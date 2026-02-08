import type { ExtractedImage } from './types';

const GENERIC_ALT_PATTERNS = /^(image|photo|picture|img|icon|logo|avatar|thumbnail|banner|placeholder|decorative|spacer)$/i;

const AD_TRACKING_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'facebook.com/tr', 'pixel.', 'tracking.', 'analytics.',
  'ads.', 'adserver.', 'beacon.',
];

function isAdOrTracking(url: string): boolean {
  const lower = url.toLowerCase();
  return AD_TRACKING_DOMAINS.some((d) => lower.includes(d));
}

function hasMeaningfulAlt(alt: string): boolean {
  return alt.length > 10 && !GENERIC_ALT_PATTERNS.test(alt.trim());
}

export function extractRichImages(container: HTMLElement): ExtractedImage[] {
  const results: ExtractedImage[] = [];
  const seen = new Set<string>();

  const imgs = container.querySelectorAll('img');
  for (const img of imgs) {
    const src = img.src || img.getAttribute('data-src') || '';
    if (!src || src.startsWith('data:')) continue;
    if (seen.has(src)) continue;
    if (isAdOrTracking(src)) continue;
    // Skip GIFs — LLM APIs only support JPEG, PNG, and WEBP
    if (/\.gif(\?|$)/i.test(src)) continue;

    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
    if (width > 0 && width < 50) continue;
    if (height > 0 && height < 50) continue;

    const alt = img.alt || '';
    const figure = img.closest('figure');
    const caption = figure?.querySelector('figcaption')?.textContent?.trim() || undefined;

    const isInline = !!(caption || hasMeaningfulAlt(alt));

    seen.add(src);
    results.push({
      url: src,
      alt,
      caption,
      tier: isInline ? 'inline' : 'contextual',
      width: width || undefined,
      height: height || undefined,
    });
  }

  return results;
}
