import React, { useState } from 'react';
import { Entity, EntityType } from '../../types';

interface GraphViewerProps {
  onSelectEntity?: (entity: Entity | null) => void;
  selectedEntityId?: string | null;
}

interface NodeData {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  meta: string;
  riskScore: number;
  icon: string;
  x: number;
  y: number;
  width: number;
  isHighRisk?: boolean;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({
  onSelectEntity,
  selectedEntityId = 'ENT-001',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(selectedEntityId || 'ENT-001');

  const nodes: NodeData[] = [
    {
      id: 'ENT-004',
      type: EntityType.PERSON,
      title: 'Victim Account',
      subtitle: 'ID: VIC-88921',
      meta: 'Loss: ₹45,000',
      riskScore: 10,
      icon: 'person',
      x: 60,
      y: 160,
      width: 190,
    },
    {
      id: 'ENT-001',
      type: EntityType.UPI,
      title: 'fraudster@example',
      subtitle: 'Entity: UPI ID',
      meta: 'Txns: 142 (Last 24h)',
      riskScore: 94,
      icon: 'alternate_email',
      x: 380,
      y: 140,
      width: 230,
      isHighRisk: true,
    },
    {
      id: 'ENT-003',
      type: EntityType.BANK_ACCOUNT,
      title: 'Mule Acc #441',
      subtitle: 'Status: Frozen',
      meta: 'Bal: ₹1,200',
      riskScore: 92,
      icon: 'account_balance_wallet',
      x: 520,
      y: 330,
      width: 190,
      isHighRisk: true,
    },
    {
      id: 'ENT-002',
      type: EntityType.BANK_ACCOUNT,
      title: 'ICICI Bank Ltd',
      subtitle: 'Branch: Mumbai Main',
      meta: 'IFSC: ICIC0000001',
      riskScore: 15,
      icon: 'account_balance',
      x: 760,
      y: 330,
      width: 190,
    },
  ];

  const handleNodeClick = (node: NodeData) => {
    setSelectedId(node.id);
    if (onSelectEntity) {
      const entity: Entity = {
        id: node.id,
        type: node.type,
        value: node.title,
        displayName: node.title,
        confidence: 94,
        riskScore: node.riskScore,
        caseCount: 7,
        firstSeen: '2026-08-14T08:22:00Z',
        lastSeen: '2026-08-28T14:05:00Z',
        metadata: {
          provider: 'PayTM Payments Bank',
          linkedName: '"Sharma Electronics"',
          ip: '103.44.xx.xx (Proxy)',
        },
        relatedEntityIds: ['ENT-003', 'ENT-002'],
      };
      onSelectEntity(entity);
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-app)] relative overflow-hidden flex flex-col h-full w-full select-none transition-colors">
      {/* Canvas Toolbar */}
      <div className="absolute top-4 left-4 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] flex items-center p-1 shadow-md z-20 gap-1">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
          className="p-1 rounded-[4px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-1 rounded-[4px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <div className="w-px h-4 bg-[var(--border)] mx-1" />
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1 rounded-[4px] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
        </button>
      </div>

      {/* Graph Canvas Grid */}
      <div
        className="flex-1 relative overflow-auto bg-grid-pattern h-full w-full"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[1000px] min-h-[600px]">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong, #8A8886)" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--danger, #D13438)" />
            </marker>
          </defs>

          {/* Victim to UPI */}
          <line x1="250" y1="200" x2="380" y2="185" stroke="var(--border-strong, #8A8886)" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
          {/* UPI to Mule */}
          <line x1="495" y1="235" x2="570" y2="330" stroke="var(--danger, #D13438)" strokeWidth="2" markerEnd="url(#arrow-red)" />
          {/* Mule to Bank */}
          <line x1="710" y1="380" x2="760" y2="380" stroke="var(--border-strong, #8A8886)" strokeWidth="2" markerEnd="url(#arrow)" />
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{ top: `${node.y}px`, left: `${node.x}px`, width: `${node.width}px` }}
              className={`absolute bg-[var(--surface)] rounded-[4px] p-3 flex flex-col gap-1 z-10 shadow-sm cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-2 border-[var(--primary)] ring-3 ring-[var(--primary)]/20 shadow-md'
                  : node.isHighRisk
                    ? 'border border-[var(--danger-border)] hover:shadow-md'
                    : 'border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  node.isHighRisk ? 'border-[var(--danger-border)]' : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`material-symbols-outlined p-1 rounded-[4px] text-[16px] ${
                      node.isHighRisk ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--info-bg)] text-[var(--primary)]'
                    }`}
                  >
                    {node.icon}
                  </span>
                  <span
                    className={`text-[12px] font-bold truncate ${
                      node.isHighRisk ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {node.title}
                  </span>
                </div>
                {node.riskScore >= 80 && (
                  <span className="text-[10px] font-bold text-[var(--danger)] bg-[var(--danger-bg)] px-1 rounded-[4px]">
                    {node.riskScore}%
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                <span className="truncate">{node.subtitle}</span>
                <span className="truncate font-semibold text-[var(--text-primary)]">{node.meta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
