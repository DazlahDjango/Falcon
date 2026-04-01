"""
Management commands for organisations app

Available commands:
- check_expiring_subscriptions: Check for subscriptions expiring soon
- process_renewals: Process auto-renewing subscriptions
- verify_all_domains: Verify all pending custom domains
- generate_usage_reports: Generate usage reports for all organisations
- cleanup_expired_trials: Clean up expired trial organisations
- enforce_quotas: Enforce plan limits and quotas
- seed_plans: Seed default subscription plans
"""

__all__ = [
    'check_expiring_subscriptions',
    'process_renewals',
    'verify_all_domains',
    'generate_usage_reports',
    'cleanup_expired_trials',
    'enforce_quotas',
    'seed_plans',
]