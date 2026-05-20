from rest_framework import serializers
from apps.dashboard.models import PeriodComparison, DashboardAccessLog

class PeriodComparisonSerializer(serializers.ModelSerializer):
    comparison_type_display = serializers.CharField(source='get_comparison_type_display', read_only=True)
    current_period_display = serializers.SerializerMethodField()
    previous_period_display = serializers.SerializerMethodField()
    variance_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = PeriodComparison
        fields = [
            'id', 'tenant_id', 'user_id', 'name', 'comparison_type', 'comparison_type_display',
            'current_period', 'previous_period', 'current_period_display', 'previous_period_display',
            'department_ids', 'kpi_ids', 'cached_results', 'cached_at', 'is_public',
            'variance_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'cached_results', 'cached_at']
    
    def get_current_period_display(self, obj):
        period = obj.current_period
        if period.get('month'):
            return f"{period.get('year')}-{period.get('month'):02d}"
        elif period.get('quarter'):
            return f"Q{period.get('quarter')} {period.get('year')}"
        return f"{period.get('year')}"
    
    def get_previous_period_display(self, obj):
        period = obj.previous_period
        if period.get('month'):
            return f"{period.get('year')}-{period.get('month'):02d}"
        elif period.get('quarter'):
            return f"Q{period.get('quarter')} {period.get('year')}"
        return f"{period.get('year')}"
    
    def get_variance_percentage(self, obj):
        if obj.cached_results:
            return obj.cached_results.get('variance_percentage')
        return None
    
    def validate_comparison_type(self, value):
        from apps.dashboard.constants import ComparisonType
        allowed = [c[0] for c in ComparisonType.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid comparison type. Allowed: {allowed}")
        return value
    
    def validate_current_period(self, value):
        return self._validate_period(value, "current_period")
    
    def validate_previous_period(self, value):
        return self._validate_period(value, "previous_period")

    def _validate_period(self, period, field_name):
        if not isinstance(period, dict):
            raise serializers.ValidationError({field_name: "Period must be a dictionary"})
        if 'year' not in period:
            raise serializers.ValidationError({field_name: "Year is required"})
        year = period.get('year')
        if not isinstance(year, int) or year < 2000 or year > 2100:
            raise serializers.ValidationError({field_name: "Year must be between 2000 and 2100"})
        if 'month' in period:
            month = period['month']
            if not isinstance(month, int) or month < 1 or month > 12:
                raise serializers.ValidationError({field_name: "Month must be between 1 and 12"})
        if 'quarter' in period:
            quarter = period['quarter']
            if not isinstance(quarter, int) or quarter < 1 or quarter > 4:
                raise serializers.ValidationError({field_name: "Quarter must be between 1 and 4"})        
        return period
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        return super().create(validated_data)

class DashboardAccessLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = DashboardAccessLog
        fields = [
            'id', 'tenant_id', 'user_id', 'dashboard_type', 'action', 'action_display',
            'ip_address', 'user_agent', 'details', 'response_time_ms', 'created_at'
        ]
        read_only_fields = '__all__',
