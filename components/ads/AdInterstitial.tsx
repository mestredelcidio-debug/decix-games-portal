import React, { useState, useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';
import { adManager } from '../../services/ads/adManager.js';

interface AdInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({ isOpen, onClose, gameId }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !adManager.isAdsEnabled()) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-gray-900 border border-slate-750 rounded-2xl p-6 shadow-2xl text-center">
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
          <span className="uppercase tracking-wider font-semibold">Anúncio Intersticial</span>
          {countdown > 0 ? (
            <span className="font-mono text-cyan-400">Pular em {countdown}s...</span>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-xs transition-colors"
            >
              <span>Fechar</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="aspect-video w-full rounded-xl bg-gray-950 border border-slate-800 flex flex-col items-center justify-center p-6 mb-4">
          <PlayCircle className="w-12 h-12 text-cyan-500/80 mb-3" />
          <p className="text-sm font-medium text-slate-200">Espaço de Transição Publicitária</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Pronto para vinculação com GamePix SDK Interstitial ou parceiro de rede oficial.
          </p>
        </div>

        {countdown === 0 && (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-gray-950 font-bold rounded-xl text-sm transition-colors"
          >
            Continuar para o Jogo
          </button>
        )}
      </div>
    </div>
  );
};
