import { BaseStructureService, withRetry } from './base.service';
import { INTERIM_ASSIGNMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class InterimAssignmentService extends BaseStructureService {
  constructor() {
    super('interim-assignments');
  }

  async getByEmployee(userId) {
    if (!userId) throw new Error('Employee user ID is required');
    return withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.BY_EMPLOYEE(userId)));
  }

  async getActive() {
    return withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.ACTIVE));
  }

  async getExpiringSoon(days) {
    return withRetry(() => this.apiClient.get(INTERIM_ASSIGNMENT_ENDPOINTS.EXPIRING_SOON, { params: { days } }));
  }

  async assign(data) {
    if (!data) throw new Error('Assignment data is required');
    return withRetry(() => this.apiClient.post(INTERIM_ASSIGNMENT_ENDPOINTS.ASSIGN, data));
  }

  async end(data) {
    if (!data) throw new Error('End data is required');
    return withRetry(() => this.apiClient.post(INTERIM_ASSIGNMENT_ENDPOINTS.END, data));
  }
}

export const interimAssignmentService = new InterimAssignmentService();
export { InterimAssignmentService };