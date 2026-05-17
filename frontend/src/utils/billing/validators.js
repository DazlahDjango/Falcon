/**
 * Billing Validators
 * Validation utilities for billing forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { isValid, error }
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true, error: null };
};

/**
 * Validate phone number (Kenyan format)
 * @param {string} phone - Phone number to validate
 * @returns {Object} { isValid, error }
 */
export const validatePhoneNumber = (phone) => {
    if (!phone) {
        return { isValid: false, error: 'Phone number is required' };
    }
    const phoneRegex = /^(07\d{8}|2547\d{8}|\+2547\d{8})$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return { isValid: false, error: 'Invalid Kenyan phone number' };
    }
    return { isValid: true, error: null };
};

/**
 * Validate card number
 * @param {string} cardNumber - Card number to validate
 * @returns {Object} { isValid, error, brand }
 */
export const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!cleaned) {
        return { isValid: false, error: 'Card number is required', brand: null };
    }
    
    if (!/^\d+$/.test(cleaned)) {
        return { isValid: false, error: 'Card number must contain only digits', brand: null };
    }
    
    // Detect card brand
    let brand = null;
    if (cleaned.startsWith('4')) brand = 'visa';
    else if (cleaned.startsWith('5')) brand = 'mastercard';
    else if (cleaned.startsWith('3')) brand = 'amex';
    else if (cleaned.startsWith('6')) brand = 'discover';
    
    // Luhn algorithm validation
    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let n = parseInt(cleaned.charAt(i), 10);
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }
    
    const isValid = sum % 10 === 0 && cleaned.length >= 13 && cleaned.length <= 19;
    
    if (!isValid) {
        return { isValid: false, error: 'Invalid card number', brand };
    }
    
    return { isValid: true, error: null, brand };
};

/**
 * Validate expiry date
 * @param {string} month - Expiry month (MM)
 * @param {string} year - Expiry year (YY or YYYY)
 * @returns {Object} { isValid, error }
 */
export const validateExpiryDate = (month, year) => {
    if (!month || !year) {
        return { isValid: false, error: 'Expiry date is required' };
    }
    
    const monthNum = parseInt(month, 10);
    const yearNum = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
    
    if (monthNum < 1 || monthNum > 12) {
        return { isValid: false, error: 'Invalid month' };
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        return { isValid: false, error: 'Card has expired' };
    }
    
    if (yearNum > currentYear + 20) {
        return { isValid: false, error: 'Invalid expiry year' };
    }
    
    return { isValid: true, error: null };
};

/**
 * Validate CVV
 * @param {string} cvv - CVV number
 * @param {string} cardBrand - Card brand for length validation
 * @returns {Object} { isValid, error }
 */
export const validateCvv = (cvv, cardBrand = null) => {
    if (!cvv) {
        return { isValid: false, error: 'CVV is required' };
    }
    
    const cleaned = cvv.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) {
        return { isValid: false, error: 'CVV must contain only digits' };
    }
    
    const requiredLength = cardBrand === 'amex' ? 4 : 3;
    if (cleaned.length !== requiredLength) {
        return { isValid: false, error: `CVV must be ${requiredLength} digits` };
    }
    
    return { isValid: true, error: null };
};

/**
 * Validate amount
 * @param {number} amount - Amount in cents
 * @param {Object} options - Validation options
 * @returns {Object} { isValid, error }
 */
export const validateAmount = (amount, options = {}) => {
    const { min = 1, max = 10000000 } = options;
    
    if (!amount && amount !== 0) {
        return { isValid: false, error: 'Amount is required' };
    }
    
    if (amount < min) {
        return { isValid: false, error: `Minimum amount is ${formatMoney(min)}` };
    }
    
    if (amount > max) {
        return { isValid: false, error: `Maximum amount is ${formatMoney(max)}` };
    }
    
    return { isValid: true, error: null };
};

/**
 * Validate billing address
 * @param {Object} address - Address object
 * @returns {Object} { isValid, errors }
 */
export const validateBillingAddress = (address) => {
    const errors = {};
    
    if (!address.fullName) {
        errors.fullName = 'Full name is required';
    }
    
    if (!address.email) {
        errors.email = 'Email is required';
    } else {
        const emailValidation = validateEmail(address.email);
        if (!emailValidation.isValid) {
            errors.email = emailValidation.error;
        }
    }
    
    if (!address.country) {
        errors.country = 'Country is required';
    }
    
    if (!address.city) {
        errors.city = 'City is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate promo code format
 * @param {string} code - Promo code
 * @returns {Object} { isValid, error }
 */
export const validatePromoCode = (code) => {
    if (!code) {
        return { isValid: false, error: 'Promo code is required' };
    }
    
    const promoRegex = /^[A-Z0-9]{6,20}$/i;
    if (!promoRegex.test(code)) {
        return { isValid: false, error: 'Invalid promo code format' };
    }
    
    return { isValid: true, error: null };
};