import uuid
from django.db import models
from .base import BaseModel
from apps.reportplt.managers.base import SoftDeleteManager

class DistributionList(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    recipient_emails = models.JSONField(default=list)
    recipient_users = models.ManyToManyField('accounts.User', blank=True, related_name='report_distributions')

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'reporting_distribution_list'
        verbose_name = 'Distribution List'
        verbose_name_plural = 'Distribution Lists'

    def __str__(self):
        return self.name
