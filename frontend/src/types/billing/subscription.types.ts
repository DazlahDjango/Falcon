import { PlanType, BillingInterval, SubscriptionPlan } from './plan.types';

export type SubscriptionStatus = 
    | 'active' 
    | 'trialing' 
    | 'past_due' 
    | 'cancelled' 
    | 'expired' 
    | 'pending_cancellation';

export interface SubscriptionActiveStatus {
    is_active: boolean;
    is_on_trial: boolean;
    trial_days_remaining: number;
    days_until_expiry: number;
    is_expiring_soon: boolean;
}

export interface Subscription {
    id: string;
    subscription_code: string;
    tenant_id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    start_date: string;
    trial_end_date: string | null;
    current_period_start: string;
    current_period_end: string;
    billing_interval: BillingInterval;
    amount: number;
    currency: string;
    auto_renew: boolean;
    cancel_at_period_end: boolean;
    cancelled_at: string | null;
    ended_at: string | null;
    paystack_subscription_code: string;
    paystack_authorization_code: string;
    paystack_customer_code: string;
    created_at: string;
    updated_at: string;
    is_active_status: SubscriptionActiveStatus;
}

export interface SubscriptionListResponse {
    id: string;
    subscription_code: string;
    plan_name: string;
    plan_type: PlanType;
    status: SubscriptionStatus;
    is_active_status: SubscriptionActiveStatus;
    current_period_end: string;
    amount: number;
    currency: string;
    auto_renew: boolean;
}

export interface SubscriptionDetail extends Subscription {
    plan_detail: SubscriptionPlan;
    recent_transactions: any[];
    upcoming_invoice: {
        amount: number;
        amount_display: string;
        due_date: string;
        days_until_due: number;
    } | null;
}

export interface SubscriptionCreateData {
    plan_id: string;
    billing_interval?: BillingInterval;
    auto_renew?: boolean;
    trial_days?: number;
    payment_method_id?: string;
}

export interface SubscriptionUpdateData {
    auto_renew?: boolean;
    billing_interval?: BillingInterval;
}

export interface SubscriptionCancelData {
    at_period_end?: boolean;
    reason?: string;
}

export interface SubscriptionRenewData {
    payment_method_id?: string;
}

export interface SubscriptionFilters {
    status?: SubscriptionStatus;
    plan_type?: PlanType;
    active_only?: boolean;
    start_date?: string;
    end_date?: string;
}

export interface SubscriptionStats {
    total: number;
    active: number;
    trialing: number;
    past_due: number;
    cancelled: number;
    expired: number;
    pending_cancellation: number;
}

export interface SubscriptionChangeResponse {
    status: 'upgraded' | 'downgraded' | 'scheduled';
    subscription_code: string;
    old_plan?: string;
    new_plan: string;
    effective_date: string;
}

export interface UpgradeDowngradeData {
    plan_id: string;
    immediate?: boolean;
}