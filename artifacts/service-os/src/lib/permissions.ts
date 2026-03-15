export type Role = "owner" | "admin" | "manager" | "operator";
export type Tier = "free" | "independent" | "pro" | "franchise" | "enterprise";

export type Feature =
  | "gps_tracking"
  | "manual_sms"
  | "referral_network"
  | "basic_financials"
  | "ai_sms_workflow"
  | "full_analytics"
  | "tech_support_limited"
  | "landing_pages"
  | "multi_location"
  | "tech_support_priority"
  | "custom_api_access";

const tierHierarchy: Record<Tier, number> = {
  free: 0,
  independent: 1,
  pro: 2,
  franchise: 3,
  enterprise: 4,
};

const featureMinTier: Record<Feature, Tier> = {
  gps_tracking: "independent",
  manual_sms: "independent",
  referral_network: "independent",
  basic_financials: "independent",
  ai_sms_workflow: "pro",
  full_analytics: "pro",
  tech_support_limited: "pro",
  landing_pages: "franchise",
  multi_location: "franchise",
  tech_support_priority: "franchise",
  custom_api_access: "franchise",
};

export function canAccess(feature: Feature, tier: Tier): boolean {
  const requiredLevel = tierHierarchy[featureMinTier[feature]];
  const userLevel = tierHierarchy[tier];
  return userLevel >= requiredLevel;
}

export function getTierLevel(tier: Tier): number {
  return tierHierarchy[tier] ?? 0;
}

export function getUpgradeTier(feature: Feature): Tier {
  return featureMinTier[feature];
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
    "view_all_financials",
    "manage_users",
    "toggle_feature_flags",
    "manage_billing",
    "assign_jobs",
    "manage_crm",
    "approve_issues",
    "view_crew_performance",
    "view_own_jobs",
  ],
  admin: [
    "assign_jobs",
    "manage_crm",
    "approve_issues",
    "view_crew_performance",
    "view_own_jobs",
  ],
  manager: [
    "approve_issues",
    "view_crew_performance",
    "view_own_jobs",
  ],
  operator: [
    "view_own_jobs",
    "sms_checkin",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function isAtLeastRole(userRole: Role, requiredRole: Role): boolean {
  const roleLevel: Record<Role, number> = {
    operator: 0,
    manager: 1,
    admin: 2,
    owner: 3,
  };
  return (roleLevel[userRole] ?? 0) >= (roleLevel[requiredRole] ?? 0);
}
