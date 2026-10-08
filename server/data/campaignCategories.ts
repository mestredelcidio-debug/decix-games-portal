import { StrategicCategoryConfig } from '../../src/types/game.js';

/**
 * DECIX GAMES – Configuração Centralizada de Categorias Estratégicas para Divulgação / Aquisição
 * 
 * Permite que o portal mantenha centenas de categorias no catálogo geral,
 * mas concentre os banners, campanhas de marketing e vitrines da Home
 * nas categorias prioritárias de atração de usuários.
 */
export const INITIAL_STRATEGIC_CATEGORIES: StrategicCategoryConfig[] = [
  {
    slug: 'raciocinio',
    categoryName: 'Raciocínio & Inteligência',
    campaignTitle: 'Treine Sua Mente Diariamente',
    tagline: 'Desafios cognitivos projetados para estimular o raciocínio rápido',
    badgeText: 'Foco Principal',
    description: 'Enigmas, quebra-cabeças e testes de agilidade mental para exercitar o cérebro.',
    priority: 1,
    active: true,
    accentColor: '#06b6d4'
  },
  {
    slug: 'palavras',
    categoryName: 'Palavras & Vocabulário',
    campaignTitle: 'Desafios de Letras e Palavras Cruzadas',
    tagline: 'Caça-palavras, anagramas e palavras cruzadas inteligentes',
    badgeText: 'Mais Buscados',
    description: 'Expanda seu vocabulário resolvendo grades de palavras e jogos de letras diários.',
    priority: 2,
    active: true,
    accentColor: '#3b82f6'
  },
  {
    slug: 'logica',
    categoryName: 'Lógica & Dedução',
    campaignTitle: 'Padrões, Números e Sudoku',
    tagline: 'Desvende sequências numéricas e problemas de dedução',
    badgeText: 'Alta Concentração',
    description: 'Jogos matemáticos e sudokus calibrados para raciocínio analítico.',
    priority: 3,
    active: true,
    accentColor: '#0284c7'
  },
  {
    slug: 'quebra-cabeca',
    categoryName: 'Quebra-Cabeça & Puzzles',
    campaignTitle: 'Encaixes e Desafios Espaciais',
    tagline: 'Tangrams, blocos deslizantes e quebra-cabeças visuais',
    badgeText: 'Visual & Espacial',
    description: 'Exercite sua percepção geométrica com blocos e encaixes instigantes.',
    priority: 4,
    active: true,
    accentColor: '#6366f1'
  },
  {
    slug: 'tabuleiro',
    categoryName: 'Tabuleiro & Estratégia Tática',
    campaignTitle: 'Grandes Clássicos da Mente',
    tagline: 'Xadrez, damas e estratégia para planejar jogadas',
    badgeText: 'Clássicos',
    description: 'Aperfeiçoe suas táticas e previsão de lances em partidas rápidas.',
    priority: 5,
    active: true,
    accentColor: '#8b5cf6'
  }
];
