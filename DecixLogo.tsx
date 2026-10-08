import React from 'react';

interface DecixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const DecixLogo: React.FC<DecixLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true
}) => {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 42, text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 56, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 84, text: 'text-4xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Insígnia DECIX – Puzzle, DG, Q?, Cruzadas, Lupa & Livro */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
        >
          {/* Defs para filtros de neon */}
          <defs>
            <linearGradient id="decixCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Contorno do Puzzle Central */}
          <path
            d="M 28,24 
               H 44 
               C 44,17 56,17 56,24 
               H 74 
               V 42 
               C 81,42 81,56 74,56 
               V 76 
               H 58 
               C 58,83 44,83 44,76 
               H 26 
               V 58 
               C 18,58 18,44 26,44 
               Z"
            stroke="url(#decixCyanGrad)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            fill="#050e1f"
            filter="url(#neonGlow)"
          />

          {/* Letra D e G estilizadas no miolo */}
          {/* Letra D */}
          <path
            d="M 33 42 V 68 H 40 C 47 68 51 64 51 55 C 51 46 47 42 40 42 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Letra G */}
          <path
            d="M 68 47 C 65 42 58 42 54 46 C 49 51 49 61 54 66 C 58 70 66 69 68 64 V 56 H 60"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ponto de interrogação no centro */}
          <path
            d="M 48 37 C 48 34 52 33 53 35 C 54 37 51 39 51 41"
            stroke="#00f0ff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="51" cy="44" r="1.1" fill="#00f0ff" />

          {/* Livro aberto no pé do emblema */}
          <path
            d="M 43 72 C 47 70 51 72 51 72 C 51 72 55 70 59 72 V 74 C 55 72 51 74 51 74 C 51 74 47 72 43 74 Z"
            stroke="#38bdf8"
            strokeWidth="1.4"
            fill="#071b30"
          />

          {/* Cruzadas mini no canto superior esquerdo */}
          <line x1="16" y1="28" x2="26" y2="28" stroke="#38bdf8" strokeWidth="1.6" />
          <line x1="21" y1="22" x2="21" y2="34" stroke="#38bdf8" strokeWidth="1.6" />

          {/* Caça-palavras mini no canto superior direito */}
          <rect x="74" y="20" width="14" height="14" rx="2" stroke="#38bdf8" strokeWidth="1.2" fill="#030c1c" />
          <line x1="77" y1="24" x2="85" y2="24" stroke="#00f0ff" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <line x1="77" y1="27" x2="85" y2="27" stroke="#00f0ff" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <line x1="77" y1="30" x2="85" y2="30" stroke="#00f0ff" strokeWidth="1" strokeDasharray="1.5 1.5" />

          {/* Lupa mini no canto inferior esquerdo */}
          <circle cx="17" cy="67" r="4" stroke="#38bdf8" strokeWidth="1.6" />
          <line x1="20" y1="70" x2="24" y2="74" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Tipografia da Marca DECIX GAMES */}
      <div className="flex flex-col leading-none">
        <div className={`font-display font-extrabold tracking-wider ${currentSize.text} text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-200 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]`}>
          DECIX
        </div>
        {showSubtitle && (
          <span className={`font-display font-semibold tracking-[0.26em] text-cyan-400/90 uppercase mt-0.5 ${currentSize.sub}`}>
            GAMES
          </span>
        )}
      </div>
    </div>
  );
};
