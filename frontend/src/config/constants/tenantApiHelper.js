// services/tenantApiHelper.js
import { TENANT_API_CONFIG, TENANT_API_ENDPOINTS, TENANT_QUERY_PARAMS } from '../constants/tenantConstants';

/**
 * Build full URL for tenant API endpoints
 * @param {string} endpoint - The endpoint path
 * @param {Object} params - Query parameters to append
 * @returns {string} Full URL with query parameters
 */
export const buildTenantUrl = (endpoint, params = {}) => {
    let url = `${TENANT_API_CONFIG.BASE_URL}${endpoint}`;

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();
    if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
};

/**
 * Helper function to replace path parameters in endpoint
 * @param {Function|string} endpoint - Endpoint function or string
 * @param {Object} params - Path parameters
 * @returns {string} Endpoint with replaced parameters
 */
export const resolveEndpoint = (endpoint, params = {}) => {
    if (typeof endpoint === 'function') {
        return endpoint(...Object.values(params));
    }
    return endpoint;
};

// Export query params for easy access
export { TENANT_QUERY_PARAMS };