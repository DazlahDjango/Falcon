from django.db import models
from django.utils import timezone
from .base import BaseManager


class OrganizationManager(BaseManager):
    """Query helpers for Organization lifecycle, provisioning, and lookup."""

    def get_by_id(self, organization_id):
        try:
            return self.get_queryset().get(id=organization_id)
        except self.model.DoesNotExist:
            return None

    def by_slug(self, slug):
        try:
            return self.get_queryset().get(slug=slug)
        except self.model.DoesNotExist:
            return None

    def by_domain(self, domain):
        try:
            return self.get_queryset().get(
                domains__domain=domain,
                domains__is_primary=True,
                domains__is_deleted=False,
            )
        except self.model.DoesNotExist:
            return None

    def by_sector(self, sector_id):
        return self.get_queryset().filter(sector_id=sector_id)

    def by_status(self, status):
        return self.get_queryset().filter(status=str(status).upper())

    def active_organizations(self):
        return self.get_queryset().filter(is_active=True)

    def onboarded(self):
        return self.get_queryset().filter(is_onboarded=True)

    def pending_onboarding(self):
        return self.get_queryset().filter(
            is_onboarded=False,
            is_active=True,
            status__in=['PENDING', 'FAILED'],
        )

    def pending_provisioning(self):
        return self.get_queryset().filter(status='PENDING', is_onboarded=False)

    def provisioning(self):
        return self.get_queryset().filter(status='PROVISIONING')

    def failed(self):
        return self.get_queryset().filter(status='FAILED')

    def suspended(self):
        return self.get_queryset().filter(status='SUSPENDED')

    def archived(self):
        return self.get_queryset().filter(status='ARCHIVED')

    def with_schema(self):
        return self.get_queryset().filter(schema__isnull=False)

    def without_schema(self):
        return self.get_queryset().filter(schema__isnull=True)

    def with_custom_domains(self):
        return self.get_queryset().filter(
            domains__is_primary=True,
            domains__is_deleted=False,
        ).distinct()

    def search(self, query):
        return self.get_queryset().filter(
            models.Q(name__icontains=query)
            | models.Q(slug__icontains=query)
            | models.Q(contact_email__icontains=query)
        )

    def for_list(self, filters=None):
        """Optimized queryset for list endpoints with common relations."""
        qs = (
            self.get_queryset()
            .select_related('sector')
            .prefetch_related('domains', 'resources')
        )
        if not filters:
            return qs

        if filters.get('sector_id'):
            qs = qs.filter(sector_id=filters['sector_id'])
        if filters.get('status'):
            qs = qs.filter(status=str(filters['status']).upper())
        if filters.get('is_active') is not None:
            qs = qs.filter(is_active=filters['is_active'])
        if filters.get('is_onboarded') is not None:
            qs = qs.filter(is_onboarded=filters['is_onboarded'])
        if filters.get('subscription_tier'):
            qs = qs.filter(subscription_tier=filters['subscription_tier'])
        if filters.get('search'):
            qs = self.search(filters['search']).filter(pk__in=qs.values('pk'))
        return qs

    def lock_for_update(self, organization_id):
        return self.get_queryset().select_for_update().get(id=organization_id)
