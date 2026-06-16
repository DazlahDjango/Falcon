from django.utils import timezone
from django.db import models
from ...models import Coefficient
from ..base_service import BaseReviewService

class CoefficientApplicator(BaseReviewService):
    @staticmethod
    def get_applicable_coefficient(employee, target_date=None):
        if target_date is None:
            target_date = timezone.now().date()
        coefficient = Coefficient.objects.filter(tenant_id=employee.tenant_id, coefficient_type='individual', user=employee, valid_from__lte=target_date, is_active=True).first()
        if coefficient:
            return coefficient
        if hasattr(employee, 'position') and employee.position:
            coefficient = Coefficient.objects.filter(tenant_id=employee.tenant_id, coefficient_type='position', position=employee.position, valid_from__lte=target_date, is_active=True).first()
            if coefficient:
                return coefficient
        if hasattr(employee, 'department') and employee.department:
            coefficient = Coefficient.objects.filter(tenant_id=employee.tenant_id, coefficient_type='department', department=employee.department, valid_from__lte=target_date, is_active=True).first()
            if coefficient:
                return coefficient
        return None
    @staticmethod
    def apply_coefficient(score, coefficient_value):
        if score is None:
            return None
        if coefficient_value is None or coefficient_value == 1.0:
            return score
        adjusted = float(score) * float(coefficient_value)
        return min(round(adjusted, 2), 100.0)
    @staticmethod
    def apply_coefficient_to_rating(final_rating):
        if not final_rating.employee or not final_rating.review_cycle:
            return final_rating
        coefficient = CoefficientApplicator.get_applicable_coefficient(final_rating.employee, final_rating.review_cycle.end_date)
        if coefficient:
            final_rating.coefficient_applied = coefficient.value
            if final_rating.raw_total_score:
                final_rating.adjusted_score = CoefficientApplicator.apply_coefficient(final_rating.raw_total_score, coefficient.value)
        else:
            final_rating.coefficient_applied = 1.0
            final_rating.adjusted_score = final_rating.raw_total_score
        return final_rating
    @staticmethod
    def batch_apply_coefficients(final_ratings):
        updated = []
        for rating in final_ratings:
            updated.append(CoefficientApplicator.apply_coefficient_to_rating(rating))
        return updated
    @staticmethod
    def get_coefficient_summary(employee, start_date, end_date):
        coefficients = Coefficient.objects.filter(tenant_id=employee.tenant_id, valid_from__lte=end_date, is_active=True).filter(models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=start_date))
        applicable = []
        for coeff in coefficients:
            if coeff.coefficient_type == 'individual' and coeff.user == employee:
                applicable.append(coeff)
            elif coeff.coefficient_type == 'position' and hasattr(employee, 'position') and coeff.position == employee.position:
                applicable.append(coeff)
            elif coeff.coefficient_type == 'department' and hasattr(employee, 'department') and coeff.department == employee.department:
                applicable.append(coeff)
        return {'employee': employee.email, 'period': f"{start_date} to {end_date}", 'coefficients_found': len(applicable), 'coefficients': [{'type': c.get_coefficient_type_display(), 'value': float(c.value), 'valid_from': c.valid_from, 'valid_to': c.valid_to, 'reason': c.reason} for c in applicable]}