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

    const input = await req.json() as { resumeId?: string; resumeText?: string; jobDescription?: string; targetRole?: string; saveReport?: boolean };
    const resumeText = String(input.resumeText ?? '').trim();
    const jobDescription = String(input.jobDescription ?? '').trim();
    if (resumeText.length < 80) return Response.json({ error: 'Please add resume details before checking match.' }, { status: 400, headers: corsHeaders });
    if (jobDescription.length < 80) return Response.json({ error: 'Job description is too short. Please paste the complete job description.' }, { status: 400, headers: corsHeaders });
    if (resumeText.length > 20000 || jobDescription.length > 20000) return Response.json({ error: 'Input is too large.' }, { status: 413, headers: corsHeaders });

    const access = await canUse(adminClient, userData.user.id, 'job_match', 'job_match');
    if (!access.allowed) return Response.json({ error: access.reason }, { status: 402, headers: corsHeaders });

    const result = buildMatch(resumeText, jobDescription, input.targetRole);
    if (input.saveReport) {
      await adminClient.from('job_match_reports').insert({
        user_id: userData.user.id,
        resume_id: input.resumeId,
        target_role: input.targetRole,
        match_score: result.matchScore,
        report_json: result,
      });
    }

    if (!access.entitled && access.creditType) await consumeCredit(adminClient, userData.user.id, access.creditType, 'job_match');
    return Response.json(result, { headers: corsHeaders });
  } catch (_error) {
    return Response.json({ error: 'Unable to check job match right now. Please try again.' }, { status: 500, headers: corsHeaders });
  }
});

function buildMatch(resumeText: string, jobDescription: string, targetRole?: string) {
  const resume = resumeText.toLowerCase();
  const keywords = Array.from(new Set(jobDescription.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) ?? [])).filter((word) => word.length > 3).slice(0, 18);
  const keywordMatches = keywords.map((keyword) => ({
    keyword,
    present: resume.includes(keyword),
    category: /react|node|sql|java|css|html|aem|typescript|javascript|api|cloud/.test(keyword) ? 'technical' : 'domain',
  }));
  const matched = keywordMatches.filter((item) => item.present).length;
  const matchScore = Math.round((matched / Math.max(keywordMatches.length, 1)) * 100);

  return {
    matchScore,
    keywordScore: matchScore,
    roleAlignmentScore: Math.max(35, Math.min(92, matchScore + 8)),
    keywordMatches,
    missingTechnicalSkills: keywordMatches.filter((item) => !item.present && item.category === 'technical').map((item) => item.keyword),
    missingSoftSkills: ['communication', 'ownership', 'collaboration'].filter((keyword) => jobDescription.toLowerCase().includes(keyword) && !resume.includes(keyword)),
    suggestedSummaryRewrite: `For ${targetRole ?? 'this role'}, highlight verified matching skills, project ownership, and measurable impact without adding false claims.`,
    suggestedSkillsUpdate: keywordMatches.filter((item) => item.present).map((item) => item.keyword).slice(0, 10),
    bulletPointImprovements: [
      { before: 'Worked on relevant tasks.', after: 'Delivered role-relevant work with clear tools, scope, collaboration, and measurable business outcome.', reason: 'Adds role alignment and outcome language.' },
    ],
    gaps: keywordMatches.filter((item) => !item.present).slice(0, 6).map((item) => ({ title: item.keyword, detail: 'Not visible in the resume. Add only if this is a real skill or treat it as a learning gap.', type: 'missing_keyword' })),
    warnings: ['Do not add false skills. Mark missing requirements as learning gaps when needed.'],
    nextActions: ['Update summary for this JD', 'Add honest matching keywords', 'Improve 3 strongest bullets'],
  };
}

async function canUse(client: ReturnType<typeof createClient>, userId: string, entitlement: string, creditType: string) {
  const { data: plan } = await client.from('user_plans').select('plan_type,status,ends_at').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (plan?.status === 'active' && plan.plan_type === 'pro' && (!plan.ends_at || new Date(plan.ends_at).getTime() > Date.now())) return { allowed: true, entitled: true };
  const { data: entitlements } = await client.from('user_entitlements').select('ends_at').eq('user_id', userId).eq('entitlement_key', entitlement).eq('status', 'active');
  if ((entitlements ?? []).some((item) => !item.ends_at || new Date(item.ends_at).getTime() > Date.now())) return { allowed: true, entitled: true };
  const { data: credits } = await client.from('user_credit_balances').select('balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if ((credits?.balance ?? 0) > 0) return { allowed: true, entitled: false, creditType };
  return { allowed: false, reason: 'Your job match credits are finished. Upgrade or buy credits to continue.' };
}

async function consumeCredit(client: ReturnType<typeof createClient>, userId: string, creditType: string, reason: string) {
  const { data } = await client.from('user_credit_balances').select('id,balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if (!data || data.balance <= 0) return;
  await client.from('user_credit_balances').update({ balance: data.balance - 1, updated_at: new Date().toISOString() }).eq('id', data.id);
  await client.from('user_credit_transactions').insert({ user_id: userId, credit_type: creditType, transaction_type: 'consume', amount: 1, reason });
}
