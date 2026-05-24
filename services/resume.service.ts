import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { isSupabaseConfigured, supabase } from './supabase';
import type { ResumeDraft } from '@/types/resume.types';

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

export async function exportResumePdf(resume: ResumeDraft) {
  const html = buildResumeHtml(resume);
  const file = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${resume.title}.pdf`,
    });
  }

  return file.uri;
}

function paragraphToList(value: string) {
  return value
    .split('\n')
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');
}

function buildResumeHtml(resume: ResumeDraft) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { border-bottom: 1px solid #CBD5E1; color: #0F766E; font-size: 15px; margin-top: 24px; padding-bottom: 6px; text-transform: uppercase; }
          p { line-height: 1.45; }
          ul { margin: 8px 0 0; padding-left: 18px; }
          li { margin-bottom: 6px; }
          .meta { color: #4B5563; margin-top: 6px; }
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

