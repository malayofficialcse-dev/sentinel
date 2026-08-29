import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const PermissionDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-[4px] bg-[#FDE7E9] border border-[#E6A6AA] flex items-center justify-center mb-4 text-[#D13438] shadow-xs">
        <span className="material-symbols-outlined text-[36px]">gpp_bad</span>
      </div>
      <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
        Permission Denied
      </h1>
      <p className="text-[13px] text-[#605E5C] max-w-sm mt-1 mb-6">
        You do not have the required clearance or role permissions to access this investigation module.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="md" onClick={() => navigate('/investigator')}>
          Investigator Dashboard
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate('/login')}>
          Switch Role
        </Button>
      </div>
    </div>
  );
};
