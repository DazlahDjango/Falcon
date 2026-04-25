/**
 * SessionStorage utilities
 */

/**
 * Set item in sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setSessionStorage = (key, value) => {
    try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error setting sessionStorage:', error);
    }
};

/**
 * Get item from sessionStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value
 */
export const getSessionStorage = (key, defaultValue = null) => {
    try {
        const serialized = sessionStorage.getItem(key);
        if (serialized === null) return defaultValue;
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Error getting sessionStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove item from sessionStorage
 * @param {string} key - Storage key
 */
export const removeSessionStorage = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing sessionStorage:', error);
    }
};

/**
 * Clear all sessionStorage
 */
export const clearSessionStorage = () => {
    try {
        sessionStorage.clear();
    } catch (error) {
        console.error('Error clearing sessionStorage:', error);
    }
};

/**
 * Check if key exists in sessionStorage
 * @param {string} key - Storage key
 * @returns {boolean} Whether key exists
 */
export const hasSessionStorage = (key) => {
    return sessionStorage.getItem(key) !== null;
};