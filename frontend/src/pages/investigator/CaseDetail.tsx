import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCases, mockEvidence, mockEntities, mockFindings, mockTransactions } from '../../data/mockData';
import { GraphViewer } from '../../components/graph/GraphViewer';
import { Entity, CaseStatus, Severity } from '../../types';
import { SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentCase = mockCases.find((c) => c.id.toLowerCase() === id?.toLowerCase()) || mockCases[0];

  const [activeTab, setActiveTab] = useState<string>('Graph');
  const [selectedEntity, setSelectedEntity] = useState<Entity>(mockEntities[0]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>(currentCase.status);
  const [assignedName, setAssignedName] = useState(currentCase.assignedTo?.name || 'Rahul Sharma');

  const tabs = [
    'Overview',
    'Evidence',
    'Entities',
    'Threat Intel',
    'Financial',
    'Graph',
    'Timeline',
    'AI Analysis',
    'Audit',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-left">
      {/* Case Header matching Screen 3 */}
      <div className="px-6 py-3 border-b border-[#E1DFDD] flex flex-col gap-2 bg-white shrink-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">
            <button onClick={() => navigate('/investigator/cases')} className="hover:text-[#0078D4]">
              Cases
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#242424] font-bold">{currentCase.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              leftIcon={<span className="material-symbols-outlined text-[16px]">person_add</span>}
            >
              Assign
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsStatusModalOpen(true)}
              leftIcon={<span className="material-symbols-outlined text-[16px]">update</span>}
            >
              Change Status
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/investigator/reports')}
              leftIcon={<span className="material-symbols-outlined text-[16px]">summarize</span>}
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Title & Primary Metadata */}
        <div className="flex flex-wrap items-center gap-3 mt-0.5">
          <h1 className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            {currentCase.title}
          </h1>
          <SeverityBadge severity={currentCase.severity} size="md" />
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F3F2F1] border border-[#E1DFDD] rounded-[4px] text-[12px] text-[#242424]">
            <span className="material-symbols-outlined text-[#605E5C] text-[16px]">person</span>
            <span>Assigned: <strong className="font-semibold">{assignedName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EFF6FC] border border-[#B4D6F0] rounded-[4px] text-[11px] text-[#0078D4] font-semibold">
            Status: {caseStatus}
          </div>
        </div>
      </div>

      {/* Case Tabs matching Screen 3 */}
      <div className="px-6 flex items-center gap-6 border-b border-[#E1DFDD] bg-white shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-1.5 select-none whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#0078D4] text-[#0078D4] font-bold'
                  : 'border-transparent text-[#605E5C] hover:text-[#242424] hover:border-[#C8C6C4]'
              }`}
            >
              {tab === 'Graph' && <span className="material-symbols-outlined text-[16px]">hub</span>}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Three Pane Layout matching Screen 3 */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANE: Linked Evidence List (Fixed 300px) */}
        <section className="w-[300px] bg-white border-r border-[#E1DFDD] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#E1DFDD] bg-[#FAFAFA] flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#242424] uppercase tracking-wider">
              Linked Evidence ({mockEvidence.length})
            </span>
            <button
              onClick={() => navigate('/investigator/evidence')}
              className="text-[#605E5C] hover:text-[#0078D4]"
              title="Add Evidence"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {mockEvidence.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate('/investigator/evidence')}
                className="bg-white border border-[#E1DFDD] rounded-[4px] p-3 flex flex-col gap-2 cursor-pointer hover:border-[#0078D4] hover:bg-[#FAFAFA] transition-colors shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1 bg-[#F3F2F1] px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold text-[#605E5C] uppercase">
                    <span className="material-symbols-outlined text-[12px]">
                      {ev.type === 'IMAGE' ? 'image' : ev.type === 'PDF' ? 'picture_as_pdf' : 'article'}
                    </span>
                    <span>{ev.type}</span>
                  </div>
                  <span className="text-[10px] text-[#8A8886] font-mono">
                    {new Date(ev.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {ev.thumbnailUrl ? (
                  <div className="h-20 bg-[#F3F2F1] border border-[#E1DFDD] rounded-[4px] overflow-hidden">
                    <img src={ev.thumbnailUrl} alt="Evidence" className="w-full h-full object-cover opacity-90" />
                  </div>
                ) : null}

                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[#242424] truncate">{ev.fileName}</span>
                  <span className="text-[10px] font-mono text-[#8A8886] truncate">SHA: {ev.hash.substring(0, 16)}...</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MIDDLE PANE: Investigation Canvas (Fluid) */}
        <section className="flex-1 bg-[#FAFAFA] relative overflow-hidden flex flex-col">
          {activeTab === 'Graph' ? (
            <GraphViewer onSelectEntity={(e) => e && setSelectedEntity(e)} selectedEntityId={selectedEntity.id} />
          ) : activeTab === 'Overview' ? (
            <div className="p-6 overflow-y-auto space-y-6 max-w-4xl">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Risk Score</span>
                  <p className="text-[20px] font-bold text-[#D13438]">{currentCase.riskScore}</p>
                </div>
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Evidence</span>
                  <p className="text-[20px] font-bold text-[#242424]">{currentCase.evidenceCount}</p>
                </div>
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Entities</span>
                  <p className="text-[20px] font-bold text-[#242424]">{currentCase.entityCount}</p>
                </div>
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Findings</span>
                  <p className="text-[20px] font-bold text-[#242424]">{currentCase.findingCount}</p>
                </div>
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Txns</span>
                  <p className="text-[20px] font-bold text-[#242424]">{currentCase.transactionCount}</p>
                </div>
                <div className="bg-white border border-[#E1DFDD] p-3 rounded-[4px]">
                  <span className="text-[11px] text-[#605E5C] uppercase font-semibold">Related</span>
                  <p className="text-[20px] font-bold text-[#0078D4]">{currentCase.relatedCaseCount}</p>
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="bg-white border border-[#0078D4]/30 rounded-[4px] p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#0078D4] text-[20px]">psychology</span>
                  <h3 className="font-bold text-[14px] text-[#0078D4] uppercase tracking-wider">
                    AI-Generated Case Intelligence Summary
                  </h3>
                </div>
                <p className="text-[13px] text-[#323130] leading-relaxed">
                  {currentCase.aiSummary || 'Detailed multi-agent intelligence summary generated by Sentinel core engine.'}
                </p>
              </div>

              {/* Key Findings List */}
              <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-5 shadow-xs">
                <h3 className="font-bold text-[14px] text-[#242424] mb-3">Key Automated Findings ({mockFindings.length})</h3>
                <div className="space-y-2.5">
                  {mockFindings.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[#242424]">{f.title}</span>
                          <SeverityBadge severity={f.severity} size="sm" />
                        </div>
                        <p className="text-[12px] text-[#605E5C] mt-1">{f.description}</p>
                      </div>
                      <span className="text-[12px] font-bold text-[#0078D4] bg-[#EFF6FC] px-2 py-1 rounded-[4px]">
                        {f.confidence}% Conf.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto">
              <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center max-w-lg mx-auto">
                <span className="material-symbols-outlined text-[32px] text-[#0078D4] mb-2">view_quilt</span>
                <h3 className="text-[16px] font-bold text-[#242424] mb-1">{activeTab} View</h3>
                <p className="text-[13px] text-[#605E5C]">
                  Full module data loaded for {currentCase.id}. Switch to specialized views from the main sidebar for deep analytics.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANE: Entity Details matching Screen 3 (Fixed 320px) */}
        <section className="w-[320px] bg-white border-l border-[#E1DFDD] flex flex-col shrink-0">
          {/* Detail Header */}
          <div className="p-4 border-b border-[#E1DFDD] bg-white flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#605E5C] bg-[#F3F2F1] px-1.5 py-0.5 rounded-[4px] w-fit mb-1 uppercase font-semibold">
                  {selectedEntity.type}
                </span>
                <h2 className="text-[15px] font-bold text-[#242424] break-all font-mono">
                  {selectedEntity.value}
                </h2>
              </div>
              <button className="text-[#8A8886] hover:text-[#242424]">
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-2 flex flex-col items-center justify-center">
                <span className="text-[#D13438] text-[20px] font-extrabold">{selectedEntity.riskScore}%</span>
                <span className="text-[#D13438] text-[10px] font-bold uppercase">Risk Score</span>
              </div>
              <div className="flex-1 bg-[#F3F2F1] border border-[#E1DFDD] rounded-[4px] p-2 flex flex-col items-center justify-center">
                <span className="text-[#242424] text-[20px] font-extrabold">{selectedEntity.caseCount}</span>
                <span className="text-[#605E5C] text-[10px] font-bold uppercase text-center leading-tight">
                  Related Cases
                </span>
              </div>
            </div>
          </div>

          {/* Detail Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Quick Actions matching Screen 3 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<span className="material-symbols-outlined text-[14px]">block</span>}
              >
                Block Entity
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<span className="material-symbols-outlined text-[14px]">visibility</span>}
              >
                Watchlist
              </Button>
            </div>

            {/* Properties Table matching Screen 3 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider border-b border-[#E1DFDD] pb-1">
                Properties
              </h3>
              <div className="space-y-1.5 text-[12px]">
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-2 flex justify-between items-center">
                  <span className="text-[#605E5C]">First Seen</span>
                  <span className="font-mono text-[#242424]">
                    {new Date(selectedEntity.firstSeen).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-2 flex justify-between items-center">
                  <span className="text-[#605E5C]">Last Active</span>
                  <span className="font-mono text-[#D13438] font-bold">
                    {new Date(selectedEntity.lastSeen).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-2 flex justify-between items-center">
                  <span className="text-[#605E5C]">Provider</span>
                  <span className="font-semibold text-[#242424]">
                    {selectedEntity.metadata.provider || 'UPI Network'}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-2 flex justify-between items-center">
                  <span className="text-[#605E5C]">Linked Name</span>
                  <span className="italic text-[#242424]">
                    {selectedEntity.metadata.linkedName || 'Unregistered'}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-2 flex flex-col gap-1">
                  <span className="text-[#605E5C]">Associated IPs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] bg-white border border-[#E1DFDD] px-1.5 py-0.5 rounded-[4px]">
                      103.44.xx.xx
                    </span>
                    <span className="text-[9px] text-[#D13438] bg-[#FDE7E9] border border-[#E6A6AA] px-1 rounded-[2px] font-bold">
                      PROXY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card matching Screen 3 */}
            <div className="rounded-[4px] border border-[#B4D6F0] bg-[#EFF6FC] p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-[#0078D4] text-[18px]">psychology</span>
                <span className="text-[11px] font-bold text-[#0078D4] uppercase tracking-wide">
                  Sentinel AI Insights
                </span>
              </div>
              <p className="text-[12px] text-[#323130] leading-relaxed">
                This UPI ID exhibits high-velocity transactional behavior typical of a Level 1 collector mule. Pattern matches <strong className="text-[#0078D4]">ThreatCluster-Alpha</strong> with 87% confidence. Recommend immediate suspension request to underlying PSP.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Case to Investigator"
      >
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-semibold text-[#323130]">Select Investigator</label>
          <select
            value={assignedName}
            onChange={(e) => setAssignedName(e.target.value)}
            className="h-8 px-3 text-[13px] bg-white border border-[#E1DFDD] rounded-[4px]"
          >
            <option value="Rahul Sharma">Rahul Sharma (Lead Investigator)</option>
            <option value="Sarah Jenkins">Sarah Jenkins (Senior Analyst)</option>
            <option value="David Chen">David Chen (Cyber Forensics)</option>
            <option value="Priya Patel">Priya Patel (Financial Crimes)</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="md" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsAssignModalOpen(false)}>
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Case Status"
      >
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-semibold text-[#323130]">Select Case Status</label>
          <select
            value={caseStatus}
            onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
            className="h-8 px-3 text-[13px] bg-white border border-[#E1DFDD] rounded-[4px]"
          >
            <option value={CaseStatus.INVESTIGATING}>Investigating</option>
            <option value={CaseStatus.UNDER_REVIEW}>Under Review</option>
            <option value={CaseStatus.ESCALATED}>Escalated</option>
            <option value={CaseStatus.RESOLVED}>Resolved</option>
            <option value={CaseStatus.CLOSED}>Closed</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="md" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsStatusModalOpen(false)}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
