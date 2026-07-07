from django.db import models
from .base import BaseModel
from ..managers import SectorManager


class OrganizationSector(BaseModel):
    SECTOR_TYPES = [
        ('COMMERCIAL', 'Commercial'),
        ('NGO', 'Non-Profit'),
        ('PUBLIC', 'Public Sector'),
        ('CONSULTING', 'Consulting'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    sector_type = models.CharField(max_length=20, choices=SECTOR_TYPES, db_index=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    objects = SectorManager()

    class Meta:
        db_table = 'organization_sectors'
        ordering = ['sector_type', 'name']
        verbose_name = 'Organization Sector'
        verbose_name_plural = 'Organization Sectors'

    def __str__(self):
        return f"{self.get_sector_type_display()} - {self.name}"