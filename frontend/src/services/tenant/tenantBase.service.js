import { tenantApiClient, withRetry } from '../api';
import { auditLog } from './auditService';
import { encryptData, decryptData } from '../security/encryptionService';
import TENANT_API_ENDPOINTS from '../../config/constants/tenantConstants';

const apiClient = tenantApiClient;

const logAudit = async (action, resource, resourceId, details = {}) => {
    try {
        await auditLog({
            action,
            resource,
            resourceId,
            service: 'tenant',
            timestamp: new Date().toISOString(),
            ...details,
        });
    } catch (error) {
        console.error('[TenantService] Audit log failed:', error);
    }
};

const encryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret'];
    const encrypted = { ...data };
    sensitiveFields.forEach((field) => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });
    return encrypted;
};

const decryptSensitiveData = (data) => {
    const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'client_secret'];
    const decrypted = { ...data };
    sensitiveFields.forEach((field) => {
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

class BaseTenantService {
    constructor(resourceName) {
        if (!resourceName) {
            throw new Error('Resource name is required');
        }
        this.resourceName = resourceName;
        this.apiClient = apiClient;
        this.withRetry = withRetry;
        this.encryptSensitiveData = encryptSensitiveData;
        this.decryptSensitiveData = decryptSensitiveData;
        this.logAudit = logAudit;
    }

    getEndpoint(endpoint = '') {
        const endpointsMap = {
            tenants: () => TENANT_API_ENDPOINTS.TENANT.LIST,
            domains: () => TENANT_API_ENDPOINTS.DOMAIN.LIST,
            backups: () => TENANT_API_ENDPOINTS.BACKUP.LIST,
            migrations: () => TENANT_API_ENDPOINTS.MIGRATION.LIST,
            schemas: () => TENANT_API_ENDPOINTS.SCHEMA.LIST,
            health: () => '/health/',
            stats: () => '/stats/',
            provisioning: () => '/provisioning/',
            resources: () => '/resources/',
            audit: () => '/audit/',
        };
        const basePath = endpointsMap[this.resourceName];
        if (basePath) {
            const path = basePath();
            return endpoint ? `${path}${endpoint}` : path;
        }
        return `/${this.resourceName}/${endpoint}`;
    }

    getTenantEndpoint(tenantId, endpoint = '') {
        const endpointsMap = {
            domains: () => TENANT_API_ENDPOINTS.DOMAIN.TENANT_DOMAINS(tenantId),
            backups: () => TENANT_API_ENDPOINTS.BACKUP.TENANT_BACKUPS(tenantId),
            migrations: () => TENANT_API_ENDPOINTS.MIGRATION.TENANT_MIGRATIONS(tenantId),
            schemas: () => TENANT_API_ENDPOINTS.SCHEMA.TENANT_SCHEMAS(tenantId),
            resources: () => `/tenants/${tenantId}/resources/`,
            audit: () => `/tenants/${tenantId}/audit/`,
        };
        const getPath = endpointsMap[this.resourceName];
        if (getPath) {
            const path = getPath();
            return endpoint ? `${path}${endpoint}` : path;
        }
        const resourcePath = this.resourceName;
        return endpoint
            ? `/tenants/${tenantId}/${resourcePath}/${endpoint}`
            : `/tenants/${tenantId}/${resourcePath}/`;
    }

    async list(params = {}) {
        const sanitizedParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v != null && v !== ''),
        );
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(), { params: sanitizedParams }),
        );
    }

    async listForTenant(tenantId, params = {}) {
        if (!tenantId) throw new Error('Tenant ID is required');
        const sanitizedParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v != null && v !== ''),
        );
        return this.withRetry(() =>
            this.apiClient.get(this.getTenantEndpoint(tenantId), { params: sanitizedParams }),
        );
    }

    async getById(id, params = {}) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/`), { params }),
        );
    }

    async getForTenant(tenantId, resourceId, params = {}) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getTenantEndpoint(tenantId, `${resourceId}/`), { params }),
        );
    }

    async create(data, encrypt = true) {
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        return this.withRetry(() => this.apiClient.post(this.getEndpoint(), processedData));
    }

    async createForTenant(tenantId, data, encrypt = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        return this.withRetry(() =>
            this.apiClient.post(this.getTenantEndpoint(tenantId), processedData),
        );
    }

    async update(id, data, partial = true, encrypt = true) {
        if (!id) throw new Error('Resource ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() =>
            this.apiClient[method](this.getEndpoint(`${id}/`), processedData),
        );
    }

    async updateForTenant(tenantId, resourceId, data, partial = true, encrypt = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        if (!data || typeof data !== 'object') throw new Error('Valid data object is required');
        const processedData = encrypt ? encryptSensitiveData(data) : data;
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() =>
            this.apiClient[method](this.getTenantEndpoint(tenantId, `${resourceId}/`), processedData),
        );
    }

    async delete(id, soft = true) {
        if (!id) throw new Error('Resource ID is required');
        const url = soft ? this.getEndpoint(`${id}/soft-delete/`) : this.getEndpoint(`${id}/`);
        return this.withRetry(() => this.apiClient.delete(url));
    }

    async deleteForTenant(tenantId, resourceId, soft = true) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        const url = soft
            ? this.getTenantEndpoint(tenantId, `${resourceId}/soft-delete/`)
            : this.getTenantEndpoint(tenantId, `${resourceId}/`);
        return this.withRetry(() => this.apiClient.delete(url));
    }

    async restore(id) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() => this.apiClient.post(this.getEndpoint(`${id}/restore/`)));
    }

    async restoreForTenant(tenantId, resourceId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!resourceId) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.post(this.getTenantEndpoint(tenantId, `${resourceId}/restore/`)),
        );
    }

    async getStats(params = {}) {
        return this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), { params }));
    }

    async bulkOperation(operation, data) {
        if (!operation || !data) throw new Error('Operation and data are required');
        return this.withRetry(() =>
            this.apiClient.post(this.getEndpoint(`bulk/${operation}/`), data),
        );
    }

    async exportData(format = 'csv', params = {}) {
        const validFormats = ['csv', 'json', 'xlsx'];
        if (!validFormats.includes(format)) {
            throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
        }
        const responseType = format === 'json' ? 'json' : 'blob';
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`export/${format}/`), { params, responseType }),
        );
    }

    async getHistory(id, params = {}) {
        if (!id) throw new Error('Resource ID is required');
        return this.withRetry(() =>
            this.apiClient.get(this.getEndpoint(`${id}/history/`), { params }),
        );
    }

    async validate(data) {
        if (!data) throw new Error('Data to validate is required');
        return this.withRetry(() => this.apiClient.post(this.getEndpoint('validate/'), data));
    }
}

export {
    apiClient,
    withRetry,
    BaseTenantService,
    encryptSensitiveData,
    decryptSensitiveData,
    logAudit,
};

export default BaseTenantService;