from django.db import models
from .base import BaseConfigManager

class EncryptionKeyManager(BaseConfigManager):
    def active(self):
        return self.get_queryset().filter(key_status='active')
    
    def default(self):
        return self.get_queryset().filter(is_default=True, key_status='active').first()
    
    def by_source(self, key_source):
        return self.get_queryset().filter(key_source=key_source)
    
    def expired(self):
        from django.utils import timezone
        return self.get_queryset().filter(expires_at__lt=timezone.now())
    
    def compromised(self):
        return self.get_queryset().filter(key_status='compromised')
    
    def needs_rotation(self, days=90):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(
            key_status='active', rotated_at__lt=cutoff
        ).exclude(is_default=True)
    
    def least_used(self):
        return self.get_queryset().filter(key_status='active').order_by('usage_count')
    
    def by_key_id(self, key_id):
        return self.get_queryset().filter(key_id=key_id).first()
    
    def by_alias(self, alias):
        return self.get_queryset().filter(key_alias=alias).first()