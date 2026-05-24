import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const formData = await req.formData();
  const resume = formData.get('resume');
  if (!resume || !(resume instanceof File)) {
    return Response.json({ error: 'Resume PDF is required' }, { status: 400 });
  }

  // Production implementation: extract PDF text, call OpenAI/Gemini using server-side secrets,
  // validate JSON output, persist ai_resume_reports, and rate-limit per authenticated user.
  return Response.json({
    atsScore: 78,
    missingKeywords: ['React Native', 'Supabase', 'Metrics'],
    suggestions: ['Add quantified outcomes.', 'Mirror target job keywords.', 'Tighten the summary section.'],
    rewrittenSummary:
      'Frontend engineer specializing in React Native, TypeScript, and scalable mobile experiences for Indian career and hiring workflows.',
  });
});

