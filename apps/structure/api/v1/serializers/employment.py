from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from ....models.employment import Employment
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class EmploymentSerializer(BaseStructureSerializer):
    position_code = serializers.CharField(source='position.job_code', read_only=True, allow_null=True)
    position_title = serializers.CharField(source='position.title', read_only=True, allow_null=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    team_code = serializers.CharField(source='team.code', read_only=True, allow_null=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    class Meta:
        model = Employment
        fields = [
            'id', 'tenant_id', 'user_id', 'user_name', 'user_email', 
            'user_first_name', 'user_last_name',
            'position_id', 'position_code',
            'position_title', 'department_id', 'department_code', 'department_name',
            'team_id', 'team_code', 'team_name', 'employment_type',
            'effective_from', 'effective_to', 'is_current', 'is_manager',
            'is_executive', 'is_board_member', 'is_active', 'created_at'
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
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    team_code = serializers.CharField(source='team.code', read_only=True, allow_null=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    manager_user_id = serializers.SerializerMethodField()
    manager_position = serializers.SerializerMethodField()
    dotted_line_manager_user_id = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employment
        fields = [
            'id', 'tenant_id', 'user_id', 'user_name', 'user_email', 
            'user_first_name', 'user_last_name',
            'position_id', 'position_code',
            'position_title', 'position_level', 'department_id', 'department_code',
            'department_name', 'team_id', 'team_code', 'team_name',
            'employment_type', 'effective_from', 'effective_to', 'is_current',
            'is_manager', 'is_executive', 'is_board_member', 'is_active',
            'change_reason', 'approved_by_id', 'is_deleted',
            'manager_user_id', 'manager_position', 'dotted_line_manager_user_id',
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

    def get_manager_user_id(self, obj):
        return obj.manager_user_id
    
    def get_manager_position(self, obj):
        if obj.position and obj.position.reports_to:
            return obj.position.reports_to.job_code
        return None
    
    def get_dotted_line_manager_user_id(self, obj):
        if obj.dotted_line_manager:
            return obj.dotted_line_manager.user_id
        return None

class EmploymentCreateUpdateSerializer(serializers.ModelSerializer):
    position_id = serializers.UUIDField(required=True)
    department_id = serializers.UUIDField(required=True)
    team_id = serializers.UUIDField(required=False, allow_null=True)
    dotted_line_manager_id = serializers.UUIDField(required=False, allow_null=True)
    approved_by_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Employment
        fields = [
            'user_id', 'position_id', 'department_id', 'team_id',
            'employment_type', 'effective_from', 'effective_to',
            'is_manager', 'is_executive', 'is_board_member',
            'dotted_line_manager_id', 'change_reason', 'approved_by_id'
        ]
    
    def validate_user_id(self, value):
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if Employment.objects.filter(user_id=value, tenant_id=tenant_id, is_current=True, is_deleted=False).exists():
            if not self.instance or self.instance.user_id != value:
                raise serializers.ValidationError(_("User already has an active employment."))
        return value
    
    def validate_position_id(self, value):
        from ....models.position import Position
        from ....services.validation.org_validator import OrgValidatorService
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        position = Position.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
        if not position:
            raise serializers.ValidationError(_("Position not found."))
        is_valid, error = OrgValidatorService.validate_position_occupancy(value, tenant_id)
        if not is_valid and (not self.instance or self.instance.position_id != value):
            raise serializers.ValidationError(error)
        return value
    
    def validate_department_id(self, value):
        from ....models.department import Department
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        department = Department.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
        if not department:
            raise serializers.ValidationError(_("Department not found."))
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
        from ....validators import validate_employment_period
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