import api from '../api/client';

export const organisationService = {
  getCurrent: () => {
    console.log("organisationService: Calling /organisations/tenants/current/")
    return api.get('/organisations/tenants/current/')
  },
  getLocations: () => api.get('/organisations/locations/'),
  getDepartments: () => api.get('/organisations/departments/'),
  getPositions: () => api.get('/organisations/positions/'),
  getDocuments: () => api.get('/organisations/documents/')
};
