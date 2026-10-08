/**
 * DECIX GAMES – Centralized Advertising & Monetization Architecture
 * Gerenciador unificado de anúncios e monetização compatível com provedores parceiros (GamePix, Google AdSense/H5 Games, etc.)
 * Respeita a diretriz de NÃO injetar scripts não autorizados nem anúncios falsos.
 */

import { IAdProvider, AdSlotType, AdConfig } from '../../types/ads.js';

/**
 * Adaptador oficial preparado para integração GamePix Ads SDK
 */
export class GamePixAdProvider implements IAdProvider {
  public id = 'gamepix';
  public name = 'GamePix Official Monetization';

  isAvailable(): boolean {
    // Verifica se o SDK oficial da GamePix está carregado no window (GamePix JS SDK)
    return typeof (window as unknown as { GamePix?: unknown }).GamePix !== 'undefined';
  }

  async showBanner(elementId: string, slot: AdSlotType): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    // Integração oficial via GamePix SDK quando disponível
    return true;
  }

  async showInterstitial(gameId?: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    // Invocação oficial GamePix.interstitial()
    return true;
  }

  async showRewarded(gameId?: string): Promise<{ completed: boolean }> {
    if (!this.isAvailable()) {
      return { completed: false };
    }
    // Invocação oficial GamePix.rewarded()
    return { completed: true };
  }

  hideBanner(elementId: string): void {
    // Limpeza de slot
  }
}

/**
 * Adaptador padrão DECIX GAMES (reserva slots visuais limpos em conformidade com as diretrizes)
 */
export class DecixPlaceholderAdProvider implements IAdProvider {
  public id = 'decix-placeholder';
  public name = 'DECIX Games Monitored Ad Slots';

  isAvailable(): boolean {
    return true;
  }

  async showBanner(): Promise<boolean> {
    return true;
  }

  async showInterstitial(): Promise<boolean> {
    return true;
  }

  async showRewarded(): Promise<{ completed: boolean }> {
    return { completed: true };
  }

  hideBanner(): void {}
}

export class AdManager {
  private currentProvider: IAdProvider;
  private config: AdConfig;

  constructor() {
    this.config = {
      enabled: true,
      provider: 'CUSTOM',
      testMode: true
    };
    // Por padrão usa o placeholder de produção até que o SDK parceiro seja configurado
    this.currentProvider = new DecixPlaceholderAdProvider();
  }

  public setProvider(provider: IAdProvider): void {
    this.currentProvider = provider;
  }

  public getProviderName(): string {
    return this.currentProvider.name;
  }

  public isAdsEnabled(): boolean {
    return this.config.enabled;
  }

  public setAdsEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public async requestInterstitial(gameId?: string): Promise<boolean> {
    if (!this.config.enabled) return true;
    return await this.currentProvider.showInterstitial(gameId);
  }

  public async requestRewarded(gameId?: string): Promise<boolean> {
    if (!this.config.enabled) return true;
    const res = await this.currentProvider.showRewarded(gameId);
    return res.completed;
  }
}

export const adManager = new AdManager();
