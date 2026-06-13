# apps/reviews/api/v1/serializers/analytics_serializers.py
"""
Serializers for Analytics data
Following the same pattern as calibration_serializers.py
"""

from rest_framework import serializers
from django.utils import timezone

from .base_serializers import BaseTenantSerializer


class RatingDistributionSerializer(serializers.Serializer):
    """Serializer for rating distribution data"""
    outstanding = serializers.IntegerField()
    exceeds = serializers.IntegerField()
    meets = serializers.IntegerField()
    needs_work = serializers.IntegerField()
    unsatisfactory = serializers.IntegerField()
    outstanding_percent = serializers.FloatField()
    exceeds_percent = serializers.FloatField()
    meets_percent = serializers.FloatField()
    needs_work_percent = serializers.FloatField()
    unsatisfactory_percent = serializers.FloatField()


class TrendDataPointSerializer(serializers.Serializer):
    """Serializer for individual trend data points"""
    month = serializers.CharField()
    score = serializers.FloatField()
    ratings_count = serializers.IntegerField()


class CompanyAnalyticsSerializer(serializers.Serializer):
    """Serializer for company-level analytics"""
    period = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_cycles = serializers.IntegerField()
    total_ratings = serializers.IntegerField()
    average_score = serializers.FloatField()
    previous_average_score = serializers.FloatField()
    score_change = serializers.FloatField()
    score_change_percent = serializers.FloatField()
    trend = serializers.DictField()
    rating_distribution = RatingDistributionSerializer()
    promotions_count = serializers.IntegerField()
    active_pips = serializers.IntegerField()
    completed_pips = serializers.IntegerField()
    pip_success_rate = serializers.FloatField()


class DepartmentAnalyticsItemSerializer(serializers.Serializer):
    """Serializer for individual department analytics"""
    id = serializers.CharField()
    name = serializers.CharField()
    employee_count = serializers.IntegerField()
    average_score = serializers.FloatField()
    ratings_count = serializers.IntegerField()
    std_dev = serializers.FloatField()
    promotions = serializers.IntegerField()
    pips = serializers.IntegerField()


class DepartmentAnalyticsSerializer(serializers.Serializer):
    """Serializer for department-level analytics"""
    period = serializers.CharField()
    total_departments = serializers.IntegerField()
    company_average = serializers.FloatField()
    best_performing_department = DepartmentAnalyticsItemSerializer(allow_null=True)
    worst_performing_department = DepartmentAnalyticsItemSerializer(allow_null=True)
    departments = DepartmentAnalyticsItemSerializer(many=True)


class ManagerAnalyticsItemSerializer(serializers.Serializer):
    """Serializer for individual manager analytics"""
    id = serializers.CharField()
    name = serializers.CharField()
    team_size = serializers.IntegerField()
    average_rating = serializers.FloatField()
    company_average = serializers.FloatField()
    inflation = serializers.FloatField()
    inflation_percent = serializers.FloatField()
    rating_inflated = serializers.BooleanField()
    rating_deflated = serializers.BooleanField()
    timely_reviews = serializers.IntegerField()
    late_reviews = serializers.IntegerField()


class ManagerAnalyticsSerializer(serializers.Serializer):
    """Serializer for manager-level analytics"""
    period = serializers.CharField()
    total_managers = serializers.IntegerField()
    company_average = serializers.FloatField()
    inflated_managers = ManagerAnalyticsItemSerializer(many=True)
    deflated_managers = ManagerAnalyticsItemSerializer(many=True)
    top_managers = ManagerAnalyticsItemSerializer(many=True)
    bottom_managers = ManagerAnalyticsItemSerializer(many=True)
    all_managers = ManagerAnalyticsItemSerializer(many=True)


class InsightSerializer(serializers.Serializer):
    """Serializer for individual insights"""
    type = serializers.CharField()
    title = serializers.CharField()
    message = serializers.CharField()
    recommendation = serializers.CharField()
    priority = serializers.CharField()
    created_at = serializers.DateTimeField()
    data = serializers.DictField(required=False)


class InsightsSerializer(serializers.Serializer):
    """Serializer for all insights"""
    company = InsightSerializer(many=True)
    departments = InsightSerializer(many=True)
    skill_gaps = InsightSerializer(many=True)
    generated_at = serializers.DateTimeField()


class FlightRiskItemSerializer(serializers.Serializer):
    """Serializer for individual flight risk employee"""
    employee_id = serializers.CharField()
    employee_name = serializers.CharField()
    risk_score = serializers.IntegerField()
    risk_level = serializers.CharField(allow_null=True)
    risk_factors = serializers.ListField(child=serializers.CharField())
    recommendation = serializers.CharField()


class FlightRiskSerializer(serializers.Serializer):
    """Serializer for flight risk predictions"""
    total_high_risk = serializers.IntegerField()
    total_medium_risk = serializers.IntegerField()
    employees = FlightRiskItemSerializer(many=True)
    generated_at = serializers.DateTimeField()


class AnalyticsPeriodSerializer(serializers.Serializer):
    """Serializer for analytics period request"""
    period = serializers.ChoiceField(
        choices=['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        default='monthly'
    )
    department_id = serializers.UUIDField(required=False, allow_null=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)


class SkillGapItemSerializer(serializers.Serializer):
    """Serializer for individual skill gap item"""
    name = serializers.CharField()
    score = serializers.FloatField()


class SkillGapAnalyticsSerializer(serializers.Serializer):
    """Serializer for skill gap analysis"""
    weakest_competencies = SkillGapItemSerializer(many=True)
    strongest_competencies = SkillGapItemSerializer(many=True)
    all_competencies = SkillGapItemSerializer(many=True)