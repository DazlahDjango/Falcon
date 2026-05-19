from django_filters import rest_framework as filters
from apps.configs.models import RiskAssessment
from apps.configs.constants import RiskLevel

class RiskAssessmentFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    risk_level = filters.ChoiceFilter(choices=RiskLevel.CHOICES)
    risk_score_min = filters.NumberFilter(field_name='risk_score', lookup_expr='gte')
    risk_score_max = filters.NumberFilter(field_name='risk_score', lookup_expr='lte')
    requires_super_admin = filters.BooleanFilter(field_name='requires_super_admin')
    assessed_after = filters.DateTimeFilter(field_name='assessed_at', lookup_expr='gte')
    assessed_before = filters.DateTimeFilter(field_name='assessed_at', lookup_expr='lte')
    expires_after = filters.DateTimeFilter(field_name='expires_at', lookup_expr='gte')
    expires_before = filters.DateTimeFilter(field_name='expires_at', lookup_expr='lte')
    is_current = filters.BooleanFilter(method='filter_is_current')
    is_critical = filters.BooleanFilter(method='filter_is_critical')
    def filter_is_current(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(expires_at__gt=timezone.now())
        return queryset.filter(expires_at__lte=timezone.now())
    def filter_is_critical(self, queryset, name, value):
        if value:
            return queryset.filter(risk_level=RiskLevel.CRITICAL)
        return queryset.exclude(risk_level=RiskLevel.CRITICAL)
    class Meta:
        model = RiskAssessment
        fields = ['app_name', 'risk_level', 'requires_super_admin']