import { organisationApi, departmentApi, locationApi, documentApi } from './api';

export const organisationService = {
  async getCurrent() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return { data: null };
    }
    const response = await organisationApi.getAll();
    const organisations = response.data?.results || response.data || [];
    return { data: organisations[0] || null };
  },
  
  async getLocations() {
    const response = await locationApi.getAll();
    return response;
  },

  async getDepartments() {
    const response = await departmentApi.getAll();
    return response;
  },

  async getDocuments() {
    const response = await documentApi.getAll();
    return response;
  },

  async updateOrganisation(id, data) {
    const response = await organisationApi.update(id, data);
    return response;
  }
};