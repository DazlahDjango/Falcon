from django.db import models
from .base import BaseManager


class MigrationManager(BaseManager):
    def by_organization(self, organization_id):
        return self.get_queryset().filter(organization_id=organization_id)

    def by_app(self, app_name):
        return self.get_queryset().filter(app_name=app_name)

    def by_migration(self, migration_name):
        return self.get_queryset().filter(migration_name=migration_name)

    def by_organization_and_migration(self, organization_id, migration_name, app_name):
        try:
            return self.get_queryset().get(
                organization_id=organization_id,
                migration_name=migration_name,
                app_name=app_name
            )
        except self.model.DoesNotExist:
            return None

    def pending(self):
        return self.get_queryset().filter(status='PENDING')

    def running(self):
        return self.get_queryset().filter(status='RUNNING')

    def completed(self):
        return self.get_queryset().filter(status='COMPLETED')

    def failed(self):
        return self.get_queryset().filter(status='FAILED')

    def rolled_back(self):
        return self.get_queryset().filter(status='ROLLED_BACK')

    def recent_completed(self, limit=10):
        return self.completed().order_by('-completed_at')[:limit]

    def pending_for_organization(self, organization_id):
        return self.get_queryset().filter(
            organization_id=organization_id,
            status='PENDING'
        ).order_by('created_at')