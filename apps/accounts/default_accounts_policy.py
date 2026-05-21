"""Canonical defaults for accounts security policy (CIA: Integrity via versioning)."""

DEFAULT_ACCOUNTS_POLICY = {
    'lockout': {
        'failure_limit': 5,
        'lockout_minutes': 15,
        'ip_failure_limit': 5,
        'reset_on_success': True,
    },
    'jwt': {
        'access_token_lifetime_minutes': 30,
        'refresh_token_lifetime_days': 7,
        'rotate_refresh_tokens': True,
        'blacklist_after_rotation': True,
    },
    'sessions': {
        'max_concurrent_sessions': 5,
        'default_timeout_minutes': 480,
        'retention_days': 90,
    },
    'mfa': {
        'required_roles': [
            'super_admin',
            'client_admin',
            'executive',
        ],
        'totp_digits': 6,
        'totp_interval_seconds': 30,
        'issuer': 'FalconPMS',
    },
    'password': {
        'expiry_days': 90,
        'min_length': 8,
    },
    'audit': {
        'retention_days': 365,
    },
}
