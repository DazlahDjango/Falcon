from django.db.models import Avg, Max
from django.utils import timezone
from datetime import timedelta
from .base import BaseManager


class ResourceSnapshotManager(BaseManager):

    def for_organization(self, organization_id, resource_type, days=30):
        """Return daily snapshots for a given org/resource over the last N days."""
        since = timezone.now() - timedelta(days=days)
        return (
            self.get_queryset()
            .filter(
                organization_id=organization_id,
                resource_type=resource_type,
                snapshot_type='daily',
                created_at__gte=since,
            )
            .order_by('period_label')
        )

    def latest_snapshot(self, organization_id, resource_type):
        """Most recent snapshot of any type for the given org/resource."""
        return (
            self.get_queryset()
            .filter(organization_id=organization_id, resource_type=resource_type)
            .order_by('-created_at')
            .first()
        )

    def daily_average(self, organization_id, resource_type, days=7):
        """Average snapshot_value over the last N daily snapshots."""
        since = timezone.now() - timedelta(days=days)
        result = (
            self.get_queryset()
            .filter(
                organization_id=organization_id,
                resource_type=resource_type,
                snapshot_type='daily',
                created_at__gte=since,
            )
            .aggregate(avg=Avg('snapshot_value'), peak=Max('peak_value'))
        )
        return result

    def trend_values(self, organization_id, resource_type, days=7):
        """Return ordered list of snapshot values for sparkline/trend display."""
        since = timezone.now() - timedelta(days=days)
        return list(
            self.get_queryset()
            .filter(
                organization_id=organization_id,
                resource_type=resource_type,
                snapshot_type='daily',
                created_at__gte=since,
            )
            .order_by('period_label')
            .values_list('snapshot_value', flat=True)
        )

    def period_exists(self, organization_id, resource_type, snapshot_type, period_label):
        """Check if a snapshot for this exact period already exists."""
        return self.get_queryset().filter(
            organization_id=organization_id,
            resource_type=resource_type,
            snapshot_type=snapshot_type,
            period_label=period_label,
        ).exists()
