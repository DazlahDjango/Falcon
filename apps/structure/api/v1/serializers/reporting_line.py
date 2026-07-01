from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.reporting_line import ReportingLine
from .base import BaseStructureSerializer, BaseStructureDetailSerializer


class ReportingLineSerializer(BaseStructureSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    employee_name = serializers.SerializerMethodField()
    employee_position = serializers.CharField(source='employee.position.job_code', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(source='manager.user_id', read_only=True)
    manager_name = serializers.SerializerMethodField()
    manager_position = serializers.CharField(source='manager.position.job_code', read_only=True, allow_null=True)
    is_current = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ReportingLine
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_name',
            'employee_position', 'manager_id', 'manager_user_id', 'manager_name',
            'manager_position', 'effective_from', 'effective_to', 'is_active',
            'is_current', 'change_reason', 'approved_by_id', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

    def _get_user_names(self, user_ids):
        if not hasattr(self, '_user_names_cache'):
            from apps.accounts.models.user import User
            users = User.objects.filter(id__in=user_ids)
            self._user_names_cache = {u.id: u.get_full_name() for u in users}
        return self._user_names_cache

    def get_employee_name(self, obj):
        if not obj.employee:
            return None
        names = self._get_user_names([obj.employee.user_id])
        return names.get(obj.employee.user_id, str(obj.employee.user_id))

    def get_manager_name(self, obj):
        if not obj.manager:
            return None
        names = self._get_user_names([obj.manager.user_id])
        return names.get(obj.manager.user_id, str(obj.manager.user_id))


class ReportingLineDetailSerializer(BaseStructureDetailSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    employee_name = serializers.SerializerMethodField()
    employee_position = serializers.CharField(source='employee.position.title', read_only=True, allow_null=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(source='manager.user_id', read_only=True)
    manager_name = serializers.SerializerMethodField()
    manager_position = serializers.CharField(source='manager.position.title', read_only=True, allow_null=True)
    manager_department = serializers.CharField(source='manager.department.name', read_only=True, allow_null=True)
    is_current = serializers.BooleanField(read_only=True)
    employee_details = serializers.SerializerMethodField()
    manager_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportingLine
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_name',
            'employee_position', 'employee_department', 'manager_id', 'manager_user_id',
            'manager_name', 'manager_position', 'manager_department',
            'effective_from', 'effective_to', 'is_active', 'is_current',
            'is_deleted', 'change_reason', 'approved_by_id',
            'employee_details', 'manager_details',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']
    
    def _get_user_names(self, user_ids):
        if not hasattr(self, '_user_names_cache'):
            from apps.accounts.models.user import User
            users = User.objects.filter(id__in=user_ids)
            self._user_names_cache = {u.id: u.get_full_name() for u in users}
        return self._user_names_cache

    def get_employee_name(self, obj):
        if not obj.employee:
            return None
        names = self._get_user_names([obj.employee.user_id])
        return names.get(obj.employee.user_id, str(obj.employee.user_id))

    def get_manager_name(self, obj):
        if not obj.manager:
            return None
        names = self._get_user_names([obj.manager.user_id])
        return names.get(obj.manager.user_id, str(obj.manager.user_id))
    
    def get_employee_details(self, obj):
        from .employment import EmploymentListSerializer
        return EmploymentListSerializer(obj.employee).data if obj.employee else None
    
    def get_manager_details(self, obj):
        from .employment import EmploymentListSerializer
        return EmploymentListSerializer(obj.manager).data if obj.manager else None


class ReportingLineCreateUpdateSerializer(serializers.ModelSerializer):
    employee_id = serializers.UUIDField(required=True)
    manager_id = serializers.UUIDField(required=True)
    approved_by_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = ReportingLine
        fields = [
            'employee_id', 'manager_id', 'effective_from', 'effective_to',
            'change_reason', 'approved_by_id'
        ]
    
    def validate_employee_id(self, value):
        from apps.structure.models.employment import Employment
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        employment = Employment.objects.filter(
            id=value, tenant_id=tenant_id, is_current=True,
            is_deleted=False, is_active=True
        ).first()
        if not employment:
            raise serializers.ValidationError(_("Employee employment not found or not active."))
        return value
    
    def validate_manager_id(self, value):
        from apps.structure.models.employment import Employment
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        employment = Employment.objects.filter(
            id=value, tenant_id=tenant_id, is_current=True,
            is_deleted=False, is_active=True
        ).first()
        if not employment:
            raise serializers.ValidationError(_("Manager employment not found or not active."))
        return value
    
    def validate(self, data):
        from apps.structure.services.validation.org_validator import OrgValidatorService
        employee_id = data.get('employee_id')
        manager_id = data.get('manager_id')
        
        if employee_id and manager_id:
            from apps.structure.models.employment import Employment
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            
            employee = Employment.objects.filter(id=employee_id, tenant_id=tenant_id).first()
            manager = Employment.objects.filter(id=manager_id, tenant_id=tenant_id).first()
            
            if employee and manager:
                if employee.user_id == manager.user_id:
                    raise serializers.ValidationError({
                        "manager_id": _("Employee cannot report to themselves.")
                    })
                
                if employee.tenant_id != manager.tenant_id:
                    raise serializers.ValidationError({
                        "manager_id": _("Employee and manager must belong to same tenant.")
                    })
                
                errors = OrgValidatorService.validate_reporting_relationship(
                    employee.user_id, manager.user_id, tenant_id
                )
                if errors:
                    raise serializers.ValidationError({'non_field_errors': errors})
        
        effective_from = data.get('effective_from')
        effective_to = data.get('effective_to')
        if effective_from and effective_to and effective_from > effective_to:
            raise serializers.ValidationError({
                "effective_from": _("Effective from cannot be after effective to.")
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
            validated_data['is_active'] = True
        if not validated_data.get('effective_from'):
            validated_data['effective_from'] = timezone.now().date()
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)