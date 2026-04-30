import { BaseStructureService, withRetry } from './base.service';

export class StructureSearchService extends BaseStructureService {
  constructor() {
    super('search');
  }

  async globalSearch(query, params = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/global/', {
        params: { q: query, ...params },
      });
      return response;
    });
  }

  async searchDepartments(query, params = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/departments/', {
        params: { search: query, ...params },
      });
      return response;
    });
  }

  async searchTeams(query, params = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/teams/', {
        params: { search: query, ...params },
      });
      return response;
    });
  }

  async searchPositions(query, params = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/positions/', {
        params: { search: query, ...params },
      });
      return response;
    });
  }

  async searchEmployments(query, params = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/employments/', {
        params: { search: query, ...params },
      });
      return response;
    });
  }

  async advancedSearch(filters) {
    if (!filters.entity_type) throw new Error('Entity type is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/advanced/', filters);
      return response;
    });
  }
  
  async getSuggestions(partial) {
    if (!partial || partial.trim().length < 2) {
      return { suggestions: [] };
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/suggestions/', {
        params: { q: partial },
      });
      return response;
    });
  }
  
  async getTypeahead(query, entityTypes = ['departments', 'teams', 'positions']) {
    if (!query || query.trim().length < 2) {
      return { results: [] };
    }
    return withRetry(async () => {
      const response = await this.apiClient.get('/typeahead/', {
        params: { q: query, types: entityTypes.join(',') },
      });
      return response;
    });
  }
}

export const structureSearchService = new StructureSearchService();