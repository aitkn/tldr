export interface SummaryDocument {
  tldr: string;
  keyTakeaways: string[];
  summary: string;
  notableQuotes: string[];
  conclusion: string;
  prosAndCons?: { pros: string[]; cons: string[] };
  commentsHighlights?: string[];
  relatedTopics: string[];
  tags: string[];
  sourceLanguage?: string; // detected source language code, e.g. 'ru'
  summaryLanguage?: string; // language the summary is written in, e.g. 'en'
  translatedTitle?: string; // title translated to summary language (only when translated)
  inferredAuthor?: string; // author inferred from content when not in metadata
  inferredPublishDate?: string; // publish date inferred from content when not in metadata
}
