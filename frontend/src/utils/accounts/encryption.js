/**
 * Encryption - Client-side encryption utilities
 */

// ============================================================================
// Constants
// ============================================================================

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'falcon-pms-secure-key';
const SALT = 'falcon-salt-v1';

// ============================================================================
// Helper Functions
// ============================================================================

const stringToArrayBuffer = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
};

const arrayBufferToString = (buffer) => {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
};

const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// ============================================================================
// Key Derivation
// ============================================================================

const deriveKey = async (password, salt) => {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        stringToArrayBuffer(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: stringToArrayBuffer(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

// ============================================================================
// Encryption/Decryption
// ============================================================================

export const encrypt = async (data, key = ENCRYPTION_KEY) => {
    try {
        const encryptionKey = await deriveKey(key, SALT);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encodedData = stringToArrayBuffer(JSON.stringify(data));
        
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            encryptionKey,
            encodedData
        );
        
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        return arrayBufferToBase64(combined);
    } catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
};

export const decrypt = async (encryptedData, key = ENCRYPTION_KEY) => {
    try {
        const combined = base64ToArrayBuffer(encryptedData);
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        
        const encryptionKey = await deriveKey(key, SALT);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            encryptionKey,
            data
        );
        
        return JSON.parse(arrayBufferToString(decrypted));
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

// ============================================================================
// Hash Functions
// ============================================================================

export const sha256 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hash);
};

export const sha512 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    return arrayBufferToBase64(hash);
};

// ============================================================================
// Random Generation
// ============================================================================

export const generateRandomBytes = (length) => {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
};

export const generateRandomString = (length = 32) => {
    const bytes = generateRandomBytes(length);
    return arrayBufferToBase64(bytes).replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
};

export const generateToken = () => {
    return generateRandomString(64);
};

// ============================================================================
// Secure Storage Helpers
// ============================================================================

export const secureSet = async (key, value) => {
    const encrypted = await encrypt(value);
    if (encrypted) {
        localStorage.setItem(`secure_${key}`, encrypted);
        return true;
    }
    return false;
};

export const secureGet = async (key) => {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (encrypted) {
        return await decrypt(encrypted);
    }
    return null;
};

export const secureRemove = (key) => {
    localStorage.removeItem(`secure_${key}`);
};