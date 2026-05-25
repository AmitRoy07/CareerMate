import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { isSupabaseConfigured, supabase } from './supabase';
import { hasEntitlement } from './monetization.service';
import resumeTemplateData from '@/data/resume-templates.json';
import type { ResumeDraft } from '@/types/resume.types';
import type { ExportResult, ExportResumeOptions, ResumeTemplate } from '@/types/template.types';

export const emptyResume: ResumeDraft = {
  title: 'Frontend Resume',
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    links: '',
  },
  education: '',
  experience: '',
  skills: '',
  projects: '',
  certifications: '',
  languages: '',
  summary: '',
};

export async function saveResume(userId: string | undefined, resume: ResumeDraft) {
  if (!isSupabaseConfigured || !userId) return { id: resume.id ?? 'local-draft' };

  const { data, error } = await supabase
    .from('resumes')
    .upsert({
      id: resume.id,
      user_id: userId,
      title: resume.title,
      data: resume,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function getSavedResumes(userId: string | undefined): Promise<ResumeDraft[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase.from('resumes').select('id,title,data').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...(row.data as ResumeDraft),
    id: String(row.id),
    title: String(row.title),
  }));
}

const resumeTemplates = resumeTemplateData as ResumeTemplate[];

export async function getResumeTemplates(): Promise<ResumeTemplate[]> {
  return resumeTemplates;
}

export async function canUseTemplate(userId: string | undefined, templateId: string): Promise<boolean> {
  const template = resumeTemplates.find((item) => item.id === templateId);
  if (!template) return false;
  if (!template.isPremium) return true;
  if (!userId) return false;
  return hasEntitlement(userId, 'premium_templates');
}

export async function canExportWithoutWatermark(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  return hasEntitlement(userId, 'resume_no_watermark');
}

export async function exportResumePdf(input: ResumeDraft | ExportResumeOptions): Promise<ExportResult> {
  const options = 'resume' in input ? input : { resume: input };
  const templateId = options.templateId ?? 'classic_basic';
  const template = resumeTemplates.find((item) => item.id === templateId) ?? resumeTemplates[0];
  const templateAllowed = await canUseTemplate(options.userId, template.id);

  if (!templateAllowed) {
    throw new Error('Premium templates require an active Premium or Pro entitlement.');
  }

  const noWatermarkAllowed = options.withoutWatermark === true || (await canExportWithoutWatermark(options.userId));
  const watermarked = !noWatermarkAllowed;
  const html = buildResumeHtml(options.resume, template, watermarked);
  const file = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${options.resume.title}.pdf`,
    });
  }

  return { uri: file.uri, templateId: template.id, watermarked };
}

function paragraphToList(value: string) {
  return value
    .split('\n')
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');
}

function buildResumeHtml(resume: ResumeDraft, template: ResumeTemplate, watermarked: boolean) {
  const accent = template.id === 'minimal_blue' || template.id === 'tech_modern' ? '#2563EB' : '#0F766E';
  const compact = template.id === 'compact_one_page';

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: ${compact ? '24px' : '32px'}; }
          h1 { margin: 0; font-size: ${compact ? '24px' : '28px'}; }
          h2 { border-bottom: 1px solid #CBD5E1; color: ${accent}; font-size: 15px; margin-top: ${compact ? '16px' : '24px'}; padding-bottom: 6px; text-transform: uppercase; }
          p { line-height: 1.45; }
          ul { margin: 8px 0 0; padding-left: 18px; }
          li { margin-bottom: 6px; }
          .meta { color: #4B5563; margin-top: 6px; }
          .watermark { border-top: 1px solid #E5E7EB; color: #94A3B8; font-size: 11px; margin-top: 28px; padding-top: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(resume.personal.fullName || resume.title)}</h1>
        <p class="meta">${escapeHtml([resume.personal.email, resume.personal.phone, resume.personal.location, resume.personal.links].filter(Boolean).join(' | '))}</p>
        <h2>Summary</h2><p>${escapeHtml(resume.summary)}</p>
        <h2>Skills</h2><p>${escapeHtml(resume.skills)}</p>
        <h2>Experience</h2><ul>${paragraphToList(resume.experience)}</ul>
        <h2>Projects</h2><ul>${paragraphToList(resume.projects)}</ul>
        <h2>Education</h2><p>${escapeHtml(resume.education)}</p>
        <h2>Certifications</h2><p>${escapeHtml(resume.certifications)}</p>
        <h2>Languages</h2><p>${escapeHtml(resume.languages)}</p>
        ${watermarked ? '<div class="watermark">Built with CareerMate India - upgrade to remove watermark</div>' : ''}
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
