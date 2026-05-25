# CareerMate India

Production-oriented Expo MVP for Indian job seekers: resume builder, premium PDF export, AI resume analyzer, ATS score, job description match, HR mail generator, salary calculator, interview prep, document vault, and profile/legal flows.

## Stack

- React Native + Expo + TypeScript
- Expo Router
- NativeWind + Tailwind CSS for utility-first styling
- Supabase Auth, PostgreSQL, Storage-ready schema
- Supabase Edge Functions for AI and credit-gated tools
- Expo Print/Sharing for PDF export
- Local-first private document vault with optional paid cloud sync path
- Premium entitlement and AI credit foundation for plans, templates, exports, analyzer, job match, HR mails, and vault sync

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add Supabase values.
3. Run database SQL from `supabase/schema.sql` in Supabase SQL editor.
4. Start the app with `npm run web` or `npm run android`.

The app supports local demo mode when Supabase env vars are missing.

## Project Rules And Architecture

Read these before making meaningful changes:

- [Architecture](docs/ARCHITECTURE.md)
- [Engineering Rules](docs/RULES.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Change Workflow](docs/CHANGE_WORKFLOW.md)
- [Launch Readiness](docs/LAUNCH_READINESS.md)
- [Android Play Store Readiness](docs/PLAY_STORE_READINESS.md)

Important rule: study the relevant screen, service, store, types, and existing patterns before changing code. If a feature or folder structure changes, update the docs in the same work.

## Premium And AI Features

Routes:

- `app/analyze/index.tsx`: AI Resume Analyzer with ATS score and improvement report.
- `app/analyze/job-match.tsx`: resume-to-job-description match report.
- `app/tools/hr-mail.tsx`: HR email and letter generator.
- `app/resume/builder.tsx` and `app/resume/preview.tsx`: free/premium template selector and no-watermark export gating.

Services and types:

- `services/monetization.service.ts` centralizes plan, entitlement, and credit access.
- `services/paywall.service.ts` owns upgrade copy and recommended plans.
- `services/ai.service.ts` invokes Supabase Edge Functions for analyzer and job match.
- `services/hrMail.service.ts` invokes the HR mail Edge Function.
- `services/analytics.service.ts` is a privacy-safe no-op event wrapper.
- `types/monetization.types.ts`, `types/ai.types.ts`, `types/hr-mail.types.ts`, and `types/template.types.ts` hold shared contracts.

## Security Notes

- Never put OpenAI or Gemini keys in the Expo app.
- Route AI tools through `supabase/functions/analyze-resume`, `supabase/functions/job-match`, and `supabase/functions/generate-hr-mail`.
- Keep Row Level Security enabled on all user-owned tables.
- For phone OTP, enable the Supabase Phone provider and configure an SMS provider before production.
- The document vault is local-only by default. Cloud sync must stay locked behind a real payment/subscription check before production.
- Add production rate limiting and transactional credit consumption RPCs before high-traffic launch.

## Supabase Setup

Apply `supabase/schema.sql` to create:

- Monetization tables: `user_plans`, `user_entitlements`, `user_credit_balances`, `user_credit_transactions`.
- AI tables: `resume_analysis_reports`, `job_match_reports`, `saved_hr_mails`.
- Existing app tables for profile, resumes, salary, interviews, favorites, and vault documents.

Deploy Edge Functions:

```bash
supabase functions deploy analyze-resume
supabase functions deploy job-match
supabase functions deploy generate-hr-mail
```

Required function secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set OPENAI_API_KEY=... # optional provider key for future real AI calls
supabase secrets set GEMINI_API_KEY=... # optional alternative provider key
```

The current functions include secure structured fallbacks so local smoke tests work without provider secrets. Real provider calls must stay inside Edge Functions.

## Document Vault

The vault imports PDFs/images into app-private local storage for offline access. Nothing is uploaded unless the user enables Vault Plus and triggers sync.

Production setup required:

- Apply `supabase/schema.sql` so `vault_documents` and `vault-documents` storage policies exist.
- Replace the demo Vault Plus toggle with a real subscription entitlement from Razorpay, RevenueCat, or your billing backend.
- Keep the `vault-documents` bucket private.
- Add server-side signed URL/download logic if users need restore on new devices.
- Add account deletion cleanup for vault files and metadata.

## Design Imports

Stitch project IDs alone are not downloadable from this workspace. To import the Stitch/Figma screens pixel-for-pixel, export hosted image/code URLs or attach the exported files, then place them under `assets/design-reference/` and update the matching Expo screens.

## Useful Commands

```bash
npm run start
npm run android
npm run web
npm run build:interviews
npm run typecheck
npm run doctor
npx expo-doctor
```

## Styling

NativeWind is configured with `global.css`, `tailwind.config.js`, `babel.config.js`, `metro.config.js`, and `nativewind-env.d.ts`. Shared primitives such as `Screen`, `Card`, `Text`, and `Button` accept `className` so new screens can use Tailwind utilities while still respecting the app theme tokens.

## Production Checklist

- Configure Supabase Auth providers: email, Google, phone OTP, and Apple before iOS release.
- Android config is launch-versioned with package `com.careermate.india` and version code `1`.
- Configure Supabase RLS and storage policies using `supabase/schema.sql`.
- Deploy `supabase/functions/analyze-resume`, `supabase/functions/job-match`, and `supabase/functions/generate-hr-mail`; keep AI keys in server-side secrets only.
- Replace placeholder Vault Plus toggle with verified $1/month subscription entitlement.
- Use `user_plans`, `user_entitlements`, `user_credit_balances`, and `user_credit_transactions` as the source of truth for premium access and usage.
- Add real account deletion Edge Function using service-role credentials.
- Add hosted privacy policy and terms URLs to app store listings.
- Run `npm run typecheck`, `npm run doctor`, and an EAS preview build before release.

## Interview Bank

The interview prep module reads from `data/interview-bank.json`, generated by `scripts/build-interview-bank.mjs`.

Current imported sources:

- liquidslr/interview-company-wise-problems: company-wise DSA/LeetCode practice metadata.
- Saran-pariyar/100_Days_Of_Frontend_Interview_Questions: frontend theory questions.
- Ebazhanov/linkedin-skill-assessments-quizzes: skill quiz questions, licensed AGPL-3.0.

Two source repos do not include license files in the cloned copy, so keep attribution visible and review redistribution requirements before publishing a commercial build.
"# CareerMate" 
