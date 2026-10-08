import React, { useState } from 'react';
import { Search, Heart, Menu, X, Sparkles, Flame, Grid, Compass, ShieldCheck } from 'lucide-react';
import { DecixLogo } from './DecixLogo.js';
import { useFavorites } from '../../hooks/useFavorites.js';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { count: favoritesCount } = useFavorites();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(`/pesquisa?q=${encodeURIComponent(searchInput.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Jogos', path: '/jogos' },
    { label: 'Categorias', path: '/categorias' },
    { label: 'Novos', path: '/novos' },
    { label: 'Populares', path: '/populares' },
    { label: 'Destaques', path: '/destaques' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/40 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('/')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-1 transition-opacity hover:opacity-90 flex items-center"
          aria-label="DECIX GAMES Página Inicial"
        >
          <DecixLogo size="md" />
        </button>

        {/* Zone 2: Primary Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.path)}
                className={`transition-colors py-1 relative whitespace-nowrap hover:text-cyan-300 ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Form Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Pesquisar jogos, palavras, lógica..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-gray-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Search Button Mobile */}
          <button
            onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('/pesquisa')}
            className="md:hidden p-2 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-900"
            aria-label="Pesquisar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Favoritos Shortcut Button */}
          <button
            onClick={() => onNavigate('/favoritos')}
            className={`relative p-2 rounded-lg transition-colors flex items-center justify-center ${
              currentPath === '/favoritos'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
            }`}
            title="Meus Favoritos"
            aria-label="Jogos Favoritos"
          >
            <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-gray-950 text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-sm">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Botão Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-cyan-300 rounded-lg hover:bg-slate-900 focus:outline-none"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-gray-950 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative pt-1">
            <input
              type="text"
              placeholder="Pesquisar jogos no DECIX GAMES..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none mt-0.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => { onNavigate('/jogos'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/80 text-slate-200 hover:bg-gray-800 text-left font-medium"
            >
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>Todos os Jogos</span>
            </button>
            <button
              onClick={() => { onNavigate('/populares'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/80 text-slate-200 hover:bg-gray-800 text-left font-medium"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Populares</span>
            </button>
            <button
              onClick={() => { onNavigate('/novos'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/80 text-slate-200 hover:bg-gray-800 text-left font-medium"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Novidades</span>
            </button>
            <button
              onClick={() => { onNavigate('/destaques'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/80 text-slate-200 hover:bg-gray-800 text-left font-medium"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Destaques</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => { onNavigate('/favoritos'); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 hover:text-cyan-300"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Favoritos ({favoritesCount})</span>
            </button>
            <button
              onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
              className="flex items-center gap-1 hover:text-slate-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Painel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
