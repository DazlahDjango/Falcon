/**
 * URL Utilities
 * Functions for URL manipulation
 */

/**
 * Parse query string into object
 * @param {string} queryString - Query string (e.g., ?key=value)
 * @returns {Object} Parsed query parameters
 */
export const parseQueryString = (queryString) => {
    const params = {};
    const search = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    
    if (!search) return params;
    
    search.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    
    return params;
};

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Query string (e.g., ?key=value)
 */
export const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
        }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Update URL query params without page reload
 * @param {Object} params - New query parameters
 * @param {boolean} replace - Use replace instead of push
 */
export const updateQueryParams = (params, replace = false) => {
    const newUrl = `${window.location.pathname}${buildQueryString(params)}`;
    
    if (replace) {
        window.history.replaceState({}, '', newUrl);
    } else {
        window.history.pushState({}, '', newUrl);
    }
};

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
export const getQueryParam = (name) => {
    const params = parseQueryString(window.location.search);
    return params[name] || null;
};

/**
 * Remove URL parameter
 * @param {string} name - Parameter to remove
 */
export const removeQueryParam = (name) => {
    const params = parseQueryString(window.location.search);
    delete params[name];
    updateQueryParams(params, true);
};

/**
 * Get full URL with protocol and domain
 * @returns {string} Full URL
 */
export const getFullUrl = () => {
    return window.location.href;
};

/**
 * Get base URL (without query params)
 * @returns {string} Base URL
 */
export const getBaseUrl = () => {
    return window.location.origin + window.location.pathname;
};

/**
 * Check if URL is external
 * @param {string} url - URL to check
 * @returns {boolean} Whether URL is external
 */
export const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};