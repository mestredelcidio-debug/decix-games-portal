import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-gray-900/50 rounded-2xl border border-slate-800/60 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-slate-800/60" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-850 rounded w-1/2" />
        <div className="h-3 bg-slate-850 rounded w-full pt-1" />
      </div>
    </div>
  );
};
