from rest_framework import serializers
from ....models import Score, TrafficLight, AggregatedScore
from .base import TenantAwareSerializer

class ScoreSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    period = serializers.SerializerMethodField()
    traffic_light_status = serializers.SerializerMethodField()
    achievement_percentage = serializers.SerializerMethodField()
    class Meta:
        model = Score
        fields = [
            'id', 'kpi', 'kpi_name', 'kpi_code', 'user', 'user_email',
            'user_full_name', 'year', 'month', 'period', 'score',
            'actual_value', 'target_value', 'formula_used', 'achievement_percentage',
            'traffic_light_status', 'calculated_at', 'calculated_by',
            'tenant_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'calculated_at']
    def get_period(self, obj):
        return f"{obj.year}-{obj.month:02d}"
    def get_traffic_light_status(self, obj):
        if hasattr(obj, 'traffic_light'):
            return {
                'status': obj.traffic_light.status,
                'display': obj.traffic_light.get_status_display(),
                'emoji': obj.traffic_light.emoji
            }
        return None
    def get_achievement_percentage(self, obj):
        if obj.target_value and obj.target_value > 0:
            percentage = (obj.actual_value / obj.target_value) * 100
            return round(percentage, 2)
        return None

class TrafficLightSerializer(TenantAwareSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    emoji = serializers.CharField(read_only=True)
    kpi_name = serializers.CharField(source='score.kpi.name', read_only=True)
    user_email = serializers.EmailField(source='score.user.email', read_only=True)
    period = serializers.SerializerMethodField()
    class Meta:
        model = TrafficLight
        fields = [
            'id', 'score', 'kpi_name', 'user_email', 'period', 'status',
            'status_display', 'emoji', 'score_value', 'green_threshold',
            'yellow_threshold', 'consecutive_red_count', 'calculated_at',
            'tenant_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'calculated_at']
    def get_period(self, obj):
        return f"{obj.score.year}-{obj.score.month:02d}"

class AggregatedScoreSerializer(TenantAwareSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    score_formatted = serializers.SerializerMethodField()
    health_status = serializers.SerializerMethodField()
    class Meta:
        model = AggregatedScore
        fields = [
            'id', 'level', 'level_display', 'entity_id', 'entity_name',
            'year', 'month', 'aggregated_score', 'score_formatted',
            'member_count', 'kpi_count', 'calculation_method', 'health_status',
            'calculated_at', 'tenant_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'calculated_at']
    def get_score_formatted(self, obj):
        return f"{obj.aggregated_score:.1f}%"
    def get_health_status(self, obj):
        if obj.aggregated_score >= 90:
            return {'status': 'EXCELLENT', 'color': '#22c55e', 'message': 'Excellent performance'}
        elif obj.aggregated_score >= 75:
            return {'status': 'GOOD', 'color': '#3b82f6', 'message': 'Good performance, maintain momentum'}
        elif obj.aggregated_score >= 50:
            return {'status': 'FAIR', 'color': '#eab308', 'message': 'Fair performance, needs improvement'}
        else:
            return {'status': 'POOR', 'color': '#ef4444', 'message': 'Poor performance, immediate action required'}