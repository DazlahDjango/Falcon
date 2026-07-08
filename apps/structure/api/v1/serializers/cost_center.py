from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.cost_center import CostCenter
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class CostCenterSerializer(BaseStructureSerializer):
    organizational_unit_code = serializers.CharField(source='organizational_unit.code', read_only=True, allow_null=True)
    organizational_unit_name = serializers.CharField(source='organizational_unit.name', read_only=True, allow_null=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'organizational_unit_id', 'organizational_unit_code',
            'organizational_unit_name', 'category', 'category_display',
            'budget_amount', 'fiscal_year', 'allocation_percentage',
            'is_active', 'is_shared', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

class CostCenterDetailSerializer(BaseStructureDetailSerializer):
    organizational_unit_code = serializers.CharField(source='organizational_unit.code', read_only=True, allow_null=True)
    organizational_unit_name = serializers.CharField(source='organizational_unit.name', read_only=True, allow_null=True)
    organizational_unit_level = serializers.CharField(source='organizational_unit.level', read_only=True, allow_null=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'organizational_unit_id', 'organizational_unit_code',
            'organizational_unit_name', 'organizational_unit_level',
            'category', 'category_display', 'budget_amount',
            'remaining_budget', 'fiscal_year', 'allocation_percentage',
            'is_active', 'is_shared', 'requires_budget_approval',
            'authorized_approver_ids', 'is_deleted',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']

class CostCenterCreateUpdateSerializer(serializers.ModelSerializer):
    organizational_unit_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'code', 'name', 'description', 'organizational_unit_id',
            'category', 'budget_amount', 'fiscal_year',
            'allocation_percentage', 'is_active', 'is_shared',
            'requires_budget_approval', 'authorized_approver_ids'
        ]
    
    def validate_code(self, value):
        from apps.structure.validators import validate_cost_center_code
        validate_cost_center_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and CostCenter.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Cost center with this code already exists."))
        return value
    
    def validate_budget_amount(self, value):
        from apps.structure.validators import validate_budget_amount
        if value is not None:
            validate_budget_amount(value)
        return value
    
    def validate_allocation_percentage(self, value):
        from apps.structure.validators import validate_allocation_percentage
        validate_allocation_percentage(value)
        return value
    
    def validate_fiscal_year(self, value):
        current_year = timezone.now().year
        if value < current_year - 5 or value > current_year + 5:
            raise serializers.ValidationError(_("Fiscal year must be within 5 years of current year."))
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