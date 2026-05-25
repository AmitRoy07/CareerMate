import { BriefcaseBusiness, SearchCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeatureLimitBanner } from '@/components/ui/FeatureLimitBanner';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { matchResumeToJob } from '@/services/ai.service';
import { trackEvent } from '@/services/analytics.service';
import { buildPaywallMessage } from '@/services/paywall.service';
import { getSavedResumes } from '@/services/resume.service';
import { useAuth } from '@/store/userStore';
import type { JobMatchResult } from '@/types/ai.types';
import type { ResumeDraft } from '@/types/resume.types';

export default function JobMatchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode } = useAuth();
  const [resumeText, setResumeText] = useState(sampleResumeText);
  const [savedResumes, setSavedResumes] = useState<ResumeDraft[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState(sampleJobDescription);
  const [targetRole, setTargetRole] = useState('React Native Developer');
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = Boolean(user || demoMode);

  useEffect(() => {
    getSavedResumes(user?.id).then(setSavedResumes).catch(() => setSavedResumes([]));
  }, [user?.id]);

  async function handleMatch() {
    if (!isLoggedIn) {
      setError('Please sign in before checking job match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      await trackEvent('job_match_started');
      const nextResult = await matchResumeToJob({ userId: user?.id, resumeId: selectedResumeId ?? undefined, resumeText, jobDescription, targetRole, saveReport: Boolean(user?.id) });
      setResult(nextResult);
      await trackEvent('job_match_completed', { score: nextResult.matchScore });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Unable to check job match right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="gap-2">
        <GlassIcon icon={SearchCheck} tone="violet" size={72} />
        <Text variant="label" style={{ color: colors.primary }}>Job Match</Text>
        <Text variant="title">Match resume with JD</Text>
        <Text variant="muted">Compare your resume with a job description and get ethical improvement suggestions.</Text>
      </View>

      {!isLoggedIn ? <FeatureLimitBanner title="Sign in required" message="Job match needs a logged-in or demo session." /> : null}

      <Card>
        <Text variant="heading">Inputs</Text>
        <TextInput value={targetRole} onChangeText={setTargetRole} placeholder="Target role" placeholderTextColor={colors.muted} style={inputStyle(colors, 48)} />
        {savedResumes.length ? (
          <View className="gap-2">
            <Text variant="label">Saved resumes</Text>
            <View className="flex-row flex-wrap gap-2">
              {savedResumes.map((resume) => (
                <Pressable
                  key={resume.id ?? resume.title}
                  onPress={() => {
                    setSelectedResumeId(resume.id ?? null);
                    setResumeText(resumeToText(resume));
                  }}
                  style={{ backgroundColor: selectedResumeId === resume.id ? colors.primary : colors.surfaceLow, borderColor: selectedResumeId === resume.id ? colors.primary : colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: selectedResumeId === resume.id ? '#FFFFFF' : colors.text, fontFamily: 'PlusJakartaSans_700Bold' }}>{resume.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        <TextInput multiline value={resumeText} onChangeText={setResumeText} placeholder="Paste resume content" placeholderTextColor={colors.muted} style={inputStyle(colors, 150)} />
        <TextInput multiline value={jobDescription} onChangeText={setJobDescription} placeholder="Paste full job description" placeholderTextColor={colors.muted} style={inputStyle(colors, 170)} />
        <Button title={loading ? 'Checking match...' : 'Check Match'} icon={BriefcaseBusiness} loading={loading} onPress={handleMatch} />
      </Card>

      {error ? (
        <UpgradePrompt
          title="Job match unavailable"
          message={error.includes('requires') || error.includes('credits') ? buildPaywallMessage({ entitlement: 'job_match', creditType: 'job_match', featureName: 'Job Match' }) : error}
          onMaybeLater={() => setError(null)}
        />
      ) : null}

      {!result && !error ? (
        <Card>
          <Text variant="heading">Ready when you are</Text>
          <Text variant="muted">Paste a complete JD to see match percentage, keyword coverage, gaps, summary rewrite, and next actions.</Text>
        </Card>
      ) : null}

      {result ? (
        <>
          <Card>
            <Text variant="label">Match percentage</Text>
            <Text variant="metric">{result.matchScore}%</Text>
            <Text variant="muted">Keyword {result.keywordScore}% - Role alignment {result.roleAlignmentScore}%</Text>
          </Card>
          <List title="Missing technical skills" items={result.missingTechnicalSkills} />
          <List title="Missing soft skills" items={result.missingSoftSkills} />
          <Card>
            <Text variant="heading">Suggested summary rewrite</Text>
            <Text>{result.suggestedSummaryRewrite}</Text>
          </Card>
          <List title="Skills section update" items={result.suggestedSkillsUpdate} />
          <Card>
            <Text variant="heading">Warnings</Text>
            {result.warnings.map((item) => <Text key={item}>- {item}</Text>)}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <Text variant="heading">{title}</Text>
      {items.length ? items.map((item) => <Text key={item}>- {item}</Text>) : <Text variant="muted">No major gaps detected.</Text>}
    </Card>
  );
}

function inputStyle(colors: typeof Colors.light, minHeight: number) {
  return {
    backgroundColor: colors.surfaceLow,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontFamily: 'PlusJakartaSans_400Regular',
    minHeight,
    padding: 14,
    textAlignVertical: 'top' as const,
  };
}

const sampleResumeText = 'React Native developer with TypeScript, JavaScript, Supabase, API integration, and reusable UI component experience.';
const sampleJobDescription = 'We need a React Native Developer with TypeScript, JavaScript, REST API integration, performance optimization, testing, collaboration, and ownership.';

function resumeToText(resume: ResumeDraft) {
  return [resume.summary, resume.skills, resume.experience, resume.projects, resume.education, resume.certifications].filter(Boolean).join('\n\n');
}
