import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = process.cwd();
const sourcesRoot = join(root, '.tmp', 'sources');
const outputDir = join(root, 'data');
const outputFile = join(outputDir, 'interview-bank.json');

const repos = {
  frontend100: join(sourcesRoot, '100_Days_Of_Frontend_Interview_Questions'),
  linkedin: join(sourcesRoot, 'linkedin-skill-assessments-quizzes'),
  companies: join(sourcesRoot, 'interview-company-wise-problems'),
};

const bank = [];

const sourceMeta = {
  frontend100: {
    name: '100 Days Of Frontend Interview Questions',
    url: 'https://github.com/Saran-pariyar/100_Days_Of_Frontend_Interview_Questions',
    license: 'No license file found in cloned repository',
  },
  linkedin: {
    name: 'LinkedIn Skill Assessments Quizzes',
    url: 'https://github.com/Ebazhanov/linkedin-skill-assessments-quizzes',
    license: 'AGPL-3.0',
  },
  companies: {
    name: 'Interview Company Wise Problems',
    url: 'https://github.com/liquidslr/interview-company-wise-problems',
    license: 'No license file found in cloned repository',
  },
};

function idFor(...parts) {
  return createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 14);
}

function clean(value = '') {
  return value
    .replace(/\r/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?b>/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pushQuestion(question) {
  if (!question.question || question.question.length < 8) return;
  const normalized = question.question.toLowerCase().replace(/\W+/g, ' ').trim();
  if (bank.some((item) => item.normalized === normalized && item.category === question.category)) return;

  bank.push({
    id: idFor(question.sourceKey, question.category, question.question),
    type: question.type ?? 'theory',
    category: question.category,
    subcategory: question.subcategory ?? question.category,
    question: clean(question.question),
    answer: clean(question.answer ?? 'Practice prompt. Add your own answer notes as you revise this topic.'),
    options: question.options ?? [],
    correctOption: question.correctOption ?? null,
    company: question.company ?? null,
    difficulty: question.difficulty ?? null,
    frequency: question.frequency ?? null,
    link: question.link ?? null,
    tags: question.tags ?? [],
    source: sourceMeta[question.sourceKey],
    normalized,
  });
}

function parseFrontend100() {
  const readme = join(repos.frontend100, 'README.md');
  if (!existsSync(readme)) return;

  const text = readFileSync(readme, 'utf8');
  const matches = [...text.matchAll(/(?:^|\r?\n)(\d+)\.\s+###\s+(.+?)\r?\n([\s\S]*?)(?=\r?\n\d+\.\s+###|\r?\n# (HTML|CSS|Javascript|React|Typescript)|$)/g)];
  let category = 'Frontend';
  const categoryRanges = [
    ['HTML', 1, 50],
    ['CSS', 51, 150],
    ['JavaScript', 151, 330],
    ['React', 331, 465],
    ['TypeScript', 466, 500],
  ];

  for (const match of matches) {
    const number = Number(match[1]);
    category = categoryRanges.find(([, min, max]) => number >= min && number <= max)?.[0] ?? category;
    pushQuestion({
      sourceKey: 'frontend100',
      type: 'theory',
      category,
      subcategory: `Day ${Math.ceil(number / 5)}`,
      question: match[2],
      answer: match[3],
      tags: ['frontend', category.toLowerCase()],
    });
  }
}

function parseLinkedinTopic(folder, category = categoryFromFolder(folder)) {
  const quiz = join(repos.linkedin, folder, `${folder}-quiz.md`);
  if (!existsSync(quiz)) return;

  const text = readFileSync(quiz, 'utf8');
  const matches = [...text.matchAll(/####\s+Q\d+\.\s+(.+?)\r?\n([\s\S]*?)(?=\r?\n####\s+Q\d+\.|$)/g)];

  for (const match of matches) {
    const body = match[2];
    const options = [...body.matchAll(/- \[(x| )\]\s+(.+)/g)].map((option) => clean(option[2]));
    const correct = [...body.matchAll(/- \[x\]\s+(.+)/g)][0]?.[1];
    const reference = [...body.matchAll(/\[Reference[^\]]*\]\(([^)]+)\)/g)][0]?.[1];

    pushQuestion({
      sourceKey: 'linkedin',
      type: 'quiz',
      category,
      subcategory: 'Skill quiz',
      question: match[1],
      answer: correct ? `Correct answer: ${clean(correct)}` : 'Review the options and linked reference.',
      options,
      correctOption: correct ? clean(correct) : null,
      link: reference,
      tags: ['linkedin', 'quiz', category.toLowerCase()],
    });
  }
}

function parseAllLinkedinTopics() {
  if (!existsSync(repos.linkedin)) return;

  const folders = readdirSync(repos.linkedin, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'assets')
    .map((entry) => entry.name)
    .filter((folder) => existsSync(join(repos.linkedin, folder, `${folder}-quiz.md`)));

  for (const folder of folders) {
    parseLinkedinTopic(folder);
  }
}

function categoryFromFolder(folder) {
  const known = {
    'adobe-ai': 'Adobe Illustrator',
    'adobe-in-design': 'Adobe InDesign',
    'adobe-xd': 'Adobe XD',
    'ai-ml': 'AI/ML',
    'arc-gis': 'ArcGIS',
    'autocad': 'AutoCAD',
    'aws': 'AWS',
    'aws-lambda': 'AWS Lambda',
    'c-(programming-language)': 'C',
    'c++': 'C++',
    'c-sharp': 'C#',
    'css': 'CSS',
    'dotnet-framework': '.NET Framework',
    'front-end-development': 'Front-End Development',
    'google-cloud-platform': 'Google Cloud Platform',
    'html': 'HTML',
    'it-operations': 'IT Operations',
    'javascript': 'JavaScript',
    'jquery': 'jQuery',
    'json': 'JSON',
    'mongodb': 'MongoDB',
    'mysql': 'MySQL',
    'node.js': 'Node.js',
    'nosql': 'NoSQL',
    'objective-c': 'Objective-C',
    'php': 'PHP',
    'python': 'Python',
    'r': 'R',
    'reactjs': 'React',
    'rest-api': 'REST API',
    'ruby-on-rails': 'Ruby on Rails',
    't-sql': 'T-SQL',
    'typescript': 'TypeScript',
    'vba': 'VBA',
    'wordpress': 'WordPress',
    'xml': 'XML',
  };

  if (known[folder]) return known[folder];

  return folder
    .split('-')
    .map((part) => {
      if (!part) return part;
      return part[0].toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function parseCompanyProblems() {
  if (!existsSync(repos.companies)) return;

  const companies = readdirSync(repos.companies, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);

  for (const company of companies) {
    const file = join(repos.companies, company, '5. All.csv');
    if (!existsSync(file)) continue;
    const rows = parseCsv(readFileSync(file, 'utf8')).slice(1);

    for (const row of rows) {
      const [difficulty, title, frequency, acceptanceRate, link, topics] = row;
      if (!title || !link) continue;
      pushQuestion({
        sourceKey: 'companies',
        type: 'coding',
        category: 'DSA',
        subcategory: company,
        company,
        difficulty,
        frequency: Number(frequency) || null,
        link,
        question: title,
        answer: `Solve on LeetCode. Topics: ${topics || 'Not listed'}. Acceptance rate: ${acceptanceRate ? `${Math.round(Number(acceptanceRate) * 100)}%` : 'Not listed'}.`,
        tags: (topics ?? '').split(',').map((topic) => topic.trim()).filter(Boolean),
      });
    }
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

parseFrontend100();
parseAllLinkedinTopics();
parseCompanyProblems();

const publicBank = bank
  .map(({ normalized, ...item }) => item)
  .sort((a, b) => a.category.localeCompare(b.category) || (b.frequency ?? 0) - (a.frequency ?? 0) || a.question.localeCompare(b.question));

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  outputFile,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      total: publicBank.length,
      sources: sourceMeta,
      questions: publicBank,
    },
    null,
    2,
  )}\n`,
);

console.log(`Built ${publicBank.length} interview questions at ${basename(outputFile)}`);
