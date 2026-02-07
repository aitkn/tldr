import { getSettings, saveSettings } from '@/lib/storage/settings';
import { getActiveProviderConfig } from '@/lib/storage/types';
import { createProvider } from '@/lib/llm/registry';
import { summarize } from '@/lib/summarizer/summarizer';
import type { Message, ExtractResultMessage, SummaryResultMessage, ChatResponseMessage, ConnectionTestResultMessage, SettingsResultMessage, SaveSettingsResultMessage, NotionDatabasesResultMessage, ExportResultMessage } from '@/lib/messaging/types';
import type { ChatMessage } from '@/lib/llm/types';
import type { SummaryDocument } from '@/lib/summarizer/types';
import type { ExtractedContent } from '@/lib/extractors/types';

export default defineBackground(() => {
  const chromeObj = (globalThis as unknown as { chrome: typeof chrome }).chrome;

  // Open side panel when extension icon is clicked
  (chromeObj as unknown as { sidePanel?: { setPanelBehavior: (opts: { openPanelOnActionClick: boolean }) => Promise<void> } })
    .sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  chromeObj.runtime.onMessage.addListener(
    (message: unknown, _sender: unknown, sendResponse: (response: unknown) => void) => {
      handleMessage(message as Message)
        .then(sendResponse)
        .catch((err) => {
          sendResponse({ type: (message as Message).type, success: false, error: String(err) });
        });
      return true; // keep channel open for async response
    },
  );
});

async function handleMessage(message: Message): Promise<Message> {
  switch (message.type) {
    case 'EXTRACT_CONTENT':
      return handleExtractContent();
    case 'EXTRACT_COMMENTS':
      return handleExtractComments();
    case 'SUMMARIZE':
      return handleSummarize(message.content, message.userInstructions);
    case 'CHAT_MESSAGE':
      return handleChatMessage(message.messages, message.summary, message.content);
    case 'EXPORT':
      return handleExport(message.adapterId, message.summary, message.content);
    case 'TEST_LLM_CONNECTION':
      return handleTestLLMConnection();
    case 'TEST_NOTION_CONNECTION':
      return handleTestNotionConnection();
    case 'GET_SETTINGS':
      return handleGetSettings();
    case 'SAVE_SETTINGS':
      return handleSaveSettings(message.settings);
    case 'FETCH_NOTION_DATABASES':
      return handleFetchNotionDatabases();
    default:
      return { type: (message as Message).type, success: false, error: 'Unknown message type' } as Message;
  }
}

async function handleExtractContent(): Promise<ExtractResultMessage> {
  try {
    const chromeTabs = (globalThis as unknown as { chrome: { tabs: typeof chrome.tabs } }).chrome.tabs;
    const [tab] = await chromeTabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    const response = await new Promise<unknown>((resolve, reject) => {
      chromeTabs.sendMessage(tab.id!, { type: 'EXTRACT_CONTENT' }, (resp: unknown) => {
        const chromeRT = (globalThis as unknown as { chrome: { runtime: typeof chrome.runtime } }).chrome.runtime;
        if (chromeRT.lastError) reject(new Error(chromeRT.lastError.message));
        else resolve(resp);
      });
    });
    return response as ExtractResultMessage;
  } catch (err) {
    return {
      type: 'EXTRACT_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleExtractComments(): Promise<Message> {
  try {
    const chromeTabs = (globalThis as unknown as { chrome: { tabs: typeof chrome.tabs } }).chrome.tabs;
    const [tab] = await chromeTabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    const response = await new Promise<unknown>((resolve, reject) => {
      chromeTabs.sendMessage(tab.id!, { type: 'EXTRACT_COMMENTS' }, (resp: unknown) => {
        const chromeRT = (globalThis as unknown as { chrome: { runtime: typeof chrome.runtime } }).chrome.runtime;
        if (chromeRT.lastError) reject(new Error(chromeRT.lastError.message));
        else resolve(resp);
      });
    });
    return response as Message;
  } catch (err) {
    return { type: 'EXTRACT_COMMENTS', success: false, error: err instanceof Error ? err.message : String(err) } as Message;
  }
}

async function handleSummarize(content: ExtractedContent, userInstructions?: string): Promise<SummaryResultMessage> {
  try {
    const settings = await getSettings();
    const llmConfig = getActiveProviderConfig(settings);

    if (!llmConfig.apiKey && llmConfig.providerId !== 'self-hosted') {
      throw new Error('Please configure your LLM API key in Settings');
    }

    const provider = createProvider(llmConfig);
    const result = await summarize(provider, content, {
      detailLevel: settings.summaryDetailLevel,
      language: settings.summaryLanguage,
      contextWindow: llmConfig.contextWindow,
      userInstructions,
      allowExplicitContent: settings.allowExplicitContent,
    });

    return { type: 'SUMMARY_RESULT', success: true, data: result };
  } catch (err) {
    return {
      type: 'SUMMARY_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleChatMessage(
  messages: ChatMessage[],
  summary: SummaryDocument,
  content: ExtractedContent,
): Promise<ChatResponseMessage> {
  try {
    const settings = await getSettings();
    const llmConfig = getActiveProviderConfig(settings);
    const provider = createProvider(llmConfig);

    const systemPrompt = `You are a helpful assistant that helps refine and discuss content summaries.
The user has a summary of a ${content.type === 'youtube' ? 'YouTube video' : 'web page'} titled "${content.title}".

Current summary (JSON):
${JSON.stringify(summary, null, 2)}

If the user asks to modify the summary, respond with the complete updated JSON summary.
If the user asks a question, respond naturally in text.`;

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await provider.sendChat(chatMessages);
    return { type: 'CHAT_RESPONSE', success: true, message: response };
  } catch (err) {
    return {
      type: 'CHAT_RESPONSE',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleExport(
  adapterId: string,
  summary: SummaryDocument,
  content: ExtractedContent,
): Promise<ExportResultMessage> {
  try {
    if (adapterId !== 'notion') {
      throw new Error(`Unknown export adapter: ${adapterId}`);
    }

    const settings = await getSettings();
    if (!settings.notion.apiKey) {
      throw new Error('Please configure your Notion API key in Settings');
    }

    const { NotionAdapter } = await import('@/lib/export/notion');
    const adapter = new NotionAdapter(settings.notion);
    const result = await adapter.export(summary, content);

    if (result.databaseId && !settings.notion.databaseId) {
      await saveSettings({
        notion: { ...settings.notion, databaseId: result.databaseId },
      });
    }

    return { type: 'EXPORT_RESULT', success: true, url: result.url };
  } catch (err) {
    return {
      type: 'EXPORT_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleTestLLMConnection(): Promise<ConnectionTestResultMessage> {
  try {
    const settings = await getSettings();
    const provider = createProvider(getActiveProviderConfig(settings));
    const success = await provider.testConnection();
    return { type: 'CONNECTION_TEST_RESULT', success };
  } catch (err) {
    return {
      type: 'CONNECTION_TEST_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleTestNotionConnection(): Promise<ConnectionTestResultMessage> {
  try {
    const settings = await getSettings();
    if (!settings.notion.apiKey) throw new Error('Notion API key not configured');

    const response = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${settings.notion.apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    });

    return { type: 'CONNECTION_TEST_RESULT', success: response.ok };
  } catch (err) {
    return {
      type: 'CONNECTION_TEST_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function handleGetSettings(): Promise<SettingsResultMessage> {
  const settings = await getSettings();
  return { type: 'SETTINGS_RESULT', settings };
}

async function handleSaveSettings(partial: object): Promise<SaveSettingsResultMessage> {
  try {
    await saveSettings(partial);
    return { type: 'SAVE_SETTINGS_RESULT', success: true };
  } catch {
    return { type: 'SAVE_SETTINGS_RESULT', success: false };
  }
}

async function handleFetchNotionDatabases(): Promise<NotionDatabasesResultMessage> {
  try {
    const settings = await getSettings();
    if (!settings.notion.apiKey) throw new Error('Notion API key not configured');

    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.notion.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        page_size: 100,
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch databases');

    const data = await response.json();
    const databases = data.results.map((db: Record<string, unknown>) => ({
      id: db.id,
      title: ((db.title as Array<{ plain_text: string }>)?.[0]?.plain_text) || 'Untitled',
    }));

    return { type: 'NOTION_DATABASES_RESULT', success: true, databases };
  } catch (err) {
    return {
      type: 'NOTION_DATABASES_RESULT',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
