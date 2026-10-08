import React from 'react';
import { FileText } from 'lucide-react';
import { useSeo } from '../hooks/useSeo.js';

export const TermsPage: React.FC = () => {
  useSeo({
    title: 'Termos de Uso – DECIX GAMES',
    description: 'Condições de utilização e direitos autorais da plataforma DECIX GAMES.',
    url: window.location.href
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Contrato de Utilização</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Termos de Uso</h1>
        <span className="text-xs text-slate-500">Última atualização: Março de 2026</span>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o portal <strong>DECIX GAMES</strong>, você concorda com as disposições e diretrizes estipuladas nestes Termos de Uso. Caso não concorde com algum dos termos, recomendamos a não utilização dos serviços.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">2. Propriedade Intelectual</h2>
          <p>
            A marca, identidade visual, logotipos, interface e jogos autorais pertencem à empresa <strong>DECIX GAMES</strong>. Jogos de terceiros distribuídos via GamePix ou desenvolvedores parceiros mantêm seus direitos de propriedade intelectual reservados aos seus respectivos titulares.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">3. Condições de Uso</h2>
          <p>
            O portal é destinado exclusivamente ao uso pessoal e não comercial. É estritamente proibido realizar scraping agressivo, engenharia reversa desautorizada ou tentativas de sobrecarga nos servidores da DECIX GAMES.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">4. Isenção de Responsabilidade</h2>
          <p>
            Embora nos esforcemos para manter 100% de disponibilidade, os serviços podem sofrer eventuais instabilidades decorrentes de manutenção técnica ou falhas em serviços de parceiros integrados.
          </p>
        </section>
      </div>
    </div>
  );
};
