from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.dashboard.models import ExportSchedule, DashboardAlert, FavoriteKPI
from apps.dashboard.constants import ExportFormat, AlertType, ScheduleType
from apps.dashboard.validators import validate_alert_config

class FavoriteKPISerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteKPI
        fields = [
            'id', 'tenant_id', 'user_id', 'kpi_id', 'kpi_name',
            'order', 'dashboard', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        if 'order' not in validated_data:
            max_order = FavoriteKPI.objects.filter(
                user_id=validated_data['user_id'],
                tenant_id=validated_data['tenant_id']
            ).aggregate(serializers.models.Max('order'))['order__max']
            validated_data['order'] = (max_order or -1) + 1
        return super().create(validated_data)


class DashboardAlertSerializer(serializers.ModelSerializer):
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    config = serializers.JSONField(validators=[validate_alert_config])
    
    class Meta:
        model = DashboardAlert
        fields = [
            'id', 'tenant_id', 'user_id', 'alert_type', 'alert_type_display',
            'severity', 'severity_display', 'config', 'frequency', 'frequency_display',
            'send_email', 'send_in_app', 'send_sms', 'is_active',
            'last_triggered_at', 'trigger_count', 'suppress_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'last_triggered_at', 'trigger_count']
    
    def validate_alert_type(self, value):
        allowed = [t[0] for t in AlertType.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid alert type. Allowed: {allowed}")
        return value
    
    def validate_frequency(self, value):
        allowed = [f[0] for f in AlertType.FREQUENCY_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid frequency. Allowed: {allowed}")
        return value
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'suppress_until' in validated_data:
            validated_data['trigger_count'] = 0
        return super().update(instance, validated_data)


class ExportScheduleSerializer(serializers.ModelSerializer):
    format_display = serializers.CharField(source='get_format_display', read_only=True)
    schedule_type_display = serializers.CharField(source='get_schedule_type_display', read_only=True)
    next_run_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = ExportSchedule
        fields = [
            'id', 'tenant_id', 'user_id', 'dashboard_type', 'format', 'format_display',
            'schedule_type', 'schedule_type_display', 'schedule_config', 'filters',
            'recipients', 'is_active', 'last_run_at', 'last_run_status', 'next_run_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'last_run_at', 'last_run_status', 'next_run_at']
    
    def validate_dashboard_type(self, value):
        allowed = ['executive', 'client_admin', 'super_admin', 'manager', 'staff']
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid dashboard type. Allowed: {allowed}")
        return value
    
    def validate_format(self, value):
        allowed = [f[0] for f in ExportFormat.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid export format. Allowed: {allowed}")
        return value
    
    def validate_schedule_type(self, value):
        allowed = [s[0] for s in ScheduleType.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid schedule type. Allowed: {allowed}")
        return value
    
    def validate_recipients(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Recipients must be a list of email addresses")
        
        from django.core.validators import EmailValidator
        email_validator = EmailValidator()
        
        for email in value:
            try:
                email_validator(email)
            except ValidationError:
                raise serializers.ValidationError(f"Invalid email address: {email}")
        
        return value
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        
        from dateutil.relativedelta import relativedelta
        schedule_type = validated_data.get('schedule_type', 'daily')
        
        if schedule_type == 'daily':
            validated_data['next_run_at'] = timezone.now() + timezone.timedelta(days=1)
        elif schedule_type == 'weekly':
            validated_data['next_run_at'] = timezone.now() + timezone.timedelta(weeks=1)
        elif schedule_type == 'monthly':
            validated_data['next_run_at'] = timezone.now() + relativedelta(months=1)
        elif schedule_type == 'quarterly':
            validated_data['next_run_at'] = timezone.now() + relativedelta(months=3)
        
        return super().create(validated_data)
