from django_filters import rest_framework as filters
from django.db import models
from apps.configs.models import DisasterRecoveryPlan, DisasterRecoveryExecution

class DisasterRecoveryPlanFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    status = filters.ChoiceFilter(choices=DisasterRecoveryPlan.STATUS_CHOICES)
    approval_required = filters.BooleanFilter(field_name='approval_required')
    test_successful = filters.BooleanFilter(field_name='test_successful')
    last_tested_after = filters.DateTimeFilter(field_name='last_tested_at', lookup_expr='gte')
    last_tested_before = filters.DateTimeFilter(field_name='last_tested_at', lookup_expr='lte')
    needs_testing = filters.BooleanFilter(method='filter_needs_testing')
    def filter_needs_testing(self, queryset, name, value):
        from django.utils import timezone
        from datetime import timedelta
        if value:
            cutoff = timezone.now() - timedelta(days=30)
            return queryset.filter(status='active').exclude(last_tested_at__gte=cutoff)
        return queryset
    class Meta:
        model = DisasterRecoveryPlan
        fields = ['app_name', 'status', 'approval_required', 'test_successful']

class DisasterRecoveryExecutionFilter(filters.FilterSet):
    execution_type = filters.ChoiceFilter(choices=DisasterRecoveryExecution.EXECUTION_TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=DisasterRecoveryExecution.STATUS_CHOICES)
    triggered_by_role = filters.CharFilter(field_name='triggered_by_role')
    triggered_after = filters.DateTimeFilter(field_name='triggered_at', lookup_expr='gte')
    triggered_before = filters.DateTimeFilter(field_name='triggered_at', lookup_expr='lte')
    rto_met = filters.BooleanFilter(method='filter_rto_met')
    rpo_met = filters.BooleanFilter(method='filter_rpo_met')
    def filter_rto_met(self, queryset, name, value):
        if value:
            return queryset.filter(rto_achieved_minutes__lte=models.F('dr_plan__rto_target_minutes'))
        return queryset.filter(rto_achieved_minutes__gt=models.F('dr_plan__rto_target_minutes'))
    def filter_rpo_met(self, queryset, name, value):
        if value:
            return queryset.filter(rpo_achieved_minutes__lte=models.F('dr_plan__rpo_target_minutes'))
        return queryset.filter(rpo_achieved_minutes__gt=models.F('dr_plan__rpo_target_minutes'))
    class Meta:
        model = DisasterRecoveryExecution
        fields = ['execution_type', 'status', 'triggered_by_role']