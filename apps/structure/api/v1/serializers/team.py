from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ....models.team import Team
from .base import BaseStructureSerializer, BaseStructureDetailSerializer
from .department import DepartmentSerializer

class TeamSerializer(BaseStructureSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Team
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'department_id', 'department_code', 'department_name',
            'parent_team_id', 'team_lead', 'is_active',
            'max_members', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class TeamTreeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    description = serializers.CharField(required=False)
    department_id = serializers.UUIDField()
    parent_team_id = serializers.UUIDField(allow_null=True)
    team_lead = serializers.UUIDField(allow_null=True)
    max_members = serializers.IntegerField(allow_null=True)
    is_active = serializers.BooleanField()
    children = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    member_count = serializers.IntegerField(required=False, default=0)
    members = serializers.ListField(child=serializers.DictField(), required=False, default=list)


class TeamDetailSerializer(BaseStructureDetailSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    parent_team_code = serializers.CharField(source='parent_team.code', read_only=True, allow_null=True)
    parent_team_name = serializers.CharField(source='parent_team.name', read_only=True, allow_null=True)
    full_path = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    sub_team_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'department_id', 'department_code', 'department_name',
            'parent_team_id', 'parent_team_code', 'parent_team_name',
            'team_lead', 'max_members', 'is_active', 'is_deleted',
            'full_path', 'member_count', 'sub_team_count',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']
    
    def get_full_path(self, obj):
        from ....services.hierarchy.path_resolver import PathResolver
        return PathResolver.resolve_team_path(obj.id, obj.tenant_id)
    
    def get_member_count(self, obj):
        from ....models.employment import Employment
        return Employment.objects.filter(team_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_sub_team_count(self, obj):
        return obj.sub_teams.filter(is_deleted=False).count()

class TeamCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'code', 'name', 'description', 'department_id',
            'parent_team_id', 'team_lead', 'max_members', 'is_active'
        ]
    
    def validate_code(self, value):
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Team.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Team with this code already exists."))
        return value
    
    def validate_department_id(self, value):
        from ....models.department import Department
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        department = Department.objects.filter(id=value, tenant_id=tenant_id, is_deleted=False).first()
        if not department:
            raise serializers.ValidationError(_("Department not found."))
        return value
    
    def validate_parent_team_id(self, value):
        if value:
            from ....services.hierarchy.cycle_detector import CycleDetector
            from ....exceptions import HierarchyCycleError
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            if self.instance and self.instance.id == value:
                raise serializers.ValidationError(_("Team cannot be its own parent."))
            try:
                if self.instance:
                    CycleDetector.validate_assignment(value, self.instance.id, tenant_id, 'team')
            except HierarchyCycleError as e:
                raise serializers.ValidationError(str(e))
        
        return value
    
    def validate_max_members(self, value):
        from ....validators import validate_team_max_members
        if value is not None:
            validate_team_max_members(value)
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)