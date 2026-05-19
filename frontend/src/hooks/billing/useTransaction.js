/**
 * useTransaction Hook
 * Manages single transaction data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { TransactionService } from '../../services/billing';
import { TRANSACTION_STATUS } from '../../config/constants/billingConstants';

export const useTransaction = (transactionId, options = {}) => {
    const {
        autoFetch = true,
        autoVerify = false,
    } = options;

    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [refunding, setRefunding] = useState(false);

    // Fetch transaction
    const fetchTransaction = useCallback(async (forceRefresh = false) => {
        if (!transactionId) return null;
        
        setLoading(true);
        setError(null);

        try {
            const response = await TransactionService.getTransaction(transactionId);
            const data = response?.data;
            setTransaction(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch transaction');
            console.error('[useTransaction] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [transactionId]);

    // Verify transaction
    const verifyTransaction = useCallback(async () => {
        if (!transaction?.reference) return;
        
        setVerifying(true);
        setError(null);

        try {
            const result = await TransactionService.verifyTransaction(transaction.reference);
            
            // Update transaction with verified status
            if (result?.verified || result?.status) {
                setTransaction(prev => ({
                    ...prev,
                    status: result.status || prev.status,
                    verified: true,
                }));
            }
            
            return result;
        } catch (err) {
            setError(err.message || 'Failed to verify transaction');
            console.error('[useTransaction] Verification error:', err);
            throw err;
        } finally {
            setVerifying(false);
        }
    }, [transaction?.reference]);

    // Refund transaction (admin only)
    const refundTransaction = useCallback(async (amount = null, reason = 'Customer requested refund') => {
        if (!transactionId) return;
        
        setRefunding(true);
        setError(null);

        try {
            const response = await TransactionService.refundTransaction(transactionId, { amount, reason });
            await fetchTransaction(true);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to refund transaction');
            console.error('[useTransaction] Refund error:', err);
            throw err;
        } finally {
            setRefunding(false);
        }
    }, [transactionId, fetchTransaction]);

    // Auto-fetch on mount or ID change
    useEffect(() => {
        if (autoFetch && transactionId) {
            fetchTransaction();
        }
    }, [autoFetch, transactionId, fetchTransaction]);

    // Auto-verify if pending
    useEffect(() => {
        if (autoVerify && transaction?.status === TRANSACTION_STATUS.PENDING && !transaction?.verified) {
            verifyTransaction();
        }
    }, [autoVerify, transaction?.status, transaction?.verified, verifyTransaction]);

    // Computed values
    const isSuccessful = transaction?.status === TRANSACTION_STATUS.SUCCESS;
    const isPending = transaction?.status === TRANSACTION_STATUS.PENDING;
    const isFailed = transaction?.status === TRANSACTION_STATUS.FAILED;
    const isRefunded = transaction?.status === TRANSACTION_STATUS.REFUNDED;
    const isDisputed = transaction?.status === TRANSACTION_STATUS.DISPUTED;
    
    const canRefund = useCallback(() => {
        if (!transaction) return false;
        return TransactionService.canRefund(transaction);
    }, [transaction]);

    const amountDisplay = transaction 
        ? `${transaction.currency} ${(transaction.amount / 100).toFixed(2)}`
        : null;
    
    const totalDisplay = transaction 
        ? `${transaction.currency} ${(transaction.total_amount / 100).toFixed(2)}`
        : null;
    
    const taxDisplay = transaction 
        ? `${transaction.currency} ${(transaction.tax_amount / 100).toFixed(2)}`
        : null;

    return {
        // State
        transaction,
        loading,
        error,
        verifying,
        refunding,
        
        // Status flags
        isSuccessful,
        isPending,
        isFailed,
        isRefunded,
        isDisputed,
        
        // Display values
        amountDisplay,
        totalDisplay,
        taxDisplay,
        
        // Actions
        fetchTransaction,
        verifyTransaction,
        refundTransaction,
        canRefund,
    };
};

export default useTransaction;