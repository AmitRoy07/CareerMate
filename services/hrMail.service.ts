import { canUsePremiumFeature } from './monetization.service';
import { isSupabaseConfigured, supabase } from './supabase';
import type { GenerateHrMailInput, GenerateHrMailResult, SavedHrMail } from '@/types/hr-mail.types';

export async function generateHrMail(input: GenerateHrMailInput): Promise<GenerateHrMailResult> {
  if (!input.name.trim() || !input.companyName.trim() || !input.role.trim()) {
    throw new Error('Please add your name, company, and role before generating a mail.');
  }

  if (input.userId) {
    const access = await canUsePremiumFeature(input.userId, 'hr_mail_generator', 'hr_mail');
    if (!access.allowed) throw new Error(access.reason === 'credits_exhausted' ? 'Your HR mail credits are finished. Upgrade or buy credits to continue.' : 'HR mail generator requires Premium or credits.');
  }

  if (!isSupabaseConfigured) return buildLocalMail(input);

  const { data, error } = await supabase.functions.invoke<GenerateHrMailResult>('generate-hr-mail', { body: input });
  if (error) throw new Error('Unable to generate HR mail right now. Please try again.');
  if (!data) throw new Error('Unable to generate HR mail right now. Please try again.');
  return data;
}

export async function saveHrMail(userId: string, result: GenerateHrMailResult): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  const { error } = await supabase.from('saved_hr_mails').insert({
    user_id: userId,
    mail_type: result.mailType,
    tone: result.tone,
    subject: result.subject,
    body: result.body,
    short_message: result.shortMessage,
  });

  if (error) throw error;
}

export async function getSavedHrMails(userId: string): Promise<SavedHrMail[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase.from('saved_hr_mails').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    mailType: row.mail_type as SavedHrMail['mailType'],
    tone: row.tone as SavedHrMail['tone'],
    subject: String(row.subject),
    body: String(row.body),
    shortMessage: row.short_message ? String(row.short_message) : undefined,
    createdAt: String(row.created_at),
  }));
}

function buildLocalMail(input: GenerateHrMailInput): GenerateHrMailResult {
  const greeting = input.hrOrManagerName ? `Dear ${input.hrOrManagerName},` : 'Dear HR Team,';
  const signoff = `Regards,\n${input.name}`;
  const context = `${input.role} at ${input.companyName}`;

  const templates: Record<GenerateHrMailInput['mailType'], { subject: string; body: string; shortMessage?: string }> = {
    resignation_email: {
      subject: `Resignation from ${context}`,
      body: `${greeting}\n\nI am writing to formally resign from my position as ${context}. ${input.lastWorkingDay ? `My proposed last working day is ${input.lastWorkingDay}.` : 'I will support a smooth transition during my notice period.'}\n\nThank you for the opportunities and support during my tenure.\n\n${signoff}`,
      shortMessage: `Hi, I have shared my formal resignation mail for the ${input.role} role. Please let me know the next steps.`,
    },
    salary_negotiation: {
      subject: `Compensation discussion for ${input.role}`,
      body: `${greeting}\n\nThank you for discussing the ${input.role} opportunity with me. Based on the role expectations, market alignment, and my experience, I would like to request a compensation review${input.expectedSalary ? ` toward ${input.expectedSalary}` : ''}.\n\nI am excited about the opportunity and would be glad to discuss this further.\n\n${signoff}`,
    },
    interview_follow_up: {
      subject: `Follow-up for ${input.role} interview`,
      body: `${greeting}\n\nThank you for the interview opportunity for the ${input.role} position at ${input.companyName}. I enjoyed learning more about the role and remain interested in contributing to the team.\n\nPlease let me know if any additional information is needed.\n\n${signoff}`,
    },
    referral_request: {
      subject: `Referral request for ${input.role}`,
      body: `${greeting}\n\nI hope you are doing well. I am interested in the ${input.role} role at ${input.companyName} and would be grateful if you could consider referring me if my profile seems relevant.\n\nI can share my resume and job link for your review.\n\n${signoff}`,
    },
    offer_acceptance: {
      subject: `Offer acceptance for ${input.role}`,
      body: `${greeting}\n\nI am pleased to accept the offer for the ${input.role} position at ${input.companyName}. Thank you for the opportunity and confidence in my profile.\n\nPlease share the next onboarding steps.\n\n${signoff}`,
    },
    offer_rejection: {
      subject: `Regarding the ${input.role} offer`,
      body: `${greeting}\n\nThank you for offering me the ${input.role} position at ${input.companyName}. After careful consideration, I have decided not to proceed with the offer at this time.\n\nI appreciate the time and effort of the team and hope we can stay connected.\n\n${signoff}`,
    },
    notice_period_reduction: {
      subject: 'Request for notice period reduction',
      body: `${greeting}\n\nI request your consideration for reducing my notice period${input.noticePeriod ? ` from ${input.noticePeriod}` : ''}. I will ensure proper handover, documentation, and transition support before my last working day${input.lastWorkingDay ? `, ${input.lastWorkingDay}` : ''}.\n\nThank you for considering my request.\n\n${signoff}`,
    },
    experience_letter_request: {
      subject: 'Request for experience letter',
      body: `${greeting}\n\nI request you to please issue my experience letter for my tenure as ${context}. Please let me know if any formalities or details are required from my side.\n\n${signoff}`,
    },
    relieving_letter_request: {
      subject: 'Request for relieving letter',
      body: `${greeting}\n\nI request you to please issue my relieving letter for my role as ${context}. I have completed the necessary handover from my side and would appreciate your support.\n\n${signoff}`,
    },
    work_from_home_request: {
      subject: 'Request for work from home',
      body: `${greeting}\n\nI request approval to work from home for a short period due to personal circumstances. I will remain available during working hours and ensure all deliverables for my ${input.role} responsibilities are handled on time.\n\n${signoff}`,
    },
  };

  const selected = templates[input.mailType];
  return { mailType: input.mailType, tone: input.tone, ...selected };
}
