from django.db import models
from .base import BaseConfigManager

class BackupArtifactManager(BaseConfigManager):
    def verified(self):
        return self.get_queryset().filter(status='verified')
    
    def corrupt(self):
        return self.get_queryset().filter(status='corrupt')
    
    def by_storage(self, storage_location):
        return self.get_queryset().filter(storage_location=storage_location)
    
    def for_job(self, job_id):
        return self.get_queryset().filter(backup_job_id=job_id)
    
    def older_than(self, days):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__lt=cutoff)
    
    def not_verified(self):
        return self.get_queryset().filter(status__in=['uploaded', 'verifying'])
    
    def archived(self):
        return self.get_queryset().filter(status='archived')
    
    def restorable(self):
        return self.get_queryset().filter(status__in=['verified', 'uploaded'])
    
    def largest(self, limit=10):
        return self.get_queryset().filter(size_bytes__isnull=False).order_by('-size_bytes')[:limit]