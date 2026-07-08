from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.enums.reporting_type import ReportingType
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class InterimAssignmentSerializer(BaseStructureSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    interim_manager_user_id = serializers.UUIDField(source='interim_manager.user_id', read_only=True)
    is_current = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    reporting_type_display = serializers.CharField(source='get_reporting_type_display', read_only=True)
    
    class Meta:
        model = InterimAssignment
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id',
            'interim_manager_id', 'interim_manager_user_id',
            'effective_from', 'effective_to', 'reporting_type',
            'reporting_type_display', 'reason', 'is_active',
            'is_current', 'days_remaining', 'approved_by_id',
            'approved_at', 'notes', 'is_deleted', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'approved_at', 'created_at', 'updated_at']

class InterimAssignmentDetailSerializer(BaseStructureDetailSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    interim_manager_user_id = serializers.UUIDField(source='interim_manager.user_id', read_only=True)
    is_current = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    reporting_type_display = serializers.CharField(source='get_reporting_type_display', read_only=True)
    employee_details = serializers.SerializerMethodField()
    interim_manager_details = serializers.SerializerMethodField()
    
    class Meta:
        model = InterimAssignment
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id',
            'interim_manager_id', 'interim_manager_user_id',
            'effective_from', 'effective_to', 'reporting_type',
            'reporting_type_display', 'reason', 'is_active',
            'is_current', 'days_remaining', 'approved_by_id',
            'approved_at', 'notes', 'is_deleted',
            'employee_details', 'interim_manager_details',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'approved_at', 'created_at', 'updated_at', 'deleted_at']
    
    def get_employee_details(self, obj):
        from .employment import EmploymentListSerializer
        return EmploymentListSerializer(obj.employee).data if obj.employee else None
    
    def get_interim_manager_details(self, obj):
        from .employment import EmploymentListSerializer
        return EmploymentListSerializer(obj.interim_manager).data if obj.interim_manager else None