from django.db import models
from apps.core.models import BaseModel
from apps.organisations.managers.subscription import SubscriptionManager
from .organisation import Organisation

class Subscription(BaseModel):
    """
    Manages the subscription status and plan for an organization.
    """
    objects = SubscriptionManager()

    PLAN_CHOICES = [
        ('STARTER', 'Starter'),
        ('PROFESSIONAL', 'Professional'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    organisation = models.OneToOneField(Organisation, on_delete=models.CASCADE, related_name='subscription')
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default='STARTER')
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.organisation.name} - {self.get_plan_type_display()}"
