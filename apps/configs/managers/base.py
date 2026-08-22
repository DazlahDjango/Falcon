from django.db import models

class BaseConfigManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    
    def for_user(self, user_id, role, tenant_id=None):
        if role == 'super_admin':
            return self.get_queryset()
        elif role == 'client_admin':
            if tenant_id:
                field_names = [f.name for f in self.model._meta.get_fields()]
                if 'tenant_id' in field_names:
                    return self.get_queryset().filter(tenant_id=tenant_id)
                elif 'tenant' in field_names:
                    return self.get_queryset().filter(tenant_id=tenant_id)
            field_names = [f.name for f in self.model._meta.get_fields()]
            if 'created_by' in field_names:
                return self.get_queryset().filter(created_by=user_id)
            return self.get_queryset()
        return self.get_queryset().none()
    
    def recent(self, days=7):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff)