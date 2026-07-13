from django.db import models
from .base import BaseManager


class ResourceManager(BaseManager):

    def by_organization(self, organization_id):
        return self.get_queryset().filter(organization_id=organization_id)

    def by_resource_type(self, resource_type):
        return self.get_queryset().filter(resource_type=resource_type)

    def by_organization_and_type(self, organization_id, resource_type):
        try:
            return self.get_queryset().get(
                organization_id=organization_id, resource_type=resource_type
            )
        except self.model.DoesNotExist:
            return None

    def exceeded_limits(self):
        """Resources whose current value is at or above their limit."""
        return self.get_queryset().filter(
            current_value__gte=models.F('limit_value')
        )

    def at_capacity(self):
        """Alias for exceeded_limits."""
        return self.exceeded_limits()

    def warning_level(self):
        """Resources whose usage % has crossed the warning_threshold."""
        return self.get_queryset().filter(
            current_value__gte=(
                models.F('limit_value') * models.F('warning_threshold') / 100
            )
        )

    def near_soft_limit(self, organization_id=None):
        """
        Resources between 80 % and soft limit ceiling.
        Optionally filtered to a single org.
        """
        qs = self.get_queryset()
        if organization_id:
            qs = qs.filter(organization_id=organization_id)
        return qs.filter(
            current_value__gte=models.F('limit_value') * 0.8,
            current_value__lt=models.F('limit_value'),
        )

    def exceeded_hard_limit(self):
        """
        Resources whose current value exceeds limit * hard_limit_multiplier.
        Uses 1.2 as approximate constant (exact per-row check done in service).
        """
        return self.get_queryset().filter(
            current_value__gt=models.F('limit_value') * models.F('hard_limit_multiplier')
        )

    def sync_needed(self):
        """Resources not yet synced from billing."""
        return self.get_queryset().filter(is_synced_from_billing=False)

    def has_available_capacity(self, organization_id, resource_type, amount=1):
        try:
            resource = self.get_queryset().get(
                organization_id=organization_id, resource_type=resource_type
            )
            return resource.can_increment(amount)
        except self.model.DoesNotExist:
            return False

    def bulk_reset_by_type(self, resource_type):
        """
        Efficiently resets current_value to 0 for all active resources of a
        given type, also clears alert timestamps.
        Returns count of updated rows.
        """
        from django.utils import timezone
        return self.get_queryset().filter(
            resource_type=resource_type,
            is_deleted=False,
        ).update(
            current_value=0,
            last_reset_at=timezone.now(),
            alert_80_sent_at=None,
            alert_90_sent_at=None,
            alert_100_sent_at=None,
        )