import React, { useEffect, useRef } from 'react';
import { adManager } from '../../services/ads/adManager.js';

interface AdBannerProps {
  slotId?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar';
}

const AD_KEY = 'de04f6ed2bce2a0e74aa924d1a08c05c';
const REFRESH_INTERVAL_MS = 30_000;

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = 'decix-ad-banner',
  className = '',
  position = 'top'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !adManager.isAdsEnabled()) return;

    let disposed = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const loadAd = () => {
      if (disposed || document.visibilityState === 'hidden') return;

      // Limpa o anúncio anterior antes de solicitar a próxima exibição.
      container.replaceChildren();

      const adBox = document.createElement('div');
      adBox.className = 'flex w-full justify-center overflow-hidden';
      adBox.style.width = '100%';
      adBox.style.minHeight = '90px';

      const config = document.createElement('script');
      config.text = "window.atOptions = { key: '" + AD_KEY + "', format: 'iframe', height: 90, width: 728, params: {} };";

      const invoke = document.createElement('script');
      invoke.async = true;
      invoke.src = 'https://www.highrevenueformat.com/' + AD_KEY + '/invoke.js';
      invoke.onerror = () => {
        if (!disposed && adBox.isConnected) {
          const message = document.createElement('span');
          message.className = 'text-xs text-slate-500';
          message.textContent = 'Anúncio indisponível no momento.';
          adBox.replaceChildren(message);
        }
      };

      adBox.append(config, invoke);
      container.append(adBox);
    };

    loadAd();
    timer = setInterval(loadAd, REFRESH_INTERVAL_MS);

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      container.replaceChildren();
    };
  }, []);

  if (!adManager.isAdsEnabled()) return null;

  return (
    <section
      id={slotId}
      aria-label={'Publicidade ' + position}
      className={'relative w-full rounded-xl overflow-hidden border border-slate-800/80 bg-gray-950/60 flex flex-col items-center justify-center p-3 text-center my-4 ' + className}
    >
      <div className="flex items-center justify-between w-full max-w-[728px] text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">
        <span>Publicidade</span>
        <span className="text-slate-600">DECIX GAMES</span>
      </div>
      <div
        ref={containerRef}
        className="w-full max-w-[728px] min-h-[90px] rounded-lg bg-gray-900/60 flex items-center justify-center"
      >
        <span className="text-xs text-slate-500">Carregando anúncio…</span>
      </div>
    </section>
  );
};
