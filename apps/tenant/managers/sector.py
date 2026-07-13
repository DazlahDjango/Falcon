from django.db import models
from .base import BaseManager


class SectorManager(BaseManager):
    def by_code(self, code):
        try:
            return self.get_queryset().get(code=code)
        except self.model.DoesNotExist:
            return None

    def by_type(self, sector_type):
        return self.get_queryset().filter(sector_type=sector_type)

    def active_sectors(self):
        return self.get_queryset().filter(is_active=True)

    def commercial(self):
        return self.get_queryset().filter(sector_type='COMMERCIAL')

    def ngo(self):
        return self.get_queryset().filter(sector_type='NGO')

    def public(self):
        return self.get_queryset().filter(sector_type='PUBLIC')

    def consulting(self):
        return self.get_queryset().filter(sector_type='CONSULTING')

    def with_organizations(self):
        return self.get_queryset().filter(organizations__isnull=False).distinct()

    def search(self, query):
        return self.get_queryset().filter(
            models.Q(name__icontains=query) |
            models.Q(code__icontains=query) |
            models.Q(description__icontains=query)
        )

    def get_default_sector(self):
        try:
            return self.get_queryset().filter(is_active=True).first()
        except self.model.DoesNotExist:
            return None