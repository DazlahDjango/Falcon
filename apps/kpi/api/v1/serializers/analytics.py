from rest_framework import serializers

class KPISummarySerializer(serializers.ModelSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    period = serializers.SerializerMethodField()
    health_status = serializers.SerializerMethodField()
    class Meta:
        model = None  # This is a materialized view, not a Django model
        fields = [
            'kpi', 'kpi_name', 'kpi_code', 'year', 'month', 'period',
            'average_score', 'green_count', 'yellow_count', 'red_count',
            'total_users', 'health_status', 'last_calculated'
        ]
    def get_period(self, obj):
        return f"{obj.year}-{obj.month:02d}"
    def get_health_status(self, obj):
        if obj.average_score >= 90:
            return 'EXCELLENT'
        elif obj.average_score >= 75:
            return 'GOOD'
        elif obj.average_score >= 50:
            return 'FAIR'
        return 'POOR'

class DepartmentRollupSerializer(serializers.ModelSerializer):
    period = serializers.SerializerMethodField()
    class Meta:
        model = None
        fields = [
            'department_id', 'department_name', 'year', 'month', 'period',
            'overall_score', 'employee_count', 'green_percentage',
            'yellow_percentage', 'red_percentage', 'last_calculated'
        ]
    def get_period(self, obj):
        return f"{obj.year}-{obj.month:02d}"

class OrganizationHealthSerializer(serializers.ModelSerializer):
    period = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    class Meta:
        model = None
        fields = [
            'tenant_id', 'year', 'month', 'period', 'overall_health_score',
            'kpi_completion_rate', 'validation_compliance_rate',
            'red_kpi_count', 'total_kpi_count', 'active_employees',
            'risk_level', 'last_calculated'
        ]
    def get_period(self, obj):
        return f"{obj.year}-{obj.month:02d}"
    def get_risk_level(self, obj):
        if obj.overall_health_score >= 85:
            return 'LOW'
        elif obj.overall_health_score >= 60:
            return 'MEDIUM'
        return 'HIGH'

class CustomReportSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=[
        'kpi_performance', 'department_comparison', 'trend_analysis'
    ])
    format = serializers.ChoiceField(choices=['pdf', 'excel', 'csv'], default='pdf')
    filters = serializers.DictField(required=False, default=dict)
    def validate_filters(self, value):
        if value.get('kpi_ids') and not isinstance(value['kpi_ids'], list):
            raise serializers.ValidationError("kpi_ids must be a list")
        if value.get('year'):
            try:
                value['year'] = int(value['year'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("year must be an integer")
        if value.get('month'):
            try:
                month = int(value['month'])
                if month < 1 or month > 12:
                    raise serializers.ValidationError("month must be between 1 and 12")
                value['month'] = month
            except (ValueError, TypeError):
                raise serializers.ValidationError("month must be an integer")
        return value