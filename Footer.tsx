import React from 'react';
import { DecixLogo } from './DecixLogo.js';
import { Gamepad2, Shield, FileText, Info, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-900 bg-gray-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <DecixLogo size="lg" />
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              DECIX GAMES – Jogos para desafiar sua mente. A melhor experiência em quebra-cabeças, lógica, matemática e desafios de raciocínio diretamente no seu navegador, sem instalação.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400/80 font-medium pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jogos HTML5 de alta performance em Desktop, Tablet e Mobile</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/jogos')} className="hover:text-cyan-400 transition-colors">
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categorias')} className="hover:text-cyan-400 transition-colors">
                  Todas as Categorias
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/populares')} className="hover:text-cyan-400 transition-colors">
                  Jogos Populares
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/novos')} className="hover:text-cyan-400 transition-colors">
                  Novos Lançamentos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/destaques')} className="hover:text-cyan-400 transition-colors">
                  Destaques da Semana
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/favoritos')} className="hover:text-cyan-400 transition-colors">
                  Meus Favoritos
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Links */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/sobre')} className="hover:text-cyan-400 transition-colors">
                  Sobre a DECIX GAMES
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/politica-de-privacidade')} className="hover:text-cyan-400 transition-colors">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/termos')} className="hover:text-cyan-400 transition-colors">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-cyan-400 transition-colors text-slate-500 hover:text-slate-300">
                  Acesso Administrativo
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DECIX GAMES. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">v1.0.0 Production</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Feito para quem ama pensar</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
