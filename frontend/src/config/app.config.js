import environment from './environment';

const appConfig = {
    // App Info
    name: environment.APP_NAME,
    version: environment.APP_VERSION,
    url: environment.APP_URL,
    // Features
    features: {
        analytics: environment.enableAnalytics,
        notifications: environment.enableNotifications,
        offlineMode: environment.enableOfflineMode,
        darkMode: true,
        realtimeUpdates: true,
        exportReports: true,
        bulkOperations: true,
        cascadeTargets: true,
    },
    // UI Settings
    ui: {
        theme: {
            default: 'light',
            options: ['light', 'dark', 'system'],
        },
        sidebar: {
            defaultCollapsed: false,
            defaultOpen: true,
        },
        animations: {
            enabled: true,
            duration: 300,
        },
        notifications: {
            duration: 5000,
            position: 'top-right',
        },
        pagination: {
            defaultPageSize: environment.defaultPageSize,
            pageSizeOptions: [10, 20, 50, 100],
        },
    },
    // Date Formats
    dateFormats: {
        display: 'MMM DD, YYYY',
        api: 'YYYY-MM-DD',
        period: 'YYYY-MM',
        monthYear: 'MMMM YYYY',
        time: 'HH:mm',
        dateTime: 'MMM DD, YYYY HH:mm',
    },
    // Number Formats
    numberFormats: {
        decimal: '.',
        thousand: ',',
        precision: {
            score: 1,
            percentage: 1,
            currency: 2,
            default: 2,
        },
    },
    // Currency
    currency: {
        default: 'KES',
        symbol: 'KES',
        locale: 'en-KE',
    },
    // Thresholds
    thresholds: {
        score: {
            green: 90,
            yellow: 50,
        },
        consecutiveRed: 2,
    },
    // File Upload
    upload: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
        ],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.xlsx', '.csv'],
    },
    // Cache
    cache: {
        ttl: environment.cacheTTL,
        maxSize: 100,
        storage: 'localStorage', // localStorage, sessionStorage, indexedDB
    },
    // Logging
    logging: {
        level: environment.logLevel,
        enabled: environment.debug,
        console: environment.isDevelopment,
    },
    // Error Handling
    errors: {
        showDetails: environment.isDevelopment,
        logToServer: environment.isProduction,
        defaultMessage: 'An unexpected error occurred. Please try again.',
    },
    // Local Storage Keys
    storageKeys: {
        auth: 'access_token',
        refresh: 'refresh_token',
        user: 'user_data',
        theme: 'theme_preference',
        sidebarState: 'sidebar_state',
        notifications: 'notifications',
    },
    // Analytics
    analytics: {
        enabled: environment.enableAnalytics,
        provider: 'google',
        trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
    },
};
export default appConfig;