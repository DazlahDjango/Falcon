from django.db import models
from .base import BaseManager


class SchemaManager(BaseManager):
    def active_schemas(self):
        return self.get_queryset().filter(status='ACTIVE', is_ready=True)

    def by_organization(self, organization_id):
        return self.get_queryset().filter(organization_id=organization_id)

    def by_schema_name(self, schema_name):
        try:
            return self.get_queryset().get(schema_name=schema_name)
        except self.model.DoesNotExist:
            return None

    def pending(self):
        return self.get_queryset().filter(status='PENDING')

    def creating(self):
        return self.get_queryset().filter(status='CREATING')

    def migrating(self):
        return self.get_queryset().filter(status='MIGRATING')

    def failed(self):
        return self.get_queryset().filter(status='FAILED')

    def ready(self):
        return self.get_queryset().filter(is_ready=True)

    def not_ready(self):
        return self.get_queryset().filter(is_ready=False)

    def get_primary_schema(self, organization_id):
        try:
            return self.get_queryset().get(organization_id=organization_id)
        except self.model.DoesNotExist:
            return None