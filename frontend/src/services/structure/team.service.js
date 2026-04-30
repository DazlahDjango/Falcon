import { BaseStructureService, withRetry } from './base.service';

export class TeamService extends BaseStructureService {
  constructor() {
    super('teams');
  }

  async getByCode(code) {
    if (!code) throw new Error('Team code is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/teams/by-code/${code}/`);
      return response;
    });
  }

  async getByDepartment(departmentId, params = {}) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/teams/by-department/${departmentId}/`, { params });
      return response;
    });
  }

  async getMembers(id) {
    if (!id) throw new Error('Team ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/members/`));
      return response;
    });
  }

  async addMember(id, userId) {
    if (!id) throw new Error('Team ID is required');
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(this.getEndpoint(`${id}/add-member/`), { user_id: userId });
      return response;
    });
  }
  
  async removeMember(id, userId) {
    if (!id) throw new Error('Team ID is required');
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(this.getEndpoint(`${id}/remove-member/`), { user_id: userId });
      return response;
    });
  }

  async getHierarchy(departmentId, params = {}) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/team-hierarchies/full/${departmentId}/`, { params });
      return response;
    });
  }

  async getSubtree(teamId) {
    if (!teamId) throw new Error('Team ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/team-hierarchies/subtree/${teamId}/`);
      return response;
    });
  }
  
  async getRootTeams(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get('/team-hierarchies/', {
        params: { department_id: departmentId },
      });
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/teams/validate/', data);
      return response;
    });
  }
}

export const teamService = new TeamService();