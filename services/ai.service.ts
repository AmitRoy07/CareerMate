import * as DocumentPicker from 'expo-document-picker';

import { canUsePremiumFeature } from './monetization.service';
import { isSupabaseConfigured, supabase } from './supabase';
import type { AnalyzeResumeInput, AnalyzeResumeResult, JobMatchInput, JobMatchResult, ResumeAnalysisReport } from '@/types/ai.types';

export async function pickResumePdf() {
  return DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });
}

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeResult> {
  if (!input.resumeText.trim()) throw new Error('Please add resume details before running analysis.');

  if (input.userId) {
    const access = await canUsePremiumFeature(input.userId, 'ai_resume_analyzer', 'ai_resume_scan');
    if (!access.allowed) throw new Error(access.reason === 'credits_exhausted' ? 'Your AI credits are finished. Upgrade or buy credits to continue.' : 'AI Resume Analyzer requires Pro or AI credits.');
  }

  if (!isSupabaseConfigured) return buildLocalAnalysis(input);

  const { data, error } = await supabase.functions.invoke<AnalyzeResumeResult>('analyze-resume', { body: input });
  if (error) throw new Error('Unable to analyze resume right now. Please try again.');
  if (!data) throw new Error('Unable to analyze resume right now. Please try again.');
  return data;
}

export async function matchResumeToJob(input: JobMatchInput): Promise<JobMatchResult> {
  if (input.jobDescription.trim().length < 80) throw new Error('Job description is too short. Please paste the complete job description.');

  if (input.userId) {
    const access = await canUsePremiumFeature(input.userId, 'job_match', 'job_match');
    if (!access.allowed) throw new Error(access.reason === 'credits_exhausted' ? 'Your job match credits are finished. Upgrade or buy credits to continue.' : 'Job match requires Pro or job match credits.');
  }

  if (!isSupabaseConfigured) return buildLocalJobMatch(input);

  const { data, error } = await supabase.functions.invoke<JobMatchResult>('job-match', { body: input });
  if (error) throw new Error('Unable to check job match right now. Please try again.');
  if (!data) throw new Error('Unable to check job match right now. Please try again.');
  return data;
}

export async function getSavedAnalysisReports(userId: string): Promise<ResumeAnalysisReport[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase
    .from('resume_analysis_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...(row.report_json as AnalyzeResumeResult),
    id: String(row.id),
    userId: String(row.user_id),
    resumeId: row.resume_id ? String(row.resume_id) : undefined,
    targetRole: row.target_role ? String(row.target_role) : undefined,
    jobDescriptionHash: row.job_description_hash ? String(row.job_description_hash) : undefined,
    createdAt: String(row.created_at),
  }));
}

export async function saveAnalysisReport(report: ResumeAnalysisReport): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('resume_analysis_reports').insert({
    user_id: report.userId,
    resume_id: report.resumeId,
    target_role: report.targetRole,
    job_description_hash: report.jobDescriptionHash,
    overall_score: report.overallScore,
    ats_score: report.atsScore,
    report_json: report,
  });

  if (error) throw error;
}

function buildLocalAnalysis(input: AnalyzeResumeInput): AnalyzeResumeResult {
  const text = input.resumeText.toLowerCase();
  const hasMetrics = /\d+%|\d+x|reduced|improved|increased|saved/.test(text);
  const hasKeywords = ['react', 'typescript', 'javascript', 'node', 'supabase', 'aem'].filter((keyword) => text.includes(keyword));
  const keywordScore = Math.min(92, 45 + hasKeywords.length * 8);
  const structureScore = text.includes('experience') && text.includes('skills') ? 82 : 62;
  const readabilityScore = input.resumeText.length > 400 ? 78 : 64;
  const atsScore = Math.round((keywordScore + structureScore + readabilityScore) / 3);

  return {
    overallScore: Math.min(95, atsScore + (hasMetrics ? 4 : -4)),
    atsScore,
    readabilityScore,
    keywordScore,
    structureScore,
    breakdown: { keywords: keywordScore, structure: structureScore, readability: readabilityScore, relevance: atsScore },
    missingKeywords: ['Impact metrics', 'Target role keywords', 'Tools used in projects'].filter((keyword) => !text.includes(keyword.toLowerCase())),
    weakSections: hasMetrics ? ['Professional summary can be sharper'] : ['Experience bullets need measurable impact'],
    improvementSuggestions: [
      { title: 'Add measurable outcomes', detail: 'Include numbers such as latency reduced, revenue influenced, defects prevented, or users supported.', priority: 'high' },
      { title: 'Mirror target role keywords', detail: 'Use honest keywords from the job description where they match your real experience.', priority: 'medium' },
      { title: 'Tighten the summary', detail: 'Keep the summary to 3 lines with role, core stack, and business impact.', priority: 'medium' },
    ],
    rewrittenSummary: `Career-focused ${input.targetRole || 'professional'} with hands-on experience across product delivery, collaboration, and measurable execution for Indian hiring teams.`,
    improvedBulletPoints: [
      {
        before: 'Worked on frontend features.',
        after: 'Built reusable frontend features with measurable quality, performance, and delivery improvements.',
        reason: 'Adds ownership and outcome without inventing claims.',
      },
    ],
    warnings: ['Do not add skills or employers that are not true. Keep every claim verifiable.'],
    nextActions: ['Add 3 quantified bullets', 'Tailor skills to the target role', 'Export a clean PDF before applying'],
  };
}

function buildLocalJobMatch(input: JobMatchInput): JobMatchResult {
  const resume = input.resumeText.toLowerCase();
  const jdWords = Array.from(new Set(input.jobDescription.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) ?? [])).slice(0, 16);
  const matches = jdWords.map((keyword) => ({
    keyword,
    present: resume.includes(keyword),
    category: keyword.includes('react') || keyword.includes('node') || keyword.includes('sql') ? 'technical' as const : 'domain' as const,
  }));
  const presentCount = matches.filter((item) => item.present).length;
  const matchScore = Math.round((presentCount / Math.max(matches.length, 1)) * 100);

  return {
    matchScore,
    keywordScore: matchScore,
    roleAlignmentScore: Math.max(35, Math.min(90, matchScore + 10)),
    keywordMatches: matches,
    missingTechnicalSkills: matches.filter((item) => !item.present && item.category === 'technical').map((item) => item.keyword),
    missingSoftSkills: ['stakeholder communication', 'ownership'].filter((keyword) => !resume.includes(keyword)),
    suggestedSummaryRewrite: `Position yourself for ${input.targetRole || 'this role'} by highlighting matching stack, project ownership, and measurable delivery outcomes.`,
    suggestedSkillsUpdate: matches.filter((item) => item.present).map((item) => item.keyword),
    bulletPointImprovements: [
      { before: 'Responsible for project work.', after: 'Delivered role-aligned project work with clear scope, stack, and measurable business outcome.', reason: 'Shows relevance without adding false claims.' },
    ],
    gaps: matches.filter((item) => !item.present).slice(0, 5).map((item) => ({ title: item.keyword, detail: 'Not visible in resume. Add only if you genuinely have this skill or mark it as a learning gap.', type: 'missing_keyword' })),
    warnings: ['Suggestions are based only on the pasted resume and JD. Do not claim skills you have not used.'],
    nextActions: ['Add honest matching keywords', 'Rewrite summary for the role', 'Strengthen the top 3 experience bullets'],
  };
}
