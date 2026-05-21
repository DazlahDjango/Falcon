/**
 * Map API system settings to editable form sections.
 */
export const apiToFormPolicy = (apiData) => {
    const effective = apiData?.effective_settings || apiData?.settings || {};
    return {
        version: apiData?.version ?? 1,
        lockout: {
            failure_limit: effective.lockout?.failure_limit ?? 5,
            lockout_minutes: effective.lockout?.lockout_minutes ?? 15,
            ip_failure_limit: effective.lockout?.ip_failure_limit ?? 5,
        },
        jwt: {
            access_token_lifetime_minutes: effective.jwt?.access_token_lifetime_minutes ?? 30,
            refresh_token_lifetime_days: effective.jwt?.refresh_token_lifetime_days ?? 7,
        },
        sessions: {
            max_concurrent_sessions: effective.sessions?.max_concurrent_sessions ?? 5,
            default_timeout_minutes: effective.sessions?.default_timeout_minutes ?? 480,
            retention_days: effective.sessions?.retention_days ?? 90,
        },
        mfa: {
            required_roles: effective.mfa?.required_roles ?? [],
        },
        password: {
            expiry_days: effective.password?.expiry_days ?? 90,
        },
        audit: {
            retention_days: effective.audit?.retention_days ?? 365,
        },
    };
};

export const formToApiPatch = (form) => ({
    lockout: form.lockout,
    jwt: form.jwt,
    sessions: form.sessions,
    mfa: form.mfa,
    password: form.password,
    audit: form.audit,
});
