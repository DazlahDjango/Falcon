from rest_framework import serializers
from apps.configs.models import RiskAssessment

class RiskAssessmentSerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    class Meta:
        model = RiskAssessment
        fields = ['id', 'app', 'app_name', 'risk_level', 'risk_score', 'factors', 'recommended_maintenance_type', 'recommended_maintenance_window_minutes', 'requires_super_admin', 'action_taken', 'assessed_by', 'assessed_at', 'expires_at']
        read_only_fields = ['id', 'assessed_at']