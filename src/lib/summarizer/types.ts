/** Parse extraSections from LLM output: validate Record<string, string> and strip markdown bold from keys. */
export function coerceExtraSections(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const cleanKey = (k: string) => k.replace(/^\*\*(.+)\*\*$/, '$1').replace(/^__(.+)__$/, '$1').trim();
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => [cleanKey(k), v]);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export interface SummaryDocument {
  tldr: string;
  keyTakeaways: string[];
  summary: string;
  notableQuotes: string[];
  conclusion: string;
  prosAndCons?: { pros: string[]; cons: string[] };
  factCheck?: string;
  commentsHighlights?: string[];
  relatedTopics: string[];
  tags: string[];
  extraSections?: Record<string, string>; // custom sections added via chat refinement (key = title, value = markdown content)
  sourceLanguage?: string; // detected source language code, e.g. 'ru'
  summaryLanguage?: string; // language the summary is written in, e.g. 'en'
  translatedTitle?: string; // title translated to summary language (only when translated)
  inferredTitle?: string; // title inferred from content when not in metadata (e.g. Facebook posts)
  inferredAuthor?: string; // author inferred from content when not in metadata
  inferredPublishDate?: string; // publish date inferred from content when not in metadata
  llmProvider?: string; // display name of the LLM provider used, e.g. 'OpenAI'
  llmModel?: string; // model ID used for summarization, e.g. 'gpt-4o'
}
