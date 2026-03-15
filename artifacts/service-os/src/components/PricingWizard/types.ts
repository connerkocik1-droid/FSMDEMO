export interface SuggestedAddon {
  name: string;
  addon_key: string;
  price: number;
  price_label: string;
  is_one_time?: boolean;
  reason: string;
  default_on: boolean;
  triggered_by?: string;
}

export interface QuoteResponse {
  recommended_tier: "free" | "pro" | "enterprise";
  tier_explanation: string;
  monthly_base: number;
  user_addon_cost: number;
  suggested_addons: SuggestedAddon[];
  competitor_name: string;
  competitor_monthly: number;
  monthly_savings: number;
  annual_savings: number;
  free_option: {
    available: boolean;
    message: string;
  };
  headline: string;
}

export type WizardStep = 0 | 1 | 2 | 3 | "processing" | "quote";
export type BillingPeriod = "monthly" | "annual";
