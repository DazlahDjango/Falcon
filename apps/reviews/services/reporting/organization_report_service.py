# apps/reviews/services/reporting/organization_report_service.py
"""
Organization Report Service - Generates strategic, organization-wide performance summary reports.
"""

from django.utils import timezone
from django.db import models
from django.db.models import Avg, Count, StdDev, Q

from ...models import ReviewCycle, FinalRating, CompetencyRating, PIP, SelfAssessment, SupervisorReview
from ..base_service import BaseReviewService
from ..analytics.predictive_service import PredictiveService


class OrganizationReportService(BaseReviewService):
    """
    Generates strategic performance reports at the organization (tenant) level.
    """

    @staticmethod
    def get_organization_summary(cycle_id, tenant):
        """
        Get strategic performance summary for the whole organization in a review cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id, tenant=tenant)
        except ReviewCycle.DoesNotExist:
            return {'error': 'Review cycle not found'}

        # 1. Total Employees & Stage Completion (Compliance)
        total_employees = cycle.get_participating_employees().count()

        self_assessments = SelfAssessment.objects.filter(review_cycle=cycle, tenant=tenant)
        self_completed = self_assessments.filter(status='submitted').count()
        self_completion_rate = round((self_completed / total_employees) * 100, 1) if total_employees > 0 else 0.0

        supervisor_reviews = SupervisorReview.objects.filter(review_cycle=cycle, tenant=tenant)
        sup_completed = supervisor_reviews.filter(status='approved').count()
        sup_completion_rate = round((sup_completed / total_employees) * 100, 1) if total_employees > 0 else 0.0

        final_ratings = FinalRating.objects.filter(review_cycle=cycle, tenant=tenant)
        locked_ratings = final_ratings.filter(status='locked')
        locked_count = locked_ratings.count()
        overall_completion_rate = round((locked_count / total_employees) * 100, 1) if total_employees > 0 else 0.0

        # 2. Overall Performance averages (KPI vs Competency)
        # Final ratings score contains normalized score or final_score (0-100 scale)
        avg_scores = final_ratings.aggregate(
            overall=Avg('final_score'),
            kpi=Avg('kpi_score'),
            competency=Avg('competency_score'),
            std_dev=StdDev('final_score')
        )
        
        avg_overall = round(float(avg_scores['overall']), 1) if avg_scores['overall'] is not None else 0.0
        avg_kpi = round(float(avg_scores['kpi']), 1) if avg_scores['kpi'] is not None else 0.0
        avg_competency = round(float(avg_scores['competency']), 1) if avg_scores['competency'] is not None else 0.0
        std_dev = round(float(avg_scores['std_dev']), 1) if avg_scores['std_dev'] is not None else 0.0

        # 3. Rating Distribution / Bell Curve
        # Map rating labels and their counts
        distribution_counts = final_ratings.values('final_rating_label', 'final_rating_color').annotate(count=Count('id')).order_by('-count')
        rating_distribution = []
        for dist in distribution_counts:
            label = dist['final_rating_label'] or 'Not Rated'
            count = dist['count']
            pct = round((count / final_ratings.count()) * 100, 1) if final_ratings.count() > 0 else 0.0
            rating_distribution.append({
                'label': label,
                'count': count,
                'percentage': pct,
                'color': dist['final_rating_color'] or 'gray'
            })

        # 4. Achievements (Excelling Competencies & Departments)
        # Top 3 Strongest Competencies
        comp_ratings = CompetencyRating.objects.filter(
            supervisor_review__review_cycle=cycle,
            raw_score__isnull=False,
            tenant=tenant
        ).select_related('competency')
        
        strongest_competencies = []
        weakest_competencies = []
        
        if comp_ratings.exists():
            comp_averages = comp_ratings.values('competency__name').annotate(avg_score=Avg('raw_score')).order_by('-avg_score')
            # Normalize to 100% (assuming raw score is on a 5-point scale)
            for item in comp_averages[:3]:
                strongest_competencies.append({
                    'name': item['competency__name'],
                    'score': round(float(item['avg_score']), 2),
                    'percentage': round((float(item['avg_score']) / 5.0) * 100, 1)
                })
            for item in list(comp_averages)[-3:]:
                # Reverse list for weakest so lowest is first
                weakest_competencies.insert(0, {
                    'name': item['competency__name'],
                    'score': round(float(item['avg_score']), 2),
                    'percentage': round((float(item['avg_score']) / 5.0) * 100, 1)
                })

        # Excelling vs Underperforming Departments
        # Calculate overall department averages
        dept_averages = final_ratings.filter(employee__department__isnull=False).values('employee__department__name').annotate(avg_score=Avg('final_score')).order_by('-avg_score')
        
        excelling_departments = []
        underperforming_departments = []
        
        for dept in dept_averages:
            dept_avg = float(dept['avg_score'])
            dept_data = {
                'name': dept['employee__department__name'],
                'score': round(dept_avg, 1),
                'variance': round(dept_avg - avg_overall, 1)
            }
            if dept_avg >= avg_overall:
                excelling_departments.append(dept_data)
            else:
                underperforming_departments.append(dept_data)

        # 5. Strategic Recommendations: What to Add / What to Remove
        # What to Add: Upskilling recommendations for bottom competencies
        what_to_add = []
        for w_comp in weakest_competencies:
            what_to_add.append({
                'topic': f"Targeted training in {w_comp['name']}",
                'reason': f"Competency average is low ({w_comp['score']}/5.0)",
                'action': f"Roll out corporate training sessions, mentorship cohorts, or professional courses specifically designed to strengthen {w_comp['name']}."
            })
            
        if avg_competency < avg_kpi:
            what_to_add.append({
                'topic': "Structural Behavioral Alignment",
                'reason': f"Competency average ({avg_competency}%) lags behind KPI performance ({avg_kpi}%)",
                'action': "Organize alignment workshops to bridge cultural behaviors (collaboration, leadership) with strategic business execution outputs."
            })

        # What to Remove/Address: Attrition Risks & Underperformance Remediation
        # Fetch flight risk predictions using PredictiveService
        high_risk_response = PredictiveService.get_high_risk_employees(tenant)
        high_risk_list = high_risk_response.get('employees', [])
        
        # Cross-reference high-performers with high/critical flight risk
        high_performers_at_risk = []
        for r_emp in high_risk_list:
            emp_id = r_emp['employee_id']
            # Check if this employee got a high score in this cycle
            score_record = final_ratings.filter(employee_id=emp_id).first()
            if score_record and score_record.final_score and score_record.final_score >= 80.0:
                high_performers_at_risk.append({
                    'name': r_emp['employee_name'],
                    'score': float(score_record.final_score),
                    'risk_level': r_emp['risk_level'],
                    'factors': r_emp['risk_factors']
                })

        active_pips_count = PIP.objects.filter(tenant=tenant, status='active').count()

        what_to_remove = []
        if high_performers_at_risk:
            what_to_remove.append({
                'topic': f"High-Performer Attrition Risks ({len(high_performers_at_risk)} identified)",
                'reason': "Top talent exhibiting critical flight risk indicators.",
                'action': f"Schedule proactive stay interviews with key performers: {', '.join([h['name'] for h in high_performers_at_risk])}. Address primary stress points (such as career development or compensation)."
            })
            
        if active_pips_count > 0:
            what_to_remove.append({
                'topic': f"Underperformance Remediation ({active_pips_count} active PIPs)",
                'reason': "Ongoing Performance Improvement Plans require management follow-ups.",
                'action': "Ensure timely completion of active PIP milestones and support managers in conducting weekly check-ins to transition workers off PIPs successfully."
            })

        # Standard deviation bias flag
        bias_warning = None
        if std_dev > 0 and std_dev < 8.0:
            bias_warning = {
                'type': 'warning',
                'title': 'Central Tendency Bias Alert',
                'message': f'Low standard deviation ({std_dev}) indicates scoring clustering. Managers might be rating all employees similarly without differentiating performance.',
                'action': 'Deploy rating calibration guidelines in the upcoming review cycle.'
            }

        return {
            'cycle': {
                'id': str(cycle.id),
                'name': cycle.name,
                'period': f"{cycle.start_date} to {cycle.end_date}",
                'type': cycle.get_cycle_type_display(),
            },
            'overall_stats': {
                'total_employees': total_employees,
                'self_assessment_completion': self_completion_rate,
                'supervisor_review_completion': sup_completion_rate,
                'overall_completion': overall_completion_rate,
                'avg_score': avg_overall,
                'avg_kpi_score': avg_kpi,
                'avg_competency_score': avg_competency,
                'std_dev': std_dev
            },
            'rating_distribution': rating_distribution,
            'achievements': {
                'strongest_competencies': strongest_competencies,
                'excelling_departments': excelling_departments,
                'high_performers_count': final_ratings.filter(final_score__gte=80.0).count()
            },
            'misses': {
                'weakest_competencies': weakest_competencies,
                'underperforming_departments': underperforming_departments,
            },
            'remediation_plan': {
                'what_to_add': what_to_add,
                'what_to_remove': what_to_remove,
                'bias_warning': bias_warning
            },
            'high_performers_at_risk': high_performers_at_risk,
            'generated_at': timezone.now().isoformat()
        }
