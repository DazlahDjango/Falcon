import { BaseTenantService } from './tenantBase.service';
import { ORGANIZATION_ENDPOINTS, ADMIN_ORGANIZATION_ENDPOINTS } from '../../config/constants/tenantApiConstants';
import {
  validateOrganizationPayload,
  extractApiError,
} from './organization.utils';

class OrganizationService extends BaseTenantService {
  constructor() {
    super('organizations');
  }

  async getOrganizations(params = {}) {
    const sanitized = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ''),
    );
    return this.withRetry(() =>
      this.apiClient.get(ORGANIZATION_ENDPOINTS.LIST, { params: sanitized }),
    );
  }

  async getOrganization(id, params = {}) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.get(ORGANIZATION_ENDPOINTS.DETAIL(id), { params }),
    );
  }

  async getOrganizationBySlug(slug) {
    if (!slug) throw new Error('Organization slug is required');
    const response = await this.getOrganizations({ search: slug });
    const results = response.data?.results || response.data || [];
    const org = results.find((item) => item.slug === slug);
    if (!org) throw new Error(`Organization with slug "${slug}" not found`);
    return this.getOrganization(org.id);
  }

  async createOrganization(data) {
    if (!data) throw new Error('Organization data is required');
    validateOrganizationPayload(data);
    const isFormData = data instanceof FormData;
    return this.withRetry(() =>
      this.apiClient.post(ORGANIZATION_ENDPOINTS.CREATE, data, isFormData ? {} : undefined),
    );
  }

  async updateOrganization(id, data) {
    if (!id) throw new Error('Organization ID is required');
    if (!data) throw new Error('Update data is required');
    const isFormData = data instanceof FormData;
    if (!isFormData && (data.name !== undefined || data.contact_email !== undefined)) {
      validateOrganizationPayload(data);
    }
    return this.withRetry(() =>
      this.apiClient.patch(ORGANIZATION_ENDPOINTS.UPDATE(id), data, isFormData ? {} : undefined),
    );
  }

  async deleteOrganization(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(ORGANIZATION_ENDPOINTS.DELETE(id)),
    );
  }

  async onboardOrganization(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(ORGANIZATION_ENDPOINTS.ONBOARD(id)),
    );
  }

  async activateOrganization(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(ORGANIZATION_ENDPOINTS.ACTIVATE(id)),
    );
  }

  async suspendOrganization(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(ORGANIZATION_ENDPOINTS.SUSPEND(id)),
    );
  }

  async getProvisioningStatus(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.get(ORGANIZATION_ENDPOINTS.PROVISIONING_STATUS(id)),
    );
  }

  async getUsageSummary(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.get(ORGANIZATION_ENDPOINTS.USAGE_SUMMARY(id)),
    );
  }

  async forceSuspend(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(ADMIN_ORGANIZATION_ENDPOINTS.FORCE_SUSPEND(id)),
    );
  }

  async forceActivate(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(ADMIN_ORGANIZATION_ENDPOINTS.FORCE_ACTIVATE(id)),
    );
  }

  async forceDelete(id) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(ADMIN_ORGANIZATION_ENDPOINTS.FORCE_DELETE(id)),
    );
  }

  async getAdminOrganizations(params = {}) {
    const sanitized = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ''),
    );
    return this.withRetry(() =>
      this.apiClient.get(ADMIN_ORGANIZATION_ENDPOINTS.LIST, { params: sanitized }),
    );
  }

  async getAdminOrganization(id, params = {}) {
    if (!id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.get(ADMIN_ORGANIZATION_ENDPOINTS.DETAIL(id), { params }),
    );
  }
}

export const organizationService = new OrganizationService();
export { extractApiError };
