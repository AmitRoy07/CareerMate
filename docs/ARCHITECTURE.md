# CareerMate India Architecture

## Product Shape

CareerMate India is an Expo React Native app for Indian professionals. It is Android-first, iOS-ready, and web-smoke-testable.

Core modules:

- Auth: email, Google, phone OTP, demo mode.
- Dashboard: entry points for career tools.
- Resume: builder, preview, PDF export.
- AI Tools: resume analyzer, ATS scoring, job description match, and HR mail generation via Edge Functions.
- Interview: imported question bank, sectors, filters, question detail.
- Salary: Indian CTC/in-hand calculator.
- Document Vault: local-first private document storage with subscription-gated cloud sync.
- Monetization: plan, entitlement, credit foundation, premium templates, and no-watermark export gating without payment gateway implementation.
- Profile: account, theme toggle, avatar upload, legal links, logout.
- Legal: privacy policy, terms, account deletion information.

## Technical Stack

- Expo SDK 56
- React Native 0.85
- React 19
- TypeScript strict mode
- Expo Router file-based navigation
- NativeWind/Tailwind for utility-first styling
- Supabase Auth, PostgreSQL, Storage, Edge Functions
- AsyncStorage for local settings and offline metadata
- Expo FileSystem for native private vault storage
- Expo Print/Sharing for resume PDF export

## Architecture Layers

### `app/`

Route layer only. Screens compose UI, call services, and handle user interaction. Business logic should not live here unless it is tiny and screen-specific.

### `components/`

Reusable presentation layer.

- `components/ui`: app-wide primitives such as `Screen`, `Card`, `Text`, `Button`, top bars, icons, visual panels.
- `components/forms`: reusable form controls.
- `components/cards`: repeated card patterns.

Components should be stateless when practical. Stateful UI is allowed when the state is purely visual/local.

### `services/`

Business logic and integration boundaries.

- Auth calls belong in `auth.service.ts`.
- Supabase client belongs in `supabase.ts`.
- Salary math belongs in `salary.service.ts`.
- Resume persistence/export belongs in `resume.service.ts`.
- AI analyzer and job match calls belong in `ai.service.ts` and must go through Supabase Edge Functions.
- HR mail generation belongs in `hrMail.service.ts` and must go through Supabase Edge Functions.
- Analytics events belong in `analytics.service.ts`; never send resume, JD, HR mail, vault document, or other sensitive content.
- Crash reporting integration belongs in `crash.service.ts`; keep the wrapper privacy-safe and provider-agnostic until launch tooling is chosen.
- Vault local/cloud document logic belongs in `vault.service.ts`.
- Monetization plan, entitlement, and credit reads belong in `monetization.service.ts`.
- Paywall messaging and access decisions belong in `paywall.service.ts`.

Screens should call services instead of embedding API or persistence details.

### `store/`

React context/global app state.

- `userStore.tsx`: session, user, auth/demo mode state.
- `appSettings.tsx`: theme mode and resolved color scheme.

Keep stores small. Do not turn them into mixed business-logic containers.

### `types/`

Shared TypeScript contracts. Services and screens should import these instead of redefining shapes.

### `constants/`

Static design tokens and app constants.

### `data/`

Generated/static data used by the app. The interview bank is generated and should not be hand-edited.

### `scripts/`

Node scripts used to generate app data or support development workflows.

### `supabase/`

Database schema and Edge Functions. Keep schema changes explicit and review RLS policies whenever adding tables.

## Data Flow

1. Screen receives user action.
2. Screen validates lightweight UI requirements.
3. Screen calls a service.
4. Service performs local storage, Supabase, FileSystem, or network work.
5. Service returns typed result or throws typed/normal errors.
6. Screen updates local UI state and shows user-facing feedback.

## Security Architecture

- No AI provider keys in the mobile app.
- AI resume analysis, job match, and HR mail generation must run through Supabase Edge Functions or another protected backend.
- Supabase RLS must protect all user-owned tables.
- Vault documents are local-only by default.
- Vault cloud sync must require a verified paid entitlement before upload.
- Premium feature access should check entitlements, not hardcoded plan names.
- Mobile clients may read their own plan, entitlement, and credit state but must not grant/update entitlements or credits directly.
- Credit consumption should happen in an Edge Function or secured RPC after successful work.
- Cloud vault bucket should remain private.
- Account deletion must remove auth, profile, resumes, reports, vault files, and metadata through a backend function.

## Offline Architecture

Offline-first areas:

- Theme settings: AsyncStorage.
- Demo auth mode: local state.
- Interview bank: bundled JSON.
- Vault metadata: AsyncStorage.
- Vault files: app-private native document directory.

Cloud sync should be additive. The app should still provide local utility without network access.
