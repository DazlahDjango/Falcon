// Organisation Authentication Service
// Handles organisation-specific authentication features

import api from './api';

export const authApi = {
  // Get 2FA settings
  getTwoFactorSettings: () => api.get('/organisations/auth/2fa/'),

  // Enable 2FA
  enableTwoFactor: (data) => api.post('/organisations/auth/2fa/enable/', data),

  // Disable 2FA
  disableTwoFactor: () => api.post('/organisations/auth/2fa/disable/'),

  // Generate backup codes
  generateBackupCodes: () => api.post('/organisations/auth/backup-codes/'),

  // Verify 2FA token
  verifyTwoFactor: (token) => api.post('/organisations/auth/2fa/verify/', { token }),

  // Get SSO settings
  getSSOSettings: () => api.get('/organisations/auth/sso/'),

  // Update SSO settings
  updateSSOSettings: (data) => api.patch('/organisations/auth/sso/', data),

  // Test SSO configuration
  testSSO: (data) => api.post('/organisations/auth/sso/test/', data),

  // Get authentication logs
  getAuthLogs: (params) => api.get('/organisations/auth/logs/', { params }),
};

export default authApi;