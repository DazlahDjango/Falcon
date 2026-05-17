/**
 * Webhook Types
 * Type definitions for webhook events
 */

export type WebhookEventType = 
    | 'charge.success'
    | 'charge.dispute.create'
    | 'charge.dispute.remind'
    | 'charge.dispute.resolve'
    | 'subscription.create'
    | 'subscription.disable'
    | 'subscription.enable'
    | 'invoice.create'
    | 'invoice.update'
    | 'invoice.payment_failed'
    | 'paymentrequest.success';

export type WebhookProcessingStatus = 'pending' | 'processed' | 'failed' | 'duplicate';

export interface WebhookAuthorization {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bin: string;
    bank: string;
    channel: string;
    signature: string;
    reusable: boolean;
    country_code: string;
}

export interface WebhookCustomer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
    phone: string;
    metadata: Record<string, any>;
    risk_action: string;
}

export interface WebhookData {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: Record<string, any>;
    fees: number;
    fees_split: Record<string, any>;
    authorization: WebhookAuthorization;
    customer: WebhookCustomer;
    plan?: Record<string, any>;
    subscription?: Record<string, any>;
}

export interface WebhookPayload {
    event: WebhookEventType;
    data: WebhookData;
}

export interface WebhookEventLog {
    id: string;
    event_type: WebhookEventType;
    event_idempotency_key: string;
    paystack_event_id: string;
    paystack_data_id: string;
    processing_status: WebhookProcessingStatus;
    raw_payload: Record<string, any>;
    processed_at: string | null;
    processing_error: string;
    retry_count: number;
    last_retry_at: string | null;
    signature_valid: boolean;
    signature_error: string;
    related_transaction_id: string | null;
    related_subscription_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface WebhookEventLogListResponse {
    id: string;
    event_type: WebhookEventType;
    processing_status: WebhookProcessingStatus;
    created_at: string;
    signature_valid: boolean;
    retry_count: number;
}

export interface WebhookStats {
    total: number;
    processed: number;
    failed: number;
    duplicate: number;
    success_rate: number;
    by_event_type: Record<string, {
        total: number;
        processed: number;
        success_rate: number;
    }>;
}

export interface WebhookFilters {
    event_type?: WebhookEventType;
    processing_status?: WebhookProcessingStatus;
    start_date?: string;
    end_date?: string;
    signature_valid?: boolean;
}

export interface WebhookResponse {
    status: 'processed' | 'duplicate' | 'error';
    message: string;
    event_type?: WebhookEventType;
    processed_at?: string;
}

// Webhook notification types for WebSocket
export interface WebhookNotification {
    type: string;
    data: Record<string, any>;
    timestamp: string;
}

export interface PaymentSuccessWebhookData {
    reference: string;
    amount: number;
    amount_display: string;
    status: string;
    transaction_id: string;
}

export interface SubscriptionUpdateWebhookData {
    subscription_code: string;
    status: string;
    plan_name: string;
    effective_date: string;
}

export interface InvoiceReadyWebhookData {
    invoice_number: string;
    amount: number;
    amount_display: string;
    due_date: string;
    invoice_id: string;
}

export interface TrialEndingWebhookData {
    days_remaining: number;
    trial_end_date: string;
    plan_name: string;
}