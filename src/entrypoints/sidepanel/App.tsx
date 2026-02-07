import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import type { SummaryDocument } from '@/lib/summarizer/types';
import type { ExtractedContent } from '@/lib/extractors/types';
import type { ChatMessage } from '@/lib/llm/types';
import type { Settings } from '@/lib/storage/types';
import { DEFAULT_SETTINGS } from '@/lib/storage/types';
import { sendMessage } from '@/lib/messaging/bridge';
import type {
  ExtractResultMessage,
  SummaryResultMessage,
  ChatResponseMessage,
  ConnectionTestResultMessage,
  SettingsResultMessage,
  SaveSettingsResultMessage,
  NotionDatabasesResultMessage,
  ExportResultMessage,
} from '@/lib/messaging/types';
import { SummaryContent, MetadataHeader } from './pages/SummaryView';
import { SettingsView } from './pages/SettingsView';
import { Toast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { ChatInputBar } from '@/components/ChatInputBar';
import type { SummarizeVariant } from '@/components/ChatInputBar';
import { useTheme } from '@/hooks/useTheme';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_PROMPTS = [
  'Summarize briefly',
  'Focus on key arguments',
  'Highlight technical details',
];

export function App() {
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  const [summary, setSummary] = useState<SummaryDocument | null>(null);
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Settings drawer
  const [settingsOpen, setSettingsOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract content from active tab
  const extractContent = useCallback(async () => {
    setExtracting(true);
    try {
      const response = await sendMessage({ type: 'EXTRACT_CONTENT' }) as ExtractResultMessage;
      if (response.success && response.data) {
        setContent(response.data);
        // Reset summary & chat when page changes
        setSummary(null);
        setChatMessages([]);
      }
    } catch {
      // Silently fail — user can still click Summarize which will retry
    } finally {
      setExtracting(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    sendMessage({ type: 'GET_SETTINGS' }).then((response) => {
      const res = response as SettingsResultMessage;
      if (res.settings) {
        setSettings(res.settings);
        if (res.settings.theme) {
          setThemeMode(res.settings.theme);
        }
      }
    });
  }, [setThemeMode]);

  // Auto-extract on mount
  useEffect(() => {
    extractContent();
  }, [extractContent]);

  // Re-extract when active tab changes
  useEffect(() => {
    const chromeObj = (globalThis as unknown as { chrome: typeof chrome }).chrome;
    let spaTimer: ReturnType<typeof setTimeout> | null = null;

    const onActivated = () => { extractContent(); };
    const onUpdated = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete') {
        extractContent();
      }
      // SPA navigation (e.g. YouTube): URL changes without a full reload.
      // Delay extraction to let the SPA update the DOM.
      if (changeInfo.url) {
        if (spaTimer) clearTimeout(spaTimer);
        spaTimer = setTimeout(() => extractContent(), 1500);
      }
    };

    chromeObj.tabs.onActivated.addListener(onActivated);
    chromeObj.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chromeObj.tabs.onActivated.removeListener(onActivated);
      chromeObj.tabs.onUpdated.removeListener(onUpdated);
      if (spaTimer) clearTimeout(spaTimer);
    };
  }, [extractContent]);

  // YouTube lazy-loads comments — retry a few times after extraction
  useEffect(() => {
    if (!content || content.type !== 'youtube') return;
    if ((content.comments?.length ?? 0) > 0) return;

    const delays = [3000, 6000, 10000];
    const timers = delays.map((delay) =>
      setTimeout(async () => {
        try {
          const resp = await sendMessage({ type: 'EXTRACT_COMMENTS' }) as { success: boolean; comments?: ExtractedContent['comments'] };
          if (resp.success && resp.comments && resp.comments.length > 0) {
            setContent((prev) => prev ? { ...prev, comments: resp.comments } : prev);
          }
        } catch { /* ignore */ }
      }, delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [content?.url]); // re-run when URL changes, not on every content update

  // Scroll to bottom when new chat messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const isFirstSubmit = !summary && chatMessages.length === 0;

  // Compute summarize button state for YouTube pages
  const summarizeVariant: SummarizeVariant = (() => {
    if (!content) return 'primary';
    if (content.type !== 'youtube') return 'primary';

    const hasTranscriptMarker = content.content.includes('[YOUTUBE_TRANSCRIPT:');
    const hasTranscriptError = content.content.includes('*Transcript could not be loaded:');
    const transcriptLoaded = !hasTranscriptMarker && !hasTranscriptError;

    if (transcriptLoaded) return 'primary';
    // No transcript — amber warning (comments may still be loading lazily)
    return 'amber';
  })();

  const handleSummarize = useCallback(async (userInstructions?: string) => {
    setLoading(true);

    // Show user instructions in chat if provided
    if (userInstructions) {
      setChatMessages((prev) => [...prev, { role: 'user', content: userInstructions }]);
    }

    try {
      // Re-extract if we don't have content yet
      let extractedContent = content;
      if (!extractedContent) {
        const extractResponse = await sendMessage({ type: 'EXTRACT_CONTENT' }) as ExtractResultMessage;
        if (!extractResponse.success || !extractResponse.data) {
          throw new Error(extractResponse.error || 'Failed to extract content');
        }
        extractedContent = extractResponse.data;
        setContent(extractedContent);
      }

      const summaryResponse = await sendMessage({
        type: 'SUMMARIZE',
        content: extractedContent,
        userInstructions,
      }) as SummaryResultMessage;

      if (!summaryResponse.success || !summaryResponse.data) {
        throw new Error(summaryResponse.error || 'Failed to generate summary');
      }
      setSummary(summaryResponse.data);
    } catch (err) {
      // Route failures to chat as assistant messages
      const message = err instanceof Error ? err.message : String(err);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setLoading(false);
    }
  }, [content]);

  const handleExport = useCallback(async () => {
    if (!summary || !content) return;

    try {
      const response = await sendMessage({
        type: 'EXPORT',
        adapterId: 'notion',
        summary,
        content,
      }) as ExportResultMessage;

      if (response.success && response.url) {
        setToast({ message: 'Exported to Notion!', type: 'success' });
      } else {
        setToast({ message: response.error || 'Export failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Export failed', type: 'error' });
    }
  }, [summary, content]);

  const handleChatSend = useCallback(async (text: string) => {
    if (!content) return;

    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
    setChatLoading(true);

    try {
      const allMessages: ChatMessage[] = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      allMessages.push({ role: 'user', content: text });

      const emptySummary: SummaryDocument = {
        tldr: '', keyTakeaways: [], summary: '', notableQuotes: [],
        conclusion: '', relatedTopics: [], tags: [],
      };

      const response = await sendMessage({
        type: 'CHAT_MESSAGE',
        messages: allMessages,
        summary: summary || emptySummary,
        content,
      }) as ChatResponseMessage;

      if (!response.success || !response.message) {
        throw new Error(response.error || 'Chat failed');
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: response.message! }]);

      // Try to parse as updated summary JSON
      let cleaned = response.message.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.tldr && parsed.summary) {
          setSummary(parsed);
          setToast({ message: 'Summary updated from chat', type: 'success' });
        }
      } catch {
        // Not a JSON update
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [summary, content, chatMessages]);

  const handleSubmit = useCallback(() => {
    const text = inputValue.trim();
    if (!text && isFirstSubmit) {
      if (summarizeVariant === 'amber') {
        setToast({ message: 'No transcript available — summarizing from comments only', type: 'info' });
      }
      handleSummarize();
      setInputValue('');
      return;
    }
    if (!text) return;

    setInputValue('');
    if (isFirstSubmit) {
      if (summarizeVariant === 'amber') {
        setToast({ message: 'No transcript available — summarizing from comments only', type: 'info' });
      }
      handleSummarize(text);
    } else {
      handleChatSend(text);
    }
  }, [inputValue, isFirstSubmit, handleSummarize, handleChatSend, summarizeVariant]);

  const handleSaveSettings = useCallback(async (newSettings: Settings) => {
    const response = await sendMessage({
      type: 'SAVE_SETTINGS',
      settings: newSettings,
    }) as SaveSettingsResultMessage;

    if (response.success) {
      setSettings(newSettings);
      setToast({ message: 'Settings saved', type: 'success' });
    }
  }, []);

  const handleTestLLM = useCallback(async (): Promise<boolean> => {
    const response = await sendMessage({ type: 'TEST_LLM_CONNECTION' }) as ConnectionTestResultMessage;
    return response.success;
  }, []);

  const handleTestNotion = useCallback(async (): Promise<boolean> => {
    const response = await sendMessage({ type: 'TEST_NOTION_CONNECTION' }) as ConnectionTestResultMessage;
    return response.success;
  }, []);

  const handleFetchNotionDatabases = useCallback(async (): Promise<Array<{ id: string; title: string }>> => {
    const response = await sendMessage({ type: 'FETCH_NOTION_DATABASES' }) as NotionDatabasesResultMessage;
    return response.databases || [];
  }, []);

  const handleThemeChange = useCallback((mode: Settings['theme']) => {
    setThemeMode(mode);
    sendMessage({ type: 'SAVE_SETTINGS', settings: { theme: mode } });
  }, [setThemeMode]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--md-sys-color-surface)' }}>
      {/* Header */}
      <Header
        onThemeToggle={() => {
          const next = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
          handleThemeChange(next);
        }}
        themeMode={themeMode}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Scrollable content area */}
      <div ref={scrollAreaRef} style={{ flex: 1, overflow: 'auto' }}>
        {/* Extracting state */}
        {extracting && !content && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Spinner label="Reading page..." />
          </div>
        )}

        {/* No content extracted (e.g. chrome:// pages) */}
        {!content && !extracting && !loading && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              font: 'var(--md-sys-typescale-title-large)',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '8px',
            }}>
              TLDR
            </div>
            <p style={{
              font: 'var(--md-sys-typescale-body-medium)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              Navigate to a page to get started.
            </p>
          </div>
        )}

        {/* Page metadata — always visible when content is extracted */}
        {content && (
          <div style={{ padding: '16px' }}>
            <MetadataHeader content={content} />
            <ContentIndicators content={content} />
          </div>
        )}

        {/* Prompt chips — only before first interaction */}
        {content && !summary && !loading && chatMessages.length === 0 && (
          <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  color: 'var(--md-sys-color-on-surface)',
                  font: 'var(--md-sys-typescale-label-large)',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Loading summary spinner */}
        {loading && (
          <div style={{ padding: '0 16px 16px' }}>
            <Spinner label="Generating summary..." />
          </div>
        )}

        {/* Summary section */}
        {summary && !loading && (
          <div style={{ padding: '0 16px' }}>
            <SummaryContent
              summary={summary}
              content={content}
              onExport={handleExport}
            />
          </div>
        )}

        {/* Chat section */}
        {chatMessages.length > 0 && (
          <div style={{ padding: '8px 16px 16px' }}>
            <div style={{
              font: 'var(--md-sys-typescale-label-medium)',
              color: 'var(--md-sys-color-on-surface-variant)',
              padding: '8px 0',
              marginBottom: '4px',
              borderTop: '1px solid var(--md-sys-color-outline-variant)',
            }}>
              Chat
            </div>
            {chatMessages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {chatLoading && (
              <div style={{ padding: '8px 12px', font: 'var(--md-sys-typescale-body-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Thinking...
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <ChatInputBar
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isFirstSubmit={isFirstSubmit}
        loading={loading || chatLoading}
        summarizeVariant={isFirstSubmit ? summarizeVariant : 'primary'}
      />

      {/* Settings drawer */}
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingsView
          settings={settings}
          onSave={handleSaveSettings}
          onTestLLM={handleTestLLM}
          onTestNotion={handleTestNotion}
          onFetchNotionDatabases={handleFetchNotionDatabases}
          onThemeChange={handleThemeChange}
          currentTheme={themeMode}
        />
      </SettingsDrawer>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function ContentIndicators({ content }: { content: ExtractedContent }) {
  const isYouTube = content.type === 'youtube';
  const commentCount = content.comments?.length ?? 0;

  // Transcript is resolved during extraction now.
  const hasTranscriptMarker = content.content.includes('[YOUTUBE_TRANSCRIPT:');
  const hasTranscriptError = content.content.includes('*Transcript could not be loaded:');
  const transcriptLoaded = isYouTube && !hasTranscriptMarker && !hasTranscriptError;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
      {isYouTube ? (
        <IndicatorChip
          icon={transcriptLoaded ? '\u2713' : '\u2717'}
          label={transcriptLoaded ? 'Transcript' : 'No transcript'}
          variant={transcriptLoaded ? 'success' : 'warning'}
        />
      ) : (
        <IndicatorChip icon={'\u2713'} label={`${content.wordCount.toLocaleString()} words`} variant="success" />
      )}
      {commentCount > 0 && (
        <IndicatorChip icon={String.fromCodePoint(0x1F4AC)} label={`${commentCount} comments`} variant="success" />
      )}
      {content.language && content.language.trim() && (
        <IndicatorChip icon={String.fromCodePoint(0x1F310)} label={content.language} variant="neutral" />
      )}
    </div>
  );
}

function IndicatorChip({ icon, label, variant }: { icon: string; label: string; variant: 'success' | 'neutral' | 'warning' }) {
  const colors = {
    success: { bg: 'var(--md-sys-color-success-container, #d1fae5)', fg: 'var(--md-sys-color-on-success-container, #065f46)' },
    warning: { bg: '#fef3c7', fg: '#92400e' },
    neutral: { bg: 'var(--md-sys-color-surface-container-high)', fg: 'var(--md-sys-color-on-surface-variant)' },
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      font: 'var(--md-sys-typescale-label-small)',
      backgroundColor: colors[variant].bg,
      color: colors[variant].fg,
    }}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

function Header({ onThemeToggle, themeMode, onOpenSettings }: {
  onThemeToggle: () => void;
  themeMode: string;
  onOpenSettings: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      flexShrink: 0,
      backgroundColor: 'var(--md-sys-color-surface)',
    }}>
      <span style={{ font: 'var(--md-sys-typescale-title-large)', color: 'var(--md-sys-color-on-surface)' }}>
        TLDR
      </span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <IconButton onClick={onThemeToggle} label={`Theme: ${themeMode}`}>
          {themeMode === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" /></svg>
          ) : themeMode === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" /></svg>
          )}
        </IconButton>
        <IconButton onClick={onOpenSettings} label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: preact.ComponentChildren }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: 'var(--md-sys-shape-corner-small)',
        color: 'var(--md-sys-color-on-surface-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

function ChatBubble({ role, content: text }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        marginBottom: '8px',
        padding: '10px 14px',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        font: 'var(--md-sys-typescale-body-medium)',
        lineHeight: 1.5,
        backgroundColor: isUser ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)',
        color: isUser ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
        maxWidth: '90%',
        marginLeft: isUser ? 'auto' : '0',
        marginRight: isUser ? '0' : 'auto',
      }}
    >
      {isUser ? text : <MarkdownRenderer content={text} />}
    </div>
  );
}
