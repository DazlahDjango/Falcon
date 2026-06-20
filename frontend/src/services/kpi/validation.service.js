import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  VALIDATION_ENDPOINTS,
  REJECTION_REASON_ENDPOINTS,
  ESCALATION_ENDPOINTS,
} from '../api/endpoints';

class ValidationService extends BaseKPIService {
  constructor() {
    super('validations');
  }

  // ============ Validations ============
  async getValidations(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(VALIDATION_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getPendingValidations(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(VALIDATION_ENDPOINTS.PENDING, { params });
      return response;
    });
  }

  async getPendingSummary(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(VALIDATION_ENDPOINTS.PENDING_SUMMARY, { params });
      return response;
    });
  }

  // ============ Rejection Reasons ============
  async getRejectionReasons(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(REJECTION_REASON_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async createRejectionReason(data) {
    if (!data) throw new Error('Rejection reason data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(REJECTION_REASON_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateRejectionReason(id, data) {
    if (!id) throw new Error('Rejection reason ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(REJECTION_REASON_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteRejectionReason(id) {
    if (!id) throw new Error('Rejection reason ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(REJECTION_REASON_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  // ============ Escalations ============
  async getEscalations(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ESCALATION_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getEscalation(id) {
    if (!id) throw new Error('Escalation ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(ESCALATION_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createEscalation(actualId, escalatedToId, reason) {
    if (!actualId) throw new Error('Actual ID is required');
    if (!escalatedToId) throw new Error('Escalated to user ID is required');
    if (!reason) throw new Error('Reason is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ESCALATION_ENDPOINTS.CREATE, {
        actual: actualId,
        escalated_to: escalatedToId,
        reason,
      });
      return response;
    });
  }

  async resolveEscalation(id, resolution) {
    if (!id) throw new Error('Escalation ID is required');
    if (!resolution) throw new Error('Resolution is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ESCALATION_ENDPOINTS.RESOLVE(id), { resolution });
      return response;
    });
  }

  async getMyEscalations(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ESCALATION_ENDPOINTS.MY_ESCALATIONS, { params });
      return response;
    });
  }
}

export const validationService = new ValidationService();