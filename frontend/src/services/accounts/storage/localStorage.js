import { encrypt, decrypt } from './secureStorage';

const PREFIX = 'falcon_';

export const setItem = (key, value, encryptValue = false) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        if (encryptValue) {
            return encrypt(JSON.stringify(value))
                .then((encrypted) => {
                    localStorage.setItem(fullKey, encrypted);
                    return true;
                })
                .catch((error) => {
                    console.error('localStorage setItem error:', error);
                    return false;
                });
        }

        let data = value;
        if (typeof value === 'object') {
            data = JSON.stringify(value);
        }
        localStorage.setItem(fullKey, data);
        return true;
    } catch (error) {
        console.error('localStorage setItem error:', error);
        return false;
    }
};
export const getItem = (key, decryptValue = false) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        const data = localStorage.getItem(fullKey);
        if (!data) return null;
        if (decryptValue) {
            return decrypt(data)
                .then((decrypted) => {
                    try {
                        return JSON.parse(decrypted);
                    } catch {
                        return decrypted;
                    }
                })
                .catch((error) => {
                    console.error('localStorage getItem error:', error);
                    removeItem(key);
                    return null;
                });
        }
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
    }
};

export const removeItem = (key) => {
    try {
        const fullKey = `${PREFIX}${key}`;
        localStorage.removeItem(fullKey);
        return true;
    } catch (error) {
        console.error('localStorage removeItem error:', error);
        return false;
    }
};

export const clearAppData = () => {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('localStorage clear error:', error);
        return false;
    }
};

export const isAvailable = () => {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};