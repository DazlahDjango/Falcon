"""Canonical defaults for persisted billing platform settings (CIA: Integrity via versioning)."""

DEFAULT_BILLING_SYSTEM_SETTINGS = {
    'payments': {
        'default_currency': 'KES',
        'allow_trial': True,
        'trial_days': 14,
        'auto_renew': True,
    },
    'tax': {
        'enabled': True,
        'default_rate_percent': 16,
        'inclusive_pricing': False,
    },
    'invoices': {
        'auto_send_email': True,
        'due_days': 14,
        'retry_failed_days': 3,
    },
    'webhooks': {
        'retry_max_attempts': 5,
        'signature_required': True,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_subscription_updates': True,
        'push_payment_events': True,
    },
}
