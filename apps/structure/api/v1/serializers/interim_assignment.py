from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.enums.reporting_type import ReportingType
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class InterimAssignmentSerializer(BaseStructureSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    interim_manager_user_id = serializers.UUIDField(source='interim_manager.user_id', read_only=True)
    employee_name = serializers.SerializerMethodField()
    employee_position = serializers.CharField(source='employee.position.title', read_only=True, allow_null=True)
    interim_manager_name = serializers.SerializerMethodField()
    interim_manager_position = serializers.CharField(source='interim_manager.position.title', read_only=True, allow_null=True)
    is_current = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    reporting_type_display = serializers.CharField(source='get_reporting_type_display', read_only=True)
    
    class Meta:
        model = InterimAssignment
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_name', 'employee_position',
            'interim_manager_id', 'interim_manager_user_id', 'interim_manager_name', 'interim_manager_position',
            'effective_from', 'effective_to', 'reporting_type',
            'reporting_type_display', 'reason', 'is_active',
            'is_current', 'days_remaining', 'approved_by_id',
            'approved_at', 'notes', 'is_deleted', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'approved_at', 'created_at', 'updated_at']

    def _get_user_name(self, emp):
        if not emp or not emp.user_id:
            return 'Unknown'
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(id=emp.user_id).first()
        return user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email if user else str(emp.user_id)

    def get_employee_name(self, obj):
        return self._get_user_name(obj.employee)

    def get_interim_manager_name(self, obj):
        return self._get_user_name(obj.interim_manager)

class InterimAssignmentDetailSerializer(BaseStructureDetailSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    interim_manager_user_id = serializers.UUIDField(source='interim_manager.user_id', read_only=True)
    employee_name = serializers.SerializerMethodField()
    employee_position = serializers.CharField(source='employee.position.title', read_only=True, allow_null=True)
    interim_manager_name = serializers.SerializerMethodField()
    interim_manager_position = serializers.CharField(source='interim_manager.position.title', read_only=True, allow_null=True)
    is_current = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    reporting_type_display = serializers.CharField(source='get_reporting_type_display', read_only=True)
    employee_details = serializers.SerializerMethodField()
    interim_manager_details = serializers.SerializerMethodField()
    
    class Meta:
        model = InterimAssignment
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_name', 'employee_position',
            'interim_manager_id', 'interim_manager_user_id', 'interim_manager_name', 'interim_manager_position',
            'effective_from', 'effective_to', 'reporting_type',
            'reporting_type_display', 'reason', 'is_active',
            'is_current', 'days_remaining', 'approved_by_id',
            'approved_at', 'notes', 'is_deleted',
            'employee_details', 'interim_manager_details',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'approved_at', 'created_at', 'updated_at', 'deleted_at']
    
    def _get_user_name(self, emp):
        if not emp or not emp.user_id:
            return 'Unknown'
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(id=emp.user_id).first()
        return user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email if user else str(emp.user_id)

    def get_employee_name(self, obj):
        return self._get_user_name(obj.employee)

    def get_interim_manager_name(self, obj):
        return self._get_user_name(obj.interim_manager)

    def get_employee_details(self, obj):
        from .employment import EmploymentSerializer
        return EmploymentSerializer(obj.employee).data if obj.employee else None
    
    def get_interim_manager_details(self, obj):
        from .employment import EmploymentSerializer
        return EmploymentSerializer(obj.interim_manager).data if obj.interim_manager else None