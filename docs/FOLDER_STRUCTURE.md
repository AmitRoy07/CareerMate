# Folder Structure

```text
CareerMate/
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── analyze/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── job-match.tsx
│   ├── interview/
│   │   ├── _layout.tsx
│   │   ├── [id].tsx
│   │   └── questions.tsx
│   ├── legal/
│   ├── resume/
│   │   ├── _layout.tsx
│   │   ├── builder.tsx
│   │   └── preview.tsx
│   ├── tools/
│   │   ├── _layout.tsx
│   │   └── hr-mail.tsx
│   ├── vault/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── _layout.tsx
│   ├── +html.tsx
│   └── +not-found.tsx
├── assets/
├── components/
│   ├── cards/
│   ├── forms/
│   └── ui/
│       └── ProtectedRoute.tsx
├── constants/
├── data/
│   ├── interview-bank.json
│   └── resume-templates.json
├── docs/
├── scripts/
├── services/
│   ├── ai.service.ts
│   ├── analytics.service.ts
│   ├── auth.service.ts
│   ├── crash.service.ts
│   ├── hrMail.service.ts
│   ├── interview.service.ts
│   ├── monetization.service.ts
│   ├── paywall.service.ts
│   ├── profile.service.ts
│   ├── resume.service.ts
│   ├── salary.service.ts
│   ├── supabase.ts
│   └── vault.service.ts
├── store/
├── supabase/
│   ├── functions/
│   │   ├── analyze-resume/
│   │   ├── generate-hr-mail/
│   │   └── job-match/
│   └── schema.sql
├── types/
│   ├── ai.types.ts
│   ├── hr-mail.types.ts
│   ├── interview.types.ts
│   ├── monetization.types.ts
│   ├── resume.types.ts
│   ├── template.types.ts
│   ├── user.types.ts
│   └── vault.types.ts
└── config and package files
```

## Ownership

### `app/`

Route files only. If logic grows beyond UI state and event handling, move it into a service.

### `components/`

Reusable UI. Components should not know about Supabase, FileSystem, or remote APIs.

### `services/`

Integration and business logic. Services may use Supabase, AsyncStorage, FileSystem, DocumentPicker, Print, Sharing, and network APIs.

### `store/`

Global app state via React Context. Keep it minimal and typed.

### `types/`

Shared interfaces and unions.

### `constants/`

App constants and design tokens.

### `data/`

Generated/static app data. Large generated files should have a script source. `interview-bank.json` is generated; `resume-templates.json` is curated product data.

### `supabase/`

Database, RLS, storage policy, and Edge Function source of truth.

## Naming Rules

- Screens: route-based lowercase files under `app/`.
- Components: PascalCase.
- Services: `feature.service.ts`.
- Types: `feature.types.ts`.
- Stores: clear domain names such as `userStore.tsx`.
- Constants: `*.constants.ts` or descriptive token file names.
