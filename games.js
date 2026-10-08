/**
 * DECIX GAMES – Public Games API Routes
 * Endpoints RESTful para consulta de catálogo, categorias, busca e detalhes
 */
import { Router } from 'express';
import { gameService } from '../services/game.service.js';
export const gamesRouter = Router();
// GET /api/games
gamesRouter.get('/', (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 24;
        const category = req.query.category;
        const provider = req.query.provider;
        const sortBy = req.query.sortBy;
        const result = gameService.getGames({
            page,
            limit,
            category,
            provider,
            sortBy
        });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar jogos', message: msg });
    }
});
// GET /api/games/strategic-categories (Categorias prioritárias de campanha/divulgação)
gamesRouter.get('/strategic-categories', (req, res) => {
    try {
        const list = gameService.getStrategicCategories();
        res.json(list);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar categorias estratégicas', message: msg });
    }
});
// GET /api/games/category-summary/:category (Resumo detalhado com mais jogados e novos da categoria)
gamesRouter.get('/category-summary/:category', (req, res) => {
    try {
        const category = req.params.category;
        const summary = gameService.getCategorySummary(category);
        res.json(summary);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar resumo da categoria', message: msg });
    }
});
// GET /api/games/popular
gamesRouter.get('/popular', (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 12;
        const result = gameService.getGames({ sortBy: 'popular', limit });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar jogos populares', message: msg });
    }
});
// GET /api/games/new
gamesRouter.get('/new', (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 12;
        const result = gameService.getGames({ sortBy: 'new', limit });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar jogos novos', message: msg });
    }
});
// GET /api/games/featured
gamesRouter.get('/featured', (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 12;
        const result = gameService.getGames({ isFeatured: true, limit });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar jogos em destaque', message: msg });
    }
});
// GET /api/games/search?q=
gamesRouter.get('/search', (req, res) => {
    try {
        const query = req.query.q || '';
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 24;
        const sortBy = req.query.sortBy;
        const result = gameService.getGames({
            search: query,
            page,
            limit,
            sortBy
        });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro na pesquisa', message: msg });
    }
});
// GET /api/games/category/:category
gamesRouter.get('/category/:category', (req, res) => {
    try {
        const category = req.params.category;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 24;
        const sortBy = req.query.sortBy;
        const result = gameService.getGames({
            category,
            page,
            limit,
            sortBy
        });
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao carregar categoria', message: msg });
    }
});
// GET /api/games/:slugOrId
gamesRouter.get('/:slugOrId', (req, res) => {
    try {
        const slugOrId = req.params.slugOrId;
        const game = gameService.getGameBySlugOrId(slugOrId);
        if (!game) {
            res.status(404).json({ error: 'Jogo não encontrado', slugOrId });
            return;
        }
        const related = gameService.getRelatedGames(game, 6);
        res.json({ game, related });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ error: 'Erro ao buscar detalhes do jogo', message: msg });
    }
});
// POST /api/games/:id/play (registrar início de jogo)
gamesRouter.post('/:id/play', (req, res) => {
    try {
        const id = req.params.id;
        gameService.registerPlay(id);
        res.json({ success: true, id });
    }
    catch {
        res.json({ success: false });
    }
});
