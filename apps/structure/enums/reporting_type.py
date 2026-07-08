from django.db import models
from django.utils.translation import gettext_lazy as _

class ReportingType(models.TextChoices):
    SOLID = 'solid', _('Solid Line')
    INTERIM = 'interim', _('Interim')
    ACTING = 'acting', _('Acting')