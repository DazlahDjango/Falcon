// Organisation Contacts Service
// Handles organisation contact management

import api from './api';

export const contactApi = {
  // Get all contacts
  getAll: (params) => api.get('/organisations/contacts/', { params }),

  // Get contact by ID
  getById: (id) => api.get(`/organisations/contacts/${id}/`),

  // Create contact
  create: (data) => api.post('/organisations/contacts/', data),

  // Update contact
  update: (id, data) => api.patch(`/organisations/contacts/${id}/`, data),

  // Delete contact
  delete: (id) => api.delete(`/organisations/contacts/${id}/`),

  // Get contact types
  getTypes: () => api.get('/organisations/contacts/types/'),

  // Bulk import contacts
  bulkImport: (data) => api.post('/organisations/contacts/bulk-import/', data),

  // Export contacts
  export: (params) => api.get('/organisations/contacts/export/', { params }),
};

// Helper function for fetching contacts (used in pages)
export const fetchContacts = async () => {
  return await contactApi.getAll();
};

export default contactApi;