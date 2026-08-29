import React from 'react';
import { Card } from '../../components/ui/Card';

const topics = [
  ['Start an investigation', 'Create a case, attach evidence, and review the AI-generated findings from the case workspace.'],
  ['Evidence integrity', 'Open an evidence record to inspect its SHA-256 hash and run the demo verification check.'],
  ['Need more help?', 'Contact your SENTINEL administrator for access, role, or data-source issues.'],
];

export const HelpCenter: React.FC = () => (
  <div className="flex-1 p-6 overflow-y-auto text-left">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[22px] font-bold text-[#242424]">Help Center</h1>
      <p className="text-[13px] text-[#605E5C] mt-1">Quick guidance for the SENTINEL investigation workspace.</p>
      <div className="grid gap-3 mt-6 md:grid-cols-3">
        {topics.map(([title, description]) => (
          <Card key={title} className="p-4">
            <h2 className="text-[14px] font-bold text-[#242424]">{title}</h2>
            <p className="text-[12px] text-[#605E5C] mt-2 leading-relaxed">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  </div>
);
