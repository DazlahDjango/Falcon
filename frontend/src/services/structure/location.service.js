import { BaseStructureService, withRetry } from './base.service';
import { LOCATION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class LocationService extends BaseStructureService {
  constructor() {
    super('locations');
  }

  async getByCode(code) {
    if (!code) throw new Error('Location code is required');
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.BY_CODE(code)));
  }

  async getByCountry(country) {
    if (!country) throw new Error('Country is required');
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.BY_COUNTRY(country)));
  }

  async getByOrgUnit(orgUnitId) {
    if (!orgUnitId) throw new Error('Organization unit ID is required');
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.BY_ORG_UNIT(orgUnitId)));
  }

  async getHeadquarters() {
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.HEADQUARTERS));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.STATS));
  }

  async getSubLocations(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(LOCATION_ENDPOINTS.SUB_LOCATIONS(id)));
  }

  async updateOccupancy(id, occupancy) {
    if (!id) throw new Error('ID is required');
    if (occupancy === undefined || occupancy === null) throw new Error('Occupancy is required');
    return withRetry(() => this.apiClient.post(LOCATION_ENDPOINTS.UPDATE_OCCUPANCY(id), { current_occupancy: occupancy }));
  }
}

export const locationService = new LocationService();
export { LocationService };