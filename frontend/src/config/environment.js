const environment = {
    // Environment
    MODE: import.meta.env.MODE || 'development',
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    isTest: import.meta.env.MODE === 'test',
    // App Info
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Falcon Management System',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',  // Vite default port
    // API
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    // WebSocket
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
    // Features
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
    enableMFA: import.meta.env.VITE_ENABLE_MFA === 'true',
    enableSSO: import.meta.env.VITE_ENABLE_SSO === 'true',
    enableAuditLogs: import.meta.env.VITE_ENABLE_AUDIT_LOGS === 'true',
    enableAdvancedReports: import.meta.env.VITE_ENABLE_ADVANCED_REPORTS === 'true',
    // Demo Mode
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
    // Security
    storageEncryptKey: import.meta.env.VITE_STORAGE_ENCRYPT_KEY || '',
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
    // Monitoring
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
    // Upload Limits
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
    maxAvatarSize: parseInt(import.meta.env.VITE_MAX_AVATAR_SIZE) || 2097152,
    // Debug
    debug: import.meta.env.DEV,
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    // Pagination
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
    // Defaults
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
    defaultTimezone: import.meta.env.VITE_DEFAULT_TIMEZONE || 'Africa/Nairobi',
    defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'KES',
    // Cache
    cacheTTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300, // seconds
    // Token
    tokenRefreshThreshold: parseInt(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000,
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 28800000,
};

export default environment;