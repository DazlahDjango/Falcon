from rest_framework import serializers

class KPISummarySerializer(serializers.Serializer):
    kpi = serializers.UUIDField()
    kpi_name = serializers.CharField()
    kpi_code = serializers.CharField()
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    period = serializers.SerializerMethodField()
    average_score = serializers.DecimalField(max_digits=10, decimal_places=2)
    green_count = serializers.IntegerField()
    yellow_count = serializers.IntegerField()
    red_count = serializers.IntegerField()
    total_users = serializers.IntegerField()
    health_status = serializers.SerializerMethodField()
    last_calculated = serializers.DateTimeField()

    def get_period(self, obj):
        return f"{obj.get('year')}-{obj.get('month'):02d}"

    def get_health_status(self, obj):
        avg_score = obj.get('average_score', 0)
        if avg_score >= 90:
            return 'EXCELLENT'
        elif avg_score >= 75:
            return 'GOOD'
        elif avg_score >= 50:
            return 'FAIR'
        return 'POOR'


class DepartmentRollupSerializer(serializers.Serializer):
    department_id = serializers.UUIDField()
    department_name = serializers.CharField()
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    period = serializers.SerializerMethodField()
    overall_score = serializers.DecimalField(max_digits=10, decimal_places=2)
    employee_count = serializers.IntegerField()
    green_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    yellow_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    red_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    last_calculated = serializers.DateTimeField()

    def get_period(self, obj):
        return f"{obj.get('year')}-{obj.get('month'):02d}"


class OrganizationHealthSerializer(serializers.Serializer):
    tenant_id = serializers.UUIDField()
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    period = serializers.SerializerMethodField()
    overall_health_score = serializers.DecimalField(max_digits=10, decimal_places=2)
    kpi_completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    validation_compliance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    red_kpi_count = serializers.IntegerField()
    total_kpi_count = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    risk_level = serializers.SerializerMethodField()
    last_calculated = serializers.DateTimeField()
    source = serializers.CharField(default='live')

    def get_period(self, obj):
        return f"{obj.get('year')}-{obj.get('month'):02d}"

    def get_risk_level(self, obj):
        health_score = obj.get('overall_health_score', 0)
        if health_score >= 85:
            return 'LOW'
        elif health_score >= 60:
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