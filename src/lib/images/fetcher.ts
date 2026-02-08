import type { ExtractedImage } from '../extractors/types';

export interface FetchedImage {
  url: string;
  base64: string;
  mimeType: string;
  tier: 'inline' | 'contextual';
  alt: string;
  caption?: string;
}

const MAX_IMAGE_BYTES = 1_024_000; // 1 MB
const FETCH_TIMEOUT_MS = 15_000;
const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.8;

export async function fetchImages(
  images: ExtractedImage[],
  maxCount = 5,
): Promise<FetchedImage[]> {
  // Prioritize inline images first, then contextual
  const sorted = [
    ...images.filter((i) => i.tier === 'inline'),
    ...images.filter((i) => i.tier === 'contextual'),
  ].slice(0, maxCount);

  const results: FetchedImage[] = [];

  for (const img of sorted) {
    try {
      const fetched = await fetchSingleImage(img);
      if (fetched) results.push(fetched);
    } catch {
      // Skip failed images silently
    }
  }

  return results;
}

async function fetchSingleImage(img: ExtractedImage): Promise<FetchedImage | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(img.url, { signal: controller.signal });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;

    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) {
      // Try to resize
      return await resizeAndEncode(blob, img);
    }

    const base64 = await blobToBase64(blob);
    const mimeType = blob.type || 'image/jpeg';

    return { url: img.url, base64, mimeType, tier: img.tier, alt: img.alt, caption: img.caption };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resizeAndEncode(blob: Blob, img: ExtractedImage): Promise<FetchedImage | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;

    // Calculate scaled dimensions
    let newWidth = width;
    let newHeight = height;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      newWidth = Math.round(width * scale);
      newHeight = Math.round(height * scale);
    }

    const canvas = new OffscreenCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    bitmap.close();

    const resizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY });
    if (resizedBlob.size > MAX_IMAGE_BYTES) return null; // still too big after resize

    const base64 = await blobToBase64(resizedBlob);
    return { url: img.url, base64, mimeType: 'image/jpeg', tier: img.tier, alt: img.alt, caption: img.caption };
  } catch {
    return null; // resize not supported or failed
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix — providers format differently
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
