"""
apps/tenant/signals/resource_signals.py

Custom Django signals for the tenant resource module.
Handlers are connected in apps.tenant.signals (the main signals file).
"""
from django.dispatch import Signal

# Fired when usage crosses the 80% or 90% threshold for the first time
# Kwargs: resource, organization_id, level (80|90), percentage
resource_quota_warning = Signal()

# Fired when usage reaches or exceeds 100% of the limit
# Kwargs: resource, organization_id, level (100), percentage
resource_quota_exceeded = Signal()

# Fired when billing sync updates the limit_value for one or more resources
# Kwargs: synced_count, updated (dict), organization_id (may be None for global sync)
resource_limit_synced = Signal()

# Fired when a resource is manually or automatically reset
# Kwargs: resource, organization_id
resource_usage_reset = Signal()
