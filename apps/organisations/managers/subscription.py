from django.db import models
from django.utils import timezone

class SubscriptionManager(models.Manager):
    def active(self):
        """Returns currently active subscriptions."""
        today = timezone.now().date()
        return self.filter(
            is_active=True,
            start_date__lte=today,
        ).exclude(end_date__lt=today)

    def expiring_soon(self, days=30):
        """Returns subscriptions expiring within the next N days."""
        today = timezone.now().date()
        target_date = today + timezone.timedelta(days=days)
        return self.filter(
            is_active=True,
            end_date__range=(today, target_date)
        )
