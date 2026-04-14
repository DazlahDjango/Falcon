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
        source='organization_target.target_value', max_digits=20, decimal_places=2, read_only=True
    )
    department_target_value = serializers.DecimalField(
        source='department_target.target_value', max_digits=20, decimal_places=2, read_only=True
    )
    individual_target_value = serializers.DecimalField(
        source='individual_target.target_value', max_digits=20, decimal_places=2, read_only=True
    )
    kpi_name = serializers.CharField(source='organization_target.kpi.name', read_only=True)
    class Meta:
        model = CascadeMap
        fields = [
            'id', 'organization_target', 'department_target', 'individual_target',
            'cascade_rule', 'rule_name', 'contribution_percentage',
            'organization_target_value', 'department_target_value',
            'individual_target_value', 'kpi_name',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
