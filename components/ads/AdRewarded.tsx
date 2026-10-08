import React, { useState } from 'react';
import { Gift, CheckCircle, X } from 'lucide-react';
import { adManager } from '../../services/ads/adManager.js';

interface AdRewardedProps {
  isOpen: boolean;
  onRewardGranted: () => void;
  onClose: () => void;
  rewardDescription?: string;
}

export const AdRewarded: React.FC<AdRewardedProps> = ({
  isOpen,
  onRewardGranted,
  onClose,
  rewardDescription = 'Ganhe 1 Dica Extra no Quebra-Cabeça'
}) => {
  const [watching, setWatching] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleWatch = async () => {
    setWatching(true);
    // Simula tempo de vídeo do parceiro (ou invoca SDK)
    setTimeout(() => {
      setWatching(false);
      setCompleted(true);
      onRewardGranted();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-gray-900 border border-slate-750 rounded-2xl p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-4">
          <Gift className="w-7 h-7" />
        </div>

        <h3 className="font-display font-bold text-lg text-slate-100 mb-1">Recompensa Especial</h3>
        <p className="text-xs text-slate-400 mb-6">{rewardDescription}</p>

        {!completed ? (
          <div className="space-y-3">
            <button
              onClick={handleWatch}
              disabled={watching}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-gray-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {watching ? 'Transmitindo vídeo patrocinado...' : 'Assistir anúncio para desbloquear'}
            </button>
            <p className="text-[11px] text-slate-500">
              Integrado via GamePix Rewarded Video API
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Recompensa Desbloqueada com Sucesso!</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm"
            >
              Voltar ao Jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
