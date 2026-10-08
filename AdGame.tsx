import React from 'react';
import { adManager } from '../../services/ads/adManager.js';

interface AdGameProps {
  className?: string;
  gameId: string;
}

export const AdGame: React.FC<AdGameProps> = ({ className = '', gameId }) => {
  if (!adManager.isAdsEnabled()) return null;

  return (
    <div className={`w-full bg-gray-950/80 rounded-xl border border-slate-800/80 p-3 my-3 text-center ${className}`}>
      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
        <span>Patrocínio / Anúncio do Jogo</span>
        <span className="font-mono text-[9px] text-slate-600">ID: {gameId}</span>
      </div>
      <div className="w-full h-16 rounded bg-gray-900/50 border border-dashed border-slate-800 flex items-center justify-center">
        <span className="text-xs text-slate-500">
          Slot de Monetização de Jogo – DECIX AdManager
        </span>
      </div>
    </div>
  );
};
