from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from ....models import ValidationRecord, RejectionReason, Escalation
from ....constants import KPIStatus, CalculationLogic, MeasureType
from ....validators import validate_kpi_code, validate_kpi_name, validate_weight_sum
from .base import TenantAwareSerializer, AuditTrailSerializer
from .framework import KPIFrameworkSerializer, KPICategorySerializer, SectorSerializer



class RejectionReasonSerializer(TenantAwareSerializer):
    """Serializer for Rejection Reason model"""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = RejectionReason
        fields = [
            'id', 'category', 'category_display', 'reason', 'description',
            'is_active', 'display_order',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']


class ValidationRecordSerializer(TenantAwareSerializer):
    """Serializer for Validation Record model"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    validated_by_email = serializers.EmailField(source='validated_by.email', read_only=True)
    actual_kpi = serializers.CharField(source='actual.kpi.name', read_only=True)
    actual_user = serializers.CharField(source='actual.user.email', read_only=True)
    actual_value = serializers.DecimalField(source='actual.actual_value', max_digits=20, decimal_places=2, read_only=True)
    rejection_reason_text = serializers.CharField(source='rejection_reason.reason', read_only=True)
    
    class Meta:
        model = ValidationRecord
        fields = [
            'id', 'actual', 'actual_kpi', 'actual_user', 'actual_value',
            'status', 'status_display', 'validated_by', 'validated_by_email',
            'validated_at', 'rejection_reason', 'rejection_reason_text', 'comment',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'validated_at']


class EscalationSerializer(TenantAwareSerializer):
    """Serializer for Escalation model"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    escalated_by_email = serializers.EmailField(source='escalated_by.email', read_only=True)
    escalated_to_email = serializers.EmailField(source='escalated_to.email', read_only=True)
    resolved_by_email = serializers.EmailField(source='resolved_by.email', read_only=True)
    actual_kpi = serializers.CharField(source='actual.kpi.name', read_only=True)
    period = serializers.SerializerMethodField()
    
    class Meta:
        model = Escalation
        fields = [
            'id', 'actual', 'actual_kpi', 'period', 'escalated_by',
            'escalated_by_email', 'escalated_to', 'escalated_to_email',
            'escalated_at', 'reason', 'status', 'status_display',
            'resolution', 'resolved_by', 'resolved_by_email', 'resolved_at',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'escalated_at', 'resolved_at']
    
    def get_period(self, obj):
        return f"{obj.actual.year}-{obj.actual.month:02d}"