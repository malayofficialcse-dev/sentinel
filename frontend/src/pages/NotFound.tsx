import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-[4px] bg-white border border-[#E1DFDD] flex items-center justify-center mb-4 text-[#0078D4] shadow-xs">
        <span className="material-symbols-outlined text-[36px]">search_off</span>
      </div>
      <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
        Page Not Found (404)
      </h1>
      <p className="text-[13px] text-[#605E5C] max-w-sm mt-1 mb-6">
        The investigation page or resource you requested does not exist or has been archived.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    </div>
  );
};
