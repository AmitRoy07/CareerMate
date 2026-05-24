import bankData from '@/data/interview-bank.json';
import type { InterviewBank, InterviewQuestion } from '@/types/interview.types';

const generatedBank = bankData as InterviewBank;

const originalCareerMateQuestions: InterviewQuestion[] = [
  makeOriginal('React Native', 'How is React Native different from React on the web?', 'React Native renders native platform components through a mobile runtime instead of DOM nodes, so layout, gestures, permissions, navigation, and platform APIs need mobile-specific handling.'),
  makeOriginal('Next.js', 'When would you use server-side rendering?', 'Use SSR when content must be personalized or fresh on each request, or when SEO requires fully rendered HTML from the server.'),
  makeOriginal('AEM', 'What are AEM components?', 'AEM components are reusable authorable building blocks that combine dialog configuration, content models, rendering scripts, and client-side behavior.'),
  makeOriginal('HR Questions', 'Tell me about yourself.', 'Give a concise story: current role, strongest relevant skills, proof from recent work, and why this role is a natural next step.'),
  makeOriginal('HR Questions', 'Why should we hire you?', 'Connect the role requirements to your strongest proof: relevant projects, measurable outcomes, ownership, communication, and fast learning.'),
];

export const interviewQuestions: InterviewQuestion[] = [...originalCareerMateQuestions, ...generatedBank.questions];

export const interviewBankMeta = {
  generatedAt: generatedBank.generatedAt,
  total: interviewQuestions.length,
  sources: generatedBank.sources,
};

export const interviewCategories = unique(interviewQuestions.map((item) => item.category)).sort((a, b) => {
  const preferred = ['JavaScript', 'React', 'React Native', 'HTML', 'CSS', 'TypeScript', 'DSA', 'Next.js', 'AEM', 'HR Questions'];
  const aIndex = preferred.indexOf(a);
  const bIndex = preferred.indexOf(b);
  return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex) || a.localeCompare(b);
});

export const interviewSources = unique(interviewQuestions.map((item) => item.source.name)).sort();

export const interviewCompanies = unique(interviewQuestions.map((item) => item.company).filter(Boolean) as string[]).sort();

export const interviewDifficulties = ['EASY', 'MEDIUM', 'HARD'];

export function findInterviewQuestion(id: string) {
  return interviewQuestions.find((item) => item.id === id);
}

export function getInterviewCategoryCount(category: string) {
  return interviewQuestions.filter((item) => item.category === category).length;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function makeOriginal(category: string, question: string, answer: string): InterviewQuestion {
  return {
    id: `cm-${category.toLowerCase().replace(/\W+/g, '-')}-${question.toLowerCase().replace(/\W+/g, '-').slice(0, 34)}`,
    type: 'theory',
    category,
    subcategory: 'CareerMate',
    question,
    answer,
    options: [],
    correctOption: null,
    company: null,
    difficulty: null,
    frequency: null,
    link: null,
    tags: [category],
    source: {
      name: 'CareerMate original',
      url: 'local',
      license: 'Original app content',
    },
  };
}
