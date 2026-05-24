import * as DocumentPicker from 'expo-document-picker';

import type { AiResumeReport } from '@/types/resume.types';

const aiEndpoint = process.env.EXPO_PUBLIC_AI_RESUME_ENDPOINT;

export async function pickResumePdf() {
  return DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });
}

export async function analyzeResume(uri: string): Promise<AiResumeReport> {
  if (!aiEndpoint) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      atsScore: 78,
      missingKeywords: ['React Native', 'Supabase', 'Performance metrics'],
      suggestions: [
        'Add measurable impact to the latest two projects.',
        'Move core frontend keywords into the summary and skills sections.',
        'Keep bullets action-oriented and below two lines where possible.',
      ],
      rewrittenSummary:
        'Frontend engineer specializing in React, React Native, and scalable user experiences, with a focus on performance, accessibility, and business impact.',
    };
  }

  const formData = new FormData();
  formData.append('resume', {
    uri,
    name: 'resume.pdf',
    type: 'application/pdf',
  } as unknown as Blob);

  const response = await fetch(aiEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Resume analysis failed. Please try again.');
  }

  return response.json();
}

