from datetime import timedelta
from django.db import models
from django.utils import timezone
from .base import BaseManager


class ConnectionManager(BaseManager):
    def by_organization(self, organization_id):
        return self.get_queryset().filter(organization_id=organization_id)

    def by_connection_id(self, connection_id):
        try:
            return self.get_queryset().get(connection_id=connection_id)
        except self.model.DoesNotExist:
            return None

    def active_connections(self):
        return self.get_queryset().filter(status='ACTIVE')

    def idle_connections(self):
        return self.get_queryset().filter(status='IDLE')

    def closed_connections(self):
        return self.get_queryset().filter(status='CLOSED')

    def error_connections(self):
        return self.get_queryset().filter(status='ERROR')

    def stale_idle(self, minutes=30):
        cutoff = timezone.now() - timedelta(minutes=minutes)
        return self.get_queryset().filter(
            status='IDLE',
            last_used_at__lt=cutoff
        )

    def active_or_idle_connections(self):
        return self.get_queryset().filter(status__in=['ACTIVE', 'IDLE'])

    def by_status(self, status):
        return self.get_queryset().filter(status=status)

    def get_or_create_connection(self, organization_id, connection_id):
        try:
            return self.get_queryset().get(connection_id=connection_id, organization_id=organization_id)
        except self.model.DoesNotExist:
            return self.model.objects.create(
                connection_id=connection_id,
                organization_id=organization_id,
                status='IDLE'
            )
