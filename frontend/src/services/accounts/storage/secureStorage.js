import { setItem, getItem, removeItem } from "./localStorage";
import { encrypt, decrypt } from "./crypto";

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

// Exports for other components if needed
export { encrypt, decrypt };
export { setItem as setLocalItem, getItem as getLocalItem, removeItem as removeLocalItem } from './localStorage';
export { setItem as setSessionItem, getItem as getSessionItem, removeItem as removeSessionItem } from './sessionStorage';