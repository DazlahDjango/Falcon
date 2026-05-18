from django.db import models

class BaseConfigManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    
    def for_user(self, user_id, role):
        if role == 'super_admin':
            return self.get_queryset()
        elif role == 'client_admin':
            return self.get_queryset().filter(created_by=user_id)
        return self.get_queryset().none()
    
    def recent(self, days=7):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff)