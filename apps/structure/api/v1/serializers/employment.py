from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.employment import Employment
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class EmploymentSerializer(BaseStructureSerializer):
    position_code = serializers.CharField(source='position.job_code', read_only=True, allow_null=True)
    position_title = serializers.CharField(source='position.title', read_only=True, allow_null=True)
    division_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    division_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    department_code = serializers.CharField(source='department.code', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    section_code = serializers.CharField(source='section.code', read_only=True, allow_null=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    unit_code = serializers.CharField(source='unit.code', read_only=True, allow_null=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(read_only=True)
    effective_manager_user_id = serializers.UUIDField(read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employment
        fields = [
            'id', 'tenant_id', 'user_id', 'user_name', 'user_email',
            'user_first_name', 'user_last_name',
            'position_id', 'position_code', 'position_title',
            'division_id', 'division_code', 'division_name',
            'department_id', 'department_code', 'department_name',
            'section_id', 'section_code', 'section_name',
            'unit_id', 'unit_code', 'unit_name',
            'employment_type', 'effective_from', 'effective_to',
            'is_current', 'is_manager', 'is_executive', 'is_board_member',
            'is_active', 'manager_user_id', 'effective_manager_user_id',
            'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

    def _get_user(self, obj):
        if not hasattr(self, '_users_cache'):
            self._users_cache = {}
        if obj.user_id not in self._users_cache:
            from apps.accounts.models.user import User
            user = User.objects.filter(id=obj.user_id).first()
            self._users_cache[obj.user_id] = user
        return self._users_cache[obj.user_id]

    def get_user_name(self, obj):
        user = self._get_user(obj)
        return user.get_full_name() if user else str(obj.user_id)

    def get_user_email(self, obj):
        user = self._get_user(obj)
        return user.email if user else None

    def get_user_first_name(self, obj):
        user = self._get_user(obj)
        return user.first_name if user else ''

    def get_user_last_name(self, obj):
        user = self._get_user(obj)
        return user.last_name if user else ''


class EmploymentDetailSerializer(BaseStructureDetailSerializer):
    position_code = serializers.CharField(source='position.job_code', read_only=True, allow_null=True)
    position_title = serializers.CharField(source='position.title', read_only=True, allow_null=True)
    position_level = serializers.IntegerField(source='position.level', read_only=True, allow_null=True)
    division_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    division_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    department_code = serializers.CharField(source='department.code', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    section_code = serializers.CharField(source='section.code', read_only=True, allow_null=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    unit_code = serializers.CharField(source='unit.code', read_only=True, allow_null=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(read_only=True)
    interim_manager_user_id = serializers.UUIDField(read_only=True)
    effective_manager_user_id = serializers.UUIDField(read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employment
        fields = [
            'id', 'tenant_id', 'user_id', 'user_name', 'user_email',
            'user_first_name', 'user_last_name',
            'position_id', 'position_code', 'position_title', 'position_level',
            'division_id', 'division_code', 'division_name',
            'department_id', 'department_code', 'department_name',
            'section_id', 'section_code', 'section_name',
            'unit_id', 'unit_code', 'unit_name',
            'employment_type', 'effective_from', 'effective_to',
            'is_current', 'is_manager', 'is_executive', 'is_board_member',
            'is_active', 'change_reason', 'approved_by_id', 'is_deleted',
            'manager_user_id', 'interim_manager_user_id', 'effective_manager_user_id',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']

    def _get_user(self, obj):
        if not hasattr(self, '_users_cache'):
            self._users_cache = {}
        if obj.user_id not in self._users_cache:
            from apps.accounts.models.user import User
            user = User.objects.filter(id=obj.user_id).first()
            self._users_cache[obj.user_id] = user
        return self._users_cache[obj.user_id]

    def get_user_name(self, obj):
        user = self._get_user(obj)
        return user.get_full_name() if user else str(obj.user_id)

    def get_user_email(self, obj):
        user = self._get_user(obj)
        return user.email if user else None

    def get_user_first_name(self, obj):
        user = self._get_user(obj)
        return user.first_name if user else ''

    def get_user_last_name(self, obj):
        user = self._get_user(obj)
        return user.last_name if user else ''


class EmploymentCreateUpdateSerializer(serializers.ModelSerializer):
    position_id = serializers.UUIDField(required=True)
    division_id = serializers.UUIDField(required=False, allow_null=True)
    department_id = serializers.UUIDField(required=False, allow_null=True)
    section_id = serializers.UUIDField(required=False, allow_null=True)
    unit_id = serializers.UUIDField(required=False, allow_null=True)
    approved_by_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Employment
        fields = [
            'user_id', 'position_id', 'division_id', 'department_id',
            'section_id', 'unit_id', 'employment_type',
            'effective_from', 'effective_to', 'is_manager',
            'is_executive', 'is_board_member', 'change_reason',
            'approved_by_id'
        ]
    
    def validate_user_id(self, value):
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if Employment.objects.filter(user_id=value, tenant_id=tenant_id, is_current=True, is_deleted=False).exists():
            if not self.instance or self.instance.user_id != value:
                raise serializers.ValidationError(_("User already has an active employment."))
        return value
    
    def validate_position_id(self, value):
        from apps.structure.models.position import Position
        from apps.structure.services.validation.org_validator import OrgValidatorService
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        position = Position.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
        if not position:
            raise serializers.ValidationError(_("Position not found."))
        is_valid, error = OrgValidatorService.validate_position_occupancy(value, tenant_id)
        if not is_valid and (not self.instance or self.instance.position_id != value):
            raise serializers.ValidationError(error)
        return value
    
    def validate_division_id(self, value):
        if value:
            from apps.structure.models.division import Division
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            division = Division.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
            if not division:
                raise serializers.ValidationError(_("Division not found."))
        return value
    
    def validate_department_id(self, value):
        if value:
            from apps.structure.models.department import Department
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            department = Department.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
            if not department:
                raise serializers.ValidationError(_("Department not found."))
        return value
    
    def validate_section_id(self, value):
        if value:
            from apps.structure.models.section import Section
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            section = Section.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
            if not section:
                raise serializers.ValidationError(_("Section not found."))
        return value
    
    def validate_unit_id(self, value):
        if value:
            from apps.structure.models.unit import Unit
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            unit = Unit.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
            if not unit:
                raise serializers.ValidationError(_("Unit not found."))
        return value
    
    def validate_effective_from(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError(_("Effective from date cannot be in the future."))
        return value
    
    def validate_effective_to(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError(_("Effective to date cannot be in the past."))
        return value
    
    def validate(self, data):
        from apps.structure.validators import validate_employment_period
        effective_from = data.get('effective_from')
        effective_to = data.get('effective_to')
        if effective_from and effective_to:
            validate_employment_period(effective_from, effective_to)
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
            validated_data['is_current'] = True
            validated_data['is_active'] = True
        if not validated_data.get('effective_from'):
            validated_data['effective_from'] = timezone.now().date()
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)

class EmploymentBulkSerializer(serializers.Serializer):
    employments = EmploymentCreateUpdateSerializer(many=True)
    
    def validate_employments(self, value):
        if len(value) > 100:
            raise serializers.ValidationError(_("Maximum 100 employments per bulk operation."))
        return value