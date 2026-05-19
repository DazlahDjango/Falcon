/**
 * useAdminBilling Hook
 * Manages admin billing operations (super admin only)
 */

import { useState, useCallback } from 'react';
import { AdminBillingService } from '../../services/billing';

export const useAdminBilling = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tenantSubscriptions, setTenantSubscriptions] = useState([]);
    const [tenantInvoices, setTenantInvoices] = useState([]);
    const [tenantTransactions, setTenantTransactions] = useState([]);
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [revenueReport, setRevenueReport] = useState(null);
    const [subscriptionReport, setSubscriptionReport] = useState(null);
    const [taxReport, setTaxReport] = useState(null);

    // Get tenant subscriptions
    const getTenantSubscriptions = useCallback(async (tenantId) => {
        if (!tenantId) return [];
        
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getTenantSubscriptions(tenantId);
            const data = response?.data || [];
            setTenantSubscriptions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch tenant subscriptions');
            console.error('[useAdminBilling] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get tenant invoices
    const getTenantInvoices = useCallback(async (tenantId) => {
        if (!tenantId) return [];
        
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getTenantInvoices(tenantId);
            const data = response?.data || [];
            setTenantInvoices(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch tenant invoices');
            console.error('[useAdminBilling] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get tenant transactions
    const getTenantTransactions = useCallback(async (tenantId) => {
        if (!tenantId) return [];
        
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getTenantTransactions(tenantId);
            const data = response?.data || [];
            setTenantTransactions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch tenant transactions');
            console.error('[useAdminBilling] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get system metrics
    const getSystemMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getSystemMetrics();
            setSystemMetrics(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch system metrics');
            console.error('[useAdminBilling] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get revenue report
    const getRevenueReport = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getRevenueReport(params);
            setRevenueReport(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch revenue report');
            console.error('[useAdminBilling] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get subscription report
    const getSubscriptionReport = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getSubscriptionReport(params);
            setSubscriptionReport(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch subscription report');
            console.error('[useAdminBilling] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get tax report
    const getTaxReport = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.getTaxReport(params);
            setTaxReport(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch tax report');
            console.error('[useAdminBilling] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Bulk update subscriptions
    const bulkUpdateSubscriptions = useCallback(async (updates) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminBillingService.bulkUpdateSubscriptions(updates);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to bulk update subscriptions');
            console.error('[useAdminBilling] Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get tenant billing summary (combined)
    const getTenantBillingSummary = useCallback(async (tenantId) => {
        const [subscriptions, invoices, transactions] = await Promise.all([
            getTenantSubscriptions(tenantId),
            getTenantInvoices(tenantId),
            getTenantTransactions(tenantId),
        ]);
        
        return {
            tenantId,
            subscriptions,
            invoices,
            transactions,
            subscriptionCount: subscriptions.length,
            invoiceCount: invoices.length,
            transactionCount: transactions.length,
            totalRevenue: transactions
                .filter(t => t.status === 'success')
                .reduce((sum, t) => sum + (t.total_amount || 0), 0),
        };
    }, [getTenantSubscriptions, getTenantInvoices, getTenantTransactions]);

    // Clear tenant data
    const clearTenantData = useCallback(() => {
        setTenantSubscriptions([]);
        setTenantInvoices([]);
        setTenantTransactions([]);
    }, []);

    // Refresh all admin data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            getSystemMetrics(),
            getRevenueReport(),
            getSubscriptionReport(),
            getTaxReport(),
        ]);
    }, [getSystemMetrics, getRevenueReport, getSubscriptionReport, getTaxReport]);

    return {
        // State
        loading,
        error,
        tenantSubscriptions,
        tenantInvoices,
        tenantTransactions,
        systemMetrics,
        revenueReport,
        subscriptionReport,
        taxReport,
        
        // Tenant actions
        getTenantSubscriptions,
        getTenantInvoices,
        getTenantTransactions,
        getTenantBillingSummary,
        clearTenantData,
        
        // Report actions
        getSystemMetrics,
        getRevenueReport,
        getSubscriptionReport,
        getTaxReport,
        
        // Bulk actions
        bulkUpdateSubscriptions,
        
        // Utilities
        refreshAll,
    };
};

export default useAdminBilling;