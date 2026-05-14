# apps/reviews/services/pip/pip_generator.py
"""
Create PIP from low performance ratings
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import PIP, FinalRating
from ..base_service import BaseReviewService
from .pip_service import PIPService


class PIPGenerator(BaseReviewService):
    """
    Automatically creates Performance Improvement Plans from low final ratings
    """
    
    # Default PIP settings
    DEFAULT_PIP_DURATION_DAYS = 90
    LOW_RATING_THRESHOLD = 60  # Below 60% triggers PIP
    
    @staticmethod
    def should_create_pip(final_rating, threshold=None):
        """
        Check if a PIP should be created for a final rating.
        
        Args:
            final_rating: FinalRating instance
            threshold: Optional custom threshold (default 60)
        
        Returns:
            bool: True if PIP should be created
        """
        if threshold is None:
            threshold = PIPGenerator.LOW_RATING_THRESHOLD
        
        if not final_rating.final_score:
            return False
        
        # Check if rating is below threshold
        if final_rating.final_score >= threshold:
            return False
        
        # Check if PIP already exists
        if hasattr(final_rating, 'pip') and final_rating.pip:
            return False
        
        return True
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def generate_pip_from_rating(final_rating_id, owner=None, custom_data=None):
        """
        Generate a PIP from a low final rating.
        
        Args:
            final_rating_id: FinalRating ID
            owner: User object (manager/HR) - defaults to employee's manager
            custom_data: Optional custom PIP data override
        
        Returns:
            PIP object or None
        """
        final_rating = FinalRating.objects.get(id=final_rating_id)
        
        # Check if PIP should be created
        if not PIPGenerator.should_create_pip(final_rating):
            return None
        
        # Determine owner (manager or HR)
        if owner is None:
            owner = final_rating.employee.manager
        
        if owner is None:
            raise ValidationError("No manager assigned to employee")
        
        # Calculate end date
        start_date = timezone.now().date()
        end_date = start_date + timezone.timedelta(
            days=PIPGenerator.DEFAULT_PIP_DURATION_DAYS
        )
        
        # Get rating level description
        rating_level = final_rating.rating_scale.get_level_by_percentage(
            float(final_rating.final_score)
        )
        rating_label = rating_level.get('label', 'Low Performance') if rating_level else 'Low Performance'
        
        # Create PIP data
        pip_data = {
            'title': f"Performance Improvement Plan - {rating_label} Rating",
            'description': f"This PIP is required due to a {rating_label} rating in the {final_rating.review_cycle.name} review cycle. Final score: {final_rating.final_score}%.",
            'severity': 'moderate',
            'start_date': start_date,
            'end_date': end_date,
            'improvement_areas': "Performance needs to meet minimum expectations as outlined in the job description and KPIs.",
            'success_criteria': f"Improve performance to achieve a rating of at least 'Meets Expectations' ({PIPGenerator.LOW_RATING_THRESHOLD}%) in the next review cycle.",
            'consequences_if_failed': "Continued underperformance may lead to formal disciplinary action, up to and including termination of employment.",
            'consequences_if_successful': "Successful completion of this PIP will result in return to regular performance management process.",
            'final_rating_id': final_rating.id
        }
        
        # Override with custom data if provided
        if custom_data:
            pip_data.update(custom_data)
        
        # Create PIP
        pip = PIPService.create_pip(
            employee=final_rating.employee,
            owner=owner,
            review_cycle=final_rating.review_cycle,
            data=pip_data
        )
        
        # Link PIP to final rating
        pip.final_rating = final_rating
        pip.save()
        
        # Update final rating
        final_rating.pip_recommended = True
        final_rating.pip_reason = f"Auto-generated PIP due to {rating_label} rating"
        final_rating.save()
        
        return pip
    
    @staticmethod
    def generate_pips_for_cycle(review_cycle_id, threshold=None):
        """
        Generate PIPs for all low-rated employees in a cycle.
        
        Args:
            review_cycle_id: ReviewCycle ID
            threshold: Optional custom threshold
        
        Returns:
            list: Created PIP objects
        """
        final_ratings = FinalRating.objects.filter(
            review_cycle_id=review_cycle_id,
            status='locked',
            final_score__isnull=False
        )
        
        created_pips = []
        
        for rating in final_ratings:
            if PIPGenerator.should_create_pip(rating, threshold):
                pip = PIPGenerator.generate_pip_from_rating(rating.id)
                if pip:
                    created_pips.append(pip)
        
        return created_pips