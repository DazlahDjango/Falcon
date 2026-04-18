import api from './api';

export const brandingApi = {
  // ============================================================
  // Branding CRUD
  // ============================================================
  
  /**
   * Get organisation branding
   */
  get: () => api.get('/organisations/branding/'),
  
  /**
   * Update organisation branding
   * @param {Object} data - Branding data
   */
  update: (data) => api.patch('/organisations/branding/', data),
  
  // ============================================================
  // Logo Management
  // ============================================================
  
  /**
   * Upload organisation logo
   * @param {File} file - Image file
   */
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/organisations/branding/upload-logo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  /**
   * Remove organisation logo
   */
  removeLogo: () => api.delete('/organisations/branding/logo/'),
  
  // ============================================================
  // Favicon Management
  // ============================================================
  
  /**
   * Upload favicon
   * @param {File} file - Image file
   */
  uploadFavicon: (file) => {
    const formData = new FormData();
    formData.append('favicon', file);
    return api.post('/organisations/branding/upload-favicon/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  /**
   * Remove favicon
   */
  removeFavicon: () => api.delete('/organisations/branding/favicon/'),
  
  // ============================================================
  // CSS & Theming
  // ============================================================
  
  /**
   * Get CSS variables for theming
   */
  getCSSVariables: () => api.get('/organisations/branding/css-variables/'),
  
  /**
   * Update theme colors
   * @param {Object} colors - Color values (primary, secondary, accent)
   */
  updateThemeColors: (colors) => api.patch('/organisations/branding/theme/', colors),
  
  /**
   * Update font settings
   * @param {Object} font - Font settings
   */
  updateFont: (font) => api.patch('/organisations/branding/font/', font),
  
  // ============================================================
  // Preview
  // ============================================================
  
  /**
   * Get branding preview
   */
  getPreview: () => api.get('/organisations/branding/preview/'),
  
  /**
   * Preview theme changes without saving
   * @param {Object} data - Temporary theme data
   */
  previewTheme: (data) => api.post('/organisations/branding/preview/', data),
};