"""
Authentication Component

User/Tenant models, Authentication backends, Password validators,
OAuth providers, REST Framework, Simple JWT, and MFA/OTP settings.
"""

import os
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured
from config.settings.base import env, SECRET_KEY, DEBUG

# AUTHENTICATION
# ----------------------------------------
AUTH_USER_MODEL = 'accounts.User'
AUTH_TENANT_MODEL = 'tenant.Organization'
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',  # Must be first for axes
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',  # Object-level permissions
]

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# OAuth Configuration for SSO
OAUTH_PROVIDERS = {
    # Google OAuth2
    'google': {
        'client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
        'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET', ''),
        'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
        'token_url': 'https://oauth2.googleapis.com/token',
        'userinfo_url': 'https://www.googleapis.com/oauth2/v3/userinfo',
        'redirect_uri': os.environ.get('GOOGLE_REDIRECT_URI', ''),
        'scope': 'openid email profile',
        'state': None,
    },
    # Microsoft / Azure AD OAuth2
    'microsoft': {
        'client_id': os.environ.get('MICROSOFT_CLIENT_ID', ''),
        'client_secret': os.environ.get('MICROSOFT_CLIENT_SECRET', ''),
        'auth_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        'token_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        'userinfo_url': 'https://graph.microsoft.com/v1.0/me',
        'redirect_uri': os.environ.get('MICROSOFT_REDIRECT_URI', ''),
        'scope': 'openid email profile User.Read',
        'state': None,
    },
    # GitHub OAuth2
    'github': {
        'client_id': os.environ.get('GITHUB_CLIENT_ID', ''),
        'client_secret': os.environ.get('GITHUB_CLIENT_SECRET', ''),
        'auth_url': 'https://github.com/login/oauth/authorize',
        'token_url': 'https://github.com/login/oauth/access_token',
        'userinfo_url': 'https://api.github.com/user',
        'redirect_uri': os.environ.get('GITHUB_REDIRECT_URI', ''),
        'scope': 'read:user user:email',
        'state': None,
    },
    # LinkedIn OAuth2
    'linkedin': {
        'client_id': os.environ.get('LINKEDIN_CLIENT_ID', ''),
        'client_secret': os.environ.get('LINKEDIN_CLIENT_SECRET', ''),
        'auth_url': 'https://www.linkedin.com/oauth/v2/authorization',
        'token_url': 'https://www.linkedin.com/oauth/v2/accessToken',
        'userinfo_url': 'https://api.linkedin.com/v2/userinfo',
        'redirect_uri': os.environ.get('LINKEDIN_REDIRECT_URI', ''),
        'scope': 'openid profile email',
        'state': None,
    },
    # Facebook OAuth2
    'facebook': {
        'client_id': os.environ.get('FACEBOOK_CLIENT_ID', ''),
        'client_secret': os.environ.get('FACEBOOK_CLIENT_SECRET', ''),
        'auth_url': 'https://www.facebook.com/v18.0/dialog/oauth',
        'token_url': 'https://graph.facebook.com/v18.0/oauth/access_token',
        'userinfo_url': 'https://graph.facebook.com/me',
        'redirect_uri': os.environ.get('FACEBOOK_REDIRECT_URI', ''),
        'scope': 'email public_profile',
        'state': None,
    },
}

# REST FRAMEWORK CONFIGURATION
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.accounts.api.v1.authentication.TenantAwareJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        'apps.accounts.api.v1.permissions.IsPasswordChangeCompleted',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FileUploadParser',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'apps.accounts.api.v1.throttles.AnonRateThrottle',
        'apps.accounts.api.v1.throttles.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'login': '5/minute',
        'register': '3/hour',
        'password_reset': '3/hour',
        'email_verification': '2/hour',
        'session_refresh': '10/minute',
        'mfa': '5/minute',
        'mfa_enrollment': '3/hour',
        'mfa_backup': '10/hour',
        'sensitive': '30/minute',
        'admin': '200/hour',
        'bulk': '5/hour',
        'report': '10/hour',
        'user_creation': '5/hour',
        'profile_update': '30/hour',
        'invitation': '20/hour',
        'tenant': '5000/hour',
        'tenant_user_creation': '50/day',
        'tenant_api': '10000/day',
        'connection_ops': '100/hour',
        'review_submission': '10/hour',
        'review_approval': '20/hour',
        'feedback_submission': '5/hour',
        'calibration_action': '30/min',
        'review_export': '5/hour',
        'bulk_review': '3/hour',
        'pip_creation': '2/month',
        'pip_action': '20/hour',
        'pip_approval': '10/hour',
        'pip_comment': '30/hour',
        'backup': '10/hour',
        'restore': '5/hour',
        'backup_burst': '2/minute',
        'dr': '2/hour',
        'dr_burst': '1/minute',
        'maintenance': '20/hour',
        'maintenance_burst': '5/minute',
        'config_read': '100/minute',
        'config_write': '30/minute',
    },
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100,
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.openapi.AutoSchema',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S%z',
    'COERCE_DECIMAL_TO_STRING': False,
}

# JWT CONFIGURATION
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env.int('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=30)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.int('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('JWT_SIGNING_KEY', default=SECRET_KEY),
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'FalconPMS',

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=30),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# MFA CONFIGURATION
MFA_ENCRYPTION_KEY = env('MFA_ENCRYPTION_KEY', default=None)
if not MFA_ENCRYPTION_KEY and not DEBUG:
    raise ImproperlyConfigured(
        "MFA_ENCRYPTION_KEY must be set in production for MFA to work"
    )

MFA_MAX_FAILURES = env.int('MFA_MAX_FAILURES', default=5)
MFA_LOCKOUT_MINUTES = env.int('MFA_LOCKOUT_MINUTES', default=15)
MFA_RATE_LIMIT_ATTEMPTS = env.int('MFA_RATE_LIMIT_ATTEMPTS', default=10)
MFA_RATE_LIMIT_WINDOW_MINUTES = env.int('MFA_RATE_LIMIT_WINDOW_MINUTES', default=5)

# TOTP Settings
OTP_TOTP_ISSUER = env('OTP_TOTP_ISSUER', default='FalconPMS')
OTP_TOTP_DIGITS = env.int('OTP_TOTP_DIGITS', default=6)
OTP_TOTP_INTERVAL = env.int('OTP_TOTP_INTERVAL', default=30)

# Backup Code Settings
MFA_BACKUP_CODE_COUNT = env.int('MFA_BACKUP_CODE_COUNT', default=10)
MFA_BACKUP_CODE_EXPIRY_DAYS = env.int('MFA_BACKUP_CODE_EXPIRY_DAYS', default=90)

# Session & Trust Settings
MFA_SESSION_TIMEOUT_MINUTES = env.int('MFA_SESSION_TIMEOUT_MINUTES', default=15)
MFA_REMEMBER_DEVICE_DAYS = env.int('MFA_REMEMBER_DEVICE_DAYS', default=30)

# Feature flags
MFA_ALLOW_MULTIPLE_DEVICES = env.bool('MFA_ALLOW_MULTIPLE_DEVICES', default=True)
MFA_REQUIRE_FOR_ADMIN = env.bool('MFA_REQUIRE_FOR_ADMIN', default=True)
MFA_REQUIRE_FOR_EXECUTIVE = env.bool('MFA_REQUIRE_FOR_EXECUTIVE', default=True)

# Audit retention
MFA_AUDIT_LOG_RETENTION_DAYS = env.int('MFA_AUDIT_LOG_RETENTION_DAYS', default=90)
