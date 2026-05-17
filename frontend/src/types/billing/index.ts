/**
 * Billing Types Index
 * Export all billing type definitions
 */

import { Invoice, InvoiceFilters, InvoiceSummary } from './invoice.types';
import { PaymentMethod } from './payment-method.types';
import { BillingInterval, PlanComparison, PlanFilters, PlanType, SubscriptionPlan } from './plan.types';
import { Subscription, SubscriptionCancelData, SubscriptionFilters, SubscriptionStats, SubscriptionStatus } from './subscription.types';
import { Transaction, TransactionFilters, TransactionSummary } from './transaction.types';

// Export all types from individual modules
export * from './plan.types';
export * from './subscription.types';
export * from './transaction.types';
export * from './invoice.types';
export * from './payment-method.types';
export * from './webhook.types';

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    status: number;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ErrorResponse {
    success: false;
    status: number;
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
    timestamp: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    ordering?: string;
}

// ============================================================================
// Billing State Types (for Redux)
// ============================================================================

export interface BillingState {
    plans: PlanState;
    subscriptions: SubscriptionState;
    invoices: InvoiceState;
    transactions: TransactionState;
    paymentMethods: PaymentMethodState;
    checkout: CheckoutState;
    analytics: AnalyticsState;
    admin: AdminBillingState;
}

export interface PlanState {
    items: SubscriptionPlan[];
    selectedPlan: SubscriptionPlan | null;
    popularPlan: SubscriptionPlan | null;
    comparison: PlanComparison | null;
    loading: boolean;
    error: string | null;
    filters: PlanFilters;
    pagination: PaginationInfo;
    lastFetched: number | null;
}

export interface SubscriptionState {
    current: Subscription | null;
    items: Subscription[];
    selectedSubscription: Subscription | null;
    loading: boolean;
    error: string | null;
    filters: SubscriptionFilters;
    pagination: PaginationInfo;
    stats: SubscriptionStats;
    lastFetched: number | null;
}

export interface InvoiceState {
    items: Invoice[];
    selectedInvoice: Invoice | null;
    summary: InvoiceSummary | null;
    loading: boolean;
    error: string | null;
    downloading: boolean;
    paying: boolean;
    sending: boolean;
    filters: InvoiceFilters;
    pagination: PaginationInfo;
    lastFetched: number | null;
}

export interface TransactionState {
    items: Transaction[];
    selectedTransaction: Transaction | null;
    summary: TransactionSummary | null;
    loading: boolean;
    error: string | null;
    verifying: boolean;
    refunding: boolean;
    filters: TransactionFilters;
    pagination: PaginationInfo;
    lastFetched: number | null;
}

export interface PaymentMethodState {
    items: PaymentMethod[];
    selectedMethod: PaymentMethod | null;
    defaultMethod: PaymentMethod | null;
    loading: boolean;
    error: string | null;
    adding: boolean;
    deleting: boolean;
    lastFetched: number | null;
}

export interface CheckoutState {
    currentCheckout: CheckoutData | null;
    verificationResult: CheckoutVerificationResult | null;
    loading: boolean;
    error: string | null;
    redirecting: boolean;
    lastReference: string | null;
    lastCheckoutTime: number | null;
}

export interface AnalyticsState {
    summary: BillingSummary | null;
    revenue: RevenueReport | null;
    subscriptions: SubscriptionAnalytics | null;
    forecast: RevenueForecast | null;
    taxReport: TaxReport | null;
    loading: boolean;
    error: string | null;
    lastFetched: Record<string, number | null>;
    dateRange: DateRangeConfig;
}

export interface AdminBillingState {
    systemMetrics: SystemMetrics | null;
    revenueReport: RevenueReport | null;
    subscriptionReport: SubscriptionReport | null;
    taxReport: TaxReport | null;
    currentTenantData: TenantBillingData;
    loading: boolean;
    error: string | null;
    bulkUpdateLoading: boolean;
    lastFetched: number | null;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
}

export interface CheckoutData {
    authorization_url: string;
    access_code: string;
    reference: string;
    transaction_id: string;
}

export interface CheckoutVerificationResult {
    verified: boolean;
    status: string;
    reference: string;
    amount: number;
    transaction: Transaction;
}

export interface BillingSummary {
    tenant_id: string;
    has_active_subscription: boolean;
    current_plan: any;
    subscription_status: string | null;
    trial_info: any;
    billing_info: any;
    recent_transactions: Transaction[];
    invoice_summary: InvoiceSummary;
    total_spent: number;
}

export interface RevenueReport {
    period: string;
    start_date: string;
    end_date: string;
    total_revenue: number;
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    success_rate: number;
    breakdown: RevenueBreakdownItem[];
    currency: string;
}

export interface RevenueBreakdownItem {
    date?: string;
    month?: string;
    week?: string;
    total: number;
    count: number;
}

export interface SubscriptionAnalytics {
    total_active: number;
    total_trialing: number;
    total_expired: number;
    total_cancelled: number;
    by_plan: Array<{ plan_name: string; plan_type: string; count: number }>;
    by_plan_type: Record<string, number>;
    monthly_recurring_revenue: number;
    yearly_recurring_revenue: number;
    total_mrr: number;
    recent_activity: any[];
    currency: string;
    churn_rate?: number;
    new_subscriptions?: number;
    lost_subscriptions?: number;
    growth_rate?: number;
}

export interface RevenueForecast {
    current_mrr: number;
    forecast_3_months: number;
    forecast_6_months: number;
    forecast_12_months: number;
    assumptions: Record<string, string>;
}

export interface TaxReport {
    tenant_id: string;
    year: number;
    total_tax_collected: number;
    monthly_breakdown: TaxMonthlyBreakdown[];
    currency: string;
    tax_rate?: number;
}

export interface TaxMonthlyBreakdown {
    month: number;
    taxable_amount: number;
    tax: number;
}

export interface SystemMetrics {
    transactions: {
        total: number;
        successful: number;
        failed: number;
        success_rate: number;
    };
    revenue: {
        last_30_days: number;
        currency: string;
    };
    subscriptions: {
        active: number;
        trialing: number;
        total: number;
    };
    webhooks: {
        last_24h: number;
        failed_24h: number;
        success_rate: number;
    };
}

export interface SubscriptionReport {
    total_active: number;
    total_trialing: number;
    total_cancelled: number;
    total_expired: number;
    total_past_due: number;
    total_pending_cancellation: number;
    by_plan_type: Record<string, number>;
    by_plan: Array<Record<string, any>>;
    total_mrr: number;
    previous_mrr?: number;
    churn_rate?: number;
    new_subscriptions?: number;
    lost_subscriptions?: number;
}

export interface TenantBillingData {
    tenantId: string;
    subscriptions: Subscription[];
    invoices: Invoice[];
    transactions: Transaction[];
}

export interface DateRangeConfig {
    days: number;
    period: string;
    startDate: string | null;
    endDate: string | null;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UsePlansReturn {
    plans: SubscriptionPlan[];
    loading: boolean;
    error: string | null;
    selectedPlan: SubscriptionPlan | null;
    billingCycle: BillingInterval;
    hasPlans: boolean;
    popularPlan: SubscriptionPlan | null;
    plansByType: Record<string, SubscriptionPlan[]>;
    features: Record<string, any>;
    fetchPlans: (forceRefresh?: boolean) => Promise<SubscriptionPlan[]>;
    getPlanById: (id: string) => Promise<SubscriptionPlan | null>;
    getPlanByType: (type: PlanType) => SubscriptionPlan | undefined;
    getPlanPrice: (planId: string, cycle?: BillingInterval) => { amount: number; display: string; interval: string } | null;
    comparePlans: (planIds: string[]) => Promise<PlanComparison | null>;
    selectPlan: (plan: SubscriptionPlan) => void;
    clearSelectedPlan: () => void;
    toggleBillingCycle: () => void;
    setBillingCycle: (cycle: BillingInterval) => void;
}

export interface UseSubscriptionReturn {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    isActive: boolean;
    isOnTrial: boolean;
    isExpiringSoon: boolean;
    canUpgrade: boolean;
    canDowngrade: boolean;
    canCancel: boolean;
    canRenew: boolean;
    status: SubscriptionStatus | null;
    plan: SubscriptionPlan | null;
    trialDaysRemaining: number;
    daysUntilExpiry: number;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    fetchSubscription: (forceRefresh?: boolean) => Promise<Subscription | null>;
    cancelSubscription: (options?: SubscriptionCancelData) => Promise<any>;
    renewSubscription: (paymentMethodId?: string | null) => Promise<any>;
    upgradePlan: (planId: string, immediate?: boolean) => Promise<any>;
    downgradePlan: (planId: string, immediate?: boolean) => Promise<any>;
    updateAutoRenew: (autoRenew: boolean) => Promise<any>;
}