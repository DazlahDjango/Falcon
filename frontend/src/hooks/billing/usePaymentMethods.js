/**
 * usePaymentMethods Hook
 * Manages saved payment methods
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PaymentMethodService } from '../../services/billing';

export const usePaymentMethods = (options = {}) => {
    const {
        autoFetch = true,
        autoSetDefault = true,
    } = options;

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [defaultMethod, setDefaultMethod] = useState(null);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch payment methods
    const fetchPaymentMethods = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await PaymentMethodService.getActivePaymentMethods();
            const methods = response?.data || [];
            setPaymentMethods(methods);
            
            // Find default method
            const defaultMethodData = methods.find(m => m.is_default);
            setDefaultMethod(defaultMethodData || methods[0] || null);
            
            return methods;
        } catch (err) {
            setError(err.message || 'Failed to fetch payment methods');
            console.error('[usePaymentMethods] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Add payment method
    const addPaymentMethod = useCallback(async (authorizationCode, email) => {
        setAdding(true);
        setError(null);

        try {
            const response = await PaymentMethodService.addPaymentMethod({
                authorization_code: authorizationCode,
                email,
            });
            
            const newMethod = response?.data;
            
            // Refresh list
            await fetchPaymentMethods();
            
            // If this is the first method and autoSetDefault is true, set as default
            if (autoSetDefault && paymentMethods.length === 0 && newMethod) {
                await setDefaultPaymentMethod(newMethod.id);
            }
            
            return newMethod;
        } catch (err) {
            setError(err.message || 'Failed to add payment method');
            console.error('[usePaymentMethods] Error adding:', err);
            throw err;
        } finally {
            setAdding(false);
        }
    }, [fetchPaymentMethods, paymentMethods.length, autoSetDefault]);

    // Delete payment method
    const deletePaymentMethod = useCallback(async (methodId) => {
        setDeleting(true);
        setError(null);

        try {
            await PaymentMethodService.deletePaymentMethod(methodId, true);
            
            // Refresh list
            await fetchPaymentMethods();
            return true;
        } catch (err) {
            setError(err.message || 'Failed to delete payment method');
            console.error('[usePaymentMethods] Error deleting:', err);
            throw err;
        } finally {
            setDeleting(false);
        }
    }, [fetchPaymentMethods]);

    // Set default payment method
    const setDefaultPaymentMethod = useCallback(async (methodId) => {
        try {
            await PaymentMethodService.setDefaultPaymentMethod(methodId);
            
            // Update local state
            setPaymentMethods(prev => prev.map(m => ({
                ...m,
                is_default: m.id === methodId,
            })));
            
            const newDefault = paymentMethods.find(m => m.id === methodId);
            setDefaultMethod(newDefault);
            
            return true;
        } catch (err) {
            setError(err.message || 'Failed to set default payment method');
            console.error('[usePaymentMethods] Error setting default:', err);
            throw err;
        }
    }, [paymentMethods]);

    // Check if has payment method
    const hasPaymentMethod = useMemo(() => paymentMethods.length > 0, [paymentMethods]);
    
    // Get card methods
    const cardMethods = useMemo(() => {
        return paymentMethods.filter(m => m.payment_type === 'card');
    }, [paymentMethods]);
    
    // Get bank methods
    const bankMethods = useMemo(() => {
        return paymentMethods.filter(m => m.payment_type === 'bank');
    }, [paymentMethods]);

    // Format display name
    const getDisplayName = useCallback((method) => {
        if (!method) return '';
        
        if (method.payment_type === 'card') {
            return `${method.card_brand || 'Card'} •••• ${method.card_last4 || '****'}`;
        }
        return method.payment_type || 'Payment Method';
    }, []);

    // Check if card is expired
    const isCardExpired = useCallback((method) => {
        if (method.payment_type !== 'card') return false;
        if (!method.card_expiry_year || !method.card_expiry_month) return false;
        
        const expiryDate = new Date(
            parseInt(method.card_expiry_year),
            parseInt(method.card_expiry_month) - 1,
            1
        );
        return expiryDate < new Date();
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchPaymentMethods();
        }
    }, [autoFetch, fetchPaymentMethods]);

    return {
        // State
        paymentMethods,
        loading,
        error,
        defaultMethod,
        adding,
        deleting,
        
        // Computed
        hasPaymentMethod,
        cardMethods,
        bankMethods,
        count: paymentMethods.length,
        
        // Actions
        fetchPaymentMethods,
        addPaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        getDisplayName,
        isCardExpired,
    };
};

export default usePaymentMethods;