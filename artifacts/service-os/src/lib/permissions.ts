export type Role = "owner" | "admin" | "manager" | "operator";
export type Tier = "free" | "pro" | "enterprise";

export type AddonType =
  | "gps_tracking"
  | "landing_page"
  | "sms_marketing"
  | "live_chat"
  | "background_check"
  | "custom_reports"
  | "multi_location"
  | "white_label"
  | "onboarding_session";

export type Feature =
  | "crm"
  | "scheduling"
  | "manual_sms"
  | "job_photos"
  | "quotes"
  | "invoices"
  | "digital_signatures"
  | "price_book"
  | "ratings_reviews"
  | "basic_financials"
  | "owner_role"
  | "operator_role"
  | "basic_analytics"
  | "ai_sms_dispatch"
  | "ai_quote_generation"
  | "operator_onboarding"
  | "recurring_jobs"
  | "automated_sequences"
  | "booking_widget"
  | "ai_auto_response"
  | "time_tracking"
  | "subcontractor_management"
  | "equipment_tracking"
  | "job_profitability"
  | "payroll_export"
  | "progress_invoicing"
  | "quickbooks_sync"
  | "full_analytics"
  | "unified_inbox"
  | "team_chat"
  | "customer_portal"
  | "referral_network"
  | "admin_role"
  | "manager_role"
  | "priority_support"
  | "email_support"
  | "single_location"
  | "multi_location_native"
  | "franchise_dashboard"
  | "master_dashboard"
  | "custom_api"
  | "custom_integrations"
  | "dedicated_account_manager"
  | "sla_guarantees"
  | "unlimited_support"
  | "all_addons_included"
  | "gps_tracking"
  | "landing_pages"
  | "sms_marketing"
  | "live_chat"
  | "custom_reports"
  | "multi_location"
  | "white_label";

export const FREE_FEATURES: Feature[] = [
  "crm", "scheduling", "manual_sms", "job_photos", "quotes", "invoices",
  "digital_signatures", "price_book", "ratings_reviews", "basic_financials",
  "owner_role", "operator_role", "basic_analytics",
];

export const PRO_FEATURES: Feature[] = [
  ...FREE_FEATURES,
  "ai_sms_dispatch", "ai_quote_generation", "operator_onboarding",
  "recurring_jobs", "automated_sequences", "booking_widget", "ai_auto_response",
  "time_tracking", "subcontractor_management", "equipment_tracking",
  "job_profitability", "payroll_export", "progress_invoicing",
  "quickbooks_sync", "full_analytics", "unified_inbox", "team_chat",
  "customer_portal", "referral_network", "admin_role", "manager_role",
  "priority_support", "email_support", "single_location",
];

export const ENTERPRISE_FEATURES: Feature[] = [
  ...PRO_FEATURES,
  "multi_location_native", "franchise_dashboard", "master_dashboard",
  "custom_api", "custom_integrations", "dedicated_account_manager",
  "sla_guarantees", "unlimited_support", "all_addons_included",
  "gps_tracking", "landing_pages", "sms_marketing", "live_chat",
  "custom_reports", "multi_location", "white_label",
];

export const TIER_FEATURES: Record<Tier, Feature[]> = {
  free: FREE_FEATURES,
  pro: PRO_FEATURES,
  enterprise: ENTERPRISE_FEATURES,
};

export const ADDON_FEATURE_MAP: Record<AddonType, Feature> = {
  gps_tracking: "gps_tracking",
  landing_page: "landing_pages",
  sms_marketing: "sms_marketing",
  live_chat: "live_chat",
  background_check: "crm",
  custom_reports: "custom_reports",
  multi_location: "multi_location",
  white_label: "white_label",
  onboarding_session: "operator_onboarding",
};

export interface ActiveAddon {
  addonType: AddonType;
  isActive: boolean;
}

export function canAccess(feature: Feature, tier: Tier, addons: ActiveAddon[] = []): boolean {
  if (tier === "enterprise") return true;
  if (TIER_FEATURES[tier]?.includes(feature)) return true;
  const activeAddonFeatures = addons
    .filter(a => a.isActive)
    .map(a => ADDON_FEATURE_MAP[a.addonType]);
  return activeAddonFeatures.includes(feature);
}

export function getTierFeatures(tier: Tier): Feature[] {
  return TIER_FEATURES[tier] ?? FREE_FEATURES;
}

export function getUpgradeRequirement(feature: Feature): { tier: Tier | null; addon: AddonType | null } {
  if (FREE_FEATURES.includes(feature)) return { tier: null, addon: null };
  if (PRO_FEATURES.includes(feature)) return { tier: "pro", addon: null };
  const addonEntry = Object.entries(ADDON_FEATURE_MAP).find(([, f]) => f === feature);
  if (addonEntry) return { tier: "pro", addon: addonEntry[0] as AddonType };
  return { tier: "enterprise", addon: null };
}

export function getUpgradeTier(feature: Feature): Tier {
  const req = getUpgradeRequirement(feature);
  return req.tier ?? "pro";
}

export type Permission =
  | "view_all_financials"
  | "manage_users"
  | "toggle_feature_flags"
  | "manage_billing"
  | "assign_jobs"
  | "manage_crm"
  | "approve_issues"
  | "view_crew_performance"
  | "view_own_jobs"
  | "sms_checkin";

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "view_all_financials", "manage_users", "toggle_feature_flags",
    "manage_billing", "assign_jobs", "manage_crm", "approve_issues",
    "view_crew_performance", "view_own_jobs",
  ],
  admin: [
    "assign_jobs", "manage_crm", "approve_issues",
    "view_crew_performance", "view_own_jobs",
  ],
  manager: ["approve_issues", "view_crew_performance", "view_own_jobs"],
  operator: ["view_own_jobs", "sms_checkin"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function isAtLeastRole(userRole: Role, requiredRole: Role): boolean {
  const roleLevel: Record<Role, number> = { operator: 0, manager: 1, admin: 2, owner: 3 };
  return (roleLevel[userRole] ?? 0) >= (roleLevel[requiredRole] ?? 0);
}

export const ADDON_PRICES: Record<AddonType, { price: number; unit: string; description: string; name: string }> = {
  gps_tracking: { name: "GPS Tracking", price: 14, unit: "/mo", description: "Live GPS tracking for your field team" },
  landing_page: { name: "Landing Pages", price: 14, unit: "/mo per page", description: "Custom SEO landing pages for your services" },
  sms_marketing: { name: "SMS Campaigns", price: 14, unit: "/mo", description: "Bulk SMS marketing to your customer list" },
  live_chat: { name: "Live Chat", price: 19, unit: "/mo", description: "Real-time customer chat on your website" },
  background_check: { name: "Background Checks", price: 9, unit: "/check", description: "Verified background checks for new hires" },
  custom_reports: { name: "Custom Reports", price: 19, unit: "/mo", description: "Build and export custom business reports" },
  multi_location: { name: "Multi-Location", price: 49, unit: "/mo per location", description: "Manage multiple locations from one account" },
  white_label: { name: "White Label", price: 49, unit: "/mo", description: "Remove ServiceOS branding from client portals" },
  onboarding_session: { name: "Onboarding Session", price: 59, unit: " one-time", description: "1-on-1 setup call with a ServiceOS specialist" },
};
