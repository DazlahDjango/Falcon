"""
Installed Applications Component

Configuration of Django built-in apps, third-party libraries, and internal project apps.
"""

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    # REST Framework
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    # CORS
    'corsheaders',
    # Multi-tenancy (RLS)
    'django_multitenant',
    'django_rls',
    # Security
    'axes',  # Login attempt monitoring
    'guardian',  # Object-level permissions
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
    # Workflow
    'viewflow',
    # Notifications
    'notifications',
    'django_apscheduler',
    # Reporting
    'easy_pdf',
    # Audit
    'auditlog',
    # API Documentation
    'drf_yasg',
    'drf_spectacular',
    # Async/Websockets
    'channels',
    # Celery
    'celery',
    'django_celery_beat',
    'django_celery_results',
    'django_filters',
    # Health check
    'health_check',
    'health_check.db',
    'health_check.cache',
]

PROJECT_APPS = [
    'apps.accounts.apps.AccountsConfig',
    'apps.tenant.apps.TenantConfig',
    'apps.structure.apps.StructureConfig',
    'apps.kpi.apps.KpiConfig',
    'apps.billing.apps.BillingConfig',
    'apps.configs.apps.ConfigsConfig',
    'apps.reviews.apps.ReviewsConfig',
    'apps.dashboard.apps.DashboardConfig',
    'apps.reportplt.apps.ReportpltConfig',
    'apps.core',
    'apps.tenant.api',  # For API endpoints
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + PROJECT_APPS
