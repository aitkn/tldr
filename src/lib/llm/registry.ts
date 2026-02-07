import type { LLMProvider, ProviderConfig, ProviderDefinition } from './types';
import { OpenAICompatibleProvider } from './provider';
import { AnthropicProvider } from './anthropic';
import { GoogleProvider } from './google';

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultEndpoint: 'https://api.openai.com',
    defaultModels: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultEndpoint: 'https://api.anthropic.com',
    defaultModels: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000 },
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    defaultModels: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1000000 },
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', contextWindow: 1000000 },
    ],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    defaultEndpoint: 'https://api.x.ai',
    defaultModels: [
      { id: 'grok-2', name: 'Grok-2', contextWindow: 128000 },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultEndpoint: 'https://api.deepseek.com',
    defaultModels: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', contextWindow: 64000 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextWindow: 64000 },
    ],
  },
  {
    id: 'self-hosted',
    name: 'Self-hosted',
    defaultEndpoint: 'http://localhost:11434',
    defaultModels: [
      { id: 'custom', name: 'Custom Model', contextWindow: 100000 },
    ],
  },
];

export function createProvider(config: ProviderConfig): LLMProvider {
  const definition = PROVIDER_DEFINITIONS.find((d) => d.id === config.providerId);
  const defaultEndpoint = definition?.defaultEndpoint || '';

  switch (config.providerId) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'google':
      return new GoogleProvider(config);
    case 'openai':
      return new OpenAICompatibleProvider(config, 'OpenAI', defaultEndpoint);
    case 'xai':
      return new OpenAICompatibleProvider(config, 'xAI (Grok)', defaultEndpoint);
    case 'deepseek':
      return new OpenAICompatibleProvider(config, 'DeepSeek', defaultEndpoint);
    case 'self-hosted':
      return new OpenAICompatibleProvider(config, 'Self-hosted', defaultEndpoint);
    default:
      // Treat unknown providers as OpenAI-compatible
      return new OpenAICompatibleProvider(config, config.providerId, defaultEndpoint);
  }
}

export function getProviderDefinition(providerId: string): ProviderDefinition | undefined {
  return PROVIDER_DEFINITIONS.find((d) => d.id === providerId);
}
