from django.db import models
from .base import BaseConfigManager

class DisasterRecoveryPlanManager(BaseConfigManager):
    def active(self):
        return self.get_queryset().filter(status='active')
    
    def tested(self):
        return self.get_queryset().filter(status='tested')
    
    def for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id)
    
    def latest_version(self, app_id):
        return self.get_queryset().filter(app_id=app_id).order_by('-version').first()
    
    def needs_testing(self, days=30):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(status='active').exclude(last_tested_at__gte=cutoff)
    
    def requires_approval(self):
        return self.get_queryset().filter(approval_required=True, approved_at__isnull=True)
    
    def expired(self):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=365)
        return self.get_queryset().filter(created_at__lt=cutoff, status__in=['active', 'tested'])

class DisasterRecoveryExecutionManager(BaseConfigManager):
    def drills(self):
        return self.get_queryset().filter(execution_type='drill')
    
    def actual(self):
        return self.get_queryset().filter(execution_type='actual')
    
    def successful(self):
        return self.get_queryset().filter(status='success')
    
    def failed(self):
        return self.get_queryset().filter(status='failed')
    
    def for_plan(self, plan_id):
        return self.get_queryset().filter(dr_plan_id=plan_id)
    
    def for_app(self, app_id):
        return self.get_queryset().filter(dr_plan__app_id=app_id)
    
    def last_drill(self, app_id):
        return self.get_queryset().filter(dr_plan__app_id=app_id, execution_type='drill').order_by('-triggered_at').first()
    
    def this_month(self):
        from django.utils import timezone
        from datetime import timedelta
        month_ago = timezone.now() - timedelta(days=30)
        return self.get_queryset().filter(triggered_at__gte=month_ago)