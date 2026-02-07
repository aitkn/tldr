import type { LLMProvider, ChatMessage } from '../llm/types';
import type { ExtractedContent } from '../extractors/types';
import type { SummaryDocument } from './types';
import { chunkContent, type ChunkOptions } from './chunker';
import {
  getSystemPrompt,
  getSummarizationPrompt,
  getRollingContextPrompt,
  getFinalChunkPrompt,
} from './prompts';

/** Thrown when the LLM returns a text response instead of structured JSON (e.g. refusal). Not retryable. */
export class LLMTextResponse extends Error {
  constructor(public readonly llmResponse: string) {
    super(llmResponse);
    this.name = 'LLMTextResponse';
  }
}

export interface SummarizeOptions {
  detailLevel: 'brief' | 'standard' | 'detailed';
  language: string;
  contextWindow: number;
  maxRetries?: number;
  userInstructions?: string;
  allowExplicitContent?: boolean;
}

export async function summarize(
  provider: LLMProvider,
  content: ExtractedContent,
  options: SummarizeOptions,
): Promise<SummaryDocument> {
  const { detailLevel, language, contextWindow, maxRetries = 2, userInstructions, allowExplicitContent } = options;
  let systemPrompt = getSystemPrompt(detailLevel, language);
  if (allowExplicitContent) {
    systemPrompt += `\n\nIMPORTANT: The content may contain mature, explicit, or sensitive topics (medical, psychological, sexual health, etc.). You MUST still summarize it fully and accurately. However, keep the summary professional and clinical in tone — do not reproduce explicit language or graphic details. Focus on the key ideas, arguments, and conclusions.`;
  }
  if (userInstructions) {
    systemPrompt += `\n\nAdditional user instructions: ${userInstructions}`;
  }

  const chunkOptions: ChunkOptions = { contextWindow };
  const chunks = chunkContent(content.content, chunkOptions);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (chunks.length === 1) {
        return await oneShotSummarize(provider, content, systemPrompt);
      } else {
        return await rollingContextSummarize(provider, content, chunks, systemPrompt);
      }
    } catch (err) {
      // Don't retry if the LLM gave a text response (refusal, etc.) — it won't change
      if (err instanceof LLMTextResponse) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Summarization failed');
}

async function oneShotSummarize(
  provider: LLMProvider,
  content: ExtractedContent,
  systemPrompt: string,
): Promise<SummaryDocument> {
  const userPrompt = getSummarizationPrompt(content);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await provider.sendChat(messages, { maxTokens: 4096 });
  return parseSummaryResponse(response);
}

async function rollingContextSummarize(
  provider: LLMProvider,
  content: ExtractedContent,
  chunks: string[],
  systemPrompt: string,
): Promise<SummaryDocument> {
  let rollingSummary = '';

  for (let i = 0; i < chunks.length; i++) {
    const isLast = i === chunks.length - 1;

    // Build a modified content object with just this chunk
    const chunkContent: ExtractedContent = {
      ...content,
      content: chunks[i],
      // Only include comments in the last chunk
      comments: isLast ? content.comments : undefined,
    };

    let userPrompt = '';

    if (i === 0) {
      userPrompt = getSummarizationPrompt(chunkContent);
    } else {
      userPrompt = getRollingContextPrompt(rollingSummary) + '\n\n';
      if (isLast) {
        userPrompt += getFinalChunkPrompt() + '\n\n';
      }
      userPrompt += `**Content (part ${i + 1} of ${chunks.length}):**\n\n${chunks[i]}`;

      if (isLast && content.comments && content.comments.length > 0) {
        userPrompt += `\n\n**User Comments:**\n\n`;
        for (const comment of content.comments.slice(0, 20)) {
          const author = comment.author ? `**${comment.author}**` : 'Anonymous';
          userPrompt += `- ${author}: ${comment.text}\n`;
        }
      }
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await provider.sendChat(messages, { maxTokens: 4096 });

    if (isLast) {
      return parseSummaryResponse(response);
    }

    // For intermediate chunks, use the response as rolling context
    rollingSummary = response;
  }

  throw new Error('No chunks to process');
}

function parseSummaryResponse(response: string): SummaryDocument {
  // Strip markdown code fences if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      tldr: parsed.tldr || '',
      keyTakeaways: parsed.keyTakeaways || [],
      summary: parsed.summary || '',
      notableQuotes: parsed.notableQuotes || [],
      conclusion: parsed.conclusion || '',
      prosAndCons: parsed.prosAndCons || undefined,
      commentsHighlights: parsed.commentsHighlights || undefined,
      relatedTopics: parsed.relatedTopics || [],
      tags: parsed.tags || [],
    };
  } catch {
    // LLM returned text instead of JSON — surface it as a chat message, not a broken summary
    throw new LLMTextResponse(cleaned);
  }
}
