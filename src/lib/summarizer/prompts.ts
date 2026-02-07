import type { ExtractedContent } from '../extractors/types';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
};

export function getSystemPrompt(detailLevel: 'brief' | 'standard' | 'detailed', language: string): string {
  const langInstruction = language === 'auto'
    ? 'Respond in the same language as the source content. If the content is in Russian, respond in Russian. If in English, respond in English. Match the content language exactly.'
    : `Respond in ${LANGUAGE_NAMES[language] || language}.`;

  const detailInstruction = {
    brief: 'Keep the summary concise — 2-3 sentences for the TLDR, 3-5 key takeaways, and a short summary paragraph.',
    standard: 'Provide a balanced summary — 2-3 sentences for the TLDR, 5-7 key takeaways, and a comprehensive but focused summary.',
    detailed: 'Provide a thorough summary — 3-4 sentences for the TLDR, 7-10 key takeaways, and a detailed, in-depth summary.',
  }[detailLevel];

  return `You are an expert content summarizer. ${langInstruction}

${detailInstruction}

You MUST respond with valid JSON matching this exact structure (no markdown code fences, just raw JSON):
{
  "tldr": "A concise 2-4 sentence overview of the entire content.",
  "keyTakeaways": ["Key point 1", "Key point 2", ...],
  "summary": "A detailed summary in markdown format. Use paragraphs, bullet points, and formatting as appropriate.",
  "notableQuotes": ["Direct quote 1", "Direct quote 2", ...],
  "conclusion": "The main conclusion or final thoughts from the content.",
  "prosAndCons": { "pros": ["Pro 1", ...], "cons": ["Con 1", ...] },
  "commentsHighlights": ["Notable comment/discussion point 1", ...],
  "relatedTopics": ["Related topic 1", "Related topic 2", ...],
  "tags": ["tag1", "tag2", ...]
}

Guidelines:
- "notableQuotes" should be actual quotes from the text (if any exist). Use an empty array if none found.
- "prosAndCons" is optional — include it only if the content discusses trade-offs, comparisons, or evaluations. Set to null if not applicable.
- "commentsHighlights" is optional — include it only if user comments/discussion is provided. Set to null if not applicable.
- "relatedTopics" should suggest 3-5 topics someone reading this might also be interested in.
- "tags" should be 3-7 short, lowercase tags relevant to the content.
- For "summary", use markdown formatting: headings (##), bullet points, bold, etc.`;
}

export function getSummarizationPrompt(content: ExtractedContent): string {
  let prompt = `Summarize the following ${content.type === 'youtube' ? 'YouTube video' : 'article/page'}.\n\n`;

  prompt += `**Title:** ${content.title}\n`;
  if (content.author) prompt += `**Author:** ${content.author}\n`;
  if (content.publishDate) prompt += `**Published:** ${content.publishDate}\n`;
  if (content.duration) prompt += `**Duration:** ${content.duration}\n`;
  if (content.viewCount) prompt += `**Views:** ${content.viewCount}\n`;
  prompt += `**Word count:** ${content.wordCount}\n\n`;

  prompt += `---\n\n**Content:**\n\n${content.content}\n`;

  if (content.comments && content.comments.length > 0) {
    prompt += `\n---\n\n**User Comments:**\n\n`;
    for (const comment of content.comments.slice(0, 20)) {
      const author = comment.author ? `**${comment.author}**` : 'Anonymous';
      const likes = comment.likes ? ` (${comment.likes} likes)` : '';
      prompt += `- ${author}${likes}: ${comment.text}\n`;
    }
  }

  return prompt;
}

export function getRollingContextPrompt(previousSummary: string): string {
  return `Here is a summary of the previous portion of the content. Use it as context for summarizing the next portion, then produce an updated combined summary.

**Previous summary context:**
${previousSummary}

---

Now continue summarizing the next portion below. Integrate it with the context above to produce a comprehensive summary.`;
}

export function getFinalChunkPrompt(): string {
  return `This is the FINAL portion of the content. Produce the complete, final structured JSON summary incorporating all previous context and this last section.`;
}
