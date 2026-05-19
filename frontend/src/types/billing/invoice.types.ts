/**
 * Invoice Types
 * Type definitions for invoices
 */

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    is_tax?: boolean;
    is_tax_exempt?: boolean;
}

export interface InvoiceLineItemFormatted extends InvoiceLineItem {
    unit_price_display: string;
    total_display: string;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    tenant_id: string;
    subscription_id: string | null;
    invoice_date: string;
    due_date: string;
    paid_at: string | null;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    status: InvoiceStatus;
    line_items: InvoiceLineItem[];
    pdf_url: string;
    pdf_generated_at: string | null;
    notes: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface InvoiceListResponse {
    id: string;
    invoice_number: string;
    total_amount: number;
    currency: string;
    invoice_date: string;
    due_date: string;
    status: InvoiceStatus;
    pdf_url: string;
}

export interface InvoiceDetail extends Invoice {
    is_overdue: boolean;
    days_overdue: number;
    formatted_line_items: InvoiceLineItemFormatted[];
    payment_url: string | null;
}

export interface InvoiceSummary {
    total_invoices: number;
    paid: number;
    pending: number;
    overdue: number;
    cancelled: number;
    refunded: number;
    total_paid_amount: number;
    total_outstanding: number;
    last_invoice: Invoice | null;
}

export interface InvoiceFilters {
    status?: InvoiceStatus;
    unpaid_only?: boolean;
    start_date?: string;
    end_date?: string;
    invoice_number?: string;
}

export interface InvoiceDownloadData {
    format?: 'pdf' | 'csv' | 'json';
}

export interface InvoicePayData {
    payment_method_id?: string;
}

export interface InvoiceOverdueStatus {
    is_overdue: boolean;
    days_overdue: number;
}