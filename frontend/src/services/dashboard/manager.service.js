// frontend/src/services/dashboard/manager.service.js

import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class ManagerService extends BaseDashboardService {
  constructor() {
    super('manager');
  }

  /**
   * Get manager dashboard data
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period (current, monthly, quarterly, yearly)
   * @param {boolean} params.includeTeam - Include team members
   * @param {string} params.userId - Drill down to specific user
   */
  async getDashboardData(params = {}) {
    const { period = 'current', includeTeam = true, userId } = params;
    const queryParams = new URLSearchParams();
    
    if (period) queryParams.append('period', period);
    if (includeTeam) queryParams.append('include_team', 'true');
    if (userId) queryParams.append('user_id', userId);
    
    const url = `${DASHBOARD_API.MANAGER.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.apiClient.get(url);
  }

  /**
   * Get team members list
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  async getTeamMembers(userId = null) {
    const url = userId 
      ? `${DASHBOARD_API.MANAGER.TEAM_MEMBERS}?user_id=${userId}`
      : DASHBOARD_API.MANAGER.TEAM_MEMBERS;
    return this.apiClient.get(url);
  }

  /**
   * Get team summary
   */
  async getTeamSummary() {
    return this.apiClient.get(DASHBOARD_API.MANAGER.TEAM_SUMMARY);
  }

  /**
   * Get pending approvals for manager
   */
  async getPendingApprovals() {
    return this.apiClient.get(DASHBOARD_API.MANAGER.PENDING_APPROVALS);
  }

  /**
   * Approve a submission
   * @param {string} submissionId - Submission ID
   * @param {string} comments - Approval comments
   */
  async approveSubmission(submissionId, comments = '') {
    return this.apiClient.post(DASHBOARD_API.MANAGER.APPROVE, {
      submission_id: submissionId,
      comments
    });
  }

  /**
   * Reject a submission
   * @param {string} submissionId - Submission ID
   * @param {string} comments - Rejection comments
   */
  async rejectSubmission(submissionId, comments) {
    return this.apiClient.put(DASHBOARD_API.MANAGER.REJECT, {
      submission_id: submissionId,
      comments
    });
  }

  /**
   * Drill down to specific user
   * @param {string} userId - User ID to drill down to
   * @param {string} period - Period
   */
  async drillDown(userId, period = 'current') {
    const url = DASHBOARD_API.MANAGER.DRILL_DOWN(userId);
    return this.apiClient.get(`${url}?period=${period}`);
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    return this.apiClient.post(DASHBOARD_API.MANAGER.REFRESH);
  }
}

export default new ManagerService();