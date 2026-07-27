from django.db.models import Count, Avg, Q
from django.utils import timezone
from ...models import ReviewCycle, FinalRating, SupervisorReview, SelfAssessment, PIP, PromotionRecommendation
from .base_dashboard import BaseDashboardService

class ExecutiveDashboardService(BaseDashboardService):
    @classmethod
    def get_dashboard(cls, tenant_id, department_id=None):
        cache_key = cls._cache_key(tenant_id, 'executive', f'exec_{department_id or "all"}')
        cached = cls._get_cached(tenant_id, 'executive', f'exec_{department_id or "all"}')
        if cached:
            return cached
        data = {
            'tenant_overview': cls._get_tenant_overview(tenant_id, department_id),
            'cycle_performance': cls._get_cycle_performance(tenant_id, department_id),
            'department_rankings': cls._get_department_rankings(tenant_id),
            'promotion_pipeline': cls._get_promotion_pipeline(tenant_id, department_id),
            'pip_summary': cls._get_pip_summary(tenant_id, department_id),
            'calibration_needs': cls._get_calibration_needs(tenant_id, department_id),
            'top_bottom_competencies': cls._get_top_bottom_competencies(tenant_id, department_id),
            'trends': cls._get_trends(tenant_id, department_id),
        }
        cls._set_cached(tenant_id, 'executive', f'exec_{department_id or "all"}', data)
        return data
    @classmethod
    def _get_tenant_overview(cls, tenant_id, department_id=None):
        from apps.accounts.models import User
        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        if department_id:
            users = users.filter(department_id=department_id)
        total_employees = users.count()
        active_cycles = ReviewCycle.objects.filter(tenant_id=tenant_id, status='submitted').count()
        completed_cycles = ReviewCycle.objects.filter(tenant_id=tenant_id, status='completed').count()
        return {'total_employees': total_employees, 'active_cycles': active_cycles, 'completed_cycles': completed_cycles, 'cycle_completion_rate': round((completed_cycles / (active_cycles + completed_cycles)) * 100, 1) if (active_cycles + completed_cycles) > 0 else 0}
    @classmethod
    def _get_cycle_performance(cls, tenant_id, department_id=None):
        latest_cycle = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('-end_date').first()
        if not latest_cycle:
            return None
        ratings = FinalRating.objects.filter(review_cycle=latest_cycle, final_score__isnull=False)
        if department_id:
            ratings = ratings.filter(employee__department_id=department_id)
        avg_score = ratings.aggregate(avg=Avg('final_score'))['avg']
        distribution = ratings.values('final_rating_label').annotate(count=Count('id'))
        self_assessment_rate = SelfAssessment.objects.filter(review_cycle=latest_cycle)
        if department_id:
            self_assessment_rate = self_assessment_rate.filter(employee__department_id=department_id)
        sa_total = self_assessment_rate.count()
        sa_submitted = self_assessment_rate.filter(status='submitted').count()
        review_rate = SupervisorReview.objects.filter(review_cycle=latest_cycle)
        if department_id:
            review_rate = review_rate.filter(employee__department_id=department_id)
        sr_total = review_rate.count()
        sr_approved = review_rate.filter(status='approved').count()
        return {'cycle_name': latest_cycle.name, 'average_score': round(float(avg_score), 1) if avg_score else None, 'distribution': {r['final_rating_label']: r['count'] for r in distribution}, 'self_assessment_completion': round((sa_submitted / sa_total) * 100, 1) if sa_total > 0 else 0, 'review_completion': round((sr_approved / sr_total) * 100, 1) if sr_total > 0 else 0}
    @classmethod
    def _get_department_rankings(cls, tenant_id):
        from apps.accounts.models import User
        from apps.structure.models import Department
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        rankings = []
        for dept in departments:
            employees = User.objects.filter(tenant_id=tenant_id, department=dept, is_active=True)
            avg_score = FinalRating.objects.filter(employee__in=employees, final_score__isnull=False).aggregate(avg=Avg('final_score'))['avg']
            if avg_score:
                rankings.append({'department': dept.name, 'average_score': round(float(avg_score), 1), 'employee_count': employees.count()})
        return sorted(rankings, key=lambda x: x['average_score'], reverse=True)[:10]
    @classmethod
    def _get_promotion_pipeline(cls, tenant_id, department_id=None):
        promotions = PromotionRecommendation.objects.filter(tenant_id=tenant_id, status='pending')
        if department_id:
            promotions = promotions.filter(employee__department_id=department_id)
        return {'pending_promotions': promotions.count(), 'by_priority': promotions.values('priority').annotate(count=Count('id')), 'recent_approved': PromotionRecommendation.objects.filter(tenant_id=tenant_id, status='approved', approved_at__gte=timezone.now() - timezone.timedelta(days=30)).count()}
    @classmethod
    def _get_pip_summary(cls, tenant_id, department_id=None):
        pips = PIP.objects.filter(tenant_id=tenant_id)
        if department_id:
            pips = pips.filter(employee__department_id=department_id)
        return {'active_pips': pips.filter(status__in=['draft', 'submitted']).count(), 'successful_rate': round((pips.filter(outcome='successful').count() / pips.filter(status='completed').count()) * 100, 1) if pips.filter(status='completed').count() > 0 else 0, 'by_severity': pips.values('severity').annotate(count=Count('id'))}
    @classmethod
    def _get_calibration_needs(cls, tenant_id, department_id=None):
        from ..calibration.outlier_detector import OutlierDetector
        latest_cycle = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('-end_date').first()
        if not latest_cycle:
            return {'outliers_count': 0, 'inconsistent_managers_count': 0}
        outliers = OutlierDetector.find_outliers(latest_cycle)
        if department_id:
            outliers = [o for o in outliers if o.get('department') == department_id or True]
        managers = OutlierDetector.find_inconsistent_managers(latest_cycle)
        return {'outliers_count': len(outliers), 'inconsistent_managers_count': len(managers), 'recommendations': OutlierDetector.get_calibration_recommendations(latest_cycle)}
    @classmethod
    def _get_trends(cls, tenant_id, department_id=None):
        cycles = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('end_date')[:4]
        trends = []
        for cycle in cycles:
            ratings = FinalRating.objects.filter(review_cycle=cycle, final_score__isnull=False)
            if department_id:
                ratings = ratings.filter(employee__department_id=department_id)
            avg_score = ratings.aggregate(avg=Avg('final_score'))['avg']
            trends.append({'cycle': cycle.name, 'average_score': round(float(avg_score), 1) if avg_score else None, 'end_date': cycle.end_date.isoformat()})
        return trends
    @classmethod
    def _get_top_bottom_competencies(cls, tenant_id, department_id=None):
        from ...models import ReviewCycle, SupervisorReview, CompetencyRating
        from django.contrib.contenttypes.models import ContentType
        
        latest_cycle = ReviewCycle.objects.filter(tenant_id=tenant_id).order_by('-end_date').first()
        if not latest_cycle:
            return {'top': [], 'bottom': []}
            
        sr_type = ContentType.objects.get_for_model(SupervisorReview)
        reviews = SupervisorReview.objects.filter(review_cycle=latest_cycle, status='approved')
        if department_id:
            reviews = reviews.filter(employee__department_id=department_id)
            
        review_ids = [str(r.id) for r in reviews]
        if not review_ids:
            return {'top': [], 'bottom': []}
            
        ratings = CompetencyRating.objects.filter(
            content_type=sr_type,
            object_id__in=review_ids,
            is_primary=True
        ).values('competency__name').annotate(avg_score=Avg('raw_score')).order_by('-avg_score')
        
        rating_list = [
            {'competency': r['competency__name'], 'score': round(float(r['avg_score']), 1)}
            for r in ratings
        ]
        
        top = rating_list[:3]
        bottom = rating_list[::-1][:3] if len(rating_list) > 0 else []
        
        return {'top': top, 'bottom': bottom}