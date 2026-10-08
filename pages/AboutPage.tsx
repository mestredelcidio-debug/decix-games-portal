import React from 'react';
import { DecixLogo } from '../components/common/DecixLogo.js';
import { Brain, Cpu, ShieldCheck, Zap, Sparkles, Globe, Award } from 'lucide-react';
import { useSeo } from '../hooks/useSeo.js';

export const AboutPage: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  useSeo({
    title: 'Sobre a DECIX GAMES – Jogos para Desafiar sua Mente',
    description: 'Conheça a história, visão e tecnologia por trás da DECIX GAMES, o portal focado em raciocínio, lógica e inteligência.',
    url: window.location.href
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Brand Header */}
      <div className="text-center space-y-4">
        <div className="inline-block">
          <DecixLogo size="xl" />
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-4">
          Jogos para Desafiar sua Mente
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A DECIX GAMES é uma plataforma brasileira de entretenimento digital focada no treinamento cognitivo, pensamento crítico e raciocínio lógico através de jogos HTML5 rápidos e acessíveis.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-xl w-fit text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Foco na Inteligência</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Priorizamos jogos que exercitam a memória de trabalho, reflexos lógicos, deduções geométricas e o vocabulário.
          </p>
        </div>

        <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-sky-950/80 border border-sky-800 rounded-xl w-fit text-sky-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Velocidade & Acesso</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sem downloads, sem cadastros forçados e sem barreiras. Clique e jogue instantaneamente em qualquer dispositivo.
          </p>
        </div>

        <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-xl w-fit text-indigo-400">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Ecossistema Conectado</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Arquitetura preparada para receber milhares de títulos via API oficial da GamePix e produções autorais da DECIX.
          </p>
        </div>
      </div>

      {/* Story & Tech */}
      <div className="bg-gray-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <h2 className="font-display font-bold text-xl text-white">Nossa Filosofia</h2>
        <p>
          Acreditamos que o tempo que você dedica aos jogos pode ser tanto divertido quanto estimulante para o cérebro. Em um mundo repleto de distrações passivas, os jogos da DECIX GAMES incentivam o jogador a resolver problemas, reconhecer padrões e comemorar vitórias intelectuais.
        </p>
        <p>
          Seja um clássico jogo de palavras cruzadas em um intervalo, uma partida tática de xadrez ou um quebra-cabeça numérico de 2048, a DECIX GAMES oferece uma experiência moderna, limpa e com respeito total ao jogador.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/jogos')}
          className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-gray-950 text-sm rounded-xl shadow-lg shadow-cyan-500/20"
        >
          Comece a Jogar Agora
        </button>
      </div>
    </div>
  );
};
