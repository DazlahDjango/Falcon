from django.db import models
from .base import BaseConfigManager

class BackupJobManager(BaseConfigManager):
    def pending(self):
        return self.get_queryset().filter(status='pending')
    
    def running(self):
        return self.get_queryset().filter(status='running')
    
    def completed(self):
        return self.get_queryset().filter(status='completed')
    
    def failed(self):
        return self.get_queryset().filter(status='failed')
    
    def for_app(self, app_name):
        return self.get_queryset().filter(app__name=app_name)
    
    def by_type(self, backup_type):
        return self.get_queryset().filter(backup_type=backup_type)
    
    def last_successful(self, app_id):
        return self.get_queryset().filter(app_id=app_id, status='completed').order_by('-completed_at').first()
    
    def last_full_backup(self, app_id):
        return self.get_queryset().filter(app_id=app_id, backup_type='full', status='completed').order_by('-completed_at').first()
    
    def in_date_range(self, start_date, end_date):
        return self.get_queryset().filter(started_at__gte=start_date, started_at__lte=end_date)
    
    def today(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.get_queryset().filter(started_at__date=today)
    
    def this_week(self):
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        return self.get_queryset().filter(started_at__gte=week_ago)
    
    def by_triggered_by(self, user_id):
        return self.get_queryset().filter(triggered_by=user_id)
    
    def by_triggered_by_role(self, role):
        return self.get_queryset().filter(triggered_by_role=role)
    
    def needing_verification(self):
        return self.get_queryset().filter(status='completed', artifact__verified_at__isnull=True)
    
    def failed_recently(self, hours=24):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.get_queryset().filter(status='failed', started_at__gte=cutoff)
    
    def retry_needed(self):
        return self.get_queryset().filter(status='failed', retry_count__lt=3)

class BackupJobDetailManager(BaseConfigManager):
    def for_job(self, job_id):
        return self.get_queryset().filter(backup_job_id=job_id)
    
    def by_type(self, detail_type):
        return self.get_queryset().filter(detail_type=detail_type)
    
    def failed(self):
        return self.get_queryset().filter(status='failed')
    
    def completed(self):
        return self.get_queryset().filter(status='completed')