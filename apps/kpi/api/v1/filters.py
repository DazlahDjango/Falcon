from django_filters import rest_framework as filters
from django.db.models import Q
from django.utils import timezone
from ...models import (
    KPI, KPIWeight, AnnualTarget, MonthlyActual, Score, 
    MonthlyPhasing, ValidationRecord, AggregatedScore
)

class BaseKPIListFilter(filters.FilterSet):
    is_active = filters.BooleanFilter(field_name='is_active')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')

class KPIListFilter(BaseKPIListFilter):
    # Basic filters
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    code = filters.CharFilter(field_name='code', lookup_expr='icontains')
    kpi_type = filters.ChoiceFilter(choices=KPI.KPI_TYPES, field_name='kpi_type')
    calculation_logic = filters.ChoiceFilter(choices=KPI.CALCULATION_LOGIC, field_name='calculation_logic')
    measure_type = filters.ChoiceFilter(choices=KPI.MEASURE_TYPE, field_name='measure_type')
    # Foreign key filters
    framework = filters.UUIDFilter(field_name='framework__id')
    category = filters.UUIDFilter(field_name='category__id')
    sector = filters.UUIDFilter(field_name='sector__id')
    owner = filters.UUIDFilter(field_name='owner__id')
    department = filters.UUIDFilter(field_name='department__id')
    # Multi-value filters
    kpi_types = filters.MultipleChoiceFilter(choices=KPI.KPI_TYPES, field_name='kpi_type', lookup_expr='in')
    frameworks = filters.MultipleChoiceFilter(field_name='framework__id', lookup_expr='in')
    # Range filters
    target_min_min = filters.NumberFilter(field_name='target_min', lookup_expr='gte')
    target_min_max = filters.NumberFilter(field_name='target_min', lookup_expr='lte')
    target_max_min = filters.NumberFilter(field_name='target_max', lookup_expr='gte')
    target_max_max = filters.NumberFilter(field_name='target_max', lookup_expr='lte')
    # Search across multiple fields
    search = filters.CharFilter(method='filter_search')
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(code__icontains=value) |
            Q(description__icontains=value)
        )
    class Meta:
        model = KPI
        fields = [
            'is_active', 'name', 'code', 'kpi_type', 'calculation_logic', 
            'measure_type', 'framework', 'category', 'sector', 'owner', 
            'department', 'search'
        ]

class AnnualTargetListFilter(filters.FilterSet):
    year = filters.NumberFilter(field_name='year')
    year__gte = filters.NumberFilter(field_name='year', lookup_expr='gte')
    year__lte = filters.NumberFilter(field_name='year', lookup_expr='lte')
    kpi = filters.UUIDFilter(field_name='kpi__id')
    user = filters.UUIDFilter(field_name='user__id')
    department = filters.UUIDFilter(field_name='user__department__id')
    target_min = filters.NumberFilter(field_name='target_value', lookup_expr='gte')
    target_max = filters.NumberFilter(field_name='target_value', lookup_expr='lte')
    is_approved = filters.BooleanFilter(method='filter_is_approved')
    def filter_is_approved(self, queryset, name, value):
        if value:
            return queryset.filter(approved_by__isnull=False)
        return queryset.filter(approved_by__isnull=True)
    class Meta:
        model = AnnualTarget
        fields = ['year', 'kpi', 'user', 'department', 'is_approved']

class MonthlyActualListFilter(filters.FilterSet):
    year = filters.NumberFilter(field_name='year')
    month = filters.NumberFilter(field_name='month')
    year_month = filters.CharFilter(method='filter_year_month')
    kpi = filters.UUIDFilter(field_name='kpi__id')
    user = filters.UUIDFilter(field_name='user__id')
    department = filters.UUIDFilter(field_name='user__department__id')
    supervisor = filters.UUIDFilter(method='filter_by_supervisor')
    status = filters.ChoiceFilter(choices=MonthlyActual.STATUS_CHOICES)
    submitted_after = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='gte')
    submitted_before = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='lte')
    pending_validation = filters.BooleanFilter(method='filter_pending_validation')
    missing_data = filters.BooleanFilter(method='filter_missing_data')
    def filter_year_month(self, queryset, name, value):
        try:
            year, month = value.split('-')
            return queryset.filter(year=int(year), month=int(month))
        except (ValueError, TypeError):
            return queryset
    def filter_by_supervisor(self, queryset, name, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            supervisor = User.objects.get(id=value)
            direct_reports = supervisor.get_direct_reports().values_list('id', flat=True)
        except User.DoesNotExist:
            direct_reports = []
        return queryset.filter(user_id__in=direct_reports)
    def filter_pending_validation(self, queryset, name, value):
        if value:
            return queryset.filter(status='PENDING')
        return queryset.exclude(status='PENDING')
    def filter_missing_data(self, queryset, name, value):
        if not value:
            return queryset
        from apps.accounts.models import User
        submitted_users = queryset.values_list('user_id', flat=True).distinct()
        missing_users = User.objects.filter(
            tenant_id=self.request.tenant.id,
            is_active=True
        ).exclude(id__in=submitted_users)
        # Return empty queryset as we're filtering by missing, not actuals
        return queryset.none() if missing_users.exists() else queryset
    class Meta:
        model = MonthlyActual
        fields = ['year', 'month', 'kpi', 'user', 'department', 'status']

class ScoreListFilter(filters.FilterSet):
    year = filters.NumberFilter(field_name='year')
    month = filters.NumberFilter(field_name='month')
    year_month = filters.CharFilter(method='filter_year_month')
    kpi = filters.UUIDFilter(field_name='kpi__id')
    user = filters.UUIDFilter(field_name='user__id')
    department = filters.UUIDFilter(field_name='user__department__id')
    score_min = filters.NumberFilter(field_name='score', lookup_expr='gte')
    score_max = filters.NumberFilter(field_name='score', lookup_expr='lte')
    traffic_light = filters.CharFilter(method='filter_by_traffic_light')
    red_only = filters.BooleanFilter(method='filter_red_only')
    def filter_year_month(self, queryset, name, value):
        try:
            year, month = value.split('-')
            return queryset.filter(year=int(year), month=int(month))
        except (ValueError, TypeError):
            return queryset
    def filter_by_traffic_light(self, queryset, name, value):
        return queryset.filter(traffic_light__status=value.upper())
    def filter_red_only(self, queryset, name, value):
        if value:
            return queryset.filter(traffic_light__status='RED')
        return queryset
    class Meta:
        model = Score
        fields = ['year', 'month', 'kpi', 'user', 'department']

class AggregatedScoreListFilter(filters.FilterSet):
    level = filters.ChoiceFilter(choices=AggregatedScore.AGGREGATION_LEVEL)
    year = filters.NumberFilter(field_name='year')
    month = filters.NumberFilter(field_name='month')
    year_month = filters.CharFilter(method='filter_year_month')
    entity_id = filters.UUIDFilter(field_name='entity_id')
    entity_name = filters.CharFilter(field_name='entity_name', lookup_expr='icontains')
    score_min = filters.NumberFilter(field_name='aggregated_score', lookup_expr='gte')
    score_max = filters.NumberFilter(field_name='aggregated_score', lookup_expr='lte')
    def filter_year_month(self, queryset, name, value):
        try:
            year, month = value.split('-')
            return queryset.filter(year=int(year), month=int(month))
        except (ValueError, TypeError):
            return queryset
    class Meta:
        model = AggregatedScore
        fields = ['level', 'year', 'month', 'entity_id', 'entity_name']

class MonthlyPhasingListFilter(filters.FilterSet):
    year = filters.NumberFilter(field_name='annual_target__year')
    month = filters.NumberFilter(field_name='month')
    kpi = filters.UUIDFilter(field_name='annual_target__kpi__id')
    user = filters.UUIDFilter(field_name='annual_target__user__id')
    is_locked = filters.BooleanFilter(field_name='is_locked')
    class Meta:
        model = MonthlyPhasing
        fields = ['year', 'month', 'kpi', 'user', 'is_locked']

class ValidationRecordListFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=ValidationRecord.STATUS_CHOICES)
    validated_by = filters.UUIDFilter(field_name='validated_by__id')
    validated_after = filters.DateTimeFilter(field_name='validated_at', lookup_expr='gte')
    validated_before = filters.DateTimeFilter(field_name='validated_at', lookup_expr='lte')
    actual__user = filters.UUIDFilter(field_name='actual__user__id')
    actual__kpi = filters.UUIDFilter(field_name='actual__kpi__id')
    actual__year = filters.NumberFilter(field_name='actual__year')
    actual__month = filters.NumberFilter(field_name='actual__month')
    class Meta:
        model = ValidationRecord
        fields = ['status', 'validated_by', 'actual__user', 'actual__kpi']

class KPIWeightListFilter(filters.FilterSet):
    kpi = filters.UUIDFilter(field_name='kpi__id')
    user = filters.UUIDFilter(field_name='user__id')
    is_active = filters.BooleanFilter(field_name='is_active')
    effective_from__lte = filters.DateFilter(field_name='effective_from', lookup_expr='lte')
    effective_to__gte = filters.DateFilter(field_name='effective_to', lookup_expr='gte')
    class Meta:
        model = KPIWeight
        fields = ['kpi', 'user', 'is_active']

class DashboardFilter(filters.FilterSet):
    year = filters.NumberFilter(method='filter_year')
    month = filters.NumberFilter(method='filter_month')
    def filter_year(self, queryset, name, value):
        if value:
            return value
        return timezone.now().year
    def filter_month(self, queryset, name, value):
        if value:
            return value
        return timezone.now().month
    class Meta:
        fields = ['year', 'month']