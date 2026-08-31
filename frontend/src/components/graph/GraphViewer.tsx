import React, { useMemo, useState } from 'react';
import { Entity, EntityType } from '../../types';

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
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: string;
  isHighRisk: boolean;
}

const getEntityIcon = (type: string): string => {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'UPI': return 'alternate_email';
    case 'PHONE': return 'call';
    case 'EMAIL': return 'mail';
    case 'BANK_ACCOUNT': return 'account_balance';
    case 'IFSC': return 'account_balance_wallet';
    case 'TRANSACTION': return 'receipt_long';
    case 'URL': case 'DOMAIN': return 'language';
    case 'IP': case 'IP_ADDRESS': return 'router';
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

  // Compute dynamic layout for real entities
  const { nodes, edges } = useMemo(() => {
    if (!entities || entities.length === 0) {
      return { nodes: [], edges: [] };
    }

    const count = entities.length;
    const centerX = 500;
    const centerY = 300;
    const radius = Math.max(180, Math.min(380, count * 55));

    // Layout nodes in an organized elliptical layout or grid
    const positionedNodes: RenderNode[] = entities.map((entity, index) => {
      let x = centerX;
      let y = centerY;

      if (count === 1) {
        x = centerX - 100;
        y = centerY - 50;
      } else {
        const angle = (2 * Math.PI * index) / count - Math.PI / 2;
        x = centerX + radius * Math.cos(angle) - 100;
        y = centerY + (radius * 0.75) * Math.sin(angle) - 40;
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
        width: 210,
        isHighRisk,
      };
    });

    const nodeMap = new Map<string, RenderNode>();
    for (const n of positionedNodes) {
      nodeMap.set(n.id.toLowerCase(), n);
      nodeMap.set((n.rawEntity.value || '').toLowerCase(), n);
      nodeMap.set((n.rawEntity.displayName || '').toLowerCase(), n);
    }

    // Build dynamic edges
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
          sourceX: src.x + src.width / 2,
          sourceY: src.y + 40,
          targetX: tgt.x + tgt.width / 2,
          targetY: tgt.y + 40,
          type: rel.type || 'RELATED_TO',
          isHighRisk: src.isHighRisk || tgt.isHighRisk,
        });
      }
    });

    return { nodes: positionedNodes, edges: positionedEdges };
  }, [entities, relationships]);

  const handleNodeClick = (node: RenderNode) => {
    setSelectedId(node.id);
    if (onSelectEntity) {
      onSelectEntity(node.rawEntity);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex-1 bg-[#FAFAFA] flex flex-col items-center justify-center h-full w-full p-8 text-center border border-[#E1DFDD] rounded-[4px]">
        <span className="material-symbols-outlined text-[48px] text-[#C8C6C4] mb-2">hub</span>
        <h3 className="font-bold text-[15px] text-[#242424]">No Entity Graph Mapped Yet</h3>
        <p className="text-[13px] text-[#605E5C] max-w-md mt-1">
          Upload evidence containing UPI IDs, phone numbers, or bank transfers. The AI graph engine will automatically correlate and link related nodes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-app,#FAFAFA)] relative overflow-hidden flex flex-col h-full w-full select-none transition-colors border border-[#E1DFDD] rounded-[4px]">
      {/* Canvas Toolbar */}
      <div className="absolute top-4 left-4 bg-white border border-[#E1DFDD] rounded-[4px] flex items-center p-1 shadow-md z-20 gap-1">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
          className="p-1 rounded-[4px] hover:bg-[#F3F2F1] text-[#605E5C] hover:text-[#242424] cursor-pointer"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-1 rounded-[4px] hover:bg-[#F3F2F1] text-[#605E5C] hover:text-[#242424] cursor-pointer"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <div className="w-px h-4 bg-[#E1DFDD] mx-1" />
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1 rounded-[4px] hover:bg-[#F3F2F1] text-[#605E5C] hover:text-[#242424] cursor-pointer"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs border border-[#E1DFDD] rounded-[4px] px-3 py-1.5 shadow-xs z-20 text-[11px] text-[#605E5C] flex items-center gap-4 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0078D4]" /> {nodes.length} Entities
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D13438]" /> {edges.length} Relationships
        </span>
      </div>

      {/* Graph Canvas Grid */}
      <div
        className="flex-1 relative overflow-auto bg-grid-pattern h-full w-full min-h-[500px]"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[1200px] min-h-[800px]">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0078D4" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#D13438" />
            </marker>
          </defs>

          {edges.map((edge) => (
            <g key={edge.id}>
              <line
                x1={edge.sourceX}
                y1={edge.sourceY}
                x2={edge.targetX}
                y2={edge.targetY}
                stroke={edge.isHighRisk ? '#D13438' : '#0078D4'}
                strokeWidth="2"
                strokeDasharray={edge.isHighRisk ? 'none' : '4 2'}
                markerEnd={edge.isHighRisk ? 'url(#arrow-red)' : 'url(#arrow-blue)'}
              />
              <text
                x={(edge.sourceX + edge.targetX) / 2}
                y={(edge.sourceY + edge.targetY) / 2 - 6}
                fill="#605E5C"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                className="bg-white"
              >
                {edge.type}
              </text>
            </g>
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{ top: `${node.y}px`, left: `${node.x}px`, width: `${node.width}px` }}
              className={`absolute bg-white rounded-[4px] p-3 flex flex-col gap-1 z-10 shadow-sm cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-2 border-[#0078D4] ring-3 ring-[#0078D4]/20 shadow-md'
                  : node.isHighRisk
                    ? 'border-2 border-[#D13438] hover:shadow-md'
                    : 'border border-[#E1DFDD] hover:border-[#0078D4] hover:shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  node.isHighRisk ? 'border-[#FDE7E9]' : 'border-[#E1DFDD]'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`material-symbols-outlined p-1 rounded-[4px] text-[16px] ${
                      node.isHighRisk ? 'bg-[#FDE7E9] text-[#D13438]' : 'bg-[#EFF6FC] text-[#0078D4]'
                    }`}
                  >
                    {node.icon}
                  </span>
                  <span
                    className={`text-[12px] font-bold truncate ${
                      node.isHighRisk ? 'text-[#D13438]' : 'text-[#242424]'
                    }`}
                    title={node.title}
                  >
                    {node.title}
                  </span>
                </div>
                {node.riskScore >= 50 && (
                  <span className="text-[10px] font-bold text-[#D13438] bg-[#FDE7E9] px-1 rounded-[4px]">
                    {node.riskScore}%
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-[#605E5C]">
                <span className="truncate">{node.subtitle}</span>
                <span className="truncate font-semibold text-[#242424] font-mono">{node.meta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
