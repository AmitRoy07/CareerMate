# Change Workflow

Use this workflow for every meaningful change.

## 1. Study

- Read the active route/screen.
- Read related services, types, stores, and components.
- Search for similar implementations with `rg`.
- Check versioned docs when touching Expo, NativeWind, Supabase, file storage, auth, or payments.

## 2. Decide

- Prefer existing patterns.
- Keep the smallest practical change.
- Add abstractions only when they reduce repeated complexity.
- Keep user data privacy and offline behavior explicit.

## 3. Implement

- Route/UI work goes in `app/`.
- Reusable UI goes in `components/`.
- Business/integration logic goes in `services/`.
- Shared contracts go in `types/`.
- Schema/storage changes go in `supabase/schema.sql`.

## 4. Verify

Run:

```bash
npm run typecheck
npm run doctor
```

For UI changes, also boot Expo and smoke-test the changed route.

## 5. Document

Update docs when:

- A folder is added or moved.
- A new feature/module is added.
- A new external service is introduced.
- Setup, env, permissions, build, or production requirements change.

