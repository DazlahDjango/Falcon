import { BaseStructureService, withRetry } from './base.service';

export class LocationService extends BaseStructureService {
  constructor() {
    super('locations');
  }

  async getByCode(code) {
    if (!code) throw new Error('Location code is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/locations/by-code/${code}/`);
      return response;
    });
  }

  async getByCountry(country) {
    if (!country) throw new Error('Country is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/locations/by-country/${country}/`);
      return response;
    });
  }
 
  async getHeadquarters() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/locations/headquarters/');
      return response;
    });
  }
  
  async getSubLocations(id) {
    if (!id) throw new Error('Location ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/sub-locations/`));
      return response;
    });
  }

  async updateOccupancy(id, currentOccupancy) {
    if (!id) throw new Error('Location ID is required');
    if (currentOccupancy === undefined) throw new Error('Current occupancy is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(this.getEndpoint(`${id}/update-occupancy/`), {
        current_occupancy: currentOccupancy,
      });
      return response;
    });
  }

  async getTree(includeInactive = false) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/locations/tree/', {
        params: { include_inactive: includeInactive },
      });
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/locations/validate/', data);
      return response;
    });
  }
}

export const locationService = new LocationService();