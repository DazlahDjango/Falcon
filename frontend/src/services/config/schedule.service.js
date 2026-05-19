import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class ScheduleService extends BaseConfigService {
  constructor() {
    super('schedules');
  }
  async getSchedules(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.SCHEDULES, { params }));
  }
  async getSchedule(scheduleId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.SCHEDULES}/${scheduleId}/`));
  }
  async createSchedule(data) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.SCHEDULES, data));
  }
  async updateSchedule(scheduleId, data) {
    return this.withRetry(() => this.apiClient.patch(`${CONFIG_API.SCHEDULES}/${scheduleId}/`, data));
  }
  async deleteSchedule(scheduleId) {
    return this.withRetry(() => this.apiClient.delete(`${CONFIG_API.SCHEDULES}/${scheduleId}/`));
  }
  async executeDueSchedules() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.EXECUTE_DUE_SCHEDULES));
  }
  async validateCronExpression(cronExpression) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.EVALUATE_CRON, { cron_expression: cronExpression }));
  }
  async getScheduleStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_SCHEDULING, { params }));
  }
}

export const scheduleService = new ScheduleService();