import { Bot, FileText, Sparkles } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { FeatureLimitBanner } from '@/components/ui/FeatureLimitBanner';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { analyzeResume, saveAnalysisReport } from '@/services/ai.service';
import { trackEvent } from '@/services/analytics.service';
import { buildPaywallMessage } from '@/services/paywall.service';
import { getSavedResumes } from '@/services/resume.service';
import { useAuth } from '@/store/userStore';
import type { AnalyzeResumeResult } from '@/types/ai.types';
import type { ResumeDraft } from '@/types/resume.types';

export default function AnalyzeResumeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode } = useAuth();
  const [resumeText, setResumeText] = useState(sampleResumeText);
  const [savedResumes, setSavedResumes] = useState<ResumeDraft[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('Frontend Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<AnalyzeResumeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = Boolean(user || demoMode);

  useEffect(() => {
    getSavedResumes(user?.id).then(setSavedResumes).catch(() => setSavedResumes([]));
  }, [user?.id]);

  const paywallMessage = useMemo(
    () => buildPaywallMessage({ entitlement: 'ai_resume_analyzer', creditType: 'ai_resume_scan', featureName: 'AI Resume Analyzer' }),
    [],
  );

  async function handleAnalyze() {
    if (!isLoggedIn) {
      setError('Please sign in to analyze your resume.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setReport(null);
      await trackEvent('resume_analysis_started');
      const result = await analyzeResume({ userId: user?.id, resumeId: selectedResumeId ?? undefined, resumeText, targetRole, jobDescription, saveReport: Boolean(user?.id) });
      setReport(result);
      await trackEvent('resume_analysis_completed', { score: result.overallScore });
    } catch (currentError) {
      const message = currentError instanceof Error ? currentError.message : 'Unable to analyze resume right now. Please try again.';
      setError(message);
      await trackEvent('paywall_opened', { feature: 'ai_resume_analyzer' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user?.id || !report) {
      Alert.alert('Sign in required', 'Please sign in to save analysis reports.');
      return;
    }
    await saveAnalysisReport({ ...report, userId: user.id, targetRole, createdAt: new Date().toISOString() });
    Alert.alert('Report saved', 'Your analysis report is saved to your account.');
  }

  return (
    <Screen>
      <View className="gap-2">
        <GlassIcon icon={Bot} tone="blue" size={72} />
        <Text variant="label" style={{ color: colors.primary }}>AI Resume Analyzer</Text>
        <Text variant="title">ATS score and practical fixes</Text>
        <Text variant="muted">Analyze resume content through a protected Supabase Edge Function. Secrets never live in the app.</Text>
      </View>

      {!isLoggedIn ? <FeatureLimitBanner title="Sign in required" message="Use demo mode or login before running premium AI tools." /> : null}

      <Card>
        <View className="flex-row items-center justify-between gap-3">
          <Text variant="heading">Usage</Text>
          <CreditBadge label="AI scans" value={user ? 0 : 1} />
        </View>
        <Text variant="muted">Pro unlocks unlimited analyzer access for this phase. Credits can also run individual scans.</Text>
      </Card>

      <Card>
        <Text variant="heading">Resume Input</Text>
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
        <TextInput
          multiline
          value={resumeText}
          onChangeText={setResumeText}
          placeholder="Paste resume content or key sections..."
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surfaceLow, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontFamily: 'PlusJakartaSans_400Regular', minHeight: 170, padding: 14, textAlignVertical: 'top' }}
        />
        <TextInput
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="Target role"
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surfaceLow, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontFamily: 'PlusJakartaSans_400Regular', minHeight: 48, padding: 14 }}
        />
        <TextInput
          multiline
          value={jobDescription}
          onChangeText={setJobDescription}
          placeholder="Optional job description for better keyword suggestions"
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surfaceLow, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontFamily: 'PlusJakartaSans_400Regular', minHeight: 110, padding: 14, textAlignVertical: 'top' }}
        />
        <Button title={loading ? 'Analyzing resume...' : 'Analyze Resume'} icon={Sparkles} loading={loading} onPress={handleAnalyze} />
      </Card>

      {error ? <UpgradePrompt title="Premium access needed" message={error.includes('requires') || error.includes('credits') ? paywallMessage : error} cta="View plans" onMaybeLater={() => setError(null)} /> : null}

      {!report && !error ? (
        <Card>
          <GlassIcon icon={FileText} tone="green" />
          <Text variant="heading">No report yet</Text>
          <Text variant="muted">Paste your resume and run analysis to see ATS score, missing keywords, weak bullets, warnings, and next actions.</Text>
        </Card>
      ) : null}

      {report ? (
        <>
          <Card>
            <Text variant="label">Overall score</Text>
            <Text variant="metric">{report.overallScore}/100</Text>
            <Text variant="muted">ATS {report.atsScore} - Keywords {report.keywordScore} - Structure {report.structureScore}</Text>
          </Card>
          <ReportList title="Missing keywords" items={report.missingKeywords} />
          <ReportList title="Weak sections" items={report.weakSections} />
          <Card>
            <Text variant="heading">Suggestions</Text>
            {report.improvementSuggestions.map((item) => (
              <View key={item.title} className="gap-1">
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>{item.title}</Text>
                <Text variant="muted">{item.detail}</Text>
              </View>
            ))}
          </Card>
          {report.rewrittenSummary ? (
            <Card>
              <Text variant="heading">Rewritten summary</Text>
              <Text>{report.rewrittenSummary}</Text>
            </Card>
          ) : null}
          <ReportList title="Next actions" items={report.nextActions} />
          <Button title="Save report" variant="secondary" onPress={handleSave} />
        </>
      ) : null}
    </Screen>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <Text variant="heading">{title}</Text>
      {items.length ? items.map((item) => <Text key={item}>- {item}</Text>) : <Text variant="muted">Nothing critical found here.</Text>}
    </Card>
  );
}

const sampleResumeText = `Experience
Built React Native and React features for production applications.
Skills
React, React Native, TypeScript, JavaScript, HTML, CSS, Supabase
Projects
CareerMate India resume, interview, salary, and document vault app.
Education
Computer Science graduate`;

function resumeToText(resume: ResumeDraft) {
  return [
    resume.summary && `Summary\n${resume.summary}`,
    resume.skills && `Skills\n${resume.skills}`,
    resume.experience && `Experience\n${resume.experience}`,
    resume.projects && `Projects\n${resume.projects}`,
    resume.education && `Education\n${resume.education}`,
    resume.certifications && `Certifications\n${resume.certifications}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
