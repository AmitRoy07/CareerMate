import { isSupabaseConfigured, supabase } from './supabase';
import type {
  CreditType,
  EntitlementKey,
  PlanType,
  PremiumAccessResult,
  PremiumFeatureConfig,
  PremiumSnapshot,
  UserCreditBalance,
  UserEntitlement,
  UserPlan,
} from '@/types/monetization.types';

const premiumEntitlements: EntitlementKey[] = ['resume_no_watermark', 'premium_templates', 'hr_mail_generator'];
const proEntitlements: EntitlementKey[] = [
  'resume_no_watermark',
  'premium_templates',
  'ai_resume_analyzer',
  'ats_score',
  'job_match',
  'hr_mail_generator',
  'vault_cloud_sync',
  'mock_interview',
];

const starterCredits: UserCreditBalance[] = [
  createLocalCredit('ai_resume_scan', 1),
  createLocalCredit('job_match', 0),
  createLocalCredit('hr_mail', 2),
  createLocalCredit('mock_interview', 0),
];

const freePlan: UserPlan = {
  id: 'local-free-plan',
  userId: 'local',
  planType: 'free',
  status: 'active',
  startsAt: new Date(0).toISOString(),
  endsAt: null,
  provider: null,
  providerSubscriptionId: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export async function getUserPlan(userId: string): Promise<PlanType> {
  const snapshot = await getPremiumSnapshot(userId);
  return snapshot.plan.status === 'active' ? snapshot.plan.planType : 'free';
}

export async function getUserEntitlements(userId: string): Promise<UserEntitlement[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase.from('user_entitlements').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(mapEntitlement);
}

export async function hasEntitlement(userId: string, entitlement: EntitlementKey): Promise<boolean> {
  const snapshot = await getPremiumSnapshot(userId);
  return snapshotHasEntitlement(snapshot, entitlement);
}

export async function getCreditBalance(userId: string, creditType: CreditType): Promise<number> {
  const snapshot = await getPremiumSnapshot(userId);
  return getSnapshotCreditBalance(snapshot, creditType);
}

export async function consumeCredit(userId: string, creditType: CreditType, amount = 1): Promise<void> {
  if (!isSupabaseConfigured || !userId) {
    throw new Error('Credit consumption must happen on a protected backend function.');
  }

  const { error } = await supabase.functions.invoke('consume-credit', {
    body: { userId, creditType, amount },
  });

  if (error) throw error;
}

export async function canUsePremiumFeature(userId: string, entitlement: EntitlementKey, creditType?: CreditType): Promise<PremiumAccessResult> {
  const snapshot = await getPremiumSnapshot(userId);

  if (snapshotHasEntitlement(snapshot, entitlement)) {
    return { allowed: true, remainingCredits: creditType ? getSnapshotCreditBalance(snapshot, creditType) : undefined };
  }

  if (creditType) {
    const remainingCredits = getSnapshotCreditBalance(snapshot, creditType);
    if (remainingCredits > 0) return { allowed: true, remainingCredits };
    return { allowed: false, reason: 'credits_exhausted', remainingCredits };
  }

  return { allowed: false, reason: 'premium_required' };
}

export function getPremiumFeatureConfig(): PremiumFeatureConfig[] {
  return [
    {
      entitlement: 'resume_no_watermark',
      title: 'Export without watermark',
      description: 'Create clean PDFs ready for recruiters and referrals.',
      recommendedPlan: 'premium',
      includedIn: ['premium', 'pro'],
    },
    {
      entitlement: 'premium_templates',
      title: 'Premium resume templates',
      description: 'ATS-friendly layouts for freshers, tech roles, and senior profiles.',
      recommendedPlan: 'premium',
      includedIn: ['premium', 'pro'],
    },
    {
      entitlement: 'ai_resume_analyzer',
      creditType: 'ai_resume_scan',
      title: 'AI Resume Analyzer',
      description: 'Get ATS score, weak sections, and practical rewrite suggestions.',
      recommendedPlan: 'pro',
      includedIn: ['pro'],
    },
    {
      entitlement: 'job_match',
      creditType: 'job_match',
      title: 'Job description match',
      description: 'Compare your resume against a target role and close skill gaps.',
      recommendedPlan: 'pro',
      includedIn: ['pro'],
    },
    {
      entitlement: 'hr_mail_generator',
      creditType: 'hr_mail',
      title: 'HR mail generator',
      description: 'Generate polished resignation, follow-up, referral, and offer mails.',
      recommendedPlan: 'premium',
      includedIn: ['premium', 'pro'],
    },
    {
      entitlement: 'vault_cloud_sync',
      title: 'Vault cloud sync',
      description: 'Back up personal documents only after verified subscription entitlement.',
      recommendedPlan: 'pro',
      includedIn: ['pro'],
    },
  ];
}

export async function getPremiumSnapshot(userId: string | undefined): Promise<PremiumSnapshot> {
  if (!isSupabaseConfigured || !userId) {
    return {
      plan: { ...freePlan, userId: userId ?? 'local' },
      entitlements: [],
      creditBalances: starterCredits.map((credit) => ({ ...credit, userId: userId ?? 'local' })),
    };
  }

  const [planResult, entitlementsResult, creditsResult] = await Promise.all([
    supabase.from('user_plans').select('*').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('user_entitlements').select('*').eq('user_id', userId),
    supabase.from('user_credit_balances').select('*').eq('user_id', userId),
  ]);

  if (planResult.error) throw planResult.error;
  if (entitlementsResult.error) throw entitlementsResult.error;
  if (creditsResult.error) throw creditsResult.error;

  return {
    plan: planResult.data ? mapPlan(planResult.data) : { ...freePlan, userId },
    entitlements: (entitlementsResult.data ?? []).map(mapEntitlement),
    creditBalances: (creditsResult.data ?? []).map(mapCreditBalance),
  };
}

export function snapshotHasEntitlement(snapshot: PremiumSnapshot, entitlement: EntitlementKey): boolean {
  const planEntitlements = snapshot.plan.status === 'active' ? getPlanEntitlements(snapshot.plan.planType) : [];
  if (planEntitlements.includes(entitlement)) return true;

  return snapshot.entitlements.some(
    (item) => item.entitlementKey === entitlement && item.status === 'active' && !isExpired(item.endsAt),
  );
}

export function getSnapshotCreditBalance(snapshot: PremiumSnapshot, creditType: CreditType): number {
  return snapshot.creditBalances.find((item) => item.creditType === creditType)?.balance ?? 0;
}

function getPlanEntitlements(planType: PlanType): EntitlementKey[] {
  if (planType === 'pro') return proEntitlements;
  if (planType === 'premium') return premiumEntitlements;
  return [];
}

function createLocalCredit(creditType: CreditType, balance: number): UserCreditBalance {
  return {
    id: `local-${creditType}`,
    userId: 'local',
    creditType,
    balance,
    updatedAt: new Date(0).toISOString(),
  };
}

function isExpired(value: string | null) {
  return value ? new Date(value).getTime() < Date.now() : false;
}

function mapPlan(row: Record<string, unknown>): UserPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planType: normalizePlan(row.plan_type ?? row.plan_code),
    status: normalizeStatus(row.status),
    startsAt: String(row.starts_at ?? row.created_at ?? new Date().toISOString()),
    endsAt: row.ends_at || row.expires_at ? String(row.ends_at ?? row.expires_at) : null,
    provider: row.provider ? String(row.provider) : null,
    providerSubscriptionId: row.provider_subscription_id ? String(row.provider_subscription_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapEntitlement(row: Record<string, unknown>): UserEntitlement {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    entitlementKey: normalizeEntitlement(row.entitlement_key),
    status: row.enabled === false ? 'inactive' : normalizeEntitlementStatus(row.status),
    source: row.source ? String(row.source) : row.source_plan ? String(row.source_plan) : null,
    startsAt: String(row.starts_at ?? row.created_at ?? new Date().toISOString()),
    endsAt: row.ends_at || row.expires_at ? String(row.ends_at ?? row.expires_at) : null,
    createdAt: String(row.created_at),
  };
}

function mapCreditBalance(row: Record<string, unknown>): UserCreditBalance {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    creditType: normalizeCreditType(row.credit_type ?? row.bucket),
    balance: Number(row.balance ?? 0),
    updatedAt: String(row.updated_at),
  };
}

function normalizePlan(value: unknown): PlanType {
  return value === 'premium' || value === 'pro' ? value : 'free';
}

function normalizeStatus(value: unknown): UserPlan['status'] {
  return value === 'inactive' || value === 'cancelled' || value === 'expired' ? value : 'active';
}

function normalizeEntitlementStatus(value: unknown): UserEntitlement['status'] {
  return value === 'inactive' || value === 'expired' ? value : 'active';
}

function normalizeEntitlement(value: unknown): EntitlementKey {
  const key = String(value);
  if (key === 'premium_resume_templates') return 'premium_templates';
  if (key === 'ai_resume_review') return 'ai_resume_analyzer';
  if (key === 'interview_premium_pack') return 'mock_interview';
  if (key === 'resume_no_watermark' || key === 'premium_templates' || key === 'ai_resume_analyzer' || key === 'ats_score' || key === 'job_match' || key === 'hr_mail_generator' || key === 'vault_cloud_sync' || key === 'mock_interview') {
    return key;
  }
  return 'premium_templates';
}

function normalizeCreditType(value: unknown): CreditType {
  const key = String(value);
  if (key === 'ai_resume_reviews') return 'ai_resume_scan';
  if (key === 'interview_mock_sessions') return 'mock_interview';
  if (key === 'ai_resume_scan' || key === 'job_match' || key === 'hr_mail' || key === 'mock_interview') return key;
  return 'ai_resume_scan';
}
