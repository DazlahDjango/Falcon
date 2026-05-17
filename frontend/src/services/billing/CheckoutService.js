/**
 * Checkout Service
 * Handles payment checkout operations
 */

import axios from 'axios';
import { CHECKOUT_ENDPOINTS } from '../../config/constants/billingApiConstants';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';
import { store } from '../../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BILLING_API_BASE = `${API_BASE_URL}/billing`;

const checkoutApiClient = axios.create({
    baseURL: BILLING_API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

checkoutApiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    let tenantId = await getTenantId();
    if (!tenantId) {
        const state = store.getState();
        tenantId = state?.auth?.user?.tenant_id || state?.tenant?.currentTenant?.id;
    }
    if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
    }
    
    return config;
});

class CheckoutServiceClass {
    async initializeSubscriptionCheckout(params) {
        const { plan_id, billing_interval = 'monthly', success_url, cancel_url, metadata = {} } = params;
        
        if (!plan_id) {
            throw new Error('Plan ID is required for subscription checkout');
        }
        
        return checkoutApiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
            plan_id,
            billing_interval,
            success_url,
            cancel_url,
            metadata,
        });
    }
    
    async initializeOneTimeCheckout(params) {
        const { amount, description, success_url, cancel_url, metadata = {} } = params;
        
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required for one-time checkout');
        }
        
        if (!description) {
            throw new Error('Description is required for one-time checkout');
        }
        
        return checkoutApiClient.post(CHECKOUT_ENDPOINTS.INITIALIZE, {
            amount,
            description,
            success_url,
            cancel_url,
            metadata,
        });
    }
    
    async verifyCheckout(reference) {
        if (!reference) {
            throw new Error('Transaction reference is required');
        }
        
        return checkoutApiClient.post(CHECKOUT_ENDPOINTS.VERIFY, { reference });
    }
    
    getCallbackUrl(reference, isSuccess) {
        const baseUrl = window.location.origin;
        const path = isSuccess ? '/checkout/success' : '/checkout/cancel';
        return `${baseUrl}${path}?reference=${reference}`;
    }
    
    redirectToPayment(authorizationUrl) {
        if (!authorizationUrl) {
            throw new Error('Authorization URL is required');
        }
        window.location.href = authorizationUrl;
    }
    
    openPaymentPopup(authorizationUrl) {
        if (!authorizationUrl) {
            throw new Error('Authorization URL is required');
        }
        
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        return window.open(
            authorizationUrl,
            'paystack_payment',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }
    
    saveCheckoutSession(session) {
        try {
            sessionStorage.setItem('checkout_session', JSON.stringify({
                ...session,
                timestamp: Date.now(),
            }));
            return true;
        } catch (error) {
            console.error('Failed to save checkout session:', error);
            return false;
        }
    }
    
    getCheckoutSession() {
        try {
            const session = sessionStorage.getItem('checkout_session');
            if (!session) return null;
            
            const parsed = JSON.parse(session);
            if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
                sessionStorage.removeItem('checkout_session');
                return null;
            }
            return parsed;
        } catch (error) {
            console.error('Failed to get checkout session:', error);
            return null;
        }
    }
    
    clearCheckoutSession() {
        sessionStorage.removeItem('checkout_session');
    }
}

export const CheckoutService = new CheckoutServiceClass();
export default CheckoutService;