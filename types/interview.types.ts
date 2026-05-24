export type InterviewQuestionType = 'theory' | 'quiz' | 'coding';

export interface InterviewSource {
  name: string;
  url: string;
  license: string;
}

export interface InterviewQuestion {
  id: string;
  type: InterviewQuestionType;
  category: string;
  subcategory: string;
  question: string;
  answer: string;
  options: string[];
  correctOption: string | null;
  company: string | null;
  difficulty: string | null;
  frequency: number | null;
  link: string | null;
  tags: string[];
  source: InterviewSource;
}

export interface InterviewBank {
  generatedAt: string;
  total: number;
  sources: Record<string, InterviewSource>;
  questions: InterviewQuestion[];
}

