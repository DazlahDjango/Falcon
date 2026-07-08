from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseStructureModel
from .organizational_unit import OrganizationalUnit
from apps.structure.managers.base import BaseStructureManager

class Location(BaseStructureModel):
    TYPE_CHOICES = [
        ('headquarters', 'Headquarters'),
        ('regional', 'Regional Office'),
        ('branch', 'Branch Office'),
        ('remote', 'Remote Hub'),
        ('satellite', 'Satellite Office'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, db_index=True)
    type = models.CharField(_('location type'), max_length=20, choices=TYPE_CHOICES, default='branch')
    organizational_unit = models.ForeignKey(OrganizationalUnit, on_delete=models.PROTECT, null=True, blank=True, related_name='locations', verbose_name=_('organizational unit'))
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='sub_locations', verbose_name=_('parent location'))
    address_line1 = models.CharField(_('address line 1'), max_length=255, blank=True)
    address_line2 = models.CharField(_('address line 2'), max_length=255, blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True, db_index=True)
    state_province = models.CharField(_('state/province'), max_length=100, blank=True)
    postal_code = models.CharField(_('postal code'), max_length=20, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True, db_index=True)
    timezone = models.CharField(_('timezone'), max_length=50, default='Africa/Nairobi')
    is_headquarters = models.BooleanField(_('is headquarters'), default=False, db_index=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    seating_capacity = models.PositiveIntegerField(_('seating capacity'), null=True, blank=True)
    current_occupancy = models.PositiveIntegerField(_('current occupancy'), default=0)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    email = models.EmailField(_('email address'), blank=True)

    objects = BaseStructureManager()

    class Meta:
        db_table = 'structure_location'
        verbose_name = _('location')
        verbose_name_plural = _('locations')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_location_code')
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['tenant_id', 'type', 'is_active']),
            models.Index(fields=['city', 'country']),
            models.Index(fields=['is_headquarters']),
            models.Index(fields=['organizational_unit']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name} ({self.city}, {self.country})"

    @property
    def full_address(self):
        parts = [self.address_line1, self.address_line2, self.city, self.state_province, self.postal_code, self.country]
        return ', '.join([p for p in parts if p])