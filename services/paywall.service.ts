import type { EntitlementKey, PaywallContext, PlanType } from '@/types/monetization.types';

const benefits: Record<EntitlementKey, string[]> = {
  resume_no_watermark: ['Clean recruiter-ready PDF exports', 'No CareerMate footer on premium exports', 'Best for referrals and job portals'],
  premium_templates: ['ATS-friendly premium layouts', 'Templates for freshers, tech roles, and senior profiles', 'Preview before upgrading'],
  ai_resume_analyzer: ['Overall resume score', 'ATS, keyword, structure, and readability breakdown', 'Actionable rewrite suggestions'],
  ats_score: ['ATS score from 0 to 100', 'Missing sections and weak bullet detection', 'Recruiter-friendly next steps'],
  job_match: ['Match percentage against a job description', 'Missing keywords and role gaps', 'Ethical improvement suggestions'],
  hr_mail_generator: ['Professional HR email drafts', 'Short WhatsApp-ready message when useful', 'Formal, polite, confident, and concise tones'],
  vault_cloud_sync: ['Optional cloud backup for personal documents', 'Available only after verified subscription', 'Local-first vault still works offline'],
  mock_interview: ['Premium mock interview credit foundation', 'Ready for future AI interview rounds', 'Usage tracked by credits'],
};

const recommendedPlans: Record<EntitlementKey, PlanType> = {
  resume_no_watermark: 'premium',
  premium_templates: 'premium',
  ai_resume_analyzer: 'pro',
  ats_score: 'pro',
  job_match: 'pro',
  hr_mail_generator: 'premium',
  vault_cloud_sync: 'pro',
  mock_interview: 'pro',
};

export function buildPaywallMessage(context: PaywallContext): string {
  if (context.reason === 'credits_exhausted') {
    return `Your ${context.featureName ?? 'AI'} credits are finished. Upgrade to ${formatPlan(getRecommendedPlan(context.entitlement))} or add credits when billing is available.`;
  }

  return `${context.featureName ?? 'This feature'} is included with ${formatPlan(getRecommendedPlan(context.entitlement))}. You can keep using free tools, or upgrade when plans are connected.`;
}

export function getUpgradeBenefits(entitlement: EntitlementKey): string[] {
  return benefits[entitlement];
}

export function getRecommendedPlan(entitlement: EntitlementKey): PlanType {
  return recommendedPlans[entitlement];
}

function formatPlan(planType: PlanType) {
  return planType.charAt(0).toUpperCase() + planType.slice(1);
}
