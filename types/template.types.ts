import type { ResumeSectionKey } from './resume.types';

export type ResumeTemplateCategory = 'classic' | 'modern' | 'ats' | 'fresher' | 'executive' | 'compact';

export interface ResumeTemplate {
  id: string;
  name: string;
  category: ResumeTemplateCategory;
  isPremium: boolean;
  previewImage: string;
  supportedSections: ResumeSectionKey[];
  atsFriendly: boolean;
  createdAt: string;
}

export interface ExportResumeOptions {
  resume: import('./resume.types').ResumeDraft;
  userId?: string;
  templateId?: string;
  withoutWatermark?: boolean;
}

export interface ExportResult {
  uri: string;
  templateId: string;
  watermarked: boolean;
}
