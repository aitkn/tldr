import type { ContentExtractor, ExtractedContent } from './types';

export const genericExtractor: ContentExtractor = {
  canExtract(): boolean {
    return true; // always usable as fallback
  },

  extract(url: string, doc: Document): ExtractedContent {
    const title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.title ||
      'Untitled Page';

    const author =
      doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
      undefined;

    const description =
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      '';

    const language = doc.documentElement.lang || undefined;

    // Extract main content area
    const content = extractMainContent(doc, description);
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
      type: 'generic',
      url,
      title,
      author,
      language,
      content,
      wordCount,
      estimatedReadingTime: Math.ceil(wordCount / 200),
    };
  },
};

function extractMainContent(doc: Document, description: string): string {
  // Try common main content selectors
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '#content',
    '#main-content',
    '.main-content',
    '.post-content',
    '.entry-content',
    '.article-content',
  ];

  for (const selector of mainSelectors) {
    const el = doc.querySelector(selector);
    if (el) {
      const text = cleanText(el.textContent || '');
      if (text.length > 100) {
        return text;
      }
    }
  }

  // Fallback: grab body text, removing nav/footer/header
  const body = doc.body.cloneNode(true) as HTMLElement;
  const removable = body.querySelectorAll('nav, footer, header, script, style, [role="navigation"], [role="banner"], [role="contentinfo"], aside');
  removable.forEach((el) => el.remove());

  const text = cleanText(body.textContent || '');
  if (text.length > 50) return text;

  // Last resort: use description
  return description || 'No readable content found on this page.';
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
