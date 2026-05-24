export type ResumeSectionKey =
  | 'personal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'summary';

export interface ResumeDraft {
  id?: string;
  title: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: string;
  };
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  summary: string;
}

export interface AiResumeReport {
  atsScore: number;
  missingKeywords: string[];
  suggestions: string[];
  rewrittenSummary: string;
}

