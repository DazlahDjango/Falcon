import django_filters
from django_filters import rest_framework as filters
from django.db import models
from apps.reviews.models import SelfAssessment, SupervisorReview, FinalRating
from .base_filters import TenantFilter, DateRangeFilter, StatusFilter

class SelfAssessmentFilter(TenantFilter, DateRangeFilter, StatusFilter):
    review_cycle = filters.UUIDFilter(field_name='review_cycle__id', help_text="Filter by review cycle ID")
    review_cycle_name = filters.CharFilter(field_name='review_cycle__name', lookup_expr='icontains', help_text="Filter by review cycle name")
    employee = filters.UUIDFilter(field_name='employee__id', help_text="Filter by employee ID")
    employee_email = filters.CharFilter(field_name='employee__email', lookup_expr='icontains', help_text="Filter by employee email")
    employee_name = filters.CharFilter(method='filter_employee_name', help_text="Filter by employee full name")
    department = filters.UUIDFilter(field_name='employee__department__id', help_text="Filter by department ID")
    submitted_before = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='lte', help_text="Submitted before this date/time")
    submitted_after = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='gte', help_text="Submitted after this date/time")
    has_competency_ratings = filters.BooleanFilter(method='filter_has_competency_ratings', help_text="Filter by whether competency ratings exist")
    def filter_employee_name(self, queryset, name, value):
        return queryset.filter(models.Q(employee__first_name__icontains=value) | models.Q(employee__last_name__icontains=value))
    def filter_has_competency_ratings(self, queryset, name, value):
        if value:
            return queryset.filter(competency_ratings__isnull=False).distinct()
        return queryset.filter(competency_ratings__isnull=True)
    class Meta:
        model = SelfAssessment
        fields = ['id', 'review_cycle', 'employee', 'status', 'submitted_at']

class SupervisorReviewFilter(TenantFilter, DateRangeFilter, StatusFilter):
    review_cycle = filters.UUIDFilter(field_name='review_cycle__id', help_text="Filter by review cycle ID")
    review_cycle_name = filters.CharFilter(field_name='review_cycle__name', lookup_expr='icontains', help_text="Filter by review cycle name")
    employee = filters.UUIDFilter(field_name='employee__id', help_text="Filter by employee ID")
    supervisor = filters.UUIDFilter(field_name='supervisor__id', help_text="Filter by supervisor ID")
    department = filters.UUIDFilter(field_name='employee__department__id', help_text="Filter by department ID")
    recommendation = filters.ChoiceFilter(choices=SupervisorReview.Recommendation.choices, help_text="Filter by recommendation")
    promotion_readiness = filters.BooleanFilter(field_name='promotion_readiness', help_text="Filter by promotion readiness")
    has_self_assessment = filters.BooleanFilter(method='filter_has_self_assessment', help_text="Filter by whether self assessment exists")
    uses_kpi_override = filters.BooleanFilter(field_name='override_kpi_score', lookup_expr='isnull', help_text="Filter by whether KPI override is used")
    def filter_has_self_assessment(self, queryset, name, value):
        if value:
            return queryset.filter(self_assessment__isnull=False)
        return queryset.filter(self_assessment__isnull=True)
    class Meta:
        model = SupervisorReview
        fields = ['id', 'review_cycle', 'employee', 'supervisor', 'status', 'recommendation', 'promotion_readiness']

class FinalRatingFilter(TenantFilter, DateRangeFilter):
    review_cycle = filters.UUIDFilter(field_name='review_cycle__id', help_text="Filter by review cycle ID")
    employee = filters.UUIDFilter(field_name='employee__id', help_text="Filter by employee ID")
    department = filters.UUIDFilter(field_name='employee__department__id', help_text="Filter by department ID")
    status = filters.ChoiceFilter(choices=FinalRating.FinalStatus.choices, help_text="Filter by status")
    final_score_min = filters.NumberFilter(field_name='final_score', lookup_expr='gte', help_text="Minimum final score (0-100)")
    final_score_max = filters.NumberFilter(field_name='final_score', lookup_expr='lte', help_text="Maximum final score (0-100)")
    final_rating_label = filters.CharFilter(field_name='final_rating_label', lookup_expr='icontains', help_text="Filter by rating label")
    promotion_recommended = filters.BooleanFilter(field_name='promotion_recommended', help_text="Filter by promotion recommendation")
    pip_recommended = filters.BooleanFilter(field_name='pip_recommended', help_text="Filter by PIP recommendation")
    action_outcome = filters.ChoiceFilter(choices=FinalRating.ActionOutcome.choices, help_text="Filter by action outcome")
    approved_by = filters.UUIDFilter(field_name='approved_by__id', help_text="Filter by who approved the rating")
    approved_from = filters.DateTimeFilter(field_name='approved_at', lookup_expr='gte', help_text="Approved from this date/time")
    approved_to = filters.DateTimeFilter(field_name='approved_at', lookup_expr='lte', help_text="Approved to this date/time")
    class Meta:
        model = FinalRating
        fields = ['id', 'review_cycle', 'employee', 'status', 'final_score', 'final_rating_label', 'promotion_recommended', 'pip_recommended', 'action_outcome']