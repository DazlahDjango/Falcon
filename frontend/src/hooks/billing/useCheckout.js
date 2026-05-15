import { useState, useCallback } from 'react';
import { CheckoutService } from '../../services/billing';
import { usePaymentMethods } from './usePaymentMethods';

export const useCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkoutData, setCheckoutData] = useState(null);
    const [verifying, setVerifying] = useState(false);
    
    const { paymentMethods, fetchPaymentMethods } = usePaymentMethods({ autoFetch: false });

    // Initialize subscription checkout
    const initSubscriptionCheckout = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await CheckoutService.initializeSubscriptionCheckout(params);
            setCheckoutData(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to initialize checkout');
            console.error('[useCheckout] Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize one-time checkout
    const initOneTimeCheckout = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await CheckoutService.initializeOneTimeCheckout(params);
            setCheckoutData(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to initialize checkout');
            console.error('[useCheckout] Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Verify payment
    const verifyPayment = useCallback(async (reference) => {
        setVerifying(true);
        setError(null);
        
        try {
            const response = await CheckoutService.verifyCheckout(reference);
            const result = response?.data;
            
            if (result?.verified) {
                // Refresh payment methods on successful payment
                await fetchPaymentMethods();
            }
            
            return result;
        } catch (err) {
            setError(err.message || 'Failed to verify payment');
            console.error('[useCheckout] Verification error:', err);
            throw err;
        } finally {
            setVerifying(false);
        }
    }, [fetchPaymentMethods]);

    // Redirect to payment page
    const redirectToPayment = useCallback((authorizationUrl) => {
        CheckoutService.redirectToPayment(authorizationUrl);
    }, []);

    // Open payment popup
    const openPaymentPopup = useCallback((authorizationUrl) => {
        return CheckoutService.openPaymentPopup(authorizationUrl);
    }, []);

    // Save and restore checkout session
    const saveSession = useCallback((sessionData) => {
        CheckoutService.saveCheckoutSession(sessionData);
    }, []);

    const getSession = useCallback(() => {
        return CheckoutService.getCheckoutSession();
    }, []);

    const clearSession = useCallback(() => {
        CheckoutService.clearCheckoutSession();
    }, []);

    // Clear checkout data
    const clearCheckout = useCallback(() => {
        setCheckoutData(null);
        setError(null);
    }, []);

    return {
        // State
        loading,
        verifying,
        error,
        checkoutData,
        paymentMethods,
        
        // Actions
        initSubscriptionCheckout,
        initOneTimeCheckout,
        verifyPayment,
        redirectToPayment,
        openPaymentPopup,
        saveSession,
        getSession,
        clearSession,
        clearCheckout,
    };
};

export default useCheckout;