/**
 * Billing Calculators
 * Proration, discount, and tax calculation utilities
 */

import { formatCurrency } from './formatters';

/**
 * Calculate prorated amount for partial period
 * @param {number} originalAmount - Original amount in cents
 * @param {number} daysUsed - Number of days used
 * @param {number} totalDays - Total days in period
 * @returns {number} Prorated amount in cents
 */
export const calculateProratedAmount = (originalAmount, daysUsed, totalDays) => {
    if (totalDays <= 0) return 0;
    return Math.round((originalAmount * daysUsed) / totalDays);
};

/**
 * Calculate refund amount for unused period
 * @param {number} originalAmount - Original amount in cents
 * @param {number} daysUsed - Number of days used
 * @param {number} totalDays - Total days in period
 * @returns {number} Refund amount in cents
 */
export const calculateRefundAmount = (originalAmount, daysUsed, totalDays) => {
    if (totalDays <= 0) return 0;
    const unusedRatio = (totalDays - daysUsed) / totalDays;
    return Math.max(0, Math.round(originalAmount * unusedRatio));
};

/**
 * Calculate tax amount
 * @param {number} amount - Amount in cents
 * @param {number} taxRate - Tax rate (e.g., 0.16 for 16%)
 * @returns {number} Tax amount in cents
 */
export const calculateTax = (amount, taxRate = 0.16) => {
    return Math.round(amount * taxRate);
};

/**
 * Calculate total with tax
 * @param {number} amount - Amount in cents
 * @param {number} taxRate - Tax rate
 * @returns {Object} { subtotal, tax, total }
 */
export const calculateTotalWithTax = (amount, taxRate = 0.16) => {
    const tax = calculateTax(amount, taxRate);
    const total = amount + tax;
    return {
        subtotal: amount,
        tax,
        total,
    };
};

/**
 * Calculate discount amount
 * @param {number} amount - Original amount in cents
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discount amount in cents
 */
export const calculateDiscount = (amount, discountPercent) => {
    return Math.round((amount * discountPercent) / 100);
};

/**
 * Calculate discounted price
 * @param {number} amount - Original amount in cents
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discounted amount in cents
 */
export const calculateDiscountedPrice = (amount, discountPercent) => {
    return amount - calculateDiscount(amount, discountPercent);
};

/**
 * Calculate yearly savings vs monthly
 * @param {number} monthlyPrice - Monthly price in cents
 * @param {number} yearlyPrice - Yearly price in cents
 * @returns {Object} { savingsAmount, savingsPercent, monthlyEquivalent }
 */
export const calculateYearlySavings = (monthlyPrice, yearlyPrice) => {
    const monthlyTotal = monthlyPrice * 12;
    const savingsAmount = monthlyTotal - yearlyPrice;
    const savingsPercent = monthlyTotal > 0 ? (savingsAmount / monthlyTotal) * 100 : 0;
    const monthlyEquivalent = yearlyPrice / 12;
    
    return {
        savingsAmount,
        savingsPercent: Math.round(savingsPercent),
        monthlyEquivalent: Math.round(monthlyEquivalent),
        savingsDisplay: formatCurrency(savingsAmount),
        monthlyEquivalentDisplay: formatCurrency(monthlyEquivalent),
    };
};

/**
 * Calculate MRR (Monthly Recurring Revenue)
 * @param {Array} subscriptions - List of subscriptions
 * @returns {number} Total MRR in cents
 */
export const calculateMRR = (subscriptions) => {
    return subscriptions.reduce((total, sub) => {
        if (sub.status !== 'active' && sub.status !== 'trialing') return total;
        
        let monthlyAmount = sub.amount;
        if (sub.billing_interval === 'yearly') {
            monthlyAmount = sub.amount / 12;
        }
        return total + monthlyAmount;
    }, 0);
};

/**
 * Calculate ARPU (Average Revenue Per User)
 * @param {number} totalRevenue - Total revenue in cents
 * @param {number} userCount - Number of users
 * @returns {number} ARPU in cents
 */
export const calculateARPU = (totalRevenue, userCount) => {
    if (userCount === 0) return 0;
    return Math.round(totalRevenue / userCount);
};

/**
 * Calculate LTV (Lifetime Value)
 * @param {number} averageMonthlyRevenue - Average monthly revenue per customer
 * @param {number} averageLifetimeMonths - Average customer lifetime in months
 * @returns {number} LTV in cents
 */
export const calculateLTV = (averageMonthlyRevenue, averageLifetimeMonths) => {
    return averageMonthlyRevenue * averageLifetimeMonths;
};

/**
 * Calculate CAC (Customer Acquisition Cost)
 * @param {number} totalMarketingCost - Total marketing cost in cents
 * @param {number} newCustomers - Number of new customers acquired
 * @returns {number} CAC in cents
 */
export const calculateCAC = (totalMarketingCost, newCustomers) => {
    if (newCustomers === 0) return 0;
    return Math.round(totalMarketingCost / newCustomers);
};

/**
 * Calculate churn rate
 * @param {number} customersLost - Number of customers lost in period
 * @param {number} totalCustomersAtStart - Total customers at start of period
 * @returns {number} Churn rate percentage
 */
export const calculateChurnRate = (customersLost, totalCustomersAtStart) => {
    if (totalCustomersAtStart === 0) return 0;
    return (customersLost / totalCustomersAtStart) * 100;
};

/**
 * Calculate net revenue retention
 * @param {number} startingMRR - MRR at start of period
 * @param {number} expansionMRR - MRR from upgrades
 * @param {number} contractionMRR - MRR from downgrades
 * @param {number} churnedMRR - MRR from cancellations
 * @returns {number} NRR percentage
 */
export const calculateNRR = (startingMRR, expansionMRR, contractionMRR, churnedMRR) => {
    if (startingMRR === 0) return 0;
    const netChange = expansionMRR - contractionMRR - churnedMRR;
    return ((startingMRR + netChange) / startingMRR) * 100;
};