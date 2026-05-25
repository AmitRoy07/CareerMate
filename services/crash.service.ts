type CrashContext = Record<string, string | number | boolean | null | undefined>;

export function setCrashUser(_userId: string | null): void {
  // No-op until a crash provider such as Sentry or Firebase Crashlytics is configured.
}

export function recordHandledError(_error: unknown, _context?: CrashContext): void {
  // Keep this privacy-safe: never attach resume, job description, HR mail, salary, or vault content.
}
