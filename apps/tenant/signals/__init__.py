"""
apps/tenant/signals/__init__.py

Re-exports all tenant signals. Importing this package makes Django's
apps.py `import apps.tenant.signals` resolve to this directory package,
which is backward-compatible with the previous flat signals.py.
"""
# Existing organization/domain/schema/resource signals
from apps.tenant.signals.core_signals import (       # noqa: F401
    organization_post_save_handler,
    organization_pre_save_handler,
    organization_status_change_handler,
    organization_post_delete_handler,
    domain_post_save_handler,
    domain_pre_delete_handler,
    schema_post_save_handler,
    resource_pre_save_handler,
)

# Resource quota signals (declarations only — handlers in core_signals)
from apps.tenant.signals.resource_signals import (   # noqa: F401
    resource_quota_warning,
    resource_quota_exceeded,
    resource_limit_synced,
    resource_usage_reset,
)
