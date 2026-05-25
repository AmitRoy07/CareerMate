export type PlanType = 'free' | 'premium' | 'pro';

export type EntitlementKey =
  | 'resume_no_watermark'
  | 'premium_templates'
  | 'ai_resume_analyzer'
  | 'ats_score'
  | 'job_match'
  | 'hr_mail_generator'
  | 'vault_cloud_sync'
  | 'mock_interview';

export type CreditType = 'ai_resume_scan' | 'job_match' | 'hr_mail' | 'mock_interview';

export type PlanStatus = 'active' | 'inactive' | 'cancelled' | 'expired';
export type EntitlementStatus = 'active' | 'inactive' | 'expired';
export type CreditTransactionType = 'grant' | 'consume' | 'refund' | 'expire';

export interface UserPlan {
  id: string;
  userId: string;
  planType: PlanType;
  status: PlanStatus;
  startsAt: string;
  endsAt: string | null;
  provider: string | null;
  providerSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlement {
  id: string;
  userId: string;
  entitlementKey: EntitlementKey;
  status: EntitlementStatus;
  source: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export interface UserCreditBalance {
  id: string;
  userId: string;
  creditType: CreditType;
  balance: number;
  updatedAt: string;
}

export interface UserCreditTransaction {
  id: string;
  userId: string;
  creditType: CreditType;
  transactionType: CreditTransactionType;
  amount: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface PremiumFeatureConfig {
  entitlement: EntitlementKey;
  creditType?: CreditType;
  title: string;
  description: string;
  recommendedPlan: PlanType;
  includedIn: PlanType[];
}

export interface PaywallContext {
  entitlement: EntitlementKey;
  creditType?: CreditType;
  featureName?: string;
  remainingCredits?: number;
  reason?: string;
}

export interface PremiumSnapshot {
  plan: UserPlan;
  entitlements: UserEntitlement[];
  creditBalances: UserCreditBalance[];
}

export interface PremiumAccessResult {
  allowed: boolean;
  reason?: string;
  remainingCredits?: number;
}
