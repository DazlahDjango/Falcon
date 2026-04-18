from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from ....models import AnnualTarget, MonthlyPhasing, MonthlyActual, Evidence, ActualAdjustment
from .base import TenantAwareSerializer

class AnnualTargetSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    monthly_phasing_count = serializers.SerializerMethodField()
    class Meta:
        model = AnnualTarget
        fields = [
            'id', 'kpi', 'kpi_name', 'kpi_code', 'user', 'user_email',
            'user_full_name', 'year', 'target_value', 'approved_by',
            'approved_by_email', 'approved_at', 'notes', 'is_approved',
            'monthly_phasing_count', 'tenant_id', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    def get_monthly_phasing_count(self, obj):
        return obj.monthly_phasing.count()
    def validate_target_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target value must be positive")
        return value
    
class MonthlyPhasingSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='annual_target.kpi.name', read_only=True)
    user_email = serializers.EmailField(source='annual_target.user.email', read_only=True)
    year = serializers.IntegerField(source='annual_target.year', read_only=True)
    month_name = serializers.SerializerMethodField()
    is_locked_display = serializers.SerializerMethodField()
    class Meta:
        model = MonthlyPhasing
        fields = [
            'id', 'annual_target', 'kpi_name', 'user_email', 'year', 'month',
            'month_name', 'target_value', 'is_locked', 'is_locked_display',
            'locked_at', 'locked_by', 'tenant_id', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'locked_at', 'locked_by']
    def get_month_name(self, obj):
        from ....utils.date_utils import get_month_name
        return get_month_name(obj.month)
    def get_is_locked_display(self, obj):
        return "Locked" if obj.is_locked else "Unlocked"
    def validate_target_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Target value cannot be negative")
        return value
    
# Actual Data Serializers
# ========================
class MonthlyActualSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    period = serializers.SerializerMethodField()
    evidence_count = serializers.SerializerMethodField()
    validation_status = serializers.SerializerMethodField()
    class Meta:
        model = MonthlyActual
        fields = [
            'id', 'kpi', 'kpi_name', 'kpi_code', 'user', 'user_email',
            'user_full_name', 'year', 'month', 'period', 'actual_value',
            'status', 'status_display', 'submitted_at', 'submitted_by',
            'notes', 'evidence_count', 'validation_status',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'submitted_at']
    def get_period(self, obj):
        return f"{obj.year}-{obj.month:02d}"
    def get_evidence_count(self, obj):
        return obj.evidence.count()
    def get_validation_status(self, obj):
        last_validation = obj.validations.last()
        if last_validation:
            return {
                'status': last_validation.status,
                'validated_by': last_validation.validated_by.email if last_validation.validated_by else None,
                'validated_at': last_validation.validated_at
            }
        return None
    def validate_actual_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Actual value cannot be negative")
        return value

class EvidenceSerializer(TenantAwareSerializer):
    evidence_type_display = serializers.CharField(source='get_evidence_type_display', read_only=True)
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = Evidence
        fields = [
            'id', 'actual', 'evidence_type', 'evidence_type_display',
            'file', 'file_url', 'url', 'description', 'uploaded_by',
            'uploaded_by_email', 'uploaded_at',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'uploaded_at']
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

class ActualAdjustmentSerializer(TenantAwareSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)
    original_value = serializers.DecimalField(source='original_actual.actual_value', max_digits=20, decimal_places=2, read_only=True)
    kpi_name = serializers.CharField(source='original_actual.kpi.name', read_only=True)
    period = serializers.SerializerMethodField()
    class Meta:
        model = ActualAdjustment
        fields = [
            'id', 'original_actual', 'kpi_name', 'period', 'original_value',
            'adjusted_value', 'reason', 'requested_by', 'requested_by_email',
            'requested_at', 'approved_by', 'approved_by_email', 'approved_at',
            'status', 'status_display', 'notes',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'requested_at', 'approved_at']
    def get_period(self, obj):
        return f"{obj.original_actual.year}-{obj.original_actual.month:02d}"