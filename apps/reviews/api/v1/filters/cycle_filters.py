import django_filters
from django_filters import rest_framework as filters
from django.utils import timezone
from apps.reviews.models import ReviewCycle
from .base_filters import TenantFilter, DateRangeFilter

class CycleTypeFilter(filters.FilterSet):
    cycle_type = filters.ChoiceFilter(choices=ReviewCycle.CycleType.choices, help_text="Filter by cycle type")
    class Meta:
        abstract = True

class CycleStatusFilter(filters.FilterSet):
    is_active_now = filters.BooleanFilter(method='filter_is_active_now', help_text="Filter cycles that are currently active")
    is_upcoming = filters.BooleanFilter(method='filter_is_upcoming', help_text="Filter cycles that start in the future")
    is_past = filters.BooleanFilter(method='filter_is_past', help_text="Filter cycles that have ended")
    def filter_is_active_now(self, queryset, name, value):
        today = timezone.now().date()
        if value:
            return queryset.filter(start_date__lte=today, end_date__gte=today, status='submitted')
        return queryset
    def filter_is_upcoming(self, queryset, name, value):
        today = timezone.now().date()
        if value:
            return queryset.filter(start_date__gt=today)
        return queryset
    def filter_is_past(self, queryset, name, value):
        today = timezone.now().date()
        if value:
            return queryset.filter(end_date__lt=today)
        return queryset
    class Meta:
        abstract = True

class CycleFilter(TenantFilter, DateRangeFilter, CycleTypeFilter, CycleStatusFilter):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains', help_text="Search by cycle name")
    start_date_from = filters.DateFilter(field_name='start_date', lookup_expr='gte', help_text="Start date from")
    start_date_to = filters.DateFilter(field_name='start_date', lookup_expr='lte', help_text="Start date to")
    end_date_from = filters.DateFilter(field_name='end_date', lookup_expr='gte', help_text="End date from")
    end_date_to = filters.DateFilter(field_name='end_date', lookup_expr='lte', help_text="End date to")
    self_assessment_deadline_before = filters.DateFilter(field_name='self_assessment_deadline', lookup_expr='lte', help_text="Self-assessment deadline before")
    self_assessment_deadline_after = filters.DateFilter(field_name='self_assessment_deadline', lookup_expr='gte', help_text="Self-assessment deadline after")
    supervisor_deadline_before = filters.DateFilter(field_name='supervisor_review_deadline', lookup_expr='lte', help_text="Supervisor review deadline before")
    supervisor_deadline_after = filters.DateFilter(field_name='supervisor_review_deadline', lookup_expr='gte', help_text="Supervisor review deadline after")
    status = filters.ChoiceFilter(choices=ReviewCycle.Status.choices, help_text="Filter by status")
    class Meta:
        model = ReviewCycle
        fields = ['id', 'name', 'cycle_type', 'status', 'start_date', 'end_date', 'is_active_now', 'is_upcoming', 'is_past']