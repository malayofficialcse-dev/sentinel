import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Entity } from '../../types';

export interface GraphRelationship {
  id?: string;
  sourceId?: string;
  targetId?: string;
  source?: Entity | { id: string; canonicalValue?: string; value?: string; type?: string };
  target?: Entity | { id: string; canonicalValue?: string; value?: string; type?: string };
  type: string;
  confidence?: number;
}

interface GraphViewerProps {
  entities?: Entity[];
  relationships?: GraphRelationship[];
  onSelectEntity?: (entity: Entity | null) => void;
  selectedEntityId?: string | null;
}

interface RenderNode {
  id: string;
  rawEntity: Entity;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  riskScore: number;
  icon: string;
  x: number;
  y: number;
  width: number;
  isHighRisk: boolean;
}

interface RenderEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: string;
  isHighRisk: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getEntityIcon = (type: string): string => {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'UPI': return 'alternate_email';
    case 'PHONE': return 'call';
    case 'EMAIL': return 'mail';
    case 'BANK_ACCOUNT': return 'account_balance';
    case 'IFSC': return 'account_balance_wallet';
    case 'TRANSACTION': return 'receipt_long';
    case 'URL':
    case 'DOMAIN': return 'language';
    case 'IP':
    case 'IP_ADDRESS': return 'router';
    case 'PERSON': return 'person';
    default: return 'fingerprint';
  }
};

export const GraphViewer: React.FC<GraphViewerProps> = ({
  entities = [],
  relationships = [],
  onSelectEntity,
  selectedEntityId,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(selectedEntityId || null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const { baseNodes, baseEdges } = useMemo(() => {
    if (!entities || entities.length === 0) {
      return { baseNodes: [], baseEdges: [] };
    }

    const count = entities.length;
    const centerX = 520;
    const centerY = 300;
    const radius = Math.max(200, Math.min(420, count * 58));

    const positionedNodes: RenderNode[] = entities.map((entity, index) => {
      let x = centerX;
      let y = centerY;

      if (count === 1) {
        x = centerX - 110;
        y = centerY - 30;
      } else {
        const angle = (2 * Math.PI * index) / count - Math.PI / 2;
        x = centerX + radius * Math.cos(angle) - 105;
        y = centerY + (radius * 0.72) * Math.sin(angle) - 42;
      }

      const risk = Number(entity.riskScore ?? 0);
      const isHighRisk = risk >= 70;

      return {
        id: entity.id,
        rawEntity: entity,
        type: entity.type || 'ENTITY',
        title: entity.displayName || entity.value || 'Entity',
        subtitle: `Type: ${entity.type}`,
        meta: entity.caseCount ? `${entity.caseCount} Case(s)` : 'Extracted IOC',
        riskScore: risk,
        icon: getEntityIcon(entity.type),
        x: Math.round(x),
        y: Math.round(y),
        width: 212,
        isHighRisk,
      };
    });

    const nodeMap = new Map<string, RenderNode>();
    for (const node of positionedNodes) {
      nodeMap.set(node.id.toLowerCase(), node);
      nodeMap.set((node.rawEntity.value || '').toLowerCase(), node);
      nodeMap.set((node.rawEntity.displayName || '').toLowerCase(), node);
    }

    const positionedEdges: RenderEdge[] = [];
    relationships.forEach((rel, idx) => {
      const srcObj = rel.source as any;
      const tgtObj = rel.target as any;

      const sourceKey = (
        rel.sourceId ||
        (typeof rel.source === 'string' ? rel.source : srcObj?.id || srcObj?.canonicalValue || srcObj?.value) ||
        ''
      ).toLowerCase();

      const targetKey = (
        rel.targetId ||
        (typeof rel.target === 'string' ? rel.target : tgtObj?.id || tgtObj?.canonicalValue || tgtObj?.value) ||
        ''
      ).toLowerCase();

      const src = nodeMap.get(sourceKey);
      const tgt = nodeMap.get(targetKey);

      if (src && tgt && src.id !== tgt.id) {
        positionedEdges.push({
          id: rel.id || `edge-${idx}`,
          sourceId: src.id,
          targetId: tgt.id,
          sourceX: src.x + src.width / 2,
          sourceY: src.y + 48,
          targetX: tgt.x + tgt.width / 2,
          targetY: tgt.y + 48,
          type: rel.type || 'RELATED_TO',
          isHighRisk: src.isHighRisk || tgt.isHighRisk,
        });
      }
    });

    return { baseNodes: positionedNodes, baseEdges: positionedEdges };
  }, [entities, relationships]);

  useEffect(() => {
    setNodePositions((prev) => {
      const nextPositions: Record<string, { x: number; y: number }> = { ...prev };
      baseNodes.forEach((node) => {
        if (!nextPositions[node.id]) {
          nextPositions[node.id] = { x: node.x, y: node.y };
        }
      });
      return nextPositions;
    });
  }, [baseNodes]);

  const displayNodes = useMemo(
    () =>
      baseNodes.map((node) => ({
        ...node,
        x: nodePositions[node.id]?.x ?? node.x,
        y: nodePositions[node.id]?.y ?? node.y,
      })),
    [baseNodes, nodePositions],
  );

  const displayEdges = useMemo(
    () =>
      baseEdges.map((edge) => {
        const sourceNode = displayNodes.find((node) => node.id === edge.sourceId);
        const targetNode = displayNodes.find((node) => node.id === edge.targetId);

        return {
          ...edge,
          sourceX: sourceNode ? sourceNode.x + sourceNode.width / 2 : edge.sourceX,
          sourceY: sourceNode ? sourceNode.y + 48 : edge.sourceY,
          targetX: targetNode ? targetNode.x + targetNode.width / 2 : edge.targetX,
          targetY: targetNode ? targetNode.y + 48 : edge.targetY,
        };
      }),
    [baseEdges, displayNodes],
  );

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const nextX = ((event.clientX - rect.left) / zoomLevel) - dragState.offsetX;
      const nextY = ((event.clientY - rect.top) / zoomLevel) - dragState.offsetY;

      setNodePositions((prev) => ({
        ...prev,
        [dragState.id]: {
          x: clamp(nextX, 18, Math.max(600, canvas.scrollWidth - 260)),
          y: clamp(nextY, 18, Math.max(400, canvas.scrollHeight - 120)),
        },
      }));
    };

    const handlePointerUp = () => setDragState(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, zoomLevel]);

  const handleNodeClick = (node: RenderNode) => {
    setSelectedId(node.id);
    if (onSelectEntity) {
      onSelectEntity(node.rawEntity);
    }
  };

  const handleNodePointerDown = (event: React.PointerEvent<HTMLDivElement>, node: RenderNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / zoomLevel - node.x;
    const offsetY = (event.clientY - rect.top) / zoomLevel - node.y;

    setSelectedId(node.id);
    setDragState({ id: node.id, offsetX, offsetY });
    if (onSelectEntity) {
      onSelectEntity(node.rawEntity);
    }
  };

  if (baseNodes.length === 0) {
    return (
      <div className="flex-1 bg-[var(--surface-secondary)] flex flex-col items-center justify-center h-full w-full p-8 text-center border border-[var(--border)] rounded-[4px] transition-colors">
        <span className="material-symbols-outlined text-[48px] text-[var(--text-muted)] mb-2">hub</span>
        <h3 className="font-bold text-[15px] text-[var(--text-primary)]">No Entity Graph Mapped Yet</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-md mt-1">
          Upload evidence containing UPI IDs, phone numbers, or bank transfers. The AI graph engine will automatically correlate and link related nodes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-app)] relative overflow-hidden flex flex-col h-full w-full select-none transition-colors border border-[var(--border)] rounded-[4px]">
      <div className="absolute top-4 left-4 bg-[var(--surface)]/95 border border-[var(--border)] rounded-[8px] flex items-center p-1 shadow-md z-20 gap-1 backdrop-blur-sm transition-colors">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
          className="p-1.5 rounded-[6px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-1.5 rounded-[6px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <div className="w-px h-4 bg-[var(--border)] mx-1" />
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 rounded-[6px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
        </button>
      </div>

      <div className="absolute bottom-3 left-4 bg-[var(--surface)]/90 border border-[var(--border)] rounded-[8px] px-3 py-1.5 shadow-sm z-20 text-[11px] text-[var(--text-secondary)] flex items-center gap-4 font-mono backdrop-blur-sm transition-colors">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" /> {displayNodes.length} Entities
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]" /> {displayEdges.length} Relationships
        </span>
      </div>

      <div
        ref={canvasRef}
        className="relative flex-1 w-full h-full overflow-hidden bg-grid-pattern min-h-[600px]"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%`, height: `${100 / zoomLevel}%` }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[1200px] min-h-[800px]">
          <defs>
            <linearGradient id="edge-primary" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#5EA5FF" />
              <stop offset="100%" stopColor="#0078D4" />
            </linearGradient>
            <linearGradient id="edge-danger" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#FF9AA2" />
              <stop offset="100%" stopColor="#D13438" />
            </linearGradient>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0078D4" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#D13438" />
            </marker>
          </defs>

          {displayEdges.map((edge) => (
            <g key={edge.id}>
              <line
                x1={edge.sourceX}
                y1={edge.sourceY}
                x2={edge.targetX}
                y2={edge.targetY}
                stroke={edge.isHighRisk ? 'url(#edge-danger)' : 'url(#edge-primary)'}
                strokeWidth="2.2"
                strokeDasharray={edge.isHighRisk ? 'none' : '6 5'}
                markerEnd={edge.isHighRisk ? 'url(#arrow-red)' : 'url(#arrow-blue)'}
                opacity="0.9"
              />
              <text
                x={(edge.sourceX + edge.targetX) / 2}
                y={(edge.sourceY + edge.targetY) / 2 - 8}
                fill="currentColor"
                className="text-[var(--text-muted)] font-mono text-[10px] font-semibold"
                textAnchor="middle"
              >
                {edge.type}
              </text>
            </g>
          ))}
        </svg>

        {displayNodes.map((node) => {
          const isSelected = selectedId === node.id;
          return (
            <div
              key={node.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNodeClick(node)}
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              className={`absolute rounded-[12px] p-3 flex flex-col gap-1 z-10 cursor-pointer transition-all duration-150 bg-[var(--surface)] text-[var(--text-primary)] ${
                isSelected
                  ? 'border-2 border-[var(--primary)] ring-4 ring-[var(--primary)]/20 shadow-xl'
                  : node.isHighRisk
                    ? 'border border-[var(--danger-border)] shadow-lg shadow-[var(--danger)]/10'
                    : 'border border-[var(--border-strong)] shadow-md shadow-black/5'
              }`}
              style={{
                top: `${node.y}px`,
                left: `${node.x}px`,
                width: `${node.width}px`,
                boxShadow: isSelected
                  ? '0 18px 35px rgba(0, 120, 212, 0.22)'
                  : node.isHighRisk
                    ? '0 14px 28px rgba(209, 52, 56, 0.15)'
                    : '0 8px 20px rgba(0, 0, 0, 0.12)',
                transform: dragState?.id === node.id ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  node.isHighRisk ? 'border-[var(--danger-border)]' : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`material-symbols-outlined p-1.5 rounded-[8px] text-[16px] ${
                      node.isHighRisk ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--info-bg)] text-[var(--info)]'
                    }`}
                  >
                    {node.icon}
                  </span>
                  <span
                    className={`text-[12px] font-bold truncate ${
                      node.isHighRisk ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
                    }`}
                    title={node.title}
                  >
                    {node.title}
                  </span>
                </div>
                {node.riskScore >= 50 && (
                  <span className="text-[10px] font-bold text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger-border)] px-1.5 py-0.5 rounded-[6px]">
                    {node.riskScore}%
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                <span className="truncate">{node.subtitle}</span>
                <span className="truncate font-semibold text-[var(--text-primary)] font-mono">{node.meta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
