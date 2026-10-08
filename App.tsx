/**
 * DECIX GAMES – Main Application Container
 * Arquitetura de roteamento dinâmica, controle de navegação e layouts
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { GameDetailPage } from './pages/GameDetailPage.js';
import { CategoryPage } from './pages/CategoryPage.js';
import { CategoriesHubPage } from './pages/CategoriesHubPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { PopularPage } from './pages/PopularPage.js';
import { NewGamesPage } from './pages/NewGamesPage.js';
import { FeaturedPage } from './pages/FeaturedPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { TermsPage } from './pages/TermsPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { DecixGame } from './types/game.js';
import { analytics } from './services/analytics.js';

const KNOWN_ROUTES = [
  'jogos',
  'jogo',
  'categoria',
  'categorias',
  'pesquisa',
  'populares',
  'novos',
  'destaques',
  'favoritos',
  'sobre',
  'politica-de-privacidade',
  'termos',
  'admin'
];

/**
 * Normaliza o path eliminando prefixos de subpastas do GitHub Pages (ex: /decix-games/)
 */
function getNormalizedPath(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Suporte a hash fallback (ex: /#/jogos/x)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    return window.location.hash.slice(1);
  }

  // 2. Suporte a query redirect SPA de 404 (ex: /?p=/jogos/x)
  const searchParams = new URLSearchParams(window.location.search);
  const p = searchParams.get('p');
  if (p) return p;

  const raw = window.location.pathname || '/';
  if (raw === '/') return '/';

  const segments = raw.split('/').filter(Boolean);
  if (segments.length === 0) return '/';

  // Se o primeiro segmento NÃO for uma rota conhecida do DECIX GAMES, trata como subpasta do repo (GitHub Pages)
  if (!KNOWN_ROUTES.includes(segments[0])) {
    const subRoute = '/' + segments.slice(1).join('/');
    return subRoute === '/' ? '/' : subRoute;
  }

  return raw;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(getNormalizedPath);

  // Sincroniza navegação com o histórico do navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Telemetria em troca de rota
  useEffect(() => {
    analytics.trackPageView(currentPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      const raw = window.location.pathname || '/';
      const segments = raw.split('/').filter(Boolean);
      let prefix = '';
      if (segments.length > 0 && !KNOWN_ROUTES.includes(segments[0])) {
        prefix = '/' + segments[0];
      }
      const fullTarget = `${prefix}${path}`;
      window.history.pushState({}, '', fullTarget);
    }
    setCurrentPath(path.split('?')[0]);
  };

  const handlePlayGame = (game: DecixGame) => {
    navigate(`/jogos/${game.slug}`);
  };

  // Roteador leve de alto desempenho
  const renderContent = () => {
    // 1. Rota Individual de Jogo: /jogos/:slug ou /jogo/:slug
    if (currentPath.startsWith('/jogos/')) {
      const slug = currentPath.replace('/jogos/', '').split('?')[0];
      return <GameDetailPage slug={slug} onPlayGame={handlePlayGame} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/jogo/')) {
      const slug = currentPath.replace('/jogo/', '').split('?')[0];
      return <GameDetailPage slug={slug} onPlayGame={handlePlayGame} onNavigate={navigate} />;
    }

    // 2. Rota de Categoria: /categoria/:categoria
    if (currentPath.startsWith('/categoria/')) {
      const categorySlug = currentPath.replace('/categoria/', '').split('?')[0];
      return <CategoryPage categorySlug={categorySlug} onPlayGame={handlePlayGame} onNavigate={navigate} />;
    }

    // 3. Rota de Pesquisa: /pesquisa
    if (currentPath === '/pesquisa') {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get('q') || '';
      return <SearchPage initialQuery={q} onPlayGame={handlePlayGame} onNavigate={navigate} />;
    }

    // 4. Rotas estáticas
    switch (currentPath) {
      case '/':
        return <HomePage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/jogos':
        return <CatalogPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/categorias':
        return <CategoriesHubPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/populares':
        return <PopularPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/novos':
        return <NewGamesPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/destaques':
        return <FeaturedPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/favoritos':
        return <FavoritesPage onPlayGame={handlePlayGame} onNavigate={navigate} />;
      case '/sobre':
        return <AboutPage onNavigate={navigate} />;
      case '/politica-de-privacidade':
        return <PrivacyPage />;
      case '/termos':
        return <TermsPage />;
      case '/admin':
        return <AdminPage />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header currentPath={currentPath} onNavigate={navigate} onOpenSearch={() => navigate('/pesquisa')} />
      <main className="flex-1 w-full">
        {renderContent()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
