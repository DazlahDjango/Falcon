from rest_framework import serializers
from ....models import CascadeRule, CascadeMap
from .base import TenantAwareSerializer

class CascadeRuleSerializer(TenantAwareSerializer):
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    class Meta:
        model = CascadeRule
        fields = [
            'id', 'name', 'rule_type', 'rule_type_display', 'description',
            'configuration', 'is_default', 'is_active',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']


class CascadeMapSerializer(TenantAwareSerializer):
    rule_name = serializers.CharField(source='cascade_rule.name', read_only=True)
    organization_target_value = serializers.DecimalField(
        source='organization_target.target_value', max_digits=20, decimal_places=2, read_only=True, default=None
    )
    department_target_value = serializers.DecimalField(
        source='department_target.target_value', max_digits=20, decimal_places=2, read_only=True, default=None
    )
    individual_target_value = serializers.DecimalField(
        source='individual_target.target_value', max_digits=20, decimal_places=2, read_only=True, default=None
    )
    kpi_name = serializers.SerializerMethodField()
    target_owner_name = serializers.SerializerMethodField()
    target_amount = serializers.SerializerMethodField()
    level_display = serializers.SerializerMethodField()

    class Meta:
        model = CascadeMap
        fields = [
            'id', 'organization_target', 'division_target', 'department_target',
            'section_target', 'unit_target', 'individual_target',
            'parent_target', 'child_target',
            'cascade_rule', 'rule_name', 'contribution_percentage',
            'organization_target_value', 'department_target_value',
            'individual_target_value', 'kpi_name', 'target_owner_name',
            'target_amount', 'level_display',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def get_kpi_name(self, obj):
        target = obj.parent_target or obj.organization_target or obj.child_target
        return target.kpi.name if target and hasattr(target, 'kpi') and target.kpi else ''

    def get_target_owner_name(self, obj):
        target = obj.child_target or obj.individual_target or obj.department_target or obj.unit_target or obj.section_target or obj.division_target
        if target and target.user:
            return target.user.get_full_name() or target.user.email
        return "Unassigned"

    def get_target_amount(self, obj):
        target = obj.child_target or obj.individual_target or obj.department_target or obj.unit_target or obj.section_target or obj.division_target
        return target.target_value if target else None

    def get_level_display(self, obj):
        if obj.individual_target:
            return "Individual"
        if obj.unit_target:
            return "Unit"
        if obj.section_target:
            return "Section"
        if obj.department_target:
            return "Department"
        if obj.division_target:
            return "Division"
        if obj.organization_target:
            return "Organization"
        return "Cascade Level"