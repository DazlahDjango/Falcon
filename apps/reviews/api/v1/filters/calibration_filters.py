import django_filters
from django_filters import rest_framework as filters
from apps.reviews.models import CalibrationSession, CalibrationRating
from .base_filters import TenantFilter, DateRangeFilter

class CalibrationSessionFilter(TenantFilter, DateRangeFilter):
    review_cycle = filters.UUIDFilter(field_name='review_cycle__id', help_text="Filter by review cycle ID")
    session_type = filters.ChoiceFilter(choices=CalibrationSession.SessionType.choices, help_text="Filter by session type")
    facilitator = filters.UUIDFilter(field_name='facilitator__id', help_text="Filter by facilitator ID")
    participant = filters.UUIDFilter(method='filter_participant', help_text="Filter by participant ID")
    department = filters.UUIDFilter(field_name='departments_included__id', help_text="Filter by included department ID")
    scheduled_date_from = filters.DateTimeFilter(field_name='scheduled_date', lookup_expr='gte', help_text="Scheduled date from")
    scheduled_date_to = filters.DateTimeFilter(field_name='scheduled_date', lookup_expr='lte', help_text="Scheduled date to")
    status = filters.ChoiceFilter(choices=CalibrationSession.Status.choices, help_text="Filter by status")
    outcome = filters.ChoiceFilter(choices=CalibrationSession.Outcome.choices, help_text="Filter by outcome")
    def filter_participant(self, queryset, name, value):
        return queryset.filter(participants__id=value)
    class Meta:
        model = CalibrationSession
        fields = ['id', 'review_cycle', 'session_type', 'facilitator', 'status', 'outcome', 'scheduled_date']

class CalibrationRatingFilter(TenantFilter, DateRangeFilter):
    calibration_session = filters.UUIDFilter(field_name='calibration_session__id', help_text="Filter by calibration session ID")
    final_rating = filters.UUIDFilter(field_name='final_rating__id', help_text="Filter by final rating ID")
    adjusted_by = filters.UUIDFilter(field_name='adjusted_by__id', help_text="Filter by who made the adjustment")
    before_score_min = filters.NumberFilter(field_name='before_score', lookup_expr='gte', help_text="Minimum before score")
    before_score_max = filters.NumberFilter(field_name='before_score', lookup_expr='lte', help_text="Maximum before score")
    after_score_min = filters.NumberFilter(field_name='after_score', lookup_expr='gte', help_text="Minimum after score")
    after_score_max = filters.NumberFilter(field_name='after_score', lookup_expr='lte', help_text="Maximum after score")
    class Meta:
        model = CalibrationRating
        fields = ['id', 'calibration_session', 'final_rating', 'adjusted_by', 'adjusted_at']