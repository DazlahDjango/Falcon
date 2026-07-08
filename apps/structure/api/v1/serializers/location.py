from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.location import Location
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class LocationSerializer(BaseStructureSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    organizational_unit_code = serializers.CharField(source='organizational_unit.code', read_only=True, allow_null=True)
    organizational_unit_name = serializers.CharField(source='organizational_unit.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'tenant_id', 'code', 'name', 'type', 'type_display',
            'organizational_unit_id', 'organizational_unit_code',
            'organizational_unit_name', 'parent_id', 'parent_code',
            'city', 'country', 'is_headquarters', 'is_active',
            'timezone', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']

class LocationDetailSerializer(BaseStructureDetailSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    organizational_unit_code = serializers.CharField(source='organizational_unit.code', read_only=True, allow_null=True)
    organizational_unit_name = serializers.CharField(source='organizational_unit.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    full_address = serializers.CharField(read_only=True)
    sub_location_count = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'id', 'tenant_id', 'code', 'name', 'type', 'type_display',
            'organizational_unit_id', 'organizational_unit_code',
            'organizational_unit_name', 'parent_id', 'parent_code',
            'parent_name', 'address_line1', 'address_line2',
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
    organizational_unit_id = serializers.UUIDField(required=False, allow_null=True)
    parent_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Location
        fields = [
            'code', 'name', 'type', 'organizational_unit_id',
            'parent_id', 'address_line1', 'address_line2', 'city',
            'state_province', 'postal_code', 'country', 'timezone',
            'is_headquarters', 'is_active', 'seating_capacity',
            'current_occupancy', 'phone_number', 'email'
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