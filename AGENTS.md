# CareerMate Agent Rules

## Study First

Before writing code, read the relevant route, service, store, types, and shared components. Search with `rg` for existing patterns.

## Required Docs

Read and follow:

- `docs/ARCHITECTURE.md`
- `docs/RULES.md`
- `docs/FOLDER_STRUCTURE.md`
- `docs/CHANGE_WORKFLOW.md`

If architecture, folder structure, setup, env, permissions, or production requirements change, update the docs in the same change.

## Expo HAS CHANGED

This project uses Expo SDK 56. Read exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before changing Expo APIs, native modules, config, builds, permissions, auth sessions, file storage, or routing.

## Verification

Run before handoff:

```bash
npm run typecheck
npm run doctor
```
