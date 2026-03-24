from django.db import models

class DepartmentManager(models.Manager):
    def roots(self):
        """Returns top-level departments (no parent)."""
        return self.filter(parent__isnull=True)

class HierarchyManager(models.Manager):
    def get_subordinates(self, user):
        """Returns a queryset of the given user's direct subordinates."""
        return self.filter(supervisor=user)

    def get_supervisor(self, user):
        """Returns the specific hierarchy record where the user is subordinate."""
        return self.filter(subordinate=user).first()
