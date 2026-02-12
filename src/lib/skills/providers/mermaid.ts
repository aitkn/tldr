import type { Skill, SkillProvider } from '../types';
import { MERMAID_ESSENTIAL_RULES, mermaidDocFiles } from '../../mermaid-rules';

/** Chart type metadata — one entry per unique doc file. */
const chartTypes: { file: string; name: string; desc: string }[] = [
  { file: 'flowchart', name: 'Flowchart', desc: 'Nodes, edges, subgraphs, shapes' },
  { file: 'sequenceDiagram', name: 'Sequence Diagram', desc: 'Actors, messages, loops, alt' },
  { file: 'classDiagram', name: 'Class Diagram', desc: 'Classes, relationships, methods' },
  { file: 'stateDiagram', name: 'State Diagram', desc: 'States, transitions, forks, choices' },
  { file: 'entityRelationshipDiagram', name: 'ER Diagram', desc: 'Entities, relationships, attributes' },
  { file: 'gantt', name: 'Gantt Chart', desc: 'Tasks, milestones, dependencies' },
  { file: 'pie', name: 'Pie Chart', desc: 'Proportions, segments' },
  { file: 'mindmap', name: 'Mindmap', desc: 'Hierarchical brainstorming' },
  { file: 'timeline', name: 'Timeline', desc: 'Historical events, periods' },
  { file: 'gitgraph', name: 'Git Graph', desc: 'Branches, commits, merges' },
  { file: 'userJourney', name: 'User Journey', desc: 'User satisfaction across tasks' },
  { file: 'quadrantChart', name: 'Quadrant Chart', desc: '2D comparison matrix' },
  { file: 'xyChart', name: 'XY Chart', desc: 'Line and bar charts' },
  { file: 'sankey', name: 'Sankey Diagram', desc: 'Flow quantity visualization' },
  { file: 'block', name: 'Block Diagram', desc: 'System block layout' },
  { file: 'packet', name: 'Packet Diagram', desc: 'Network packet structure' },
  { file: 'kanban', name: 'Kanban Board', desc: 'Task board columns' },
  { file: 'architecture', name: 'Architecture Diagram', desc: 'Cloud/infra layout' },
  { file: 'radar', name: 'Radar Chart', desc: 'Multi-axis comparison' },
  { file: 'treemap', name: 'Treemap', desc: 'Hierarchical area chart' },
  { file: 'c4', name: 'C4 Diagram', desc: 'C4 model architecture views' },
  { file: 'requirementDiagram', name: 'Requirement Diagram', desc: 'Requirements and links' },
  { file: 'zenuml', name: 'ZenUML', desc: 'Alternative sequence syntax' },
];

const skills: Skill[] = [
  // Top-level: essential rules + chart selection guide
  {
    id: 'mermaid',
    name: 'Mermaid Diagram Syntax',
    description: 'Syntax rules and chart type selection guide',
    content: MERMAID_ESSENTIAL_RULES,
  },
];

// Per-chart-type skills (built from doc files)
for (const ct of chartTypes) {
  const content = mermaidDocFiles[ct.file];
  if (content) {
    skills.push({
      id: `mermaid:${ct.file}`,
      name: ct.name,
      description: ct.desc,
      content,
    });
  }
}

// Styling and directives
if (mermaidDocFiles['styling']) {
  skills.push({
    id: 'mermaid:styling',
    name: 'Mermaid Styling',
    description: 'Theme configuration and CSS styling',
    content: mermaidDocFiles['styling'],
  });
}
if (mermaidDocFiles['directives']) {
  skills.push({
    id: 'mermaid:directives',
    name: 'Mermaid Directives',
    description: 'Frontmatter and directive configuration',
    content: mermaidDocFiles['directives'],
  });
}

export default {
  category: 'mermaid',
  description: 'Mermaid diagram syntax and chart-type documentation',
  skills,
} satisfies SkillProvider;
