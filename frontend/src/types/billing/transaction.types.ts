export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'disputed';
export type TransactionType = 'subscription' | 'renewal' | 'upgrade' | 'downgrade' | 'refund' | 'one_time';

export interface Transaction {
    id: string;
    reference: string;
    paystack_reference: string;
    tenant_id: string;
    subscription_id: string | null;
    invoice_id: string | null;
    transaction_type: TransactionType;
    amount: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    status: TransactionStatus;
    payment_method: string;
    card_last4: string;
    card_brand: string;
    payment_date: string | null;
    error_message: string;
    paystack_response: Record<string, any>;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface TransactionListResponse {
    id: string;
    reference: string;
    transaction_type: TransactionType;
    amount: number;
    total_amount: number;
    status: TransactionStatus;
    payment_date: string | null;
    created_at: string;
}

export interface TransactionDetail extends Transaction {
    is_successful: boolean;
    can_refund: boolean;
}

export interface TransactionSummary {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    refunded: number;
    total_amount: number;
    total_tax: number;
}

export interface TransactionFilters {
    status?: TransactionStatus;
    transaction_type?: TransactionType;
    start_date?: string;
    end_date?: string;
    reference?: string;
}

export interface TransactionVerifyResponse {
    verified: boolean;
    status: TransactionStatus;
    reference: string;
    amount: number;
    transaction: TransactionDetail;
}

export interface TransactionRefundData {
    amount?: number;
    reason?: string;
}

export interface TransactionStats {
    total_transactions: number;
    successful: number;
    failed: number;
    pending: number;
    refunded: number;
    total_spent: number;
    last_transaction: Transaction | null;
}