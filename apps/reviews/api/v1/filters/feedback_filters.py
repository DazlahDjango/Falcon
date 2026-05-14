# apps/reviews/api/v1/filters/feedback_filters.py
"""
Filter classes for feedback models
"""

import django_filters
from django_filters import rest_framework as filters

from apps.reviews.models import FeedbackRequest, FeedbackResponse, FeedbackSummary
from .base_filters import TenantFilter, DateRangeFilter, StatusFilter


class FeedbackRequestFilter(TenantFilter, DateRangeFilter, StatusFilter):
    """
    Filter set for FeedbackRequest model.
    """
    
    review_cycle = filters.UUIDFilter(
        field_name='review_cycle__id',
        help_text="Filter by review cycle ID"
    )
    
    subject = filters.UUIDFilter(
        field_name='subject__id',
        help_text="Filter by subject (employee being reviewed) ID"
    )
    
    reviewer = filters.UUIDFilter(
        field_name='reviewer__id',
        help_text="Filter by reviewer ID"
    )
    
    reviewer_type = filters.ChoiceFilter(
        choices=FeedbackRequest.ReviewerType.choices,
        help_text="Filter by reviewer type (manager, peer, subordinate, cross_dept, external, self)"
    )
    
    is_anonymous = filters.BooleanFilter(
        field_name='is_anonymous',
        help_text="Filter by anonymity"
    )
    
    is_required = filters.BooleanFilter(
        field_name='is_required',
        help_text="Filter by required status"
    )
    
    due_date_from = filters.DateFilter(
        field_name='due_date',
        lookup_expr='gte',
        help_text="Due date from"
    )
    
    due_date_to = filters.DateFilter(
        field_name='due_date',
        lookup_expr='lte',
        help_text="Due date to"
    )
    
    is_overdue = filters.BooleanFilter(
        method='filter_is_overdue',
        help_text="Filter overdue requests"
    )
    
    has_response = filters.BooleanFilter(
        method='filter_has_response',
        help_text="Filter by whether response exists"
    )
    
    def filter_is_overdue(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now().date(),
                status='pending'
            )
        return queryset
    
    def filter_has_response(self, queryset, name, value):
        if value:
            return queryset.filter(response__isnull=False)
        return queryset.filter(response__isnull=True)
    
    class Meta:
        model = FeedbackRequest
        fields = [
            'id', 'review_cycle', 'subject', 'reviewer',
            'reviewer_type', 'is_anonymous', 'is_required',
            'status', 'due_date', 'is_overdue', 'has_response'
        ]


class FeedbackResponseFilter(TenantFilter, DateRangeFilter):
    """
    Filter set for FeedbackResponse model.
    """
    
    feedback_request = filters.UUIDFilter(
        field_name='feedback_request__id',
        help_text="Filter by feedback request ID"
    )
    
    overall_rating_min = filters.NumberFilter(
        field_name='overall_rating',
        lookup_expr='gte',
        help_text="Minimum overall rating (1-5)"
    )
    
    overall_rating_max = filters.NumberFilter(
        field_name='overall_rating',
        lookup_expr='lte',
        help_text="Maximum overall rating (1-5)"
    )
    
    is_anonymous = filters.BooleanFilter(
        field_name='is_anonymous',
        help_text="Filter by anonymity"
    )
    
    has_strengths = filters.BooleanFilter(
        field_name='strengths',
        lookup_expr='isnull',
        help_text="Filter by whether strengths provided"
    )
    
    has_improvements = filters.BooleanFilter(
        field_name='areas_for_improvement',
        lookup_expr='isnull',
        help_text="Filter by whether improvements provided"
    )
    
    class Meta:
        model = FeedbackResponse
        fields = [
            'id', 'feedback_request', 'overall_rating',
            'is_anonymous', 'submitted_at'
        ]


class FeedbackSummaryFilter(TenantFilter, DateRangeFilter):
    """
    Filter set for FeedbackSummary model.
    """
    
    review_cycle = filters.UUIDFilter(
        field_name='review_cycle__id',
        help_text="Filter by review cycle ID"
    )
    
    subject = filters.UUIDFilter(
        field_name='subject__id',
        help_text="Filter by subject ID"
    )
    
    total_responses_min = filters.NumberFilter(
        field_name='total_responses',
        lookup_expr='gte',
        help_text="Minimum total responses"
    )
    
    total_responses_max = filters.NumberFilter(
        field_name='total_responses',
        lookup_expr='lte',
        help_text="Maximum total responses"
    )
    
    overall_avg_rating_min = filters.NumberFilter(
        field_name='overall_avg_rating',
        lookup_expr='gte',
        help_text="Minimum average rating"
    )
    
    overall_avg_rating_max = filters.NumberFilter(
        field_name='overall_avg_rating',
        lookup_expr='lte',
        help_text="Maximum average rating"
    )
    
    is_shared = filters.BooleanFilter(
        field_name='is_shared_with_subject',
        help_text="Filter by whether shared with subject"
    )
    
    class Meta:
        model = FeedbackSummary
        fields = [
            'id', 'review_cycle', 'subject', 'total_responses',
            'overall_avg_rating', 'is_shared_with_subject'
        ]