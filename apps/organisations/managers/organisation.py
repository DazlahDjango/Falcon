from django.db import models

class OrganisationManager(models.Manager):
    def active(self):
        """Returns only active organisations."""
        return self.filter(is_active=True)

    def with_domains(self):
        """Returns organisations with pre-fetched domains."""
        return self.prefetch_related('domains')
