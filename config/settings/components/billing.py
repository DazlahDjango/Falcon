"""
Billing & Payment Configuration Component

PayStack credentials, billing currency/tax settings, subscription plans,
and payment idempotency TTL.
"""

from config.settings.base import env

# PAYSTACK BILLING CONFIGURATION
PAYSTACK_SECRET_KEY = env("PAYSTACK_SECRET_KEY", default="")
PAYSTACK_PUBLIC_KEY = env("PAYSTACK_PUBLIC_KEY", default="")
PAYSTACK_BASE_URL = env("PAYSTACK_BASE_URL", default="https://api.paystack.co")
PAYSTACK_WEBHOOK_SECRET = env("PAYSTACK_WEBHOOK_SECRET", default="")

# Billing Core Settings
BILLING_CURRENCY = env("BILLING_CURRENCY", default="KES")
BILLING_TAX_RATE = env.float("BILLING_TAX_RATE", default=0.16)
BILLING_INVOICE_PREFIX = env("BILLING_INVOICE_PREFIX", default="FALCON-")
BILLING_PAYMENT_TIMEOUT_MINUTES = env.int("BILLING_PAYMENT_TIMEOUT_MINUTES", default=30)

# Subscription Plans
SUBSCRIPTION_TRIAL_DAYS = env.int("SUBSCRIPTION_TRIAL_DAYS", default=14)
SUBSCRIPTION_PLANS = {
    "basic": {
        "price": env.int("SUBSCRIPTION_BASIC_PRICE", default=5000),
        "features": ["max_users_50", "max_kpis_100", "basic_reports"],
    },
    "professional": {
        "price": env.int("SUBSCRIPTION_PROFESSIONAL_PRICE", default=25000),
        "features": ["max_users_500", "max_kpis_1000", "custom_branding", "api_access"],
    },
    "enterprise": {
        "price": env.int("SUBSCRIPTION_ENTERPRISE_PRICE", default=100000),
        "features": ["max_users_unlimited", "max_kpis_unlimited", "sso", "advanced_analytics"],
    },
}

# Idempotency
BILLING_IDEMPOTENCY_TTL_HOURS = env.int("BILLING_IDEMPOTENCY_TTL_HOURS", default=24)
