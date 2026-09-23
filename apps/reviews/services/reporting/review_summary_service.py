from django.utils import timezone
from django.db.models import Avg, Count, Q
from ...models import (
    SelfAssessment, 
    SupervisorReview, 
    FinalRating,
    CompetencyRating,
    FeedbackSummary
)
from ..base_service import BaseReviewService
from ..aggregation.competency_aggregator import CompetencyAggregator


class ReviewSummaryService(BaseReviewService):
    """
    Generates comprehensive review summaries for employees
    """
    
    @staticmethod
    def get_employee_summary(employee, review_cycle):
        """
        Get complete review summary for an employee.
        
        Args:
            employee: User instance
            review_cycle: ReviewCycle instance
        
        Returns:
            dict: Complete review summary
        """
        # Get self assessment
        self_assessment = SelfAssessment.objects.filter(
            review_cycle=review_cycle,
            employee=employee
        ).first()
        
        # Get supervisor review
        supervisor_review = SupervisorReview.objects.filter(
            review_cycle=review_cycle,
            employee=employee
        ).first()
        
        # Get final rating
        final_rating = FinalRating.objects.filter(
            review_cycle=review_cycle,
            employee=employee
        ).first()
        
        # Get feedback summary
        feedback_summary = FeedbackSummary.objects.filter(
            review_cycle=review_cycle,
            subject=employee
        ).first()
        
        # Get employee position and department safely
        pos = getattr(employee, 'position', None)
        dept = getattr(employee, 'department', None)
        pos_title = getattr(pos, 'title', None) if pos else None
        if not pos_title and pos:
            pos_title = getattr(pos, 'name', str(pos))
        dept_name = getattr(dept, 'name', None) if dept else None
        if not dept_name and dept:
            dept_name = getattr(dept, 'title', str(dept))

        # Build summary
        summary = {
            'employee': {
                'id': str(employee.id),
                'name': employee.get_full_name(),
                'email': employee.email,
                'position': pos_title,
                'department': dept_name,
            },
            'review_cycle': {
                'id': review_cycle.id,
                'name': review_cycle.name,
                'period': f"{review_cycle.start_date} to {review_cycle.end_date}",
            },
            'self_assessment': ReviewSummaryService._format_self_assessment(self_assessment),
            'supervisor_review': ReviewSummaryService._format_supervisor_review(supervisor_review),
            'final_rating': ReviewSummaryService._format_final_rating(final_rating),
            'feedback_summary': ReviewSummaryService._format_feedback_summary(feedback_summary),
            'competency_comparison': ReviewSummaryService._get_competency_comparison(
                self_assessment, supervisor_review
            ),
            'timeline': ReviewSummaryService._get_review_timeline(self_assessment, supervisor_review, final_rating),
        }
        
        return summary
    
    @staticmethod
    def _format_self_assessment(assessment):
        """Format self assessment data"""
        if not assessment:
            return None
        
        avg_rating = getattr(assessment, 'average_rating', getattr(assessment, 'avg_competency_rating', None))
        return {
            'status': assessment.status,
            'submitted_at': assessment.submitted_at.isoformat() if assessment.submitted_at else None,
            'overall_comment': assessment.overall_comment,
            'strengths': assessment.strengths,
            'areas_for_improvement': assessment.areas_for_improvement,
            'career_aspirations': assessment.career_aspirations,
            'achievements': assessment.achievements,
            'avg_competency_rating': float(avg_rating) if avg_rating is not None else None,
        }
    
    @staticmethod
    def _format_supervisor_review(review):
        """Format supervisor review data"""
        if not review:
            return None
        
        sup = getattr(review, 'supervisor', None)
        avg_rating = getattr(review, 'average_competency_rating', getattr(review, 'avg_competency_rating', None))
        return {
            'status': review.status,
            'submitted_at': review.submitted_at.isoformat() if review.submitted_at else None,
            'supervisor': {
                'name': sup.get_full_name() if sup else None,
                'email': sup.email if sup else None,
            } if sup else None,
            'overall_comment': review.overall_comment,
            'strengths_observed': review.strengths_observed,
            'development_areas': review.development_areas,
            'recommendation': review.get_recommendation_display() if hasattr(review, 'get_recommendation_display') else getattr(review, 'recommendation', None),
            'promotion_readiness': review.promotion_readiness,
            'bonus_recommendation': review.get_bonus_recommendation_display() if hasattr(review, 'get_bonus_recommendation_display') else getattr(review, 'bonus_recommendation', None),
            'avg_competency_rating': float(avg_rating) if avg_rating is not None else None,
        }
    
    @staticmethod
    def _format_final_rating(rating):
        """Format final rating data"""
        if not rating:
            return None
        
        return {
            'status': rating.get_status_display() if hasattr(rating, 'get_status_display') else getattr(rating, 'status', None),
            'final_score': float(rating.final_score) if rating.final_score is not None else None,
            'final_rating_label': rating.final_rating_label,
            'final_rating_color': rating.final_rating_color,
            'kpi_score': float(rating.kpi_score) if rating.kpi_score is not None else None,
            'competency_score': float(rating.competency_score) if rating.competency_score is not None else None,
            'raw_total_score': float(rating.raw_total_score) if rating.raw_total_score is not None else None,
            'coefficient_applied': float(rating.coefficient_applied) if rating.coefficient_applied is not None else None,
            'adjusted_score': float(rating.adjusted_score) if rating.adjusted_score is not None else None,
            'promotion_recommended': rating.promotion_recommended,
            'pip_recommended': rating.pip_recommended,
            'approved_by': rating.approved_by.email if getattr(rating, 'approved_by', None) else None,
            'approved_at': rating.approved_at.isoformat() if getattr(rating, 'approved_at', None) else None,
        }
    
    @staticmethod
    def _format_feedback_summary(summary):
        """Format feedback summary data"""
        if not summary:
            return None
        
        return {
            'total_responses': summary.total_responses,
            'overall_avg_rating': float(summary.overall_avg_rating) if summary.overall_avg_rating else None,
            'avg_manager_rating': float(summary.avg_manager_rating) if summary.avg_manager_rating else None,
            'avg_peer_rating': float(summary.avg_peer_rating) if summary.avg_peer_rating else None,
            'avg_subordinate_rating': float(summary.avg_subordinate_rating) if summary.avg_subordinate_rating else None,
            'common_strengths': summary.common_strengths[:5] if summary.common_strengths else [],
            'common_improvements': summary.common_improvements[:5] if summary.common_improvements else [],
            'is_shared': summary.is_shared_with_subject,
        }
    
    @staticmethod
    def _get_competency_comparison(self_assessment, supervisor_review):
        """Get comparison between self and supervisor competency ratings"""
        if not self_assessment or not supervisor_review:
            return None
        
        from django.contrib.contenttypes.models import ContentType
        sa_ct = ContentType.objects.get_for_model(SelfAssessment)
        sr_ct = ContentType.objects.get_for_model(SupervisorReview)

        self_ratings = CompetencyRating.objects.filter(
            content_type=sa_ct,
            object_id=str(self_assessment.id),
            raw_score__isnull=False
        ).select_related('competency')
        
        supervisor_ratings = CompetencyRating.objects.filter(
            content_type=sr_ct,
            object_id=str(supervisor_review.id),
            raw_score__isnull=False
        ).select_related('competency')
        
        # Map ratings by competency
        self_dict = {r.competency.name: float(r.raw_score) for r in self_ratings if r.competency}
        supervisor_dict = {r.competency.name: float(r.raw_score) for r in supervisor_ratings if r.competency}
        
        comparison = []
        all_competencies = set(self_dict.keys()) | set(supervisor_dict.keys())
        
        for competency in all_competencies:
            self_score = self_dict.get(competency)
            sup_score = supervisor_dict.get(competency)
            
            if self_score and sup_score:
                gap = self_score - sup_score
                comparison.append({
                    'competency': competency,
                    'self_score': self_score,
                    'supervisor_score': sup_score,
                    'gap': gap,
                    'gap_direction': 'higher' if gap > 0 else 'lower' if gap < 0 else 'equal',
                    'needs_discussion': abs(gap) >= 1.0  # More than 1 point difference
                })
        
        return comparison
    
    @staticmethod
    def _get_review_timeline(self_assessment, supervisor_review, final_rating):
        """Get timeline of review events"""
        timeline = []
        
        if self_assessment and self_assessment.submitted_at:
            timeline.append({
                'event': 'Self Assessment Submitted',
                'date': self_assessment.submitted_at.isoformat(),
                'status': self_assessment.status
            })
        
        if supervisor_review and supervisor_review.submitted_at:
            timeline.append({
                'event': 'Supervisor Review Submitted',
                'date': supervisor_review.submitted_at.isoformat(),
                'status': supervisor_review.status
            })
        
        if supervisor_review and supervisor_review.reviewed_at:
            timeline.append({
                'event': 'Review Approved by HR',
                'date': supervisor_review.reviewed_at.isoformat(),
                'status': supervisor_review.status
            })
        
        if final_rating and final_rating.approved_at:
            timeline.append({
                'event': 'Final Rating Approved',
                'date': final_rating.approved_at.isoformat(),
                'status': final_rating.status
            })
        
        # Sort by date
        timeline.sort(key=lambda x: x['date'])
        
        return timeline
    
    @staticmethod
    def get_team_summary(manager, review_cycle):
        """
        Get review summary for a manager's entire team.
        
        Args:
            manager: User instance (manager)
            review_cycle: ReviewCycle instance
        
        Returns:
            dict: Team review summary
        """
        direct_reports = manager.direct_reports.all()
        
        team_summary = {
            'manager': {
                'id': str(manager.id),
                'name': manager.get_full_name(),
                'email': manager.email,
            },
            'review_cycle': {
                'id': review_cycle.id,
                'name': review_cycle.name,
            },
            'total_employees': direct_reports.count(),
            'team_stats': {
                'total_direct_reports': direct_reports.count(),
            },
            'employees': [],
            'aggregate_stats': {
                'avg_kpi_score': 0,
                'avg_competency_score': 0,
                'avg_final_score': 0,
                'promotion_recommendations': 0,
                'pip_recommendations': 0,
                'ratings_distribution': {}
            }
        }
        
        scores = {
            'kpi': [],
            'competency': [],
            'final': []
        }
        
        for employee in direct_reports:
            employee_data = ReviewSummaryService.get_employee_summary(employee, review_cycle)
            
            if employee_data:
                team_summary['employees'].append(employee_data)
                
                # Collect scores for aggregates
                if employee_data.get('final_rating'):
                    if employee_data['final_rating'].get('kpi_score'):
                        scores['kpi'].append(employee_data['final_rating']['kpi_score'])
                    if employee_data['final_rating'].get('competency_score'):
                        scores['competency'].append(employee_data['final_rating']['competency_score'])
                    if employee_data['final_rating'].get('final_score'):
                        scores['final'].append(employee_data['final_rating']['final_score'])
                    
                    # Count recommendations
                    if employee_data['final_rating'].get('promotion_recommended'):
                        team_summary['aggregate_stats']['promotion_recommendations'] += 1
                    if employee_data['final_rating'].get('pip_recommended'):
                        team_summary['aggregate_stats']['pip_recommendations'] += 1
                    
                    # Distribution
                    label = employee_data['final_rating'].get('final_rating_label', 'Not Rated')
                    team_summary['aggregate_stats']['ratings_distribution'][label] = \
                        team_summary['aggregate_stats']['ratings_distribution'].get(label, 0) + 1
        
        # Calculate averages
        for key in scores:
            if scores[key]:
                team_summary['aggregate_stats'][f'avg_{key}_score'] = round(sum(scores[key]) / len(scores[key]), 2)
        
        return team_summary
    
    @staticmethod
    def generate_pdf_summary(employee, review_cycle):
        """
        Generate PDF version of review summary.
        
        Args:
            employee: User instance
            review_cycle: ReviewCycle instance
        
        Returns:
            bytes: PDF content
        """
        summary = ReviewSummaryService.get_employee_summary(employee, review_cycle)
        # PDF generation logic would go here
        # This is a placeholder - implement with reportlab or weasyprint
        return summary