# Android Play Store Readiness

CareerMate India launches Android first and keeps iOS config ready for a later App Store release.

## Launch MVP Scope

- Authentication: email, Google, phone OTP, signup, logout, demo fallback.
- Dashboard: simple career-tool entry points.
- Resume Builder: typed form flow and saved draft path.
- Resume Preview: ATS-friendly preview and template selector.
- PDF Export: Expo Print/Sharing with free watermark and premium no-watermark gating.
- Salary Calculator: Indian take-home calculation.
- Interview Preparation: bundled interview bank, categories, search, detail screens.
- Profile: avatar, plan/credits, theme toggle, legal links, logout.
- Legal: privacy policy, terms, account deletion information.
- Basic Premium Foundation: plans, entitlements, credits, paywall UI, Supabase tables.
- Basic Analytics/Crash Readiness: privacy-safe no-op analytics and crash service wrappers.
- Supabase Security/RLS: schema and user-owned table policies.
- Play Store Build Readiness: Android package, version code, adaptive icon, EAS profiles.

## Current Android Build Config

- Android package: `com.careermate.india`
- App version: `1.0.0`
- Android version code: `1`
- Orientation: portrait
- Theme mode: automatic
- Adaptive icon assets: configured
- EAS profiles: `development`, `preview`, `production`

## Required Before Play Store Internal Testing

1. Connect real Supabase project env values.
2. Apply `supabase/schema.sql` and verify RLS from authenticated and unauthenticated sessions.
3. Configure Supabase Auth providers used in Android launch: email, Google, phone OTP.
4. Deploy Edge Functions used by premium tools.
5. Configure hosted privacy policy and terms URLs.
6. Run `npm.cmd run typecheck` and `npm.cmd run doctor`.
7. Build Android preview:

```bash
eas build --platform android --profile preview
```

8. Test on at least one physical Android device:
   - login/logout
   - resume save/export
   - salary calculator
   - interview search/detail
   - profile/legal/delete-account info
   - dark/light mode
   - offline behavior for bundled/local features

## Required Before Public Production

- Replace no-op crash wrapper with configured crash provider.
- Decide analytics provider and keep sensitive content out of events.
- Add production account deletion Edge Function.
- Add rate limiting and transactional credit consumption.
- Complete Data Safety form answers.
- Prepare store screenshots, short description, full description, app category, support email, and contact details.
- Run EAS production build:

```bash
eas build --platform android --profile production
```

## iOS-Ready Notes

- Bundle identifier is configured: `com.careermate.india`.
- iOS build number starts at `1`.
- Apple login and App Store privacy details remain future-launch tasks.
