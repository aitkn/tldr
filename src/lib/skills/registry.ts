import type { Skill, SkillProvider } from './types';

const providerModules = import.meta.glob('./providers/*.ts', {
  eager: true,
  import: 'default',
}) as Record<string, SkillProvider>;

const allSkills = new Map<string, Skill>();
for (const provider of Object.values(providerModules)) {
  for (const skill of provider.skills) {
    allSkills.set(skill.id, skill);
  }
}

/** Compact skill catalog for injection into the LLM system prompt (~200 tokens). */
export function getSkillCatalog(): string {
  const rows = Array.from(allSkills.values())
    .map((s) => `| ${s.id} | ${s.description} |`)
    .join('\n');

  return `SKILL REQUEST: Before generating, you may request specialized knowledge.
Respond with ONLY this JSON: {"skillsNeeded": ["skill-id-1", "skill-id-2"]}
You will receive the documentation and be asked to generate again.
Only request skills when you intend to create content that needs them
(e.g. request mermaid skills only if you plan to include diagrams).

Available skills:
| ID | Description |
|----|-------------|
${rows}`;
}

/** Skill catalog for chat context — skill request embedded in chat JSON format. */
export function getChatSkillCatalog(): string {
  const rows = Array.from(allSkills.values())
    .map((s) => `| ${s.id} | ${s.description} |`)
    .join('\n');

  return `SKILL REQUEST: Before generating diagrams or specialized content, you may request documentation.
To request skills, respond with: {"text": "", "updates": null, "skillsNeeded": ["skill-id-1", "skill-id-2"]}
You will receive the documentation and be asked to generate again.
Only request skills when you plan to create content requiring specialized knowledge (e.g. mermaid diagrams).

Available skills:
| ID | Description |
|----|-------------|
${rows}`;
}

/** Resolve skill IDs to concatenated documentation. Unknown IDs are silently ignored. */
export function resolveSkills(ids: string[]): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const skill = allSkills.get(id);
    if (skill) parts.push(`### ${skill.name}\n${skill.content}`);
  }
  return parts.length > 0
    ? `\n\n---\n\n## Requested Skill Documentation\n\n${parts.join('\n\n')}`
    : '';
}
