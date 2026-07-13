# apps/tenant/api/v1/serializers/sector_serializers.py
from rest_framework import serializers
from apps.tenant.models import OrganizationSector

class OrganizationSectorSerializer(serializers.ModelSerializer):
    sector_type_display = serializers.CharField(source='get_sector_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, allow_null=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = OrganizationSector
        fields = [
            'id', 'name', 'code', 'sector_type', 'sector_type_display',
            'description', 'icon', 'color', 'is_active', 'metadata',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'updated_by', 'updated_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate_code(self, value):
        value = value.upper()
        if OrganizationSector.objects.filter(code=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError(f"Sector with code '{value}' already exists")
        return value

    def validate_name(self, value):
        if OrganizationSector.objects.filter(name__iexact=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError(f"Sector with name '{value}' already exists")
        return value

    def validate_sector_type(self, value):
        valid_types = ['COMMERCIAL', 'NGO', 'PUBLIC', 'CONSULTING']
        if value not in valid_types:
            raise serializers.ValidationError(f"Sector type must be one of: {', '.join(valid_types)}")
        return value