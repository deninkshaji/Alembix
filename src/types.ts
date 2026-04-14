export type DomainTemplate = 'Materials Science' | 'Polymer Chemistry' | 'Biomedical' | 'Environmental' | 'Other';

export interface ResearchPaper {
  id: string;
  name: string;
  text: string;
  size: number;
}

export interface StageResult {
  stage: number;
  name: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export const STAGES = [
  { id: 0, name: 'System Primer' },
  { id: 1, name: 'Landscape Mapping' },
  { id: 2, name: 'Contradiction Analysis' },
  { id: 3, name: 'Intellectual Lineage + Field Timeline' },
  { id: 4, name: 'Research Gaps' },
  { id: 5, name: 'Methodology Audit + Variables Map' },
  { id: 6, name: 'Field Synthesis' },
  { id: 7, name: 'Hidden Assumptions' },
  { id: 8, name: 'Knowledge Map' },
  { id: 9, name: 'Domain Glossary' },
  { id: 10, name: 'Hypothesis Seeder' },
  { id: 11, name: 'Non-Expert Pitch' },
];
