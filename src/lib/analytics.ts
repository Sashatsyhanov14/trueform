// Google Analytics 4 — event tracking utility
// GA_MEASUREMENT_ID is set via NEXT_PUBLIC_GA_ID env variable

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-RSVBF0RZVN";

// https://developers.google.com/analytics/devguides/collection/ga4/page-view
export const pageview = (url: string) => {
  if (typeof window === "undefined" || !GA_ID) return;
  (window as any).gtag?.("config", GA_ID, { page_path: url });
};

// Generic event helper
export const event = (
  action: string,
  params?: Record<string, string | number | boolean | null>
) => {
  if (typeof window === "undefined" || !GA_ID) return;
  (window as any).gtag?.("event", action, params);
};

// ──────── Predefined Events ────────

/** User uploads a photo for analysis */
export const trackPhotoUpload = () =>
  event("photo_uploaded", { method: "file_input" });

/** Demo photo loaded */
export const trackDemoPhoto = () =>
  event("demo_photo_loaded");

/** Scan started (analysis request sent) */
export const trackScanStart = () =>
  event("scan_started");

/** Scan completed with result */
export const trackScanComplete = (score: number) =>
  event("scan_completed", { overall_score: score });

/** Registration completed */
export const trackRegistration = (method: string) =>
  event("sign_up", { method });

/** Social login */
export const trackSocialLogin = (provider: string) =>
  event("login", { method: provider });

/** Paywall shown to user */
export const trackPaywallShown = () =>
  event("paywall_shown");

/** Payment initiated (click "Buy") */
export const trackPaymentInit = () =>
  event("begin_checkout", { currency: "RUB", value: 299 });

/** Payment completed */
export const trackPaymentComplete = () =>
  event("purchase", { currency: "RUB", value: 299 });

/** Share/referral link copied */
export const trackShareLink = () =>
  event("share", { method: "referral_link" });

/** Referral unlock (3 friends joined) */
export const trackReferralUnlock = () =>
  event("referral_unlock");

/** Button click — generic */
export const trackButton = (buttonName: string) =>
  event("button_click", { button_name: buttonName });
