/**
 * DECIX GAMES – SEO & Crawler Routes
 * Gera sitemap.xml dinâmico e robots.txt com todos os jogos e categorias
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { gameService } from '../services/game.service.js';
export const seoRouter = Router();
// GET /robots.txt
seoRouter.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`;
    const content = `# DECIX GAMES – Robots Directive
User-agent: *
Allow: /
Allow: /ads.txt
Allow: /jogos
Allow: /jogos/*
Allow: /jogo/*
Allow: /categorias
Allow: /categoria/*
Allow: /populares
Allow: /novos
Allow: /destaques
Allow: /sobre

Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
});
// GET /ads.txt (garante entrega física direta como text/plain sem renderização SPA)
seoRouter.get('/ads.txt', (req, res) => {
    const adsPath = path.resolve(process.cwd(), 'public', 'ads.txt');
    const distAdsPath = path.resolve(process.cwd(), 'dist', 'ads.txt');
    const targetPath = fs.existsSync(distAdsPath) ? distAdsPath : adsPath;
    if (fs.existsSync(targetPath)) {
        res.header('Content-Type', 'text/plain; charset=utf-8');
        res.sendFile(targetPath);
    }
    else {
        res.status(404).header('Content-Type', 'text/plain; charset=utf-8').send('ads.txt não encontrado.');
    }
});
// GET /sitemap.xml
seoRouter.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`;
    const now = new Date().toISOString().split('T')[0];
    const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/jogos', priority: '0.9', changefreq: 'daily' },
        { url: '/categorias', priority: '0.9', changefreq: 'daily' },
        { url: '/destaques', priority: '0.8', changefreq: 'daily' },
        { url: '/populares', priority: '0.8', changefreq: 'daily' },
        { url: '/novos', priority: '0.8', changefreq: 'daily' },
        { url: '/sobre', priority: '0.5', changefreq: 'monthly' },
        { url: '/politica-de-privacidade', priority: '0.3', changefreq: 'yearly' },
        { url: '/termos', priority: '0.3', changefreq: 'yearly' },
    ];
    const categories = gameService.getCategories();
    const allGames = gameService.getGames({ limit: 1000 }).games;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    // Static routes
    for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }
    // Categories
    for (const cat of categories) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/categoria/${cat.slug}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
    }
    // Games
    for (const game of allGames) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/jogos/${game.slug}</loc>\n`;
        xml += `    <lastmod>${game.releaseDate || now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
    }
    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
});
