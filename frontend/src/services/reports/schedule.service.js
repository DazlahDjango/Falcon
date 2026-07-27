import { ReportBaseService, withRetry } from './reportBase.service';
import { SCHEDULE_ENDPOINTS } from '../../config/constants/reportApiConstants';

class ScheduleService extends ReportBaseService {
  constructor() {
    super('schedules');
  }

  async getSchedules(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getSchedule(id) {
    if (!id) throw new Error('Schedule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createSchedule(data) {
    if (!data) throw new Error('Schedule data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(SCHEDULE_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateSchedule(id, data) {
    if (!id) throw new Error('Schedule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(SCHEDULE_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteSchedule(id) {
    if (!id) throw new Error('Schedule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(SCHEDULE_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async performAction(id, action) {
    if (!id) throw new Error('Schedule ID is required');
    if (!action) throw new Error('Action is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(SCHEDULE_ENDPOINTS.ACTION(id), { action });
      return response;
    });
  }

  async getScheduleHistory(id) {
    if (!id) throw new Error('Schedule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.HISTORY(id));
      return response;
    });
  }

  async getUpcomingRuns(id) {
    if (!id) throw new Error('Schedule ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.UPCOMING(id));
      return response;
    });
  }

  async getDueSchedules() {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.DUE);
      return response;
    });
  }

  async getOverdueSchedules() {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.OVERDUE);
      return response;
    });
  }

  async getFrequencies() {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCHEDULE_ENDPOINTS.FREQUENCIES);
      return response;
    });
  }
}

export const scheduleService = new ScheduleService();

