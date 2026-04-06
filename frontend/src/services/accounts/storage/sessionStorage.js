import { encrypt, decrypt } from './secureStorage';

const PREFIX = 'falcon_session_';

export const setItem = (key, value, encryptValue = false) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        let data = value;
        
        if (encryptValue) {
            data = encrypt(JSON.stringify(value));
        } else if (typeof value === 'object') {
            data = JSON.stringify(value);
        }
        
        sessionStorage.setItem(fullKey, data);
        return true;
    } catch (error) {
        console.error('sessionStorage setItem error:', error);
        return false;
    }
};

export const getItem = (key, decryptValue = false) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        const data = sessionStorage.getItem(fullKey);
        if (!data) return null;
        if (decryptValue) {
            return JSON.parse(decrypt(data));
        }
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    } catch (error) {
        console.error('sessionStorage getItem error:', error);
        return null;
    }
};

export const removeItem = (key) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        sessionStorage.removeItem(fullKey);
        return true;
    } catch (error) {
        console.error('sessionStorage removeItem error:', error);
        return false;
    }
};

export const clearAppData = () => {
    try {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('sessionStorage clear error:', error);
        return false;
    }
};

export const isAvailable = () => {
    try {
        const testKey = '__test__';
        sessionStorage.setItem(testKey, testKey);
        sessionStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};