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
    # MFA and Security
    'django_otp.middleware.OTPMiddleware',
    'axes.middleware.AxesMiddleware',
    'django_ratelimit.middleware.RatelimitMiddleware',
    'apps.accounts.middleware.SecurityMiddleware',
    # Organization/Tenant Context Resolution (Must run before tenant-dependent middlewares)
    'apps.tenant.middleware.organization_context.OrganizationContextMiddleware',
    'apps.tenant.middleware.organization_resolution.OrganizationResolutionMiddleware',
    # Config Maintenance Mode Blockers (Block early before DB connection acquisition)
    'apps.configs.middleware.maintenance_blocker.MaintenanceBlockerMiddleware',
    'apps.configs.middleware.partial_maintenance_blocker.PartialMaintenanceBlockerMiddleware',
    # Accounts Session & Audit (Has tenant context available now)
    'apps.accounts.middleware.SessionMiddleware',
    'apps.accounts.middleware.AuditMiddleware',
    # Tenant Isolation, Limits & Subscription Protection (Block BEFORE connection pooling)
    'apps.tenant.middleware.organization_isolation.OrganizationIsolationMiddleware',
    'apps.tenant.middleware.organization_isolation.OrganizationPathIsolationMiddleware',
    'apps.tenant.middleware.organization_limits.OrganizationLimitsMiddleware',
    'apps.billing.middleware.SubscriptionGuardMiddleware',
    'apps.billing.middleware.TenantBillingContextMiddleware',
    # Database Connection Management & Schema Routing (Executed for active, paid, authorized requests)
    'apps.tenant.middleware.connection_management.ConnectionManagementMiddleware',
    'apps.tenant.middleware.db_routing.TenantDatabaseRouterMiddleware',
    'apps.tenant.middleware.file_isolation.FileIsolationMiddleware',
    # KPI App Middlewares
    'apps.kpi.middleware.KPIContextMiddleware',
    'apps.kpi.middleware.KPIRequestAuditMiddleware',
    'apps.kpi.middleware.KPIThrottleMiddleware',
    'apps.kpi.middleware.CalculationCacheMiddleware',
    # Structure App Middlewares
    'apps.structure.middleware.StructureContextMiddleware',
    'apps.structure.middleware.StructureCacheMiddleware',
    'apps.structure.middleware.StructureAccessEnforcerMiddleware',
    'apps.structure.middleware.StructureRateLimitMiddleware',
    # Billing Audit & Webhook Limits
    'apps.billing.middleware.BillingAuditMiddleware',
    'apps.billing.middleware.WebhookRateLimitMiddleware',
    # Config Access Control & Response Notice Injector
    'apps.configs.middleware.config_access_middleware.ConfigAccessMiddleware',
    'apps.configs.middleware.maintenance_notice_injector.MaintenanceNoticeInjectorMiddleware',
]
