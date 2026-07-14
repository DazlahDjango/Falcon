import { BaseStructureService, withRetry } from './base.service';
import { INTERIM_ASSIGNMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class InterimAssignmentService extends BaseStructureService {
  constructor() {
    super('interim-assignments');
  }

  async getByEmployee(userId) {
    if (!userId) throw new Error('Employee user ID is required');
    const response = await withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.BY_EMPLOYEE(userId)));
    return this.unwrap(response);
  }

  async getActive() {
    const response = await withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.ACTIVE));
    return this.unwrap(response);
  }

  async getExpiringSoon(days) {
    const response = await withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.EXPIRING_SOON, { params: { days } }));
    return this.unwrap(response);
  }

  async assign(data) {
    if (!data) throw new Error('Assignment data is required');
    const response = await withRetry(() => this.apiClient.post(INTERIM_ASSIGNMENT_ENDPOINTS.ASSIGN, data));
    return this.unwrap(response);
  }

  async end(data) {
    if (!data) throw new Error('End data is required');
    const response = await withRetry(() => this.apiClient.post(INTERIM_ASSIGNMENT_ENDPOINTS.END, data));
    return this.unwrap(response);
  }
}

export const interimAssignmentService = new InterimAssignmentService();
export { InterimAssignmentService };
