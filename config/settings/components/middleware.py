"""
Middleware Configuration Component

Ordered list of HTTP request/response processing middleware across
Django core, third-party packages, security, multi-tenancy, and domain apps.
"""

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Django core
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # MFA - after authentications
    'django_otp.middleware.OTPMiddleware',
    # Security and monitoring
    'axes.middleware.AxesMiddleware',
    # Rate limiting
    'django_ratelimit.middleware.RatelimitMiddleware',
    # Custom middleware
    # Accounts middlewares (non-tenant-specific)
    'apps.accounts.middleware.SessionMiddleware',
    'apps.accounts.middleware.AuditMiddleware',
    'apps.accounts.middleware.SecurityMiddleware',
    # Tenant middlewares (starts with context setting)
    'apps.tenant.middleware.organization_context.OrganizationContextMiddleware',
    'apps.tenant.middleware.organization_resolution.OrganizationResolutionMiddleware',
    'apps.tenant.middleware.organization_isolation.OrganizationIsolationMiddleware',
    'apps.tenant.middleware.organization_isolation.OrganizationPathIsolationMiddleware',
    'apps.tenant.middleware.organization_limits.OrganizationLimitsMiddleware',
    'apps.tenant.middleware.db_routing.TenantDatabaseRouterMiddleware',
    'apps.tenant.middleware.connection_management.ConnectionManagementMiddleware',
    'apps.tenant.middleware.file_isolation.FileIsolationMiddleware',
    # KPI
    'apps.kpi.middleware.KPIContextMiddleware',
    'apps.kpi.middleware.KPIRequestAuditMiddleware',
    'apps.kpi.middleware.KPIThrottleMiddleware',
    'apps.kpi.middleware.CalculationCacheMiddleware',
    # Structure
    'apps.structure.middleware.StructureContextMiddleware',
    'apps.structure.middleware.StructureCacheMiddleware',
    'apps.structure.middleware.StructureAccessEnforcerMiddleware',
    'apps.structure.middleware.StructureRateLimitMiddleware',
    # Billing
    'apps.billing.middleware.SubscriptionGuardMiddleware',
    'apps.billing.middleware.BillingAuditMiddleware',
    'apps.billing.middleware.WebhookRateLimitMiddleware',
    'apps.billing.middleware.TenantBillingContextMiddleware',
    # Config App Middleware - MAINTENANCE & ACCESS CONTROL
    'apps.configs.middleware.maintenance_blocker.MaintenanceBlockerMiddleware',
    'apps.configs.middleware.partial_maintenance_blocker.PartialMaintenanceBlockerMiddleware',
    'apps.configs.middleware.config_access_middleware.ConfigAccessMiddleware',
    'apps.configs.middleware.maintenance_notice_injector.MaintenanceNoticeInjectorMiddleware',
]
