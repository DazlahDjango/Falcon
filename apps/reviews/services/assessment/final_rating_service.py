# apps/reviews/services/assessment/final_rating_service.py
"""
Final Rating Service - Creates and manages final ratings from supervisor reviews
"""

from django.core.exceptions import ValidationError
from django.utils import timezone

from ...models import FinalRating, SupervisorReview
from ..base_service import BaseReviewService
from ..rating.score_calculator import ScoreCalculator
from ..rating.coefficient_applicator import CoefficientApplicator
from ..aggregation.kpi_aggregator import KPIAggregator
from ..aggregation.competency_aggregator import CompetencyAggregator


class FinalRatingService(BaseReviewService):
    """
    Handles creation, update, and management of final ratings
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_or_update_from_review(supervisor_review_id):
        """
        Create or update a final rating from a supervisor review.
        
        Args:
            supervisor_review_id: ID of SupervisorReview instance
        
        Returns:
            FinalRating instance
        """
        try:
            review = SupervisorReview.objects.get(id=supervisor_review_id)
        except SupervisorReview.DoesNotExist:
            raise ValidationError("Supervisor review not found")
        
        # Get or create final rating
        final_rating, created = FinalRating.objects.get_or_create(
            review_cycle=review.review_cycle,
            employee=review.employee,
            defaults={
                'supervisor_review': review,
                'rating_scale': review.review_cycle.rating_scale,
                'tenant': review.review_cycle.tenant,
                'status': 'pending'
            }
        )
        
        # Always update supervisor review reference
        final_rating.supervisor_review = review
        final_rating.rating_scale = review.review_cycle.rating_scale
        
        # Calculate KPI score (with override support)
        if review.override_kpi_score is not None:
            final_rating.kpi_score = review.override_kpi_score
        else:
            final_rating.kpi_score = KPIAggregator.get_kpi_score_for_period(
                employee=review.employee,
                start_date=review.review_cycle.kpi_start_date or review.review_cycle.start_date,
                end_date=review.review_cycle.kpi_end_date or review.review_cycle.end_date
            )
        
        # Calculate competency score
        comp_score = CompetencyAggregator.calculate_competency_percentage_score(
            parent_object=review,
            rating_scale=review.review_cycle.rating_scale
        )
        final_rating.competency_score = comp_score
        
        # Calculate raw total score
        final_rating.raw_total_score = ScoreCalculator.calculate_weighted_score(
            kpi_score=final_rating.kpi_score,
            competency_score=final_rating.competency_score,
            mission_score=None,
            task_score=None,
            weights={
                'kpi': review.review_cycle.kpi_weight,
                'competency': review.review_cycle.competency_weight,
                'mission': 0,
                'task': 0
            }
        )
        
        # Apply coefficient (department/role adjustment)
        final_rating = CoefficientApplicator.apply_coefficient_to_rating(final_rating)
        
        # Set final score
        if final_rating.adjusted_score is not None:
            final_rating.final_score = final_rating.adjusted_score
        else:
            final_rating.final_score = final_rating.raw_total_score
        
        # Auto-set rating label and color from scale
        if final_rating.final_score is not None and final_rating.rating_scale:
            rating_level = final_rating.rating_scale.get_level_by_percentage(
                float(final_rating.final_score)
            )
            if rating_level:
                final_rating.final_rating_label = rating_level.get('label', '')
                final_rating.final_rating_color = rating_level.get('color', 'gray')
        
        final_rating.save()
        
        return final_rating

    @staticmethod
    @BaseReviewService.atomic_operation
    def recalculate_kpi_component(final_rating_id):
        """Refresh KPI score on an open final rating when KPI data changes."""
        final_rating = FinalRating.objects.select_related(
            'review_cycle', 'employee', 'supervisor_review',
        ).get(id=final_rating_id)
        cycle = final_rating.review_cycle
        review = final_rating.supervisor_review
        if review and review.override_kpi_score is not None:
            final_rating.kpi_score = review.override_kpi_score
        else:
            final_rating.kpi_score = KPIAggregator.get_kpi_score_for_period(
                employee=final_rating.employee,
                start_date=cycle.kpi_start_date or cycle.start_date,
                end_date=cycle.kpi_end_date or cycle.end_date,
            )
        if review:
            final_rating.raw_total_score = ScoreCalculator.calculate_weighted_score(
                kpi_score=final_rating.kpi_score,
                competency_score=final_rating.competency_score,
                mission_score=None,
                task_score=None,
                weights={
                    'kpi': cycle.kpi_weight,
                    'competency': cycle.competency_weight,
                    'mission': 0,
                    'task': 0,
                },
            )
            final_rating = CoefficientApplicator.apply_coefficient_to_rating(final_rating)
            final_rating.final_score = (
                final_rating.adjusted_score or final_rating.raw_total_score
            )
        final_rating.save()
        return final_rating
    
    @staticmethod
    def get_for_employee(employee, review_cycle=None):
        """
        Get final ratings for an employee.
        
        Args:
            employee: User instance
            review_cycle: Optional ReviewCycle filter
        
        Returns:
            QuerySet of FinalRating objects
        """
        queryset = FinalRating.objects.filter(employee=employee)
        
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        
        return queryset.order_by('-created_at')
    
    @staticmethod
    def get_for_cycle(review_cycle, status=None):
        """
        Get all final ratings for a review cycle.
        
        Args:
            review_cycle: ReviewCycle instance
            status: Optional status filter
        
        Returns:
            QuerySet of FinalRating objects
        """
        queryset = FinalRating.objects.filter(review_cycle=review_cycle)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.select_related('employee', 'supervisor_review')
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def approve_final_rating(final_rating_id, approved_by):
        """
        Approve a final rating (makes it official).
        
        Args:
            final_rating_id: ID of FinalRating
            approved_by: User instance approving
        
        Returns:
            FinalRating instance
        """
        final_rating = FinalRating.objects.get(id=final_rating_id)
        
        if final_rating.status not in ['calibrated', 'pending']:
            raise ValidationError("Only pending or calibrated ratings can be approved")
        
        final_rating.status = 'approved'
        final_rating.approved_by = approved_by
        final_rating.approved_at = timezone.now()
        final_rating.save()
        
        return final_rating
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def lock_final_rating(final_rating_id):
        """
        Lock a final rating (final, cannot be changed).
        
        Args:
            final_rating_id: ID of FinalRating
        
        Returns:
            FinalRating instance
        """
        final_rating = FinalRating.objects.get(id=final_rating_id)
        
        if final_rating.status != 'approved':
            raise ValidationError("Only approved ratings can be locked")
        
        final_rating.status = 'locked'
        final_rating.save()
        
        return final_rating
    
    @staticmethod
    def get_cycle_statistics(review_cycle):
        """
        Get statistics for final ratings in a cycle.
        
        Args:
            review_cycle: ReviewCycle instance
        
        Returns:
            dict: Statistics
        """
        ratings = FinalRating.objects.filter(
            review_cycle=review_cycle,
            final_score__isnull=False
        )
        
        total = ratings.count()
        
        if total == 0:
            return {
                'total': 0,
                'average_score': None,
                'min_score': None,
                'max_score': None,
                'distribution': {},
                'promotion_count': 0,
                'pip_count': 0
            }
        
        scores = [float(r.final_score) for r in ratings]
        
        # Calculate distribution by rating label
        distribution = {}
        for rating in ratings:
            label = rating.final_rating_label or 'Not Rated'
            distribution[label] = distribution.get(label, 0) + 1
        
        return {
            'total': total,
            'average_score': round(sum(scores) / total, 2),
            'min_score': min(scores),
            'max_score': max(scores),
            'distribution': distribution,
            'promotion_count': ratings.filter(promotion_recommended=True).count(),
            'pip_count': ratings.filter(pip_recommended=True).count()
        }