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

## 6. Report Progress

After every meaningful implementation, update or reference `docs/LAUNCH_READINESS.md` and report using this exact shape:

Implementation Summary:
- What was completed
- Files changed
- New files added
- Existing files updated
- Database/schema changes
- Edge Functions added/updated
- UI routes changed
- Security impact
- Documentation updated

Verification:
- Typecheck result
- Doctor result
- Routes smoke-tested
- Known issues

Launch Tracker Update:
- Previous overall completion
- New overall completion
- Modules completed
- Modules still pending
- Blockers
- Recommended next task

Use the weighted completion model defined in `docs/LAUNCH_READINESS.md`.

Do not mark any module as 100% unless code is implemented, TypeScript passes, the route is smoke-tested, loading/error/empty states are handled, security impact is reviewed, and documentation is updated if needed.

Use the `Done` definition in `docs/LAUNCH_READINESS.md` before calling a feature done.

Use the `Launch Claim Gate` in `docs/LAUNCH_READINESS.md` before saying the app is ready to launch.
