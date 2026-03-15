declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

let initialized = false;

export function initGA4() {
  if (initialized) return;
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  if (!measurementId) return;

  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

export function trackDemoRequest(source?: string) {
  trackEvent("demo_request", {
    event_category: "engagement",
    event_label: source || "unknown",
  });
}

export function trackSignup(method?: string) {
  trackEvent("sign_up", {
    method: method || "email",
  });
}

export function trackPricingView() {
  trackEvent("view_pricing", {
    event_category: "engagement",
  });
}

export function trackComparisonView() {
  trackEvent("view_comparison", {
    event_category: "engagement",
  });
}
