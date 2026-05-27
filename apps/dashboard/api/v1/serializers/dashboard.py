from rest_framework import serializers
from apps.dashboard.models import TenantOverviewSnapshot

class TenantOverviewSnapshotSerializer(serializers.ModelSerializer):
    health_score = serializers.SerializerMethodField()
    overall_status = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantOverviewSnapshot
        fields = [
            'id', 'tenant_id', 'client_id', 'client_name', 'subscription_status',
            'subscription_plan', 'subscription_expires_at', 'total_users', 'active_users',
            'total_kpis', 'kpi_green_count', 'kpi_yellow_count', 'kpi_red_count',
            'avg_individual_score', 'avg_department_score', 'data_submission_rate',
            'review_completion_rate', 'last_active_at', 'total_logins_30d',
            'snapshot_date', 'is_stale', 'health_score', 'overall_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = '__all__',
    
    def get_health_score(self, obj):
        return obj.overall_health_score
    
    def get_overall_status(self, obj):
        if obj.overall_health_score >= 80:
            return 'healthy'
        elif obj.overall_health_score >= 50:
            return 'at_risk'
        return 'critical'


class ExecutiveDashboardDataSerializer(serializers.Serializer):
    """Serializer for Executive Dashboard aggregated data."""
    
    executive_info = serializers.DictField()
    organization_overview = serializers.DictField()
    department_performance = serializers.ListField(child=serializers.DictField())
    top_issues = serializers.ListField(child=serializers.DictField())
    kpi_trends = serializers.ListField(child=serializers.DictField())
    recent_alerts = serializers.ListField(child=serializers.DictField())
    last_updated = serializers.CharField()


class ClientAdminDashboardDataSerializer(serializers.Serializer):
    tenant_info = serializers.DictField()
    tenant_overview = serializers.DictField()
    compliance_status = serializers.DictField()
    pending_approvals = serializers.ListField(child=serializers.DictField())
    missing_data_alerts = serializers.ListField(child=serializers.DictField())
    kpi_performance = serializers.DictField()
    user_activity = serializers.DictField()
    last_updated = serializers.CharField()

class SuperAdminDashboardDataSerializer(serializers.Serializer):
    platform_overview = serializers.DictField()
    tenant_summaries = serializers.ListField(child=serializers.DictField())
    system_health = serializers.DictField()
    subscription_alerts = serializers.ListField(child=serializers.DictField())
    platform_metrics = serializers.DictField()
    last_updated = serializers.CharField()
