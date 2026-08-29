import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-[#EDEBE9] rounded-[4px] ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 flex flex-col gap-3">
      <div className="flex gap-4 pb-2 border-b border-[#E1DFDD]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
};
