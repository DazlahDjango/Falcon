from django.utils import timezone
from django.db import models
from ...models import Coefficient
from ..base_service import BaseReviewService

class CoefficientApplicator(BaseReviewService):
    @staticmethod
    def get_applicable_coefficient(employee, target_date=None):
        if target_date is None:
            target_date = timezone.now().date()
        
        # Check individual coefficient first (highest priority)
        coefficient = Coefficient.objects.filter(
            tenant=employee.tenant,
            coefficient_type='individual',
            user=employee,
            valid_from__lte=target_date,
            is_active=True
        ).first()
        
        if coefficient:
            return coefficient
        
        # Check position coefficient
        if hasattr(employee, 'position') and employee.position:
            coefficient = Coefficient.objects.filter(
                tenant=employee.tenant,
                coefficient_type='position',
                position=employee.position,
                valid_from__lte=target_date,
                is_active=True
            ).first()
            
            if coefficient:
                return coefficient
        
        # Check department coefficient (lowest priority)
        if hasattr(employee, 'department') and employee.department:
            coefficient = Coefficient.objects.filter(
                tenant=employee.tenant,
                coefficient_type='department',
                department=employee.department,
                valid_from__lte=target_date,
                is_active=True
            ).first()
            
            if coefficient:
                return coefficient
        
        return None
    
    @staticmethod
    def apply_coefficient(score, coefficient_value):
        """
        Apply coefficient to a score.
        
        Args:
            score: Original score (0-100)
            coefficient_value: Decimal multiplier (e.g., 1.05 = +5%, 0.95 = -5%)
        
        Returns:
            float: Adjusted score (capped at 100)
        """
        if score is None:
            return None
        
        if coefficient_value is None or coefficient_value == 1.0:
            return score
        
        adjusted = float(score) * float(coefficient_value)
        
        # Cap at 100 (can't exceed maximum)
        return min(round(adjusted, 2), 100.0)
    
    @staticmethod
    def apply_coefficient_to_rating(final_rating):
        """
        Apply coefficient to a final rating object.
        
        Args:
            final_rating: FinalRating instance
        
        Returns:
            FinalRating instance with coefficient applied
        """
        if not final_rating.employee or not final_rating.review_cycle:
            return final_rating
        
        # Get coefficient for the employee
        coefficient = CoefficientApplicator.get_applicable_coefficient(
            final_rating.employee,
            final_rating.review_cycle.end_date
        )
        
        if coefficient:
            final_rating.coefficient_applied = coefficient.value
            if final_rating.raw_total_score:
                final_rating.adjusted_score = CoefficientApplicator.apply_coefficient(
                    final_rating.raw_total_score,
                    coefficient.value
                )
        else:
            final_rating.coefficient_applied = 1.0
            final_rating.adjusted_score = final_rating.raw_total_score
        
        return final_rating
    
    @staticmethod
    def batch_apply_coefficients(final_ratings):
        """
        Apply coefficients to multiple final ratings.
        
        Args:
            final_ratings: QuerySet or list of FinalRating objects
        
        Returns:
            list: Updated final ratings
        """
        updated = []
        for rating in final_ratings:
            updated.append(CoefficientApplicator.apply_coefficient_to_rating(rating))
        
        return updated
    
    @staticmethod
    def get_coefficient_summary(employee, start_date, end_date):
        """
        Get summary of coefficients applied to an employee over a period.
        
        Args:
            employee: User object
            start_date: Start of period
            end_date: End of period
        
        Returns:
            dict: Summary of coefficients
        """
        coefficients = Coefficient.objects.filter(
            tenant=employee.tenant,
            valid_from__lte=end_date,
            is_active=True
        ).filter(
            models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=start_date)
        )
        
        # Filter by applicability
        applicable = []
        for coeff in coefficients:
            if coeff.coefficient_type == 'individual' and coeff.user == employee:
                applicable.append(coeff)
            elif coeff.coefficient_type == 'position' and coeff.position == employee.position:
                applicable.append(coeff)
            elif coeff.coefficient_type == 'department' and coeff.department == employee.department:
                applicable.append(coeff)
        
        return {
            'employee': employee.email,
            'period': f"{start_date} to {end_date}",
            'coefficients_found': len(applicable),
            'coefficients': [
                {
                    'type': c.get_coefficient_type_display(),
                    'value': float(c.value),
                    'valid_from': c.valid_from,
                    'valid_to': c.valid_to,
                    'reason': c.reason
                }
                for c in applicable
            ]
        }