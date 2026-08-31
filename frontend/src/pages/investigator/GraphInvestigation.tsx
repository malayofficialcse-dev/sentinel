import React, { useEffect, useState } from 'react';
import { GraphViewer } from '../../components/graph/GraphViewer';
import { Entity, Case } from '../../types';
import { entityApi } from '../../services/entityApi';
import { caseApi } from '../../services/caseApi';

export const GraphInvestigation: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      caseApi.getCases(),
      entityApi.getEntities(),
    ])
      .then(([fetchedCases, fetchedEntities]) => {
        if (!mounted) return;
        setCases(fetchedCases);
        setEntities(fetchedEntities);
        if (fetchedEntities.length > 0) {
          setSelectedEntity(fetchedEntities[0]);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleCaseChange = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setLoading(true);
    try {
      if (caseId === 'ALL') {
        const ents = await entityApi.getEntities();
        setEntities(ents);
        setRelationships([]);
        if (ents.length > 0) setSelectedEntity(ents[0]);
      } else {
        const caseData = await caseApi.getCaseData(caseId);
        if (caseData) {
          const ents = (caseData.entities || []).map((e: any): Entity => ({
            id: e.id,
            type: e.type,
            value: e.canonicalValue || e.value || '',
            displayName: e.displayName || e.canonicalValue || '',
            riskScore: Number(e.riskScore ?? 0),
            confidence: Number(e.confidence ?? 100),
            caseCount: 1,
            firstSeen: e.firstSeen || new Date().toISOString(),
            lastSeen: e.lastSeen || new Date().toISOString(),
            metadata: {},
            relatedEntityIds: [],
          }));
          setEntities(ents);
          setRelationships(caseData.relationships || []);
          if (ents.length > 0) setSelectedEntity(ents[0]);
          else setSelectedEntity(null);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-left">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#E1DFDD] flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
        <div>
          <h1 className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Entity Relationship Graph Investigation
          </h1>
          <p className="text-[12px] text-[#605E5C]">
            Interactive visualization mapping transactions, UPI IDs, phone numbers, and linked entities from evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-[#605E5C]">Scope:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => handleCaseChange(e.target.value)}
            className="h-8 px-3 text-[12px] bg-white border border-[#E1DFDD] rounded-[4px] font-medium text-[#242424]"
          >
            <option value="ALL">All Cases ({entities.length} entities)</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.id.substring(0, 8)}…)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph Canvas */}
        <div className="flex-1 relative p-2 bg-[#F5F5F5]">
          <GraphViewer
            entities={entities}
            relationships={relationships}
            onSelectEntity={(e) => e && setSelectedEntity(e)}
            selectedEntityId={selectedEntity?.id}
          />
        </div>

        {/* Right Node Inspector */}
        <div className="w-[320px] bg-white border-l border-[#E1DFDD] p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
          <h3 className="text-[13px] font-bold text-[#242424] uppercase tracking-wider border-b border-[#E1DFDD] pb-2 flex items-center justify-between">
            <span>Entity Inspector</span>
            <span className="text-[11px] font-mono text-[#0078D4]">{entities.length} Total</span>
          </h3>

          {selectedEntity ? (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold bg-[#EFF6FC] text-[#0078D4] px-2 py-0.5 rounded-[4px] w-fit">
                  {selectedEntity.type}
                </span>
                <span className="font-bold text-[14px] text-[#242424] break-all font-mono">
                  {selectedEntity.value}
                </span>
              </div>

              <div className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] flex flex-col gap-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#605E5C]">Risk Rating:</span>
                  <span className={`font-bold ${selectedEntity.riskScore >= 70 ? 'text-[#D13438]' : selectedEntity.riskScore >= 40 ? 'text-[#CA5010]' : 'text-[#107C10]'}`}>
                    {selectedEntity.riskScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#605E5C]">Extraction Confidence:</span>
                  <span className="font-bold text-[#107C10]">{selectedEntity.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#605E5C]">First Seen:</span>
                  <span className="text-[#242424]">{new Date(selectedEntity.firstSeen).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedEntity.riskScore >= 70 && (
                <div className="bg-[#FFF4CE] border border-[#F4C7A1] rounded-[4px] p-3 text-[12px] text-[#CA5010]">
                  <div className="flex items-center gap-1 font-bold mb-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>High Risk IOC</span>
                  </div>
                  <p className="text-[#323130] leading-normal">
                    This entity exhibits elevated risk attributes associated with fraudulent routing.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-[13px] text-[#605E5C] text-center p-6">
              {loading ? 'Loading entity data…' : 'Select a node on the graph canvas to inspect details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
