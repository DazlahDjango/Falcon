# apps/reportplt/services/extraction/production/reviews_extractor.py
import logging
from typing import Dict, Any, List, Optional
from django.db.models import Avg, Count, Sum, Q, StdDev
from django.utils import timezone
from datetime import timedelta

from apps.reviews.models import (
    ReviewCycle, SelfAssessment, SupervisorReview, FinalRating,
    CompetencyRating, Competency, PIP, PIPAction, PIPReview,
    CalibrationSession, CalibrationRating, FeedbackSummary,
    PromotionRecommendation
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 1. Individual Summary Extractor
# ---------------------------------------------------------------------------
class ReviewsIndividualSummaryExtractor:
    """Extracts individual employee 360 review scorecards, self vs supervisor rating comparison, and timeline."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cycle_id = self.filters.get('cycle_id')
        employee_id = self.filters.get('employee_id')

        cycles = ReviewCycle.objects.all()
        if self.tenant_id:
            cycles = cycles.filter(tenant_id=self.tenant_id)
        if cycle_id:
            cycles = cycles.filter(id=cycle_id)

        active_cycle = cycles.first()
        if not active_cycle:
            return {'summary': {}, 'ratings': []}

        ratings_qs = FinalRating.objects.filter(review_cycle=active_cycle)
        if self.tenant_id:
            ratings_qs = ratings_qs.filter(tenant_id=self.tenant_id)
        if employee_id:
            ratings_qs = ratings_qs.filter(employee_id=employee_id)

        total_evaluated = ratings_qs.count()

        # Scorecard rows
        individual_rows = []
        for r in ratings_qs.select_related('employee', 'review_cycle').order_by('-final_score')[:150]:
            emp = r.employee
            self_ass = SelfAssessment.objects.filter(review_cycle=active_cycle, employee=emp).first()
            sup_rev = SupervisorReview.objects.filter(review_cycle=active_cycle, employee=emp).first()

            individual_rows.append({
                'rating_id': str(r.id),
                'employee_id': str(emp.id) if emp else '',
                'employee_name': emp.get_full_name() if emp else 'Unknown',
                'employee_email': emp.email if emp else '',
                'department': emp.department.name if emp and hasattr(emp, 'department') and emp.department else '',
                'cycle_name': active_cycle.name,
                'kpi_score': float(r.kpi_score) if r.kpi_score is not None else 0.0,
                'competency_score': float(r.competency_score) if r.competency_score is not None else 0.0,
                'final_score': float(r.final_score) if r.final_score is not None else 0.0,
                'rating_label': r.final_rating_label or '',
                'rating_color': r.final_rating_color or 'gray',
                'status': r.status,
                'self_avg_rating': float(self_ass.avg_competency_rating) if self_ass and self_ass.avg_competency_rating else None,
                'supervisor_avg_rating': float(sup_rev.avg_competency_rating) if sup_rev and sup_rev.avg_competency_rating else None,
            })

        return {
            'summary': {
                'cycle_name': active_cycle.name,
                'total_evaluated_employees': total_evaluated,
            },
            'individual_scorecards': individual_rows,
        }


# ---------------------------------------------------------------------------
# 2. Cycle Compliance Extractor
# ---------------------------------------------------------------------------
class ReviewsCycleComplianceExtractor:
    """Extracts review cycle completion status, submission compliance rates, and department status matrix."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cycle_id = self.filters.get('cycle_id')
        cycles = ReviewCycle.objects.all()
        if self.tenant_id:
            cycles = cycles.filter(tenant_id=self.tenant_id)
        if cycle_id:
            cycles = cycles.filter(id=cycle_id)

        active_cycle = cycles.first()
        if not active_cycle:
            return {'summary': {}, 'department_compliance': []}

        # Submissions
        self_qs = SelfAssessment.objects.filter(review_cycle=active_cycle)
        sup_qs = SupervisorReview.objects.filter(review_cycle=active_cycle)
        final_qs = FinalRating.objects.filter(review_cycle=active_cycle)

        if self.tenant_id:
            self_qs = self_qs.filter(tenant_id=self.tenant_id)
            sup_qs = sup_qs.filter(tenant_id=self.tenant_id)
            final_qs = final_qs.filter(tenant_id=self.tenant_id)

        total_participants = active_cycle.get_participating_employees().count() if hasattr(active_cycle, 'get_participating_employees') else final_qs.count()
        total_participants = max(total_participants, final_qs.count())

        self_submitted = self_qs.filter(status='submitted').count()
        sup_approved = sup_qs.filter(status='approved').count()
        ratings_locked = final_qs.filter(status='locked').count()

        self_completion_rate = round((self_submitted / total_participants * 100), 1) if total_participants else 0.0
        sup_completion_rate = round((sup_approved / total_participants * 100), 1) if total_participants else 0.0
        overall_completion_rate = round((ratings_locked / total_participants * 100), 1) if total_participants else 0.0

        # Department breakdown
        dept_matrix = list(
            final_qs.filter(employee__department__isnull=False)
            .values('employee__department__name')
            .annotate(
                total=Count('id'),
                locked=Count('id', filter=Q(status='locked')),
                avg_score=Avg('final_score')
            ).order_by('-total')
        )
        for d in dept_matrix:
            d['completion_rate_pct'] = round((d['locked'] / d['total'] * 100), 1) if d['total'] else 0.0
            d['avg_score'] = round(float(d['avg_score'] or 0.0), 1)

        return {
            'summary': {
                'cycle_name': active_cycle.name,
                'cycle_status': active_cycle.status,
                'start_date': active_cycle.start_date.isoformat() if active_cycle.start_date else None,
                'end_date': active_cycle.end_date.isoformat() if active_cycle.end_date else None,
                'total_participants': total_participants,
                'self_submitted': self_submitted,
                'supervisor_approved': sup_approved,
                'ratings_locked': ratings_locked,
                'self_completion_rate_pct': self_completion_rate,
                'supervisor_completion_rate_pct': sup_completion_rate,
                'overall_completion_rate_pct': overall_completion_rate,
            },
            'department_compliance': dept_matrix,
        }


# ---------------------------------------------------------------------------
# 3. Organization Performance Extractor
# ---------------------------------------------------------------------------
class ReviewsOrganizationPerformanceExtractor:
    """Extracts tenant strategic performance scores, bell-curve rating distributions, and competency rankings."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cycle_id = self.filters.get('cycle_id')
        cycles = ReviewCycle.objects.all()
        if self.tenant_id:
            cycles = cycles.filter(tenant_id=self.tenant_id)
        if cycle_id:
            cycles = cycles.filter(id=cycle_id)

        active_cycle = cycles.first()
        if not active_cycle:
            return {'summary': {}, 'rating_distribution': []}

        ratings_qs = FinalRating.objects.filter(review_cycle=active_cycle)
        if self.tenant_id:
            ratings_qs = ratings_qs.filter(tenant_id=self.tenant_id)

        total_rated = ratings_qs.count()
        avg_scores = ratings_qs.aggregate(
            overall=Avg('final_score'),
            kpi=Avg('kpi_score'),
            competency=Avg('competency_score'),
            std_dev=StdDev('final_score')
        )

        avg_overall = round(float(avg_scores['overall'] or 0.0), 1)
        avg_kpi = round(float(avg_scores['kpi'] or 0.0), 1)
        avg_competency = round(float(avg_scores['competency'] or 0.0), 1)
        std_dev = round(float(avg_scores['std_dev'] or 0.0), 1)

        # Rating distribution / bell curve
        distribution = list(
            ratings_qs.values('final_rating_label', 'final_rating_color')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        for dist in distribution:
            dist['percentage'] = round((dist['count'] / total_rated * 100), 1) if total_rated else 0.0

        # Strongest vs weakest competencies
        comp_ratings = CompetencyRating.objects.filter(
            supervisor_review__review_cycle=active_cycle,
            raw_score__isnull=False
        )
        if self.tenant_id:
            comp_ratings = comp_ratings.filter(tenant_id=self.tenant_id)

        strongest_competencies = []
        weakest_competencies = []
        if comp_ratings.exists():
            comp_averages = list(
                comp_ratings.values('competency__name')
                .annotate(avg_score=Avg('raw_score'))
                .order_by('-avg_score')
            )
            for item in comp_averages[:3]:
                score_val = float(item['avg_score'])
                strongest_competencies.append({
                    'name': item['competency__name'],
                    'score': round(score_val, 2),
                    'percentage': round((score_val / 5.0) * 100, 1)
                })
            for item in comp_averages[-3:]:
                score_val = float(item['avg_score'])
                weakest_competencies.insert(0, {
                    'name': item['competency__name'],
                    'score': round(score_val, 2),
                    'percentage': round((score_val / 5.0) * 100, 1)
                })

        # Department performance ranking
        dept_rankings = list(
            ratings_qs.filter(employee__department__isnull=False)
            .values('employee__department__name')
            .annotate(avg_score=Avg('final_score'))
            .order_by('-avg_score')
        )
        for d in dept_rankings:
            score = round(float(d['avg_score']), 1)
            d['avg_score'] = score
            d['variance'] = round(score - avg_overall, 1)

        return {
            'summary': {
                'cycle_name': active_cycle.name,
                'total_rated_employees': total_rated,
                'avg_overall_score': avg_overall,
                'avg_kpi_score': avg_kpi,
                'avg_competency_score': avg_competency,
                'std_dev': std_dev,
                'strongest_competencies': strongest_competencies,
                'weakest_competencies': weakest_competencies,
            },
            'rating_distribution': distribution,
            'department_rankings': dept_rankings,
        }


# ---------------------------------------------------------------------------
# 4. Calibration Impact Extractor
# ---------------------------------------------------------------------------
class ReviewsCalibrationImpactExtractor:
    """Extracts score shifts, committee adjustments, pre vs post calibration variance, and manager leniency."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cycle_id = self.filters.get('cycle_id')
        sessions_qs = CalibrationSession.objects.all()
        if self.tenant_id:
            sessions_qs = sessions_qs.filter(tenant_id=self.tenant_id)
        if cycle_id:
            sessions_qs = sessions_qs.filter(review_cycle_id=cycle_id)

        total_sessions = sessions_qs.count()
        completed_sessions = sessions_qs.filter(outcome='completed').count()

        # Calibration rating adjustments
        adjustments_qs = CalibrationRating.objects.all()
        if self.tenant_id:
            adjustments_qs = adjustments_qs.filter(tenant_id=self.tenant_id)
        if cycle_id:
            adjustments_qs = adjustments_qs.filter(calibration_session__review_cycle_id=cycle_id)

        total_adjustments = adjustments_qs.count()
        increases = adjustments_qs.filter(adjustment_amount__gt=0).count()
        decreases = adjustments_qs.filter(adjustment_amount__lt=0).count()
        no_change = adjustments_qs.filter(adjustment_amount=0).count()

        avg_adjustment = adjustments_qs.aggregate(val=Avg('adjustment_amount'))['val'] or 0.0

        # Recent calibration sessions
        session_rows = []
        for s in sessions_qs.select_related('facilitator').order_by('-scheduled_date')[:50]:
            session_rows.append({
                'id': str(s.id),
                'name': s.name,
                'session_type': getattr(s, 'session_type', ''),
                'scheduled_date': s.scheduled_date.isoformat() if s.scheduled_date else None,
                'status': s.status if hasattr(s, 'status') else '',
                'outcome': getattr(s, 'outcome', ''),
                'facilitator': s.facilitator.email if s.facilitator else None,
            })

        return {
            'summary': {
                'total_calibration_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'total_adjustments_made': total_adjustments,
                'score_increases_count': increases,
                'score_decreases_count': decreases,
                'no_change_count': no_change,
                'avg_adjustment_amount': round(float(avg_adjustment), 2),
            },
            'calibration_sessions': session_rows,
        }


# ---------------------------------------------------------------------------
# 5. PIP Tracker Extractor
# ---------------------------------------------------------------------------
class ReviewsPIPTrackerExtractor:
    """Extracts organization-wide PIP health, action item completion rates, and outcome distributions."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        pips_qs = PIP.objects.all()
        if self.tenant_id:
            pips_qs = pips_qs.filter(tenant_id=self.tenant_id)

        total_pips = pips_qs.count()
        active_pips = pips_qs.filter(status='active').count()
        successful_pips = pips_qs.filter(outcome='successful').count()
        failed_pips = pips_qs.filter(outcome='failed').count()
        extended_pips = pips_qs.filter(status='extended').count()

        # Action item stats
        actions_qs = PIPAction.objects.filter(pip__in=pips_qs)
        total_actions = actions_qs.count()
        completed_actions = actions_qs.filter(status='completed').count()
        missed_actions = actions_qs.filter(status='missed').count()

        action_completion_rate = round((completed_actions / total_actions * 100), 1) if total_actions else 0.0
        pip_success_rate = round((successful_pips / max(successful_pips + failed_pips, 1) * 100), 1)

        pip_rows = []
        for p in pips_qs.select_related('employee', 'owner').order_by('-start_date')[:100]:
            emp = p.employee
            pip_rows.append({
                'id': str(p.id),
                'title': p.title,
                'employee_name': emp.get_full_name() if emp else 'Unknown',
                'employee_email': emp.email if emp else '',
                'owner_name': p.owner.get_full_name() if p.owner else '',
                'severity': getattr(p, 'severity', ''),
                'status': p.status,
                'start_date': p.start_date.isoformat() if p.start_date else None,
                'end_date': p.end_date.isoformat() if p.end_date else None,
                'outcome': p.outcome or 'in_progress',
            })

        return {
            'summary': {
                'total_pips': total_pips,
                'active_pips': active_pips,
                'successful_pips': successful_pips,
                'failed_pips': failed_pips,
                'extended_pips': extended_pips,
                'pip_success_rate_pct': pip_success_rate,
                'total_action_items': total_actions,
                'completed_action_items': completed_actions,
                'missed_action_items': missed_actions,
                'action_completion_rate_pct': action_completion_rate,
            },
            'pips': pip_rows,
        }


# ---------------------------------------------------------------------------
# 6. Master Reviews Unified Extractor
# ---------------------------------------------------------------------------
class ReviewsUnifiedExtractor:
    """Master Unified Extractor orchestrating all real-data reviews report extractions."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.individual_extractor = ReviewsIndividualSummaryExtractor(tenant_id, filters)
        self.compliance_extractor = ReviewsCycleComplianceExtractor(tenant_id, filters)
        self.performance_extractor = ReviewsOrganizationPerformanceExtractor(tenant_id, filters)
        self.calibration_extractor = ReviewsCalibrationImpactExtractor(tenant_id, filters)
        self.pip_extractor = ReviewsPIPTrackerExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        ind_data = self.individual_extractor.extract()
        comp_data = self.compliance_extractor.extract()
        perf_data = self.performance_extractor.extract()
        cal_data = self.calibration_extractor.extract()
        pip_data = self.pip_extractor.extract()

        cs = comp_data['summary']
        ps = perf_data['summary']
        cal_s = cal_data['summary']
        pip_s = pip_data['summary']

        # Count promotion recommendations if present
        promo_qs = PromotionRecommendation.objects.all()
        if self.tenant_id:
            promo_qs = promo_qs.filter(tenant_id=self.tenant_id)
        promotion_ready_count = promo_qs.filter(recommendation='ready_now').count()

        # Calculate Talent Health Score (0–100)
        # Components: overall completion rate (30%), avg performance normalized (30%), PIP recovery rate (20%), calibration rate (20%)
        completion_pct = cs.get('overall_completion_rate_pct', 0.0)
        perf_pct = ps.get('avg_overall_score', 0.0)  # score on 0-100 scale
        pip_recovery_pct = pip_s.get('pip_success_rate_pct', 0.0)

        talent_health_score = round(
            (completion_pct * 0.30) +
            (perf_pct * 0.30) +
            (pip_recovery_pct * 0.20) +
            (max(0, 100 - pip_s.get('active_pips', 0) * 5) * 0.20),
            2
        )

        return {
            'source': 'reviews',
            'extracted_at': timezone.now().isoformat(),
            'individual_summary': ind_data,
            'cycle_compliance': comp_data,
            'organization_performance': perf_data,
            'calibration_impact': cal_data,
            'pip_tracker': pip_data,
            'summary': {
                'cycle_name': cs.get('cycle_name', ''),
                'total_participants': cs.get('total_participants', 0),
                'overall_completion_rate_pct': completion_pct,
                'avg_overall_score': perf_pct,
                'avg_kpi_score': ps.get('avg_kpi_score', 0.0),
                'avg_competency_score': ps.get('avg_competency_score', 0.0),
                'total_rated_employees': ps.get('total_rated_employees', 0),
                'promotion_ready_count': promotion_ready_count,
                'active_pips': pip_s.get('active_pips', 0),
                'pip_success_rate_pct': pip_recovery_pct,
                'calibration_sessions_count': cal_s.get('total_calibration_sessions', 0),
                'talent_health_score': talent_health_score,
            }
        }


# Aliases for backwards compatibility
ReviewsDataExtractor = ReviewsUnifiedExtractor
