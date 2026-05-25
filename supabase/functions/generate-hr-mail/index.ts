import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.106.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });

    const input = await req.json() as Record<string, string>;
    if (!input.name || !input.companyName || !input.role || !input.mailType || !input.tone) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400, headers: corsHeaders });
    }

    const access = await canUse(adminClient, userData.user.id, 'hr_mail_generator', 'hr_mail');
    if (!access.allowed) return Response.json({ error: access.reason }, { status: 402, headers: corsHeaders });

    const result = buildMail(input);
    if (!access.entitled && access.creditType) await consumeCredit(adminClient, userData.user.id, access.creditType);
    return Response.json(result, { headers: corsHeaders });
  } catch (_error) {
    return Response.json({ error: 'Unable to generate HR mail right now. Please try again.' }, { status: 500, headers: corsHeaders });
  }
});

function buildMail(input: Record<string, string>) {
  const greeting = input.hrOrManagerName ? `Dear ${input.hrOrManagerName},` : 'Dear HR Team,';
  const signoff = `Regards,\n${input.name}`;
  const subjectMap: Record<string, string> = {
    resignation_email: `Resignation from ${input.role}`,
    salary_negotiation: `Compensation discussion for ${input.role}`,
    interview_follow_up: `Follow-up for ${input.role} interview`,
    referral_request: `Referral request for ${input.role}`,
    offer_acceptance: `Offer acceptance for ${input.role}`,
    offer_rejection: `Regarding the ${input.role} offer`,
    notice_period_reduction: 'Request for notice period reduction',
    experience_letter_request: 'Request for experience letter',
    relieving_letter_request: 'Request for relieving letter',
    work_from_home_request: 'Request for work from home',
  };
  const subject = subjectMap[input.mailType] ?? `Request regarding ${input.role}`;
  const body = `${greeting}\n\nI hope you are doing well. I am writing regarding ${input.role} at ${input.companyName}. Please consider this ${input.tone} note for the requested purpose: ${subject.toLowerCase()}.\n\nI will ensure all details shared are accurate and professionally handled. Please let me know if any further information is required from my side.\n\n${signoff}`;

  return {
    mailType: input.mailType,
    tone: input.tone,
    subject,
    body,
    shortMessage: `Hi, I have shared a mail regarding ${subject.toLowerCase()}. Please let me know the next steps.`,
  };
}

async function canUse(client: ReturnType<typeof createClient>, userId: string, entitlement: string, creditType: string) {
  const { data: plan } = await client.from('user_plans').select('plan_type,status,ends_at').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (plan?.status === 'active' && (plan.plan_type === 'premium' || plan.plan_type === 'pro') && (!plan.ends_at || new Date(plan.ends_at).getTime() > Date.now())) return { allowed: true, entitled: true };
  const { data: entitlements } = await client.from('user_entitlements').select('ends_at').eq('user_id', userId).eq('entitlement_key', entitlement).eq('status', 'active');
  if ((entitlements ?? []).some((item) => !item.ends_at || new Date(item.ends_at).getTime() > Date.now())) return { allowed: true, entitled: true };
  const { data: credits } = await client.from('user_credit_balances').select('balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if ((credits?.balance ?? 0) > 0) return { allowed: true, entitled: false, creditType };
  return { allowed: false, reason: 'Your HR mail credits are finished. Upgrade or buy credits to continue.' };
}

async function consumeCredit(client: ReturnType<typeof createClient>, userId: string, creditType: string) {
  const { data } = await client.from('user_credit_balances').select('id,balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if (!data || data.balance <= 0) return;
  await client.from('user_credit_balances').update({ balance: data.balance - 1, updated_at: new Date().toISOString() }).eq('id', data.id);
  await client.from('user_credit_transactions').insert({ user_id: userId, credit_type: creditType, transaction_type: 'consume', amount: 1, reason: 'hr_mail' });
}
