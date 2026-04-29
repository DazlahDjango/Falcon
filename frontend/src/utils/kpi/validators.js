import { THRESHOLDS, ERROR_MESSAGES } from './constants';

export const validateKPICode = (code) => {
    if (!code || code.trim() === '') {
        return { valid: false, message: 'KPI code is required' };
    }
    
    const regex = /^[A-Z0-9_\-]+$/;
    if (!regex.test(code)) {
        return { valid: false, message: 'KPI code must contain only uppercase letters, numbers, underscores, and hyphens' };
    }
    
    if (code.length < 2 || code.length > 50) {
        return { valid: false, message: 'KPI code must be between 2 and 50 characters' };
    }
    
    return { valid: true, message: '' };
};

export const validateKPIName = (name) => {
    if (!name || name.trim() === '') {
        return { valid: false, message: 'KPI name is required' };
    }
    
    if (name.length < 3 || name.length > 255) {
        return { valid: false, message: 'KPI name must be between 3 and 255 characters' };
    }
    
    return { valid: true, message: '' };
};
export const validateTargetValue = (value, kpiType = null) => {
    if (value === null || value === undefined || value === '') {
        return { valid: false, message: 'Target value is required' };
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return { valid: false, message: 'Target must be a number' };
    }
    
    if (numValue <= 0) {
        return { valid: false, message: 'Target must be greater than 0' };
    }
    
    if (kpiType === 'PERCENTAGE' && numValue > 100) {
        return { valid: false, message: 'Percentage target cannot exceed 100%' };
    }
    
    return { valid: true, message: '' };
};

export const validateActualValue = (value, kpiType = null) => {
    if (value === null || value === undefined || value === '') {
        return { valid: false, message: 'Actual value is required' };
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return { valid: false, message: 'Actual must be a number' };
    }
    
    if (numValue < 0) {
        return { valid: false, message: 'Actual value cannot be negative' };
    }
    
    if (kpiType === 'PERCENTAGE' && numValue > 100) {
        return { valid: false, message: 'Percentage cannot exceed 100%' };
    }
    
    return { valid: true, message: '' };
};

export const validateTargetRange = (min, max) => {
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
        if (parseFloat(min) > parseFloat(max)) {
            return { valid: false, message: 'Minimum target cannot be greater than maximum target' };
        }
    }
    return { valid: true, message: '' };
};

export const validateWeightSum = (weights) => {
    if (!weights || weights.length === 0) {
        return { valid: true, message: '' };
    }
    
    const total = weights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
        return { valid: false, message: `Weights must sum to 100%. Current total: ${total.toFixed(1)}%` };
    }
    
    return { valid: true, message: '' };
};

export const validateWeight = (weight) => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
        return { valid: false, message: 'Weight must be a number' };
    }
    
    if (numWeight < 0) {
        return { valid: false, message: 'Weight cannot be negative' };
    }
    
    if (numWeight > 100) {
        return { valid: false, message: 'Weight cannot exceed 100%' };
    }
    
    return { valid: true, message: '' };
};

export const validatePeriod = (year, month, allowFuture = false) => {
    if (!year || !month) {
        return { valid: false, message: 'Year and month are required' };
    }
    
    if (month < 1 || month > 12) {
        return { valid: false, message: 'Month must be between 1 and 12' };
    }
    
    if (year < 2000 || year > 2100) {
        return { valid: false, message: 'Year must be between 2000 and 2100' };
    }
    
    if (!allowFuture) {
        const now = new Date();
        if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)) {
            return { valid: false, message: 'Cannot use future period' };
        }
    }
    
    return { valid: true, message: '' };
};
export const validateFile = (file) => {
    if (!file) {
        return { valid: false, message: 'No file selected' };
    }
    
    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, message: 'File size cannot exceed 10MB' };
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|xls|xlsx|csv)$/i)) {
        return { valid: false, message: 'File type not allowed. Allowed: JPG, PNG, PDF, XLS, XLSX, CSV' };
    }
    
    return { valid: true, message: '' };
};

export const validateEmail = (email) => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    
    return { valid: true, message: '' };
};
export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return { valid: false, message: 'Both start and end dates are required' };
    }
    if (startDate > endDate) {
        return { valid: false, message: 'Start date cannot be after end date' };
    }
    return { valid: true, message: '' };
};
export const validateSearchQuery = (query) => {
    if (!query) {
        return { valid: true, message: '' };
    }
    if (query.length < 2) {
        return { valid: false, message: 'Search query must be at least 2 characters' };
    }
    if (query.length > 100) {
        return { valid: false, message: 'Search query cannot exceed 100 characters' };
    }
    return { valid: true, message: '' };
};