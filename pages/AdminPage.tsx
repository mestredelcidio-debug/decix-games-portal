import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Star, Plus, CheckCircle, AlertCircle, Database, Server, Layers, Trash2, KeyRound } from 'lucide-react';
import { SystemStats, DecixGame, GameCategory } from '../types/game.js';
import { api } from '../services/api.js';
import { useSeo } from '../hooks/useSeo.js';

export const AdminPage: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [games, setGames] = useState<DecixGame[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [authError, setAuthError] = useState('');

  // Formulário de Novo Jogo
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newThumb, setNewThumb] = useState('');
  const [newCategory, setNewCategory] = useState('raciocinio');
  const [newDesc, setNewDesc] = useState('');
  const [addGameSuccess, setAddGameSuccess] = useState(false);

  useSeo({
    title: 'Painel Administrativo – DECIX GAMES',
    description: 'Gestão e sincronização do catálogo oficial DECIX GAMES',
    url: window.location.href
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await api.admin.verifySecret(secret);
    if (ok) {
      setIsAuthenticated(true);
      loadDashboardData();
    } else {
      setAuthError('Segredo administrativo inválido. Verifique o ADMIN_SECRET configurado no servidor.');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [s, gRes] = await Promise.all([
        api.getStats(),
        api.getGames({ limit: 50 })
      ]);
      setStats(s);
      setGames(gRes.games);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncGamePix = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await api.admin.syncGamePix(secret);
      if (res.success) {
        setSyncMessage({ text: res.message });
        loadDashboardData();
      } else {
        setSyncMessage({ text: res.message || 'Falha na sincronização', error: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro';
      setSyncMessage({ text: `Erro: ${msg}`, error: true });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await api.admin.toggleFeatured(id, secret);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newThumb || !newUrl) return;

    try {
      await api.admin.addGame({
        title: newTitle,
        gameUrl: newUrl,
        thumbnail: newThumb,
        categorySlug: newCategory,
        category: newCategory === 'raciocinio' ? 'Raciocínio' : newCategory,
        description: newDesc || 'Jogo lançado na plataforma DECIX GAMES.'
      }, secret);

      setAddGameSuccess(true);
      setNewTitle('');
      setNewUrl('');
      setNewThumb('');
      setNewDesc('');
      setTimeout(() => setAddGameSuccess(false), 3000);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlushCache = async () => {
    try {
      await api.admin.flushCache(secret);
      loadDashboardData();
      alert('Cache limpo com sucesso!');
    } catch (err) {
      console.error(err);
    }
  };

  // Se não estiver logado
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-gray-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-12 h-12 bg-cyan-950/80 border border-cyan-800/80 rounded-2xl text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Acesso Administrativo</h1>
          <p className="text-xs text-slate-400 mt-1 mb-2">
            Modo Estático GitHub Pages: Digite qualquer senha para acessar o painel de gerenciamento local.
          </p>
          <div className="inline-block px-2.5 py-1 mb-4 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-[11px] font-medium text-cyan-300">
            ✓ Persistência local via LocalStorage
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Digite o segredo ou senha..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />

            {authError && (
              <p className="text-xs text-rose-400 text-left bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-gray-950 rounded-xl text-sm shadow-lg shadow-cyan-500/20"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Painel DECIX GAMES</h1>
            <p className="text-xs text-slate-400">Controle do catálogo, sincronização de parceiros e infraestrutura</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFlushCache}
            className="px-3 py-1.5 bg-gray-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Cache</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/60 text-xs text-rose-300 rounded-xl"
          >
            Sair
          </button>
        </div>
      </div>

      {/* BANNER INFORMATIVO GITHUB PAGES */}
      <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <p className="text-cyan-200">
            <strong className="text-white">Hospedagem Estática GitHub Pages Ativa:</strong> Todas as alterações (jogos adicionados, novos destaques e estatísticas de jogadas) são processadas instantaneamente no cliente e persistidas com segurança no LocalStorage do navegador.
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 bg-cyan-900/50 text-cyan-300 font-mono rounded-lg border border-cyan-700/50">
          Client-Side Mode
        </span>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Total de Jogos</span>
            <span className="font-display font-extrabold text-2xl text-white font-mono">{stats.totalGames}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Originais + Parceiros</span>
          </div>
          <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Jogos em Destaque</span>
            <span className="font-display font-extrabold text-2xl text-cyan-400 font-mono">{stats.featuredCount}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Na página inicial</span>
          </div>
          <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">GamePix API</span>
            <span className={`font-display font-bold text-base mt-1 block ${stats.gamepixConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.gamepixConfigured ? 'Conectado (Chave Ativa)' : 'Aguardando API Key'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.gamepixConfigured ? 'Pronto para sync' : 'Modo demonstração'}</span>
          </div>
          <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Cache Interno</span>
            <span className="font-display font-extrabold text-2xl text-sky-400 font-mono">{stats.cacheStatus.entries} itens</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Hits: {stats.cacheStatus.hits} · Misses: {stats.cacheStatus.misses}</span>
          </div>
        </div>
      )}

      {/* GAMEPIX SYNC SECTION */}
      <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span>Sincronização com Catálogo GamePix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Consulta os endpoints oficiais da GamePix, normaliza os dados e atualiza o acervo DECIX GAMES.
            </p>
          </div>

          <button
            onClick={handleSyncGamePix}
            disabled={syncLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-gray-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>{syncLoading ? 'Sincronizando...' : 'Sincronizar GamePix Agora'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className={`p-4 rounded-xl text-xs border ${
            syncMessage.error
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
          }`}>
            {syncMessage.text}
          </div>
        )}
      </div>

      {/* ADICIONAR JOGO AUTORAL DECIX */}
      <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-sky-400" />
          <span>Cadastrar Novo Jogo Próprio (DECIX GAMES)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Adicione novos jogos HTML5 próprios ou embeds diretamente no catálogo sem depender de APIs externas.
        </p>

        <form onSubmit={handleCreateGame} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Título do Jogo</label>
            <input
              type="text"
              placeholder="Ex: Quebra-Cabeça Quântico"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">URL do Jogo (HTML5 ou Iframe)</label>
            <input
              type="text"
              placeholder="https://... ou builtin:nome"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">URL da Imagem / Thumbnail</label>
            <input
              type="text"
              placeholder="/src/assets/... ou URL de imagem"
              value={newThumb}
              onChange={(e) => setNewThumb(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Categoria</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="raciocinio">Raciocínio</option>
              <option value="logica">Lógica</option>
              <option value="palavras">Palavras</option>
              <option value="quebra-cabeca">Quebra-Cabeça</option>
              <option value="matematica">Matemática</option>
              <option value="memoria">Memória</option>
              <option value="tabuleiro">Tabuleiro</option>
              <option value="estrategia">Estratégia</option>
              <option value="arcade">Arcade</option>
              <option value="acao">Ação</option>
              <option value="aventura">Aventura</option>
              <option value="corrida">Corrida</option>
              <option value="esportes">Esportes</option>
              <option value="casual">Casual</option>
              <option value="multiplayer">Multiplayer</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1">Descrição</label>
            <textarea
              placeholder="Breve descrição do jogo..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            {addGameSuccess && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Jogo adicionado com sucesso!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
            >
              Adicionar Jogo
            </button>
          </div>
        </form>
      </div>

      {/* GERENCIAMENTO DE JOGOS & DESTAQUES */}
      <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">
          Gerenciamento do Catálogo ({games.length} jogos exibidos)
        </h3>
        <p className="text-xs text-slate-400">
          Alterne os jogos em destaque da página inicial clicando no ícone de estrela.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Provedor</th>
                <th className="p-3">Reproduções</th>
                <th className="p-3">Destaque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-gray-850/60">
                  <td className="p-3 font-medium text-white flex items-center gap-2">
                    <img src={g.thumbnail} alt="" className="w-7 h-7 rounded object-cover" />
                    <span className="truncate max-w-[200px]">{g.title}</span>
                  </td>
                  <td className="p-3">{g.category}</td>
                  <td className="p-3 font-mono">{g.provider}</td>
                  <td className="p-3 font-mono tabular-nums">{g.playCount || 0}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleFeatured(g.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        g.isFeatured
                          ? 'bg-amber-950/80 border-amber-600 text-amber-400'
                          : 'bg-gray-950 border-slate-800 text-slate-600 hover:text-slate-300'
                      }`}
                      title={g.isFeatured ? 'Remover destaque' : 'Destacar na Homepage'}
                    >
                      <Star className={`w-4 h-4 ${g.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
