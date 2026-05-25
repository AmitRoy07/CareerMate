export type HrMailType =
  | 'resignation_email'
  | 'salary_negotiation'
  | 'interview_follow_up'
  | 'referral_request'
  | 'offer_acceptance'
  | 'offer_rejection'
  | 'notice_period_reduction'
  | 'experience_letter_request'
  | 'relieving_letter_request'
  | 'work_from_home_request';

export type HrMailTone = 'formal' | 'polite' | 'confident' | 'concise';

export interface GenerateHrMailInput {
  userId?: string;
  mailType: HrMailType;
  tone: HrMailTone;
  name: string;
  companyName: string;
  role: string;
  hrOrManagerName?: string;
  noticePeriod?: string;
  lastWorkingDay?: string;
  currentOffer?: string;
  expectedSalary?: string;
}

export interface GenerateHrMailResult {
  mailType: HrMailType;
  tone: HrMailTone;
  subject: string;
  body: string;
  shortMessage?: string;
}

export interface SavedHrMail extends GenerateHrMailResult {
  id: string;
  userId: string;
  createdAt: string;
}
