/**
 * LocalStorage utilities
 */

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setLocalStorage = (key, value) => {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
};

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value
 */
export const getLocalStorage = (key, defaultValue = null) => {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return defaultValue;
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing localStorage:', error);
    }
};

/**
 * Clear all localStorage
 */
export const clearLocalStorage = () => {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
};

/**
 * Check if key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Whether key exists
 */
export const hasLocalStorage = (key) => {
    return localStorage.getItem(key) !== null;
};

/**
 * Get all keys from localStorage
 * @returns {Array} Array of keys
 */
export const getLocalStorageKeys = () => {
    return Object.keys(localStorage);
};