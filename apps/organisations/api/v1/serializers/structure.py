"""
Structure serializers for organisations API
"""

from rest_framework import serializers
from apps.organisations.models import Department, Position, Team, Hierarchy


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    manager_name = serializers.CharField(source='manager.email', read_only=True)
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id',
            'name',
            'organisation',
            'parent',
            'parent_name',
            'manager',
            'manager_name',
            'code',
            'description',
            'is_active',
            'full_path',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_path(self, obj):
        if hasattr(obj, 'get_full_path'):
            return obj.get_full_path()
        return obj.name


class PositionSerializer(serializers.ModelSerializer):
    """Serializer for Position model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    reports_to_name = serializers.CharField(source='reports_to.title', read_only=True)
    
    class Meta:
        model = Position
        fields = [
            'id',
            'title',
            'code',
            'department',
            'department_name',
            'level',
            'job_description',
            'is_management',
            'reports_to',
            'reports_to_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    team_lead_name = serializers.CharField(source='team_lead.email', read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'department',
            'department_name',
            'description',
            'team_lead',
            'team_lead_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HierarchySerializer(serializers.ModelSerializer):
    """Serializer for Hierarchy model"""
    employee_name = serializers.CharField(source='employee.email', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.email', read_only=True)
    
    class Meta:
        model = Hierarchy
        fields = [
            'id',
            'organisation',
            'employee',
            'employee_name',
            'supervisor',
            'supervisor_name',
            'level',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']