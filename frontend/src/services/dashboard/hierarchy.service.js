import { BaseDashboardService } from './dashboard.service';

class HierarchyService extends BaseDashboardService {
  constructor() {
    super('hierarchy');
  }

  async getTeam(userId = null, includeSelf = false) {
    const params = {};
    if (userId) params.user_id = userId;
    params.include_self = includeSelf;
    return this.withRetry(() => this.apiClient.get('/hierarchy/team', { params }));
  }

  async getTeamAggregate(userId = null) {
    const params = {};
    if (userId) params.user_id = userId;
    return this.withRetry(() => this.apiClient.get('/hierarchy/team-aggregate', { params }));
  }

  async drillDown(targetUserId) {
    if (!targetUserId) throw new Error('Target user ID is required');
    return this.withRetry(() => this.apiClient.get(`/hierarchy/drill-down/${targetUserId}`));
  }

  async getOrgTree(rootUserId = null) {
    const params = {};
    if (rootUserId) params.root_user_id = rootUserId;
    return this.withRetry(() => this.apiClient.get('/hierarchy/org-tree', { params }));
  }

  async getReportingChain(userId = null, includeSelf = false) {
    const params = {};
    if (userId) params.user_id = userId;
    params.include_self = includeSelf;
    return this.withRetry(() => this.apiClient.get('/hierarchy/reporting-chain', { params }));
  }

  async getTeamMembers(userId) {
    if (!userId) throw new Error('User ID is required');
    return this.withRetry(() => this.apiClient.get(`/hierarchy/team/${userId}`));
  }
}

export const hierarchyService = new HierarchyService();