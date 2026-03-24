from django.db import models
from apps.core.models import BaseModel
from .organisation import Organisation

class Domain(BaseModel):
    """
    Manages URLs/subdomains for the organization.
    """
    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='domains')
    domain_name = models.CharField(max_length=255, unique=True)
    is_primary = models.BooleanField(default=True)

    def __str__(self):
        return self.domain_name
