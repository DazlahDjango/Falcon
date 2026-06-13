import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  ACTUAL_ENDPOINTS,
  EVIDENCE_ENDPOINTS,
  ACTUAL_ADJUSTMENT_ENDPOINTS,
} from '../api/endpoints';

class ActualService extends BaseKPIService {
  constructor() {
    super('actuals');
  }

  // ============ Monthly Actuals ============
  async getActuals(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ACTUAL_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getActual(id) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(ACTUAL_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createActual(data, evidenceFile = null) {
    if (!data) throw new Error('Actual data is required');
    return withRetry(async () => {
      let response;
      if (evidenceFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        formData.append('evidence', evidenceFile);
        response = await this.apiClient.post(ACTUAL_ENDPOINTS.CREATE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await this.apiClient.post(ACTUAL_ENDPOINTS.CREATE, data);
      }
      return response;
    });
  }

  async updateActual(id, data) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(ACTUAL_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteActual(id) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(ACTUAL_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async submitActual(id) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ENDPOINTS.SUBMIT(id));
      return response;
    });
  }

  async approveActual(id, comment = '') {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ENDPOINTS.APPROVE(id), { comment });
      return response;
    });
  }

  async rejectActual(id, reasonId, comment = '') {
    if (!id) throw new Error('Actual ID is required');
    if (!reasonId) throw new Error('Rejection reason ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ENDPOINTS.REJECT(id), {
        reason_id: reasonId,
        comment,
      });
      return response;
    });
  }

  async resubmitActual(id, actualValue, notes = '') {
    if (!id) throw new Error('Actual ID is required');
    if (actualValue === undefined) throw new Error('Actual value is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ENDPOINTS.RESUBMIT(id), {
        actual_value: actualValue,
        notes,
      });
      return response;
    });
  }

  async getActualEvidence(id) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(ACTUAL_ENDPOINTS.EVIDENCE(id));
      return response;
    });
  }

  async getActualValidations(id) {
    if (!id) throw new Error('Actual ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(ACTUAL_ENDPOINTS.VALIDATIONS(id));
      return response;
    });
  }

  // ============ Evidence ============
  async uploadEvidence(actualId, file, evidenceType, description = '') {
    if (!actualId) throw new Error('Actual ID is required');
    if (!file) throw new Error('File is required');
    const formData = new FormData();
    formData.append('actual', actualId);
    formData.append('evidence_type', evidenceType);
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    return withRetry(async () => {
      const response = await this.apiClient.post(EVIDENCE_ENDPOINTS.CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    });
  }

  async deleteEvidence(id) {
    if (!id) throw new Error('Evidence ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(EVIDENCE_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  // ============ Actual Adjustments ============
  async getAdjustments(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(ACTUAL_ADJUSTMENT_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async createAdjustment(originalActualId, adjustedValue, reason) {
    if (!originalActualId) throw new Error('Original actual ID is required');
    if (adjustedValue === undefined) throw new Error('Adjusted value is required');
    if (!reason) throw new Error('Reason is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ADJUSTMENT_ENDPOINTS.CREATE, {
        original_actual: originalActualId,
        adjusted_value: adjustedValue,
        reason,
      });
      return response;
    });
  }

  async approveAdjustment(id) {
    if (!id) throw new Error('Adjustment ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(ACTUAL_ADJUSTMENT_ENDPOINTS.APPROVE(id));
      return response;
    });
  }
}

export const actualService = new ActualService();