// frontend/src/vite-env.d.ts
/// <reference types="vite/client" />

// Only keep environment variables (no asset declarations)
interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_ENV: string;
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_TOKEN_REFRESH_THRESHOLD: string;
    readonly VITE_SESSION_TIMEOUT: string;
    readonly VITE_ENABLE_MFA: string;
    readonly VITE_ENABLE_SSO: string;
    readonly VITE_ENABLE_AUDIT_LOGS: string;
    readonly VITE_ENABLE_ADVANCED_REPORTS: string;
    readonly VITE_STORAGE_ENCRYPT_KEY: string;
    readonly VITE_ENCRYPTION_KEY: string;
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_ANALYTICS_ID: string;
    readonly VITE_DEMO_MODE: string;
    readonly VITE_MAX_FILE_SIZE: string;
    readonly VITE_MAX_AVATAR_SIZE: string;
    readonly VITE_DEFAULT_PAGE_SIZE: string;
    readonly VITE_DEFAULT_THEME: string;
    readonly VITE_DEFAULT_LANGUAGE: string;
    readonly VITE_DEFAULT_TIMEZONE: string;
    readonly VITE_DEFAULT_CURRENCY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}