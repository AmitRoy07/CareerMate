export interface AnalyzeResumeInput {
  userId?: string;
  resumeId?: string;
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
  saveReport?: boolean;
}

export interface AtsScoreBreakdown {
  keywords: number;
  structure: number;
  readability: number;
  relevance: number;
}

export interface ResumeImprovementSuggestion {
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MissingKeyword {
  keyword: string;
  category: 'technical' | 'soft_skill' | 'domain' | 'tool';
}

export interface WeakBulletPoint {
  before: string;
  after: string;
  reason: string;
}

export interface AnalyzeResumeResult {
  overallScore: number;
  atsScore: number;
  readabilityScore: number;
  keywordScore: number;
  structureScore: number;
  breakdown: AtsScoreBreakdown;
  missingKeywords: string[];
  weakSections: string[];
  improvementSuggestions: ResumeImprovementSuggestion[];
  rewrittenSummary?: string;
  improvedBulletPoints?: WeakBulletPoint[];
  warnings: string[];
  nextActions: string[];
}

export interface ResumeAnalysisReport extends AnalyzeResumeResult {
  id?: string;
  userId: string;
  resumeId?: string;
  targetRole?: string;
  jobDescriptionHash?: string;
  createdAt: string;
}

export interface AiUsageStatus {
  allowed: boolean;
  reason?: 'not_logged_in' | 'premium_required' | 'credits_exhausted' | 'invalid_input' | 'network_error';
  remainingCredits?: number;
}

export interface JobMatchInput {
  userId?: string;
  resumeId?: string;
  resumeText: string;
  jobDescription: string;
  targetRole?: string;
  saveReport?: boolean;
}

export interface JobKeywordMatch {
  keyword: string;
  present: boolean;
  category: 'technical' | 'soft_skill' | 'domain' | 'tool';
}

export interface JobMatchGap {
  title: string;
  detail: string;
  type: 'missing_keyword' | 'missing_skill' | 'weak_evidence' | 'role_alignment';
}

export interface JobMatchResult {
  matchScore: number;
  keywordScore: number;
  roleAlignmentScore: number;
  keywordMatches: JobKeywordMatch[];
  missingTechnicalSkills: string[];
  missingSoftSkills: string[];
  suggestedSummaryRewrite?: string;
  suggestedSkillsUpdate: string[];
  bulletPointImprovements: WeakBulletPoint[];
  gaps: JobMatchGap[];
  warnings: string[];
  nextActions: string[];
}
