/**
 * Payment Method Types
 * Type definitions for saved payment methods
 */

export type PaymentMethodType = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money';
export type PaymentMethodStatus = 'active' | 'expired' | 'removed' | 'default';

export interface PaymentMethod {
    id: string;
    authorization_code: string;
    payment_type: PaymentMethodType;
    card_last4: string;
    card_brand: string;
    card_expiry_month: string;
    card_expiry_year: string;
    bank_name: string;
    account_name: string;
    email: string;
    status: PaymentMethodStatus;
    is_default: boolean;
    reusable: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethodListResponse {
    id: string;
    payment_type: PaymentMethodType;
    display_name: string;
    card_brand: string;
    card_last4: string;
    is_default: boolean;
    is_expired: boolean;
}

export interface PaymentMethodCreateData {
    authorization_code: string;
    email: string;
}

export interface PaymentMethodDeleteData {
    confirm: boolean;
}

export interface PaymentMethodExpiryStatus {
    is_expired: boolean;
    expiry_date: string | null;
}

export interface PaymentMethodSummary {
    total_methods: number;
    card_methods: number;
    bank_methods: number;
    has_default: boolean;
    expiring_cards: number;
}

export interface PaymentMethodFilters {
    status?: PaymentMethodStatus;
    payment_type?: PaymentMethodType;
    active_only?: boolean;
}

// Card brand types
export type CardBrand = 'visa' | 'mastercard' | 'american express' | 'discover' | 'other';

export interface CardDetails {
    brand: CardBrand;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    isExpired: boolean;
}

// Card form data
export interface CardFormData {
    cardNumber: string;
    cardName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

export interface CardFormErrors {
    cardNumber?: string;
    cardName?: string;
    expiry?: string;
    cvv?: string;
}