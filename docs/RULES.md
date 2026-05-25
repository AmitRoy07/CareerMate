# Engineering Rules

## Study First Rule

Before changing code:

1. Read the relevant screen, service, store, and types.
2. Check existing patterns before inventing new ones.
3. Search with `rg` for related code.
4. If Expo, React Native, NativeWind, or Supabase behavior may have changed, check versioned official docs.
5. After changing architecture, update these docs if the rule or folder structure changed.

This applies to humans and AI coding agents.

## Expo And React Native Rules

- Use Expo SDK 56-compatible APIs.
- Prefer Expo modules over random native libraries unless there is a clear need.
- Do not add native dependencies without checking Expo compatibility.
- Keep navigation in Expo Router file routes.
- Inner detail screens should provide a clear back path.
- Avoid using browser-only APIs in shared app code.
- Avoid touching native-only modules during web/server rendering. Lazy import platform-specific APIs when needed.

## TypeScript Rules

- Keep `strict` mode clean.
- Do not use `any` unless there is no reasonable typed alternative.
- Put shared interfaces in `types/`.
- Use discriminated/explicit union types for known option sets.
- Keep service return values typed.
- Prefer narrowing and validation near external boundaries.

## SOLID Rules

### Single Responsibility

Each file should have one clear job.

- Screen: UI composition and user interaction.
- Service: business/integration logic.
- Store: shared state.
- Component: reusable UI.
- Type file: shared contracts.

### Open/Closed

Add features by extending services/components rather than editing unrelated screens. Example: add a new vault document kind by extending `VaultDocumentKind` and the vault UI list.

### Liskov Substitution

Reusable components should behave predictably when swapped or reused. A `Button` should always behave like a button and respect disabled/loading states.

### Interface Segregation

Do not pass giant objects to components when they need only a few fields. Keep props focused.

### Dependency Inversion

Screens depend on service functions and typed contracts, not raw Supabase/FileSystem/fetch details.

## Styling Rules

- Use shared primitives first: `Screen`, `Card`, `Text`, `Button`, `AppTopBar`.
- New UI should use NativeWind `className` where it improves readability.
- Dynamic theme colors should still come from `constants/Colors.ts`.
- Dark mode must be checked for contrast.
- Do not hardcode light-only text colors on dark backgrounds.
- Keep the design aligned with Professional Excellence: clean paper cards, strong typography, blue action states, generous spacing.

## Security Rules

- Never store OpenAI/Gemini/API secrets in Expo env variables.
- Do not upload vault documents unless subscription entitlement is verified.
- Keep cloud vault bucket private.
- Use RLS for user-owned tables.
- Validate file uploads by type and size before production.
- Add rate limiting for AI and document sync endpoints.
- Analytics must not log resume content, job descriptions, HR mail bodies, personal documents, or salary inputs.

## Data Rules

- `data/interview-bank.json` is generated. Do not hand-edit it.
- Update `scripts/build-interview-bank.mjs` when changing import logic.
- Keep source attribution visible for imported interview content.
- Review licenses before commercial release.

## Verification Rules

Run before handoff:

```bash
npm run typecheck
npm run doctor
```

For UI/routes, smoke test relevant routes with Expo web or device builds.

For production readiness, run an EAS preview build before store submission.

## Documentation Rule

If you add or move a major feature:

- Update `docs/ARCHITECTURE.md`.
- Update `docs/FOLDER_STRUCTURE.md` if directories changed.
- Update `README.md` if setup, scripts, env, or production steps changed.
