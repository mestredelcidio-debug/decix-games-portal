/**
 * DECIX GAMES – Full-Stack Node.js Express Server
 * Servidor REST integrado com Vite middlewares para suporte full-stack unificado.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { gamesRouter } from './server/routes/games.js';
import { adminRouter } from './server/routes/admin.js';
import { seoRouter } from './server/routes/seo.js';
import { gameService } from './server/services/game.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body Parser
app.use(express.json());

// CORS & Security Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Secret');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// SEO Routes (Sitemap & Robots)
app.use('/', seoRouter);

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/admin', adminRouter);

// GET /api/categories
app.get('/api/categories', (req: Request, res: Response) => {
  try {
    const categories = gameService.getCategories();
    res.json(categories);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro';
    res.status(500).json({ error: 'Erro ao buscar categorias', message: msg });
  }
});

// GET /api/stats
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = gameService.getStats();
    res.json(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro';
    res.status(500).json({ error: 'Erro ao buscar estatísticas', message: msg });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    portal: 'DECIX GAMES',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Vite Middleware Integration
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DECIX GAMES] Servidor rodando na porta ${PORT} (Ambiente: ${isProd ? 'produção' : 'desenvolvimento'})`);
  });
}

startServer().catch((err) => {
  console.error('[DECIX GAMES] Erro fatal ao iniciar servidor:', err);
});
