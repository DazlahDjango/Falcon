// frontend/src/services/security/encryptionService.js

/**
 * Simple encryption service for sensitive data
 * For production, use a proper encryption library like crypto-js
 */

// Simple encode/decode for demo purposes
export const encryptData = (data) => {
    if (!data) return data;
    try {
        const jsonString = JSON.stringify(data);
        return btoa(encodeURIComponent(jsonString));
    } catch (error) {
        console.error('Encryption failed:', error);
        return data;
    }
};

export const decryptData = (encryptedData) => {
    if (!encryptedData) return encryptedData;
    try {
        const decoded = atob(encryptedData);
        return JSON.parse(decodeURIComponent(decoded));
    } catch (error) {
        console.error('Decryption failed:', error);
        return encryptedData;
    }
};

export const encryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret', 'password'];
    const encrypted = { ...data };
    
    sensitiveFields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });
    
    return encrypted;
};

export const decryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret', 'password'];
    const decrypted = { ...data };
    
    sensitiveFields.forEach(field => {
        if (decrypted[field]) {
            try {
                decrypted[field] = decryptData(decrypted[field]);
            } catch (error) {
                console.error(`Failed to decrypt ${field}:`, error);
            }
        }
    });
    
    return decrypted;
};

export default {
    encryptData,
    decryptData,
    encryptSensitiveData,
    decryptSensitiveData,
};
