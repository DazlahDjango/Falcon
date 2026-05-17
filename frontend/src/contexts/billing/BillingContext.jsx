import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBillingAnalytics } from '../../hooks/billing';

const BillingContext = createContext(null);

export const useBillingContext = () => {
    const context = useContext(BillingContext);
    if (!context) {
        throw new Error('useBillingContext must be used within BillingProvider');
    }
    return context;
};

export const BillingProvider = ({ children }) => {
    const [currency, setCurrency] = useState('KES');
    const [taxRate, setTaxRate] = useState(0.16);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    const { summary, loading: analyticsLoading, refresh } = useBillingAnalytics();

    // Update last updated timestamp
    const updateTimestamp = useCallback(() => {
        setLastUpdated(new Date());
    }, []);

    // Refresh billing data
    const refreshBillingData = useCallback(async () => {
        setLoading(true);
        try {
            await refresh();
            updateTimestamp();
        } finally {
            setLoading(false);
        }
    }, [refresh, updateTimestamp]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refreshBillingData();
        }, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [refreshBillingData]);

    // Format currency helper
    const formatCurrency = useCallback((amount, showSymbol = true) => {
        const value = amount / 100;
        if (showSymbol) {
            return new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(value);
        }
        return value.toLocaleString();
    }, [currency]);

    // Format date helper
    const formatDate = useCallback((dateString, format = 'short') => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        
        if (format === 'short') {
            return date.toLocaleDateString();
        }
        if (format === 'long') {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        if (format === 'datetime') {
            return date.toLocaleString();
        }
        return date.toLocaleDateString();
    }, []);

    const value = React.useMemo(() => ({
        // State
        currency,
        taxRate,
        loading: loading || analyticsLoading,
        lastUpdated,
        summary,
        
        // Actions
        setCurrency,
        setTaxRate,
        refreshBillingData,
        updateTimestamp,
        
        // Helpers
        formatCurrency,
        formatDate,
    }), [
        currency,
        taxRate,
        loading,
        analyticsLoading,
        lastUpdated,
        summary,
        refreshBillingData,
        updateTimestamp,
        formatCurrency,
        formatDate
    ]);

    return (
        <BillingContext.Provider value={value}>
            {children}
        </BillingContext.Provider>
    );
};