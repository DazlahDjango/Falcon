from django.db import models
from django.utils.translation import gettext_lazy as _

class OrgLevel(models.TextChoices):
    DIVISION = 'division', _('Division')
    DEPARTMENT = 'department', _('Department')
    SECTION = 'section', _('Section')
    UNIT = 'unit', _('Unit')