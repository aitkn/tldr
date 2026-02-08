import type { LLMProvider, VisionSupport } from './types';

// 32x32 solid red PNG (97 bytes) — large enough for all LLM APIs to accept
const PROBE_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKElEQVR4nO3NsQ0AAAzCMP5/un0CNkuZ41wybXsHAAAAAAAAAAAAxR4yw/wuPL6QkAAAAABJRU5ErkJggg==';

// Known public PNG with recognizable content (Google logo)
const PROBE_URL = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';

export async function probeVision(provider: LLMProvider): Promise<VisionSupport> {
  // Step 1: base64 probe — send a red image, check if model says "red"
  const base64Works = await probeBase64(provider);
  if (!base64Works) return 'none';

  // Step 2: URL probe (only if base64 works)
  const urlWorks = await probeUrl(provider);
  return urlWorks ? 'url' : 'base64';
}

async function probeBase64(provider: LLMProvider): Promise<boolean> {
  try {
    const response = await provider.sendChat(
      [
        {
          role: 'user',
          content: 'What color is this image? Reply with just the color name.',
          images: [{ base64: PROBE_IMAGE_BASE64, mimeType: 'image/png' }],
        },
      ],
      { maxTokens: 2048 },
    );
    const lower = response.toLowerCase();
    // Only accept if the model correctly identifies the color as red.
    // Text-only models can't see the image and will guess wrong or the API will reject.
    return lower.includes('red') || lower.includes('scarlet') || lower.includes('crimson');
  } catch {
    return false;
  }
}

async function probeUrl(provider: LLMProvider): Promise<boolean> {
  try {
    const response = await provider.sendChat(
      [
        {
          role: 'user',
          content: 'What company logo is this? Reply with just the company name.',
          images: [{ url: PROBE_URL }],
        },
      ],
      { maxTokens: 2048 },
    );
    const lower = response.toLowerCase();
    // Google logo — model must identify Google to confirm URL vision works
    return lower.includes('google');
  } catch {
    return false;
  }
}
