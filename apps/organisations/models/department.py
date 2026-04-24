"""
Department model for organisation structure
"""

from django.db import models
from django.conf import settings
from .base import BaseTenantModel
from .organisation import Organisation
from apps.organisations.managers import DepartmentManager


class Department(BaseTenantModel):
    """
    Represents a department within a tenant's organisation.
    """
    objects = DepartmentManager()

    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True,
                            help_text="Department code (e.g., 'HR', 'IT')")
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_departments'
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        unique_together = ('organisation', 'name')
        ordering = ['name']
        indexes = [
            models.Index(fields=['organisation', 'name']),
            models.Index(fields=['organisation', 'parent']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organisation.name})"

    def get_full_path(self):
        """Get the full department path"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name

    def get_descendants(self, include_self=False):
        """
        Get all sub-departments recursively.
        """
        descendants = []
        if include_self:
            descendants.append(self)

        for child in self.sub_departments.all():
            descendants.extend(child.get_descendants(include_self=True))
        return descendants

    def get_ancestors(self, include_self=False):
        """
        Get all parent departments up to the root.
        """
        ancestors = []
        if include_self:
            ancestors.append(self)

        if self.parent:
            ancestors.extend(self.parent.get_ancestors(include_self=True))
        return ancestors

    def get_member_count(self):
        """
        Get total number of employees in this department and all its descendants.
        """
        from apps.accounts.models import User
        descendant_ids = [
            d.id for d in self.get_descendants(include_self=True)]
        return User.objects.filter(
            models.Q(department_id__in=descendant_ids) |
            models.Q(team__department_id__in=descendant_ids)
        ).distinct().count()

    def get_sub_department_count(self):
        """Get total number of sub-departments at any depth"""
        return len(self.get_descendants())
