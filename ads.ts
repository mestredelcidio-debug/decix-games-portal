/**
 * DECIX GAMES – Architecture for Advertising & Monetization
 * Interfaces padronizadas para AdProvider e AdManager
 */

export type AdSlotType = 'banner_top' | 'banner_bottom' | 'in_game_pre_roll' | 'interstitial' | 'rewarded';

export interface AdConfig {
  enabled: boolean;
  provider: 'GAMEPIX' | 'CUSTOM' | 'NONE';
  testMode?: boolean;
}

export interface AdEventPayload {
  slot: AdSlotType;
  gameId?: string;
  success: boolean;
  rewarded?: boolean;
  error?: string;
}

export interface IAdProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  showBanner(elementId: string, slot: AdSlotType): Promise<boolean>;
  showInterstitial(gameId?: string): Promise<boolean>;
  showRewarded(gameId?: string): Promise<{ completed: boolean }>;
  hideBanner(elementId: string): void;
}
