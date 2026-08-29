import React, { useState } from 'react';
import { GraphViewer } from '../../components/graph/GraphViewer';
import { Entity } from '../../types';
import { mockEntities } from '../../data/mockData';
import { Button } from '../../components/ui/Button';

export const GraphInvestigation: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<Entity>(mockEntities[0]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-left">
      <div className="px-6 py-3 border-b border-[#E1DFDD] flex items-center justify-between bg-white shrink-0">
        <div>
          <h1 className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Entity Relationship Graph Investigation
          </h1>
          <p className="text-[12px] text-[#605E5C]">
            Interactive canvas mapping transaction flows, mule networks, and proxy connections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<span className="material-symbols-outlined text-[14px]">route</span>}>
            Shortest Path
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<span className="material-symbols-outlined text-[14px]">hub</span>}>
            Cluster Analysis
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Full Canvas */}
        <div className="flex-1 relative">
          <GraphViewer onSelectEntity={(e) => e && setSelectedEntity(e)} />
        </div>

        {/* Right Info Panel */}
        <div className="w-[300px] bg-white border-l border-[#E1DFDD] p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
          <h3 className="text-[13px] font-bold text-[#242424] uppercase tracking-wider border-b border-[#E1DFDD] pb-2">
            Selected Node Inspector
          </h3>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] bg-[#F3F2F1] px-1.5 py-0.5 rounded-[4px] w-fit text-[#605E5C]">
              {selectedEntity.type}
            </span>
            <span className="font-bold text-[14px] text-[#242424] break-all font-mono">
              {selectedEntity.value}
            </span>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] flex flex-col gap-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#605E5C]">Risk Score:</span>
              <span className="font-bold text-[#D13438]">{selectedEntity.riskScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#605E5C]">Confidence:</span>
              <span className="font-bold text-[#107C10]">{selectedEntity.confidence}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#605E5C]">Related Cases:</span>
              <span className="font-bold text-[#0078D4]">{selectedEntity.caseCount}</span>
            </div>
          </div>

          {/* Graph Insights Box */}
          <div className="bg-[#FFF4CE] border border-[#F4C7A1] rounded-[4px] p-3 text-[12px] text-[#CA5010]">
            <div className="flex items-center gap-1 font-bold mb-1">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Graph Anomaly</span>
            </div>
            <p className="text-[#323130] leading-normal">
              High degree centrality detected. This entity has direct financial transfer links to 3 other active mule nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
