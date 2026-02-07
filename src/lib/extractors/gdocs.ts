import type { ContentExtractor, ExtractedContent } from './types';

const GDOCS_URL_RE = /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;

export const gdocsExtractor: ContentExtractor = {
  canExtract(url: string): boolean {
    return GDOCS_URL_RE.test(url);
  },

  extract(url: string, doc: Document): ExtractedContent {
    const match = url.match(GDOCS_URL_RE);
    const docId = match?.[1] || '';

    // Title from the DOM (Google Docs has this in a specific element)
    const title =
      doc.querySelector('.docs-title-input')?.textContent?.trim() ||
      doc.querySelector('title')?.textContent?.replace(/ - Google Docs$/, '').trim() ||
      'Google Doc';

    return {
      type: 'article',
      url,
      title,
      content: `[Fetching Google Doc content...]\n\n[GDOCS_EXPORT:${docId}]`,
      wordCount: 0,
      estimatedReadingTime: 0,
    };
  },
};

export function extractDocId(url: string): string | null {
  const match = url.match(GDOCS_URL_RE);
  return match?.[1] || null;
}
