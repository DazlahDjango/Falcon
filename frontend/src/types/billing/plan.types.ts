export type PlanType = 'trial' | 'basic' | 'professional' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

export interface PlanFeature {
    key: string;
    label: string;
    value: boolean | number | string;
    included: boolean;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    plan_type: PlanType;
    billing_interval: BillingInterval;
    price: number;
    yearly_price: number | null;
    currency: string;
    description: string;
    features_list: string[];
    max_users: number;
    max_kpis: number;
    max_departments: number;
    max_storage_mb: number;
    custom_branding: boolean;
    api_access: boolean;
    sso_enabled: boolean;
    advanced_analytics: boolean;
    audit_logs: boolean;
    custom_reports: boolean;
    priority_support: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface PlanWithFeatures extends SubscriptionPlan {
    features_display: PlanFeature[];
    price_display: string;
    yearly_price_display: string | null;
    is_unlimited_users: boolean;
    is_unlimited_kpis: boolean;
    is_trial: boolean;
}

export interface PlanComparison {
    plans: SubscriptionPlan[];
    features_matrix: PlanComparisonFeature[];
}

export interface PlanComparisonFeature {
    feature: string;
    label: string;
    plans: Record<string, string | boolean | number>;
}

export interface PlanFilters {
    plan_type?: PlanType;
    billing_interval?: BillingInterval;
    exclude_trial?: boolean;
    is_active?: boolean;
}

export interface PlanCreateData {
    name: string;
    plan_type: PlanType;
    billing_interval: BillingInterval;
    price: number;
    yearly_price?: number | null;
    currency?: string;
    description?: string;
    features_list?: string[];
    max_users: number;
    max_kpis: number;
    max_departments?: number;
    max_storage_mb?: number;
    custom_branding?: boolean;
    api_access?: boolean;
    sso_enabled?: boolean;
    advanced_analytics?: boolean;
    audit_logs?: boolean;
    custom_reports?: boolean;
    priority_support?: boolean;
    display_order?: number;
}

export interface PlanUpdateData extends Partial<PlanCreateData> {
    is_active?: boolean;
}