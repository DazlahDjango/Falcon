from django.db import models
from django.utils.translation import gettext_lazy as _

class AssignmentStatus(models.TextChoices):
    ACTIVE = 'active', _('Active')
    PENDING = 'pending', _('Pending')
    EXPIRED = 'expired', _('Expired')
    CANCELLED = 'cancelled', _('Cancelled')