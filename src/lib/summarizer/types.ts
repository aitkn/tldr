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
}
