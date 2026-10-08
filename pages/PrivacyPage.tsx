import React from 'react';
import { Shield } from 'lucide-react';
import { useSeo } from '../hooks/useSeo.js';

export const PrivacyPage: React.FC = () => {
  useSeo({
    title: 'Política de Privacidade – DECIX GAMES',
    description: 'Transparência no tratamento de dados e cookies na plataforma DECIX GAMES.',
    url: window.location.href
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>Privacidade e Segurança</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Política de Privacidade</h1>
        <span className="text-xs text-slate-500">Última atualização: Março de 2026</span>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">1. Informações Gerais</h2>
          <p>
            A <strong>DECIX GAMES</strong> respeita a privacidade de todos os seus usuários e está em total conformidade com as legislações de proteção de dados aplicáveis (LGPD no Brasil e GDPR internacional). Esta política descreve como os dados são coletados, utilizados e protegidos quando você acessa nosso portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">2. Dados Coletados</h2>
          <p>
            Para usufruir dos jogos da DECIX GAMES, <strong>não é exigido cadastro prévio nem fornecimento de dados pessoais sensíveis</strong>. Utilizamos armazenamento local no navegador (<code>localStorage</code>) exclusivamente para registrar:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Lista de jogos favoritados pelo próprio usuário.</li>
            <li>Histórico local de jogos jogados recentemente ("Continue Jogando").</li>
            <li>Pontuações e recordes nos jogos que suportam persistência local.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">3. Jogos de Parceiros e GamePix</h2>
          <p>
            Alguns jogos disponibilizados em nossa plataforma são providos por redes externas parceiras, como a <strong>GamePix</strong>. Ao reproduzir um jogo executado em ambiente isolado (sandbox/iframe), o parceiro pode registrar métricas anônimas de jogabilidade e exibir publicidade autorizada conforme as normas da IAB.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">4. Seus Direitos</h2>
          <p>
            Você pode limpar seus dados de favoritos e histórico a qualquer momento simplesmente limpando os dados de navegação do seu navegador.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-100">5. Contato</h2>
          <p>
            Dúvidas ou solicitações relacionadas à privacidade podem ser encaminhadas para a equipe de conformidade da DECIX GAMES pelo canal oficial de suporte.
          </p>
        </section>
      </div>
    </div>
  );
};
