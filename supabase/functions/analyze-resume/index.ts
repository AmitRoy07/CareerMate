import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.106.1';

type AnalyzeInput = {
  resumeId?: string;
  resumeText?: string;
  targetRole?: string;
  jobDescription?: string;
  saveReport?: boolean;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });

    const input = (await req.json()) as AnalyzeInput;
    const resumeText = String(input.resumeText ?? '').trim();
    if (resumeText.length < 80) return Response.json({ error: 'Please add resume details before running analysis.' }, { status: 400, headers: corsHeaders });
    if (resumeText.length > 20000 || String(input.jobDescription ?? '').length > 20000) return Response.json({ error: 'Input is too large.' }, { status: 413, headers: corsHeaders });

    const access = await canUse(adminClient, userData.user.id, 'ai_resume_analyzer', 'ai_resume_scan');
    if (!access.allowed) return Response.json({ error: access.reason }, { status: 402, headers: corsHeaders });

    const result = buildReport(resumeText, input.targetRole, input.jobDescription);

    if (input.saveReport) {
      await adminClient.from('resume_analysis_reports').insert({
        user_id: userData.user.id,
        resume_id: input.resumeId,
        target_role: input.targetRole,
        job_description_hash: input.jobDescription ? await sha256(input.jobDescription) : null,
        overall_score: result.overallScore,
        ats_score: result.atsScore,
        report_json: result,
      });
    }

    if (!access.entitled && access.creditType) await consumeCredit(adminClient, userData.user.id, access.creditType);
    return Response.json(result, { headers: corsHeaders });
  } catch (_error) {
    return Response.json({ error: 'Unable to analyze resume right now. Please try again.' }, { status: 500, headers: corsHeaders });
  }
});

function buildReport(resumeText: string, targetRole?: string, jobDescription?: string) {
  const text = resumeText.toLowerCase();
  const jd = String(jobDescription ?? '').toLowerCase();
  const keywords = ['react', 'react native', 'typescript', 'javascript', 'node', 'next.js', 'supabase', 'aem', 'sql', 'testing'];
  const matched = keywords.filter((keyword) => text.includes(keyword) || (jd.includes(keyword) && text.includes(keyword)));
  const keywordScore = Math.min(95, 45 + matched.length * 6);
  const structureScore = text.includes('experience') && text.includes('skills') && text.includes('education') ? 84 : 66;
  const readabilityScore = resumeText.length > 450 ? 80 : 64;
  const atsScore = Math.round((keywordScore + structureScore + readabilityScore) / 3);

  return {
    overallScore: Math.min(96, atsScore + 3),
    atsScore,
    readabilityScore,
    keywordScore,
    structureScore,
    breakdown: { keywords: keywordScore, structure: structureScore, readability: readabilityScore, relevance: atsScore },
    missingKeywords: keywords.filter((keyword) => jd.includes(keyword) && !text.includes(keyword)).slice(0, 8),
    weakSections: text.includes('%') || /\d/.test(text) ? ['Summary can better reflect target role'] : ['Experience bullets need quantified outcomes'],
    improvementSuggestions: [
      { title: 'Quantify the strongest work', detail: 'Add measurable outcomes for performance, revenue, quality, users, or delivery speed.', priority: 'high' },
      { title: 'Improve keyword alignment', detail: 'Add only truthful keywords that match your actual experience and the target role.', priority: 'medium' },
      { title: 'Keep ATS structure simple', detail: 'Use standard headings, simple bullet points, and avoid image-only content.', priority: 'medium' },
    ],
    rewrittenSummary: `${targetRole ?? 'Career'} professional with practical delivery experience, strong ownership, and a focus on measurable business impact for Indian hiring teams.`,
    improvedBulletPoints: [
      { before: 'Worked on application features.', after: 'Delivered application features with clear ownership, quality improvements, and measurable delivery impact.', reason: 'Turns a passive task into an outcome-focused bullet.' },
    ],
    warnings: ['Do not add fake employers, skills, tools, salaries, or achievements. Keep every claim verifiable.'],
    nextActions: ['Add 3 quantified bullets', 'Move core role keywords into skills', 'Export a clean PDF without design-heavy elements'],
  };
}

async function canUse(client: ReturnType<typeof createClient>, userId: string, entitlement: string, creditType: string) {
  const { data: plan } = await client.from('user_plans').select('plan_type,status,ends_at').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
  const planType = plan?.plan_type;
  const planActive = plan?.status === 'active' && (!plan.ends_at || new Date(plan.ends_at).getTime() > Date.now());
  if (planActive && planType === 'pro') return { allowed: true, entitled: true };

  const { data: entitlements } = await client.from('user_entitlements').select('entitlement_key,status,ends_at').eq('user_id', userId).eq('entitlement_key', entitlement).eq('status', 'active');
  if ((entitlements ?? []).some((item) => !item.ends_at || new Date(item.ends_at).getTime() > Date.now())) return { allowed: true, entitled: true };

  const { data: credits } = await client.from('user_credit_balances').select('balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if ((credits?.balance ?? 0) > 0) return { allowed: true, entitled: false, creditType };
  return { allowed: false, reason: 'Your AI credits are finished. Upgrade or buy credits to continue.' };
}

async function consumeCredit(client: ReturnType<typeof createClient>, userId: string, creditType: string) {
  const { data } = await client.from('user_credit_balances').select('id,balance').eq('user_id', userId).eq('credit_type', creditType).maybeSingle();
  if (!data || data.balance <= 0) return;
  await client.from('user_credit_balances').update({ balance: data.balance - 1, updated_at: new Date().toISOString() }).eq('id', data.id);
  await client.from('user_credit_transactions').insert({ user_id: userId, credit_type: creditType, transaction_type: 'consume', amount: 1, reason: 'analyze_resume' });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
