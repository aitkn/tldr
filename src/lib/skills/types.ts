export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface SkillProvider {
  category: string;
  description: string;
  skills: Skill[];
}

/** Thrown when the LLM requests skill documentation before generating. */
export class SkillRequestError extends Error {
  constructor(public readonly requestedSkills: string[]) {
    super(`LLM requested skills: ${requestedSkills.join(', ')}`);
    this.name = 'SkillRequestError';
  }
}
