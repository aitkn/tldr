const CHARS_PER_TOKEN = 4;

export interface ChunkOptions {
  contextWindow: number;
  reservedForSystemPrompt?: number;
  reservedForOutput?: number;
  reservedForRollingContext?: number;
}

const DEFAULTS: Required<Omit<ChunkOptions, 'contextWindow'>> = {
  reservedForSystemPrompt: 1000,
  reservedForOutput: 3000,
  reservedForRollingContext: 2000,
};

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function chunkContent(content: string, options: ChunkOptions): string[] {
  const {
    contextWindow,
    reservedForSystemPrompt = DEFAULTS.reservedForSystemPrompt,
    reservedForOutput = DEFAULTS.reservedForOutput,
    reservedForRollingContext = DEFAULTS.reservedForRollingContext,
  } = options;

  const availableTokens = contextWindow - reservedForSystemPrompt - reservedForOutput - reservedForRollingContext;
  const availableChars = availableTokens * CHARS_PER_TOKEN;

  const contentTokens = estimateTokens(content);
  if (contentTokens <= availableTokens) {
    return [content]; // fits in one request
  }

  // Split at paragraph boundaries
  const paragraphs = content.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > availableChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }

    // If a single paragraph exceeds the limit, split it at sentence boundaries
    if (paragraph.length > availableChars) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      const sentences = paragraph.match(/[^.!?]+[.!?]+\s*/g) || [paragraph];
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > availableChars && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        currentChunk += sentence;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
