import { setItem, getItem, removeItem } from "./localStorage";

const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_ENCRYPT_KEY || 'falcon-pms-secure-key-2024';

const stringToArrayBuffer = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
};
const arrayBufferToString = (buffer) => {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
}
const getEncryptionKey = async () => {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        stringToArrayBuffer(ENCRYPTION_KEY),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    const salt = stringToArrayBuffer('falcon-salt');
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt, 
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};
export const  encrypt = async (data) => {
    try {
        const key = await getEncryptionKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv},
            key,
            stringToArrayBuffer(data)
        );
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        return data;
    }
};
export const decrypt = async (encryptedData) => {
    try {
        const key = await getEncryptionKey();
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        
        return arrayBufferToString(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedData;
    }
};

// Token Management
// =================
let cachedTokens = {
    access: null,
    refresh: null
};
export const setTokens = async (accessToken, refreshToken) => {
    cachedTokens.access = accessToken;
    cachedTokens.refresh = refreshToken;
    await setItem('access_token', accessToken, true);
    await setItem('refresh_token', refreshToken, true);
};
export const getAccessToken = async () => {
    if (cachedTokens.access) return cachedTokens.access;
    return await getItem('access_token', true);
};
export const getRefreshToken = async () => {
    if (cachedTokens.refresh) return cachedTokens.refresh;
    return await getItem('refresh_token', true);
};
export const clearTokens = async () => {
    cachedTokens.access = null;
    cachedTokens.refresh = null;
    await removeItem('access_token');
    await removeItem('refresh_token');
};
import { setItem as lsSet, getItem as lsGet, removeItem as lsRemove } from './localStorage';
import { setItem as ssSet, getItem as ssGet, removeItem as ssRemove } from './sessionStorage';
export const setPersistentItem = async (key, value, encryptValue = false) => {
    if (encryptValue) {
        const encrypted = await encrypt(JSON.stringify(value));
        return lsSet(key, encrypted, false);
    }
    return lsSet(key, value, false);
};
export const getPersistentItem = async (key, decryptValue = false) => {
    const data = lsGet(key);
    if (decryptValue && data) {
        const decrypted = await decrypt(data);
        return JSON.parse(decrypted);
    }
    return data;
};
export const setSessionItem = async (key, value, encryptValue = false) => {
    if (encryptValue) {
        const encrypted = await encrypt(JSON.stringify(value));
        return ssSet(key, encrypted, false);
    }
    return ssSet(key, value, false);
};
export const getSessionItem = async (key, decryptValue = false) => {
    const data = ssGet(key);
    if (decryptValue && data) {
        const decrypted = await decrypt(data);
        return JSON.parse(decrypted);
    }
    return data;
};
export { setItem as setLocalItem, getItem as getLocalItem, removeItem as removeLocalItem } from './localStorage';
export { setItem as setSessionItemSimple, getItem as getSessionItemSimple, removeItem as removeSessionItem } from './sessionStorage';