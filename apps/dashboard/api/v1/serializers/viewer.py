from rest_framework import serializers
from apps.dashboard.models import ExecutiveViewPreset
from apps.dashboard.constants import TrafficLight

class ExecutiveViewPresetSerializer(serializers.ModelSerializer):
    view_type_display = serializers.CharField(source='get_view_type_display', read_only=True)
    class Meta:
        model = ExecutiveViewPreset
        fields = [
            'id', 'tenant_id', 'user_id', 'name', 'view_type', 'view_type_display',
            'filters', 'sort_by', 'sort_order', 'show_traffic_lights', 'show_trend_indicators',
            'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def validate_view_type(self, value):
        allowed = ['department', 'strategic_objective', 'region', 'cost_center']
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid view type. Allowed: {allowed}")
        return value
    
    def validate_sort_order(self, value):
        if value not in ['asc', 'desc']:
            raise serializers.ValidationError("Sort order must be 'asc' or 'desc'")
        return value
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        
        if validated_data.get('is_default', False):
            ExecutiveViewPreset.objects.filter(
                tenant_id=validated_data['tenant_id'],
                user_id=validated_data['user_id'],
                is_default=True
            ).update(is_default=False)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if validated_data.get('is_default', False):
            ExecutiveViewPreset.objects.filter(
                tenant_id=instance.tenant_id,
                user_id=instance.user_id,
                is_default=True
            ).exclude(id=instance.id).update(is_default=False)
        
        return super().update(instance, validated_data)

class TeamMemberSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.CharField()
    title = serializers.CharField(required=False, allow_blank=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)
    aggregated_score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    department = serializers.CharField(required=False, allow_blank=True)
    is_manager = serializers.BooleanField()
    direct_report_count = serializers.IntegerField()

class TeamAggregateSerializer(serializers.Serializer):
    total_members = serializers.IntegerField()
    green_count = serializers.IntegerField()
    yellow_count = serializers.IntegerField()
    red_count = serializers.IntegerField()
    average_score = serializers.FloatField()
    submission_rate = serializers.FloatField(default=0)

class OrgTreeNodeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.CharField()
    title = serializers.CharField(required=False, allow_blank=True)
    aggregated_score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    department = serializers.CharField(required=False, allow_blank=True)
    is_manager = serializers.BooleanField()
    direct_report_count = serializers.IntegerField()
    children = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    truncated = serializers.BooleanField(required=False, default=False)

class ReportingChainSerializer(serializers.Serializer):
    chain = serializers.ListField(child=TeamMemberSerializer())

class PeriodComparisonResultSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    comparison_type = serializers.CharField()
    current_period_display = serializers.CharField()
    previous_period_display = serializers.CharField()
    current_score = serializers.FloatField(required=False, allow_null=True)
    previous_score = serializers.FloatField(required=False, allow_null=True)
    variance = serializers.FloatField()
    variance_percentage = serializers.FloatField()

