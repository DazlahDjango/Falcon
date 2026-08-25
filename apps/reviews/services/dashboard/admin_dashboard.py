from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from ...models import ReviewCycle, FinalRating, SelfAssessment, SupervisorReview, PIP, PromotionRecommendation, CalibrationSession
from .base_dashboard import BaseDashboardService

class AdminDashboardService(BaseDashboardService):
    @classmethod
    def get_dashboard(cls, tenant_id):
        cache_key = cls._cache_key(tenant_id, 'admin', 'admin')
        cached = cls._get_cached(tenant_id, 'admin', 'admin')
        if cached:
            return cached
        data = {
            'system_health': cls._get_system_health(tenant_id),
            'cycle_management': cls._get_cycle_management(tenant_id),
            'completion_analytics': cls._get_completion_analytics(tenant_id),
            'quality_metrics': cls._get_quality_metrics(tenant_id),
            'pip_oversight': cls._get_pip_oversight(tenant_id),
            'promotion_oversight': cls._get_promotion_oversight(tenant_id),
            'calibration_oversight': cls._get_calibration_oversight(tenant_id),
            'recent_audit_feed': cls._get_recent_audit_feed(tenant_id),
            'export_ready': cls._get_export_ready(tenant_id),
        }
        cls._set_cached(tenant_id, 'admin', 'admin', data)
        return data
    @classmethod
    def _get_system_health(cls, tenant_id):
        active_cycles = ReviewCycle.objects.filter(tenant_id=tenant_id, status='submitted').count()
        pending_sa = SelfAssessment.objects.filter(tenant_id=tenant_id, status='draft').count()
        pending_sr = SupervisorReview.objects.filter(tenant_id=tenant_id, status='draft').count()
        overdue_sa = SelfAssessment.objects.filter(tenant_id=tenant_id, status='draft', review_cycle__self_assessment_deadline__lt=timezone.now().date()).count()
        overdue_sr = SupervisorReview.objects.filter(tenant_id=tenant_id, status='draft', review_cycle__supervisor_review_deadline__lt=timezone.now().date()).count()
        return {'active_review_cycles': active_cycles, 'pending_self_assessments': pending_sa, 'pending_supervisor_reviews': pending_sr, 'overdue_self_assessments': overdue_sa, 'overdue_supervisor_reviews': overdue_sr}
    @classmethod
    def _get_cycle_management(cls, tenant_id):
        cycles = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('-start_date')[:5]
        return [{'id': str(c.id), 'name': c.name, 'status': c.status, 'start_date': c.start_date.isoformat(), 'end_date': c.end_date.isoformat(), 'self_assessment_deadline': c.self_assessment_deadline.isoformat(), 'supervisor_review_deadline': c.supervisor_review_deadline.isoformat()} for c in cycles]
    @classmethod
    def _get_completion_analytics(cls, tenant_id):
        total_employees = SelfAssessment.objects.filter(tenant_id=tenant_id).values('employee').distinct().count()
        if total_employees == 0:
            return {'self_assessment_rate': 0, 'supervisor_review_rate': 0, 'final_rating_rate': 0}
        sa_submitted = SelfAssessment.objects.filter(tenant_id=tenant_id, status='submitted').values('employee').distinct().count()
        sr_approved = SupervisorReview.objects.filter(tenant_id=tenant_id, status='approved').values('employee').distinct().count()
        fr_locked = FinalRating.objects.filter(tenant_id=tenant_id, status='locked').values('employee').distinct().count()
        return {'self_assessment_rate': round((sa_submitted / total_employees) * 100, 1), 'supervisor_review_rate': round((sr_approved / total_employees) * 100, 1), 'final_rating_rate': round((fr_locked / total_employees) * 100, 1)}
    @classmethod
    def _get_quality_metrics(cls, tenant_id):
        ratings = FinalRating.objects.filter(tenant_id=tenant_id, final_score__isnull=False)
        total = ratings.count()
        if total == 0:
            return {'average_score': None, 'distribution': {}, 'calibration_impact': 0}
        avg_score = ratings.aggregate(avg=Avg('final_score'))['avg']
        distribution = ratings.values('final_rating_label').annotate(count=Count('id'))
        calibrated = ratings.filter(calibration_adjustment__isnull=False)
        avg_adjustment = calibrated.aggregate(avg=Avg('calibration_adjustment'))['avg']
        return {'average_score': round(float(avg_score), 1), 'distribution': {r['final_rating_label']: r['count'] for r in distribution}, 'calibration_impact': round(float(avg_adjustment), 1) if avg_adjustment else 0, 'calibrated_count': calibrated.count()}
    @classmethod
    def _get_pip_oversight(cls, tenant_id):
        pips = PIP.objects.filter(tenant_id=tenant_id)
        severity_counts = {r['severity']: r['count'] for r in pips.values('severity').annotate(count=Count('id')) if r['severity']}
        return {
            'total_pips': pips.count(),
            'active_pips': pips.filter(status__in=['draft', 'submitted']).count(),
            'success_rate': round((pips.filter(outcome='successful').count() / pips.filter(status='completed').count()) * 100, 1) if pips.filter(status='completed').count() > 0 else 0,
            'by_severity': severity_counts
        }
    @classmethod
    def _get_promotion_oversight(cls, tenant_id):
        promotions = PromotionRecommendation.objects.filter(tenant_id=tenant_id)
        return {'pending': promotions.filter(status='pending').count(), 'approved_this_quarter': promotions.filter(status='approved', approved_at__gte=timezone.now() - timezone.timedelta(days=90)).count(), 'completed_this_quarter': promotions.filter(status='completed', actual_promotion_date__gte=timezone.now() - timezone.timedelta(days=90)).count()}
    @classmethod
    def _get_calibration_oversight(cls, tenant_id):
        sessions = CalibrationSession.objects.filter(tenant_id=tenant_id)
        return {'total_sessions': sessions.count(), 'upcoming': sessions.filter(scheduled_date__gte=timezone.now(), status='draft').count(), 'completed_this_month': sessions.filter(outcome='completed', actual_end_time__gte=timezone.now() - timezone.timedelta(days=30)).count()}
    @classmethod
    def _get_export_ready(cls, tenant_id):
        latest_cycle = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('-end_date').first()
        return {'can_export_full_report': latest_cycle is not None and latest_cycle.status in ['completed', 'approved', 'archived'], 'latest_cycle_name': latest_cycle.name if latest_cycle else None, 'export_formats': ['csv', 'excel', 'pdf']}
    @classmethod
    def _get_recent_audit_feed(cls, tenant_id):
        from ...models import ReviewAuditLog
        from apps.accounts.models import User
        
        logs = ReviewAuditLog.objects.filter(tenant_id=tenant_id).order_by('-created_at')[:5]
        actor_ids = [l.actor_id for l in logs if l.actor_id]
        
        actors = {}
        if actor_ids:
            actors = {
                str(u.id): u.get_full_name() or u.email
                for u in User.objects.filter(id__in=actor_ids)
            }
            
        feed = []
        for l in logs:
            feed.append({
                'id': str(l.id),
                'model_name': l.model_name,
                'action': l.get_action_display(),
                'object_id': l.object_id,
                'actor': actors.get(str(l.actor_id)) if l.actor_id else 'System',
                'ip_address': l.ip_address,
                'created_at': l.created_at.isoformat()
            })
        return feed