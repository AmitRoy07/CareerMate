export type AnalyticsEventName =
  | 'premium_card_viewed'
  | 'paywall_opened'
  | 'resume_analysis_started'
  | 'resume_analysis_completed'
  | 'job_match_started'
  | 'job_match_completed'
  | 'hr_mail_generated'
  | 'template_selected'
  | 'pdf_exported'
  | 'watermark_paywall_opened';

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export async function trackEvent(_eventName: AnalyticsEventName, _payload?: AnalyticsPayload): Promise<void> {
  // Privacy-safe no-op until an analytics provider is configured.
}
