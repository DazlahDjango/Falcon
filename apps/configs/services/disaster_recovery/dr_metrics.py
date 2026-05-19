# apps/config/services/disaster_recovery/dr_metrics.py
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.db import models
from datetime import timedelta
from apps.configs.models import DisasterRecoveryExecution, DisasterRecoveryPlan

class DisasterRecoveryMetrics:
    def get_rto_achievement_rate(self, app_id=None, days=90):
        cutoff = timezone.now() - timedelta(days=days)
        qs = DisasterRecoveryExecution.objects.filter(
            execution_type='actual',
            status='success',
            triggered_at__gte=cutoff
        )
        if app_id:
            qs = qs.filter(dr_plan__app_id=app_id)
        total = qs.count()
        if total == 0:
            return 0
        met_rto = qs.filter(rto_achieved_minutes__lte=models.F('dr_plan__rto_target_minutes')).count()
        return (met_rto / total) * 100
    def get_rpo_achievement_rate(self, app_id=None, days=90):
        cutoff = timezone.now() - timedelta(days=days)
        qs = DisasterRecoveryExecution.objects.filter(
            execution_type='actual',
            status='success',
            triggered_at__gte=cutoff
        )
        if app_id:
            qs = qs.filter(dr_plan__app_id=app_id)
        total = qs.count()
        if total == 0:
            return 0
        met_rpo = qs.filter(rpo_achieved_minutes__lte=models.F('dr_plan__rpo_target_minutes')).count()
        return (met_rpo / total) * 100
    def get_drill_success_rate(self, app_id=None, days=90):
        cutoff = timezone.now() - timedelta(days=days)
        qs = DisasterRecoveryExecution.objects.filter(
            execution_type='drill',
            triggered_at__gte=cutoff
        )
        if app_id:
            qs = qs.filter(dr_plan__app_id=app_id)
        total = qs.count()
        if total == 0:
            return 0
        successful = qs.filter(status='success').count()
        return (successful / total) * 100
    def get_recommended_drill_frequency(self, app_id):
        plan = DisasterRecoveryPlan.objects.filter(app_id=app_id, status='active').first()
        if not plan:
            return 30
        last_drill = DisasterRecoveryExecution.objects.filter(
            dr_plan=plan,
            execution_type='drill'
        ).order_by('-triggered_at').first()
        if not last_drill:
            return plan.test_frequency_days
        days_since = (timezone.now() - last_drill.triggered_at).days
        if days_since > plan.test_frequency_days:
            return 0
        return plan.test_frequency_days - days_since