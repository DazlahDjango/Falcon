# ============================================================================
# FALCON PMS - STAGING SETTINGS
# Pre-production testing environment
# ============================================================================

from .production import *

# ----------------------------------------------------------------------------
# DEBUG (optional for testing)
# ----------------------------------------------------------------------------
DEBUG = False  # Keep False for realistic testing
TEMPLATE_DEBUG = False

# ----------------------------------------------------------------------------
# STAGING-SPECIFIC SETTINGS
# ----------------------------------------------------------------------------
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['staging.falconpms.com'])

# Less strict security for testing
SECURE_HSTS_SECONDS = 3600  # 1 hour (not 1 year)
SECURE_SSL_REDIRECT = True

# ----------------------------------------------------------------------------
# SENTRY (staging environment)
# ----------------------------------------------------------------------------
# In staging.py - Enhanced Sentry config
if env('SENTRY_DSN', default=None):
    SENTRY_DSN = env('SENTRY_DSN')
    SENTRY_ENVIRONMENT = 'staging'
    SENTRY_RELEASE = env('SENTRY_RELEASE', default='falcon-pms@1.0.0-staging')
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(transaction_style='url'),
            CeleryIntegration(monitor_beat_tasks=True),
            RedisIntegration(describe_queries=True),
            LoggingIntegration(level="INFO", event_level="ERROR"),
        ],
        traces_sample_rate=0.5,  # 50% in staging for better testing
        profiles_sample_rate=0.5,
        environment=SENTRY_ENVIRONMENT,
        release=SENTRY_RELEASE,
        send_default_pii=False,
        attach_stacktrace=True,
        max_request_body_size='never',
        before_send=filter_sensitive_data,  # Reuse the same filter
    )