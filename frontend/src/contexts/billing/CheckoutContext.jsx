import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCheckout, usePaymentMethods } from '../../hooks/billing';

const CheckoutContext = createContext(null);

export const useCheckoutContext = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckoutContext must be used within CheckoutProvider');
    }
    return context;
};

export const CheckoutProvider = ({ children }) => {
    const {
        initSubscriptionCheckout,
        initOneTimeCheckout,
        verifyPayment,
        redirectToPayment,
        openPaymentPopup,
        loading: checkoutLoading,
        error: checkoutError,
        checkoutData,
        verifying,
        clearCheckout,
    } = useCheckout();

    const { paymentMethods, fetchPaymentMethods } = usePaymentMethods();

    const [checkoutState, setCheckoutState] = useState({
        step: 'initial', // initial, processing, payment, success, failed
        type: null, // subscription, one_time
        data: null,
        error: null,
    });

    // Initialize subscription checkout
    const startSubscriptionCheckout = useCallback(async (plan, billingCycle, metadata = {}) => {
        setCheckoutState({
            step: 'processing',
            type: 'subscription',
            data: { plan, billingCycle },
            error: null,
        });

        try {
            const result = await initSubscriptionCheckout({
                planId: plan.id,
                billingInterval: billingCycle,
                metadata: {
                    plan_name: plan.name,
                    plan_type: plan.plan_type,
                    ...metadata,
                },
            });
            
            setCheckoutState(prev => ({
                ...prev,
                step: 'payment',
                data: { ...prev.data, checkoutResult: result },
            }));
            
            return result;
        } catch (error) {
            setCheckoutState(prev => ({
                ...prev,
                step: 'failed',
                error: error.message,
            }));
            throw error;
        }
    }, [initSubscriptionCheckout]);

    // Initialize one-time checkout
    const startOneTimeCheckout = useCallback(async (amount, description, metadata = {}) => {
        setCheckoutState({
            step: 'processing',
            type: 'one_time',
            data: { amount, description },
            error: null,
        });

        try {
            const result = await initOneTimeCheckout({
                amount,
                description,
                metadata,
            });
            
            setCheckoutState(prev => ({
                ...prev,
                step: 'payment',
                data: { ...prev.data, checkoutResult: result },
            }));
            
            return result;
        } catch (error) {
            setCheckoutState(prev => ({
                ...prev,
                step: 'failed',
                error: error.message,
            }));
            throw error;
        }
    }, [initOneTimeCheckout]);

    // Process payment (redirect or popup)
    const processPayment = useCallback((authorizationUrl, usePopup = false) => {
        if (usePopup) {
            openPaymentPopup(authorizationUrl);
        } else {
            redirectToPayment(authorizationUrl);
        }
        setCheckoutState(prev => ({ ...prev, step: 'processing' }));
    }, [redirectToPayment, openPaymentPopup]);

    // Verify payment after callback
    const verifyAndComplete = useCallback(async (reference) => {
        setCheckoutState(prev => ({ ...prev, step: 'verifying' }));
        
        try {
            const result = await verifyPayment(reference);
            
            if (result?.verified) {
                // Refresh payment methods after successful payment
                await fetchPaymentMethods();
                
                setCheckoutState(prev => ({
                    ...prev,
                    step: 'success',
                    data: { ...prev.data, verificationResult: result },
                }));
            } else {
                setCheckoutState(prev => ({
                    ...prev,
                    step: 'failed',
                    error: result?.message || 'Payment verification failed',
                }));
            }
            
            return result;
        } catch (error) {
            setCheckoutState(prev => ({
                ...prev,
                step: 'failed',
                error: error.message,
            }));
            throw error;
        }
    }, [verifyPayment, fetchPaymentMethods]);

    // Reset checkout state
    const resetCheckout = useCallback(() => {
        clearCheckout();
        setCheckoutState({
            step: 'initial',
            type: null,
            data: null,
            error: null,
        });
    }, [clearCheckout]);

    // Get saved payment methods
    const getSavedPaymentMethods = useCallback(async () => {
        await fetchPaymentMethods();
        return paymentMethods;
    }, [fetchPaymentMethods, paymentMethods]);

    const value = React.useMemo(() => ({
        // State
        checkoutState,
        checkoutLoading,
        checkoutError,
        verifying,
        paymentMethods,
        checkoutData,
        
        // Computed
        isProcessing: checkoutState.step === 'processing',
        isInPayment: checkoutState.step === 'payment',
        isSuccess: checkoutState.step === 'success',
        isFailed: checkoutState.step === 'failed',
        isVerifying: checkoutState.step === 'verifying',
        
        // Actions
        startSubscriptionCheckout,
        startOneTimeCheckout,
        processPayment,
        verifyAndComplete,
        resetCheckout,
        getSavedPaymentMethods,
        
        // Helpers
        hasSavedPaymentMethods: paymentMethods.length > 0,
    }), [
        checkoutState,
        checkoutLoading,
        checkoutError,
        verifying,
        paymentMethods,
        checkoutData,
        startSubscriptionCheckout,
        startOneTimeCheckout,
        processPayment,
        verifyAndComplete,
        resetCheckout,
        getSavedPaymentMethods
    ]);

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};