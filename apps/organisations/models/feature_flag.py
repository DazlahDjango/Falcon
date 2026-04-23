from django.db import models
from .base import BaseTenantModel
from .organisation import Organisation

class FeatureFlag(BaseTenantModel):
    """
    Granular feature control for organizations, overriding plan-level settings.
    """
    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name='feature_flags'
    )
    
    feature_name = models.CharField(max_length=100)
    is_enabled = models.BooleanField(default=True)
    config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom configuration for this feature"
    )

    class Meta:
        verbose_name = "Feature Flag"
        verbose_name_plural = "Feature Flags"
        unique_together = ('organisation', 'feature_name')

    def __str__(self):
        return f"{self.feature_name}: {self.is_enabled}"
