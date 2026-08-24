from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.structure.models.cost_center import CostCenter
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class CostCenterAllocationSerializer(serializers.ModelSerializer):
    allocated_to_type = serializers.CharField(source='content_type.model', read_only=True)
    allocated_to_name = serializers.CharField(source='allocated_to.name', read_only=True)
    allocated_to_code = serializers.CharField(source='allocated_to.code', read_only=True)

    class Meta:
        from apps.structure.models.cost_center_allocation import CostCenterAllocation
        model = CostCenterAllocation
        fields = [
            'id', 'content_type', 'object_id', 'allocated_to_type', 
            'allocated_to_name', 'allocated_to_code', 'allocation_percentage'
        ]

class CostCenterSerializer(BaseStructureSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    allocations = CostCenterAllocationSerializer(many=True, read_only=True)
    
    manager_name = serializers.CharField(source='manager.position.title', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'category', 'category_display', 'allocations',
            'budget_amount', 'currency', 'fiscal_year', 'allocation_percentage',
            'manager_id', 'manager_name', 'parent_id', 'parent_name',
            'valid_from', 'valid_to', 'custom_attributes',
            'is_active', 'is_shared', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

class CostCenterDetailSerializer(BaseStructureDetailSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    allocations = CostCenterAllocationSerializer(many=True, read_only=True)
    manager_name = serializers.CharField(source='manager.position.title', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'category', 'category_display', 'budget_amount', 'currency',
            'remaining_budget', 'fiscal_year', 'allocation_percentage',
            'manager_id', 'manager_name', 'parent_id', 'parent_name',
            'valid_from', 'valid_to', 'custom_attributes',
            'allocations',
            'is_active', 'is_shared', 'requires_budget_approval',
            'authorized_approver_ids', 'is_deleted',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']

class CostCenterCreateUpdateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(required=False, allow_blank=True, max_length=50)
    allocations = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'code', 'name', 'description', 'allocations',
            'category', 'budget_amount', 'currency', 'fiscal_year',
            'allocation_percentage', 'manager_id', 'parent_id',
            'valid_from', 'valid_to', 'custom_attributes',
            'is_active', 'is_shared',
            'requires_budget_approval', 'authorized_approver_ids'
        ]
    
    def validate_code(self, value):
        if not value:
            return value
        from apps.structure.validators import validate_cost_center_code
        validate_cost_center_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and CostCenter.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Cost center with this code already exists."))
        return value

    def validate(self, attrs):
        if not attrs.get('code'):
            name = attrs.get('name') or (self.instance.name if self.instance else '')
            if name:
                import re
                clean_name = re.sub(r'[^A-Z0-9]', '-', name.upper())
                clean_name = re.sub(r'-+', '-', clean_name).strip('-')
                attrs['code'] = f"CC-{clean_name}"[:20]
        return super().validate(attrs)
    
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
    
    def _handle_allocations(self, cost_center, allocations_data, tenant_id):
        from apps.structure.models.cost_center_allocation import CostCenterAllocation
        from django.contrib.contenttypes.models import ContentType
        
        # Clear existing allocations if updating
        cost_center.allocations.all().delete()
        
        if not allocations_data:
            return
            
        allocations_to_create = []
        for alloc in allocations_data:
            try:
                content_type = ContentType.objects.get(app_label='structure', model=alloc['model_name'].lower())
                allocations_to_create.append(CostCenterAllocation(
                    tenant_id=tenant_id,
                    cost_center=cost_center,
                    content_type=content_type,
                    object_id=alloc['object_id'],
                    allocation_percentage=alloc.get('allocation_percentage', 100)
                ))
            except ContentType.DoesNotExist:
                continue
        
        if allocations_to_create:
            CostCenterAllocation.objects.bulk_create(allocations_to_create)

    def create(self, validated_data):
        allocations_data = validated_data.pop('allocations', [])
        request = self.context.get('request')
        tenant_id = None
        if request:
            tenant_id = request.user.tenant_id
            validated_data['tenant_id'] = tenant_id
            validated_data['created_by'] = request.user.id
        
        cost_center = super().create(validated_data)
        if tenant_id:
            self._handle_allocations(cost_center, allocations_data, tenant_id)
        return cost_center
    
    def update(self, instance, validated_data):
        allocations_data = validated_data.pop('allocations', None)
        request = self.context.get('request')
        tenant_id = instance.tenant_id
        if request:
            validated_data['updated_by'] = request.user.id
            
        cost_center = super().update(instance, validated_data)
        if allocations_data is not None and tenant_id:
            self._handle_allocations(cost_center, allocations_data, tenant_id)
        return cost_center
