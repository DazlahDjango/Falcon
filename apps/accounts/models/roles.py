from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Permission
from .base import BaseModel

class Role(BaseModel):
    name = models.CharField(_('name'), max_length=50, unique=True, db_index=True)
    code = models.CharField(_('code'), max_length=30, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children', verbose_name=_('parent role'))
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles', verbose_name=_('permissions'))
    ROLE_TYPE_SYSTEM = 'system'
    ROLE_TYPE_CUSTOM = 'custom'
    ROLE_TYPE_CHOICES = [
        (ROLE_TYPE_SYSTEM, 'System'),
        (ROLE_TYPE_CUSTOM, 'Custom'),
    ]
    role_type = models.CharField(_('role type'), max_length=10, choices=ROLE_TYPE_CHOICES, default=ROLE_TYPE_CUSTOM)
    # Falcon PMS role maping
    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_CLIENT_ADMIN = 'client_admin'
    ROLE_DASHBOARD_CHAMPION = 'dashboard_champion'
    ROLE_EXECUTIVE = 'executive'
    ROLE_SUPERVISOR = 'supervisor'
    ROLE_STAFF = 'staff'
    ROLE_READ_ONLY = 'read_only'
    SYSTEM_ROLES = [
        ROLE_SUPER_ADMIN,
        ROLE_CLIENT_ADMIN,
        ROLE_DASHBOARD_CHAMPION,
        ROLE_EXECUTIVE,
        ROLE_SUPERVISOR,
        ROLE_STAFF,
        ROLE_READ_ONLY,
    ]
    is_assignable = models.BooleanField(_('assignable'), default=True)
    is_system = models.BooleanField(_('system role'), default=False)
    order = models.PositiveSmallIntegerField(_('order'), default=0)

    class Meta:
        db_table = 'accounts_role'
        verbose_name = _('role')
        verbose_name_plural = _('roles')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['parent', 'tenant_id']),
            models.Index(fields=['is_system', 'is_assignable']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_all_permissions(self):
        perms = set(self.permissions.values_list('codename',flat=True))
        if self.parent:
            perms.update(self.parent.get_all_permissions())
        return perms
    
    def has_permission(self, perm_codename):
        return perm_codename in self.get_all_permissions()
    
    @classmethod
    def get_system_role(cls, role_code):
        return cls.objects.filter(code=role_code, is_system=True, is_deleted=False).first()
    
    def get_hierarchy_level(self):
        level = 0
        current = self
        while current.parent:
            level += 1
            current = current.parent
        return level
    
    def is_higher_than(self, other_role):
        return self.get_hierarchy_level() < other_role.get_hierarchy_level()
    
    def save(self, *args, **kwargs):
        if self.code in self.SYSTEM_ROLES:
            self.is_system = True
            self.role_type = self.ROLE_TYPE_SYSTEM
        super().save(*args, **kwargs)