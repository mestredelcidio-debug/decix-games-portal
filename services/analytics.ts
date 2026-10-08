/**
 * DECIX GAMES – Analytics Service
 * Camada desacoplada de telemetria e métricas de engajamento.
 * Permite plugar Google Analytics 4, Plausible, Mixpanel ou endpoint interno sem alterar o código do portal.
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export class AnalyticsService {
  private queue: AnalyticsEvent[] = [];

  public track(event: string, properties?: Record<string, unknown>): void {
    const payload: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString()
    };

    this.queue.push(payload);
    if (this.queue.length > 50) {
      this.queue.shift();
    }

    // Exemplo: Disparo para camada de dados (dataLayer) ou console em dev
    if (typeof window !== 'undefined' && (window as unknown as { dataLayer?: unknown[] }).dataLayer) {
      (window as unknown as { dataLayer: unknown[] }).dataLayer.push(payload);
    }
  }

  public trackPageView(path: string, title?: string): void {
    this.track('page_view', { path, title: title || document.title });
  }

  public trackGameStart(gameId: string, title: string, category: string, provider: string): void {
    this.track('game_start', { gameId, title, category, provider });
  }

  public trackGameComplete(gameId: string, score?: number): void {
    this.track('game_complete', { gameId, score });
  }

  public trackSearch(query: string, resultsCount: number): void {
    this.track('search', { query, resultsCount });
  }

  public trackCategoryClick(categorySlug: string): void {
    this.track('category_click', { categorySlug });
  }

  public trackFavoriteToggle(gameId: string, isFavorite: boolean): void {
    this.track('favorite_toggle', { gameId, isFavorite });
  }

  public getRecentEvents(): AnalyticsEvent[] {
    return [...this.queue];
  }
}

export const analytics = new AnalyticsService();
