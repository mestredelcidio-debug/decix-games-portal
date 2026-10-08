/**
 * DECIX GAMES – Admin API Routes
 * Endpoints protegidos para sincronização GamePix, gerenciamento de catálogo,
 * estatísticas e controle administrativo.
 */
import { Router } from 'express';
import { gameService } from '../services/game.service.js';
import { globalCache } from '../services/cache.service.js';
import { createSlug } from '../services/normalization.service.js';
export const adminRouter = Router();
// Middleware de autenticação administrativa
function requireAdminAuth(req, res, next) {
    const adminSecret = process.env.ADMIN_SECRET || 'decix_admin_secret_key_2026';
    const providedSecret = req.headers['x-admin-secret'] ||
        (req.headers.authorization && req.headers.authorization.replace('Bearer ', '')) ||
        req.query.secret;
    if (!providedSecret || providedSecret !== adminSecret) {
        res.status(401).json({
            error: 'Não autorizado',
            message: 'Credencial administrativa inválida ou ausente. Forneça o cabeçalho X-Admin-Secret.'
        });
        return;
    }
    next();
}
// POST /api/admin/verify (Verifica se a senha administrativa está correta)
adminRouter.post('/verify', requireAdminAuth, (req, res) => {
    res.json({ authorized: true, timestamp: new Date().toISOString() });
});
// GET /api/admin/stats
adminRouter.get('/stats', requireAdminAuth, (req, res) => {
    try {
        const stats = gameService.getStats();
        res.json(stats);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        res.status(500).json({ error: 'Erro ao obter estatísticas', message: msg });
    }
});
// POST /api/admin/sync-gamepix
adminRouter.post('/sync-gamepix', requireAdminAuth, async (req, res) => {
    try {
        const result = await gameService.syncWithGamePix();
        res.json(result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro na sincronização';
        res.status(500).json({
            success: false,
            message: 'Falha durante a sincronização com a GamePix',
            error: msg
        });
    }
});
// POST /api/admin/games/:id/toggle-featured
adminRouter.post('/games/:id/toggle-featured', requireAdminAuth, (req, res) => {
    try {
        const id = req.params.id;
        const updated = gameService.toggleFeatured(id);
        if (!updated) {
            res.status(404).json({ error: 'Jogo não encontrado' });
            return;
        }
        res.json({ success: true, game: updated });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        res.status(500).json({ error: 'Falha ao alterar destaque', message: msg });
    }
});
// POST /api/admin/games (Cadastrar novo jogo próprio DECIX)
adminRouter.post('/games', requireAdminAuth, (req, res) => {
    try {
        const { title, description, thumbnail, gameUrl, category, categorySlug, tags, orientation, publisher } = req.body;
        if (!title || !thumbnail || !gameUrl) {
            res.status(400).json({ error: 'Campos obrigatórios: title, thumbnail, gameUrl' });
            return;
        }
        const slug = createSlug(title);
        const newGame = {
            id: 'decix-' + Math.random().toString(36).substring(2, 9),
            slug,
            title,
            description: description || 'Novo jogo lançado na DECIX GAMES.',
            thumbnail,
            gameUrl,
            category: category || 'Raciocínio',
            categorySlug: categorySlug || 'raciocinio',
            tags: Array.isArray(tags) ? tags : ['raciocinio', 'decix'],
            orientation: orientation || 'any',
            publisher: publisher || 'DECIX GAMES',
            releaseDate: new Date().toISOString().split('T')[0],
            isNew: true,
            isFeatured: false,
            popularity: 85,
            rating: 5.0,
            playCount: 0,
            provider: 'DECIX',
            embedType: gameUrl.startsWith('builtin:') ? 'internal' : 'iframe'
        };
        const added = gameService.addGame(newGame);
        res.status(201).json({ success: true, game: added });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        res.status(500).json({ error: 'Falha ao cadastrar jogo', message: msg });
    }
});
// POST /api/admin/categories (Adicionar nova categoria)
adminRouter.post('/categories', requireAdminAuth, (req, res) => {
    try {
        const { name, description, icon, color } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Nome da categoria é obrigatório' });
            return;
        }
        const created = gameService.addCategory({
            name,
            description: description || `Jogos de ${name} na DECIX GAMES`,
            slug: createSlug(name),
            icon: icon || 'Gamepad2',
            color: color || '#06b6d4'
        });
        res.status(201).json({ success: true, category: created });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        res.status(500).json({ error: 'Falha ao criar categoria', message: msg });
    }
});
// POST /api/admin/cache/flush (Limpar cache do servidor)
adminRouter.post('/cache/flush', requireAdminAuth, (req, res) => {
    globalCache.flush();
    res.json({ success: true, message: 'Cache esvaziado com sucesso.' });
});
