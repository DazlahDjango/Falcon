from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.location import Location
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class LocationAllocationSerializer(serializers.ModelSerializer):
    allocated_to_type = serializers.CharField(source='content_type.model', read_only=True)
    allocated_to_name = serializers.CharField(source='allocated_to.name', read_only=True)
    allocated_to_code = serializers.CharField(source='allocated_to.code', read_only=True)

    class Meta:
        from apps.structure.models.location_allocation import LocationAllocation
        model = LocationAllocation
        fields = [
            'id', 'content_type', 'object_id', 'allocated_to_type', 
            'allocated_to_name', 'allocated_to_code', 'allocation_percentage'
        ]

class LocationSerializer(BaseStructureSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    cost_center_name = serializers.CharField(source='cost_center.name', read_only=True, allow_null=True)
    manager_name = serializers.CharField(source='manager.employee_name', read_only=True, allow_null=True)
    allocations = LocationAllocationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'tenant_id', 'code', 'name', 'type', 'type_display',
            'cost_center_id', 'cost_center_name', 'manager_id', 'manager_name',
            'parent_id', 'parent_code', 'allocations',
            'city', 'country', 'is_headquarters', 'is_active',
            'timezone', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

class LocationDetailSerializer(BaseStructureDetailSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    cost_center_name = serializers.CharField(source='cost_center.name', read_only=True, allow_null=True)
    manager_name = serializers.CharField(source='manager.employee_name', read_only=True, allow_null=True)
    full_address = serializers.CharField(read_only=True)
    sub_location_count = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()
    allocations = LocationAllocationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'tenant_id', 'code', 'name', 'type', 'type_display',
            'cost_center_id', 'cost_center_name', 'manager_id', 'manager_name',
            'parent_id', 'parent_code', 'parent_name', 'allocations',
            'address_line1', 'address_line2',
            'city', 'state_province', 'postal_code', 'country',
            'timezone', 'is_headquarters', 'is_active', 'is_deleted',
            'seating_capacity', 'current_occupancy', 'phone_number',
            'email', 'full_address', 'sub_location_count',
            'occupancy_rate',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']
    
    def get_sub_location_count(self, obj):
        return obj.sub_locations.filter(is_deleted=False, is_active=True).count()
    
    def get_occupancy_rate(self, obj):
        if obj.seating_capacity and obj.seating_capacity > 0:
            return round((obj.current_occupancy / obj.seating_capacity) * 100, 2)
        return None

class LocationCreateUpdateSerializer(serializers.ModelSerializer):
    cost_center_id = serializers.UUIDField(required=False, allow_null=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)
    parent_id = serializers.UUIDField(required=False, allow_null=True)
    allocations = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    
    class Meta:
        model = Location
        fields = [
            'code', 'name', 'type', 'cost_center_id', 'manager_id',
            'parent_id', 'address_line1', 'address_line2', 'city',
            'state_province', 'postal_code', 'country', 'timezone',
            'is_headquarters', 'is_active', 'seating_capacity',
            'current_occupancy', 'phone_number', 'email', 'allocations'
        ]
    
    def validate_code(self, value):
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Location.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Location with this code already exists."))
        return value
    
    def validate_phone_number(self, value):
        from apps.structure.validators import validate_phone_number
        if value:
            validate_phone_number(value)
        return value
    
    def validate_postal_code(self, value):
        from apps.structure.validators import validate_postal_code
        if value:
            validate_postal_code(value)
        return value
    
    def validate_seating_capacity(self, value):
        from apps.structure.validators import validate_seating_capacity
        if value is not None:
            validate_seating_capacity(value)
        return value
        
    def _handle_allocations(self, location, allocations_data, tenant_id):
        from apps.structure.models.location_allocation import LocationAllocation
        from django.contrib.contenttypes.models import ContentType
        
        LocationAllocation.objects.filter(location=location).delete()
        
        if not allocations_data:
            return
            
        allocations_to_create = []
        for alloc in allocations_data:
            try:
                content_type = ContentType.objects.get(app_label='structure', model=alloc['model_name'].lower())
                allocations_to_create.append(LocationAllocation(
                    tenant_id=tenant_id,
                    location=location,
                    content_type=content_type,
                    object_id=alloc['object_id'],
                    allocation_percentage=alloc.get('allocation_percentage', 100)
                ))
            except ContentType.DoesNotExist:
                continue
        
        if allocations_to_create:
            LocationAllocation.objects.bulk_create(allocations_to_create)
    
    def create(self, validated_data):
        allocations_data = validated_data.pop('allocations', [])
        request = self.context.get('request')
        tenant_id = None
        if request:
            tenant_id = request.user.tenant_id
            validated_data['tenant_id'] = tenant_id
            validated_data['created_by'] = request.user.id
            
        location = super().create(validated_data)
        if tenant_id:
            self._handle_allocations(location, allocations_data, tenant_id)
        return location
    
    def update(self, instance, validated_data):
        allocations_data = validated_data.pop('allocations', [])
        request = self.context.get('request')
        tenant_id = instance.tenant_id
        if request:
            validated_data['updated_by'] = request.user.id
            
        location = super().update(instance, validated_data)
        if tenant_id:
            self._handle_allocations(location, allocations_data, tenant_id)
        return location