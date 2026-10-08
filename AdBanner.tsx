import React from 'react';
import { adManager } from '../../services/ads/adManager.js';

interface AdBannerProps {
  slotId?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar';
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = 'decix-ad-banner',
  className = '',
  position = 'top'
}) => {
  if (!adManager.isAdsEnabled()) return null;

  return (
    <div
      id={slotId}
      className={`relative w-full rounded-xl overflow-hidden border border-slate-800/80 bg-gray-950/60 flex flex-col items-center justify-center p-3 text-center my-4 ${className}`}
    >
      <div className="flex items-center justify-between w-full text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">
        <span>Publicidade</span>
        <span className="text-slate-600">Espaço Oficial Reservado</span>
      </div>
      
      {/* Container estrutural limpo pronto para injeção de script oficial */}
      <div className="w-full max-w-[728px] h-[90px] rounded-lg bg-gray-900/60 border border-dashed border-slate-800 flex items-center justify-center">
        <span className="text-xs text-slate-500 font-medium">
          Slot de Publicidade ({position}) – Integrado ao AdManager da DECIX GAMES
        </span>
      </div>
    </div>
  );
};
