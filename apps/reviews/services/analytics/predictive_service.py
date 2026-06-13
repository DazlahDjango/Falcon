# apps/reviews/services/analytics/predictive_service.py
"""
Predictive Service - Flight risk and performance prediction
"""

from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Count, Q
from typing import List, Dict

from ...models import FinalRating, PIP, PromotionRecommendation, ReviewCycle
from ...constants import RiskLevel, AnalyticsThresholds
from ..base_service import BaseReviewService


class PredictiveService(BaseReviewService):
    """
    Predicts flight risk and potential performance drops.
    """
    
    @staticmethod
    def calculate_flight_risk(employee):
        """
        Calculate flight risk for a specific employee.
        
        Args:
            employee: User object
        
        Returns:
            dict: Risk assessment
        """
        risk_score = 0
        risk_factors = []
        
        # Factor 1: No promotion for 2+ years
        last_promotion = PromotionRecommendation.objects.filter(
            employee=employee,
            status='completed'
        ).order_by('-actual_promotion_date').first()
        
        if last_promotion:
            years_since_promotion = (timezone.now().date() - last_promotion.actual_promotion_date).days / 365
            if years_since_promotion >= AnalyticsThresholds.FLIGHT_RISK_YEARS:
                risk_score += 30
                risk_factors.append(f'No promotion for {int(years_since_promotion)} years')
        else:
            # Never promoted
            years_employed = (timezone.now().date() - employee.date_joined.date()).days / 365 if employee.date_joined else 0
            if years_employed >= 2:
                risk_score += 25
                risk_factors.append(f'Never promoted in {int(years_employed)} years')
        
        # Factor 2: Declining performance trend
        last_3_ratings = FinalRating.objects.filter(
            employee=employee,
            final_score__isnull=False
        ).order_by('-created_at')[:3]
        
        if last_3_ratings.count() >= 2:
            scores = [r.final_score for r in last_3_ratings]
            if scores[0] < scores[-1]:  # Most recent lower than oldest
                decline = scores[-1] - scores[0]
                risk_score += min(25, decline)
                risk_factors.append(f'Performance declined by {decline:.1f}% over last 2 cycles')
        
        # Factor 3: Active PIP
        active_pip = PIP.objects.filter(employee=employee, status='active').exists()
        if active_pip:
            risk_score += 35
            risk_factors.append('Currently on active PIP')
        
        # Factor 4: Low peer feedback (if available)
        from ...models import FeedbackSummary
        feedback = FeedbackSummary.objects.filter(
            subject=employee
        ).order_by('-created_at').first()
        
        if feedback and feedback.overall_avg_rating and feedback.overall_avg_rating < 3.0:
            risk_score += 20
            risk_factors.append(f'Low peer feedback rating: {feedback.overall_avg_rating}/5')
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 40:
            risk_level = RiskLevel.MEDIUM
        elif risk_score >= 20:
            risk_level = RiskLevel.LOW
        else:
            risk_level = None
        
        return {
            'employee_id': str(employee.id),
            'employee_name': employee.get_full_name() or employee.email,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'recommendation': PredictiveService._get_recommendation(risk_level, risk_factors)
        }
    
    @staticmethod
    def _get_recommendation(risk_level, risk_factors):
        """
        Get recommendation based on risk level and factors.
        
        Args:
            risk_level: Risk level string
            risk_factors: List of risk factors
        
        Returns:
            str: Recommendation
        """
        if risk_level == RiskLevel.HIGH:
            if 'active PIP' in str(risk_factors).lower():
                return 'Schedule immediate review meeting. Increase check-in frequency to weekly.'
            elif 'promotion' in str(risk_factors).lower():
                return 'Review promotion eligibility. Consider retention bonus.'
            else:
                return 'Conduct stay interview. Address concerns immediately.'
        
        elif risk_level == RiskLevel.MEDIUM:
            if 'declining' in str(risk_factors).lower():
                return 'Provide additional support and training. Set performance improvement goals.'
            else:
                return 'Schedule career development conversation. Review growth opportunities.'
        
        elif risk_level == RiskLevel.LOW:
            return 'Monitor progress. Regular check-ins recommended.'
        
        return 'No immediate action required. Continue regular performance management.'
    
    @staticmethod
    def get_high_risk_employees(tenant, limit=20):
        """
        Get all high-risk employees for a tenant.
        
        Args:
            tenant: Client object
            limit: Maximum number of employees to return
        
        Returns:
            list: High-risk employees with details
        """
        from apps.accounts.models import User
        
        employees = User.objects.filter(
            tenant=tenant,
            is_active=True,
            role__in=['staff', 'manager']
        )
        
        high_risk = []
        for employee in employees:
            risk = PredictiveService.calculate_flight_risk(employee)
            if risk['risk_level'] in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
                high_risk.append(risk)
        
        # Sort by risk score descending
        high_risk.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return {
            'total_high_risk': len([r for r in high_risk if r['risk_level'] == RiskLevel.HIGH]),
            'total_medium_risk': len([r for r in high_risk if r['risk_level'] == RiskLevel.MEDIUM]),
            'employees': high_risk[:limit],
            'generated_at': timezone.now().isoformat()
        }
    
    @staticmethod
    def predict_performance_drop(employee):
        """
        Predict potential performance drop for an employee.
        
        Args:
            employee: User object
        
        Returns:
            dict: Prediction result
        """
        from ...models import SupervisorReview
        
        risk_score = 0
        factors = []
        
        # Check if manager changed recently
        current_manager = employee.manager
        old_reviews = SupervisorReview.objects.filter(
            employee=employee,
            supervisor__isnull=False
        ).order_by('-created_at')[:5]
        
        if old_reviews.exists():
            old_manager = old_reviews.first().supervisor
            if old_manager != current_manager:
                risk_score += 25
                factors.append('Recent manager change (high risk period)')
        
        # Check if employee is new (less than 6 months)
        if employee.date_joined:
            days_employed = (timezone.now().date() - employee.date_joined.date()).days
            if days_employed < 180:
                risk_score += 20
                factors.append(f'New employee ({days_employed} days) - still in onboarding')
        
        # Check if employee missed training
        # This would integrate with training app - placeholder
        # if employee.has_missing_training:
        #     risk_score += 15
        #     factors.append('Missing required training')
        
        # Determine risk level
        if risk_score >= 50:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 30:
            risk_level = RiskLevel.MEDIUM
        elif risk_score >= 15:
            risk_level = RiskLevel.LOW
        else:
            risk_level = None
        
        return {
            'employee_id': str(employee.id),
            'employee_name': employee.get_full_name() or employee.email,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'factors': factors,
            'recommendation': 'Increase check-in frequency. Provide additional support during transition period.' if risk_level in [RiskLevel.HIGH, RiskLevel.MEDIUM] else 'Continue regular performance management.'
        }