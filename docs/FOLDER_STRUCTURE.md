# Folder Structure

```text
CareerMate/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── phone.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── interview.tsx
│   │   ├── profile.tsx
│   │   ├── resume.tsx
│   │   └── salary.tsx
│   ├── analyze/
│   │   └── index.tsx
│   ├── interview/
│   │   ├── [id].tsx
│   │   └── questions.tsx
│   ├── legal/
│   │   ├── delete-account.tsx
│   │   ├── privacy.tsx
│   │   └── terms.tsx
│   ├── resume/
│   │   ├── builder.tsx
│   │   └── preview.tsx
│   ├── vault/
│   │   └── index.tsx
│   ├── _layout.tsx
│   ├── +html.tsx
│   └── +not-found.tsx
├── assets/
│   ├── fonts/
│   └── images/
├── components/
│   ├── cards/
│   ├── forms/
│   └── ui/
├── constants/
│   ├── app.constants.ts
│   └── Colors.ts
├── data/
│   └── interview-bank.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   └── RULES.md
├── scripts/
│   └── build-interview-bank.mjs
├── services/
│   ├── ai.service.ts
│   ├── auth.service.ts
│   ├── interview.service.ts
│   ├── profile.service.ts
│   ├── resume.service.ts
│   ├── salary.service.ts
│   ├── supabase.ts
│   └── vault.service.ts
├── store/
│   ├── appSettings.tsx
│   └── userStore.tsx
├── supabase/
│   ├── functions/
│   └── schema.sql
├── types/
│   ├── interview.types.ts
│   ├── resume.types.ts
│   ├── user.types.ts
│   └── vault.types.ts
├── app.json
├── babel.config.js
├── eas.json
├── global.css
├── metro.config.js
├── nativewind-env.d.ts
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Ownership

### `app/`

Route files only. If logic grows beyond UI state and event handling, move it into a service.

### `components/`

Reusable UI. Components should not know about Supabase, FileSystem, or remote APIs.

### `services/`

Integration and business logic. Services may use Supabase, AsyncStorage, FileSystem, DocumentPicker, Print, and network APIs.

### `store/`

Global app state via React Context. Keep it minimal and typed.

### `types/`

Shared interfaces and unions.

### `constants/`

App constants and design tokens.

### `data/`

Generated/static app data. Large generated files should have a script source.

### `supabase/`

Database, storage policy, and Edge Function source of truth.

## Naming Rules

- Screens: route-based lowercase files under `app/`.
- Components: PascalCase.
- Services: `feature.service.ts`.
- Types: `feature.types.ts`.
- Stores: clear domain names such as `userStore.tsx`.
- Constants: `*.constants.ts` or descriptive token file names.

