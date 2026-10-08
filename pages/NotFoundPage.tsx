import React from 'react';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { useSeo } from '../hooks/useSeo.js';

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  useSeo({
    title: 'Página Não Encontrada – DECIX GAMES',
    description: 'Ops! Esse jogo parece ter desaparecido do catálogo da DECIX GAMES.',
    url: window.location.href
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-gray-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto shadow-2xl">
        <Gamepad2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-cyan-400 text-sm font-semibold tracking-widest uppercase">
          Erro 404
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Ops! Esse jogo parece ter desaparecido.
        </h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
          A página ou jogo que você tentou acessar não foi localizado em nossa grade de enigmas e desafios.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigate('/jogos')}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 font-bold text-gray-950 text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para os jogos</span>
        </button>
      </div>
    </div>
  );
};
