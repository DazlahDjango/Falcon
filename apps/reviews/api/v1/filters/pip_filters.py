import django_filters
from django_filters import rest_framework as filters
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.reviews.models import PIP, PIPAction, PIPReview
from .base_filters import TenantFilter, DateRangeFilter

class PIPFilter(TenantFilter, DateRangeFilter):
    employee = filters.UUIDFilter(field_name='employee__id', help_text="Filter by employee ID")
    employee_email = filters.CharFilter(field_name='employee__email', lookup_expr='icontains', help_text="Filter by employee email")
    owner = filters.UUIDFilter(field_name='owner__id', help_text="Filter by owner ID")
    department = filters.UUIDFilter(field_name='employee__department__id', help_text="Filter by department ID")
    severity = filters.ChoiceFilter(choices=PIP.Severity.choices, help_text="Filter by severity")
    status = filters.ChoiceFilter(choices=[('draft', 'Draft'), ('submitted', 'Active'), ('completed', 'Completed'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('cancelled', 'Cancelled'), ('archived', 'Archived')], help_text="Filter by status")
    outcome = filters.ChoiceFilter(choices=PIP.Outcome.choices, help_text="Filter by outcome")
    start_date_from = filters.DateFilter(field_name='start_date', lookup_expr='gte', help_text="Start date from")
    start_date_to = filters.DateFilter(field_name='start_date', lookup_expr='lte', help_text="Start date to")
    end_date_from = filters.DateFilter(field_name='end_date', lookup_expr='gte', help_text="End date from")
    end_date_to = filters.DateFilter(field_name='end_date', lookup_expr='lte', help_text="End date to")
    is_overdue = filters.BooleanFilter(method='filter_is_overdue', help_text="Filter PIPs past end date")
    is_ending_soon = filters.BooleanFilter(method='filter_is_ending_soon', help_text="Filter PIPs ending within 14 days")
    has_missed_actions = filters.BooleanFilter(method='filter_has_missed_actions', help_text="Filter PIPs with missed actions")
    def filter_is_overdue(self, queryset, name, value):
        if value:
            return queryset.filter(end_date__lt=timezone.now().date(), status__in=['draft', 'submitted'])
        return queryset
    def filter_is_ending_soon(self, queryset, name, value):
        if value:
            today = timezone.now().date()
            soon = today + timedelta(days=14)
            return queryset.filter(end_date__lte=soon, end_date__gte=today, status__in=['draft', 'submitted'])
        return queryset
    def filter_has_missed_actions(self, queryset, name, value):
        if value:
            return queryset.filter(actions__status='missed').distinct()
        return queryset.exclude(actions__status='missed')
    class Meta:
        model = PIP
        fields = ['id', 'employee', 'owner', 'severity', 'status', 'outcome', 'start_date', 'end_date']

class PIPActionFilter(TenantFilter, DateRangeFilter):
    pip = filters.UUIDFilter(field_name='pip__id', help_text="Filter by parent PIP ID")
    status = filters.ChoiceFilter(choices=PIPAction.ActionStatus.choices, help_text="Filter by status")
    priority = filters.ChoiceFilter(choices=PIPAction.Priority.choices, help_text="Filter by priority")
    due_date_from = filters.DateFilter(field_name='due_date', lookup_expr='gte', help_text="Due date from")
    due_date_to = filters.DateFilter(field_name='due_date', lookup_expr='lte', help_text="Due date to")
    is_overdue = filters.BooleanFilter(method='filter_is_overdue', help_text="Filter overdue actions")
    requires_evidence = filters.BooleanFilter(field_name='requires_evidence', help_text="Filter actions that require evidence")
    has_evidence = filters.BooleanFilter(field_name='evidence', lookup_expr='isnull', help_text="Filter actions with evidence uploaded")
    def filter_is_overdue(self, queryset, name, value):
        if value:
            return queryset.filter(due_date__lt=timezone.now().date(), status__in=['pending', 'in_progress'])
        return queryset
    class Meta:
        model = PIPAction
        fields = ['id', 'pip', 'status', 'priority', 'due_date', 'requires_evidence']

class PIPReviewFilter(TenantFilter, DateRangeFilter):
    pip = filters.UUIDFilter(field_name='pip__id', help_text="Filter by parent PIP ID")
    reviewer = filters.UUIDFilter(field_name='reviewer__id', help_text="Filter by reviewer ID")
    employee = filters.UUIDFilter(field_name='employee__id', help_text="Filter by employee ID")
    rating = filters.ChoiceFilter(choices=PIPReview.ReviewRating.choices, help_text="Filter by rating")
    review_date_from = filters.DateFilter(field_name='review_date', lookup_expr='gte', help_text="Review date from")
    review_date_to = filters.DateFilter(field_name='review_date', lookup_expr='lte', help_text="Review date to")
    employee_attended = filters.BooleanFilter(field_name='employee_attended', help_text="Filter by whether employee attended")
    employee_signed = filters.BooleanFilter(field_name='employee_signature', help_text="Filter by whether employee signed")
    class Meta:
        model = PIPReview
        fields = ['id', 'pip', 'reviewer', 'employee', 'rating', 'review_date', 'employee_attended', 'employee_signed']