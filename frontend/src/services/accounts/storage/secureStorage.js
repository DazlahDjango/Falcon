import {
    setItem,
    getItem,
    removeItem,
    setItem as lsSet,
    getItem as lsGet,
} from './localStorage';
import { setItem as ssSet, getItem as ssGet, removeItem as ssRemove } from './sessionStorage';
import { encrypt, decrypt } from './crypto';

export { encrypt, decrypt };

// Token Management
// =================
let cachedTokens = {
    access: null,
    refresh: null
};
export const setTokens = async (accessToken, refreshToken) => {
    cachedTokens.access = accessToken;
    cachedTokens.refresh = refreshToken;
    try {
        await setItem('access_token', accessToken, true);
        await setItem('refresh_token', refreshToken, true);
        console.log('Tokens encrypted and saved successfully');
    } catch (error) {
        console.error('Error saving tokens:', error);
    }
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
    try {
        await removeItem('access_token');
        await removeItem('refresh_token');
    } catch (error) {
        console.error('Error clearing tokens:', error);
    }
};

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
// Tenant ID Management
// ====================
export const setTenantId = async (tenantId) => {
    try {
        if (tenantId) {
            await setItem('tenant_id', tenantId, true);
            console.log('Tenant ID saved successfully');
        }
    } catch (error) {
        console.error('Error saving tenant ID:', error);
    }
};

export const getTenantId = async () => {
    try {
        const tenantId = await getItem('tenant_id', true);
        return tenantId;
    } catch (error) {
        console.error('Error retrieving tenant ID:', error);
        return null;
    }
};

export const clearTenantId = async () => {
    try {
        await removeItem('tenant_id');
    } catch (error) {
        console.error('Error clearing tenant ID:', error);
    }
};

export { setItem as setLocalItem, getItem as getLocalItem, removeItem as removeLocalItem } from './localStorage';
export { setItem as setSessionItemSimple, getItem as getSessionItemSimple, removeItem as removeSessionItem } from './sessionStorage';
// Add setAccessToken function (alias for setTokens)
export const setAccessToken = async (accessToken) => {
    const refreshToken = await getRefreshToken();
    return setTokens(accessToken, refreshToken);
};

// Add setRefreshToken function
export const setRefreshToken = async (refreshToken) => {
    const accessToken = await getAccessToken();
    return setTokens(accessToken, refreshToken);
};
