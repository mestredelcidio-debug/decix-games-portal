/**
 * DECIX GAMES – Public Games API Routes
 * Endpoints RESTful para consulta de catálogo, categorias, busca e detalhes
 */

import { Router, Request, Response } from 'express';
import { gameService } from '../services/game.service.js';

export const gamesRouter = Router();

// GET /api/games
gamesRouter.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 24;
    const category = req.query.category as string;
    const provider = req.query.provider as string;
    const sortBy = req.query.sortBy as 'popular' | 'new' | 'az' | 'rating';

    const result = gameService.getGames({
      page,
      limit,
      category,
      provider,
      sortBy
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar jogos', message: msg });
  }
});

// GET /api/games/strategic-categories (Categorias prioritárias de campanha/divulgação)
gamesRouter.get('/strategic-categories', (req: Request, res: Response) => {
  try {
    const list = gameService.getStrategicCategories();
    res.json(list);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar categorias estratégicas', message: msg });
  }
});

// GET /api/games/category-summary/:category (Resumo detalhado com mais jogados e novos da categoria)
gamesRouter.get('/category-summary/:category', (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const summary = gameService.getCategorySummary(category);
    res.json(summary);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar resumo da categoria', message: msg });
  }
});

// GET /api/games/popular
gamesRouter.get('/popular', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const result = gameService.getGames({ sortBy: 'popular', limit });
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar jogos populares', message: msg });
  }
});

// GET /api/games/new
gamesRouter.get('/new', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const result = gameService.getGames({ sortBy: 'new', limit });
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar jogos novos', message: msg });
  }
});

// GET /api/games/featured
gamesRouter.get('/featured', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const result = gameService.getGames({ isFeatured: true, limit });
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar jogos em destaque', message: msg });
  }
});

// GET /api/games/search?q=
gamesRouter.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 24;
    const sortBy = req.query.sortBy as 'popular' | 'new' | 'az' | 'rating';

    const result = gameService.getGames({
      search: query,
      page,
      limit,
      sortBy
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro na pesquisa', message: msg });
  }
});

// GET /api/games/category/:category
gamesRouter.get('/category/:category', (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 24;
    const sortBy = req.query.sortBy as 'popular' | 'new' | 'az' | 'rating';

    const result = gameService.getGames({
      category,
      page,
      limit,
      sortBy
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao carregar categoria', message: msg });
  }
});

// GET /api/games/:slugOrId
gamesRouter.get('/:slugOrId', (req: Request, res: Response) => {
  try {
    const slugOrId = req.params.slugOrId;
    const game = gameService.getGameBySlugOrId(slugOrId);

    if (!game) {
      res.status(404).json({ error: 'Jogo não encontrado', slugOrId });
      return;
    }

    const related = gameService.getRelatedGames(game, 6);
    res.json({ game, related });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ error: 'Erro ao buscar detalhes do jogo', message: msg });
  }
});

// POST /api/games/:id/play (registrar início de jogo)
gamesRouter.post('/:id/play', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    gameService.registerPlay(id);
    res.json({ success: true, id });
  } catch {
    res.json({ success: false });
  }
});
