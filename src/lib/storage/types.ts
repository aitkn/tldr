export type ThemeMode = 'light' | 'dark' | 'system';

export interface ProviderConfig {
  providerId: string; // 'openai' | 'anthropic' | 'google' | 'xai' | 'deepseek' | 'self-hosted'
  apiKey: string;
  model: string;
  endpoint?: string; // custom endpoint for self-hosted
  contextWindow: number; // in tokens
}

export interface NotionConfig {
  apiKey: string;
  databaseId?: string;
  databaseName?: string;
}

export interface Settings {
  providerConfigs: Record<string, ProviderConfig>;
  activeProviderId: string;
  notion: NotionConfig;
  summaryLanguage: string; // e.g. 'en', 'auto'
  summaryDetailLevel: 'brief' | 'standard' | 'detailed';
  allowExplicitContent: boolean;
  theme: ThemeMode;
}

export const DEFAULT_SETTINGS: Settings = {
  providerConfigs: {
    openai: {
      providerId: 'openai',
      apiKey: '',
      model: 'gpt-4o',
      contextWindow: 128000,
    },
  },
  activeProviderId: 'openai',
  notion: {
    apiKey: '',
  },
  summaryLanguage: 'auto',
  summaryDetailLevel: 'standard',
  allowExplicitContent: false,
  theme: 'system',
};

export function getActiveProviderConfig(settings: Settings): ProviderConfig {
  const config = settings.providerConfigs[settings.activeProviderId];
  if (config) return config;
  // Fallback: return the first available config or a default
  const firstKey = Object.keys(settings.providerConfigs)[0];
  if (firstKey) return settings.providerConfigs[firstKey];
  return DEFAULT_SETTINGS.providerConfigs['openai'];
}
