from rest_framework import serializers
from ....models import KPI, KPIWeight, StrategicLinkage, KPIDependency
from ....validators import validate_kpi_code, validate_kpi_name
from .base import TenantAwareSerializer, AuditTrailSerializer
from .framework import KPIFrameworkSerializer, KPICategorySerializer, SectorSerializer

class KPIListSerializer(TenantAwareSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    calculation_logic_display = serializers.CharField(source='get_calculation_logic_display', read_only=True)
    measure_type_display = serializers.CharField(source='get_measure_type_display', read_only=True)
    framework_name = serializers.CharField(source='framework.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'code', 'description', 'kpi_type', 'kpi_type_display',
            'calculation_logic', 'calculation_logic_display', 'measure_type',
            'measure_type_display', 'unit', 'decimal_places', 'target_min', 'target_max',
            'framework', 'framework_name', 'category', 'category_name', 'sector',
            'sector_name', 'owner', 'owner_email', 'department', 'department_name',
            'is_active', 'strategic_objective', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class KPIDetailSerializer(TenantAwareSerializer, AuditTrailSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    calculation_logic_display = serializers.CharField(source='get_calculation_logic_display', read_only=True)
    measure_type_display = serializers.CharField(source='get_measure_type_display', read_only=True)
    framework_detail = KPIFrameworkSerializer(source='framework', read_only=True)
    category_detail = KPICategorySerializer(source='category', read_only=True)
    sector_detail = SectorSerializer(source='sector', read_only=True)
    weights_count = serializers.SerializerMethodField()
    actuals_count = serializers.SerializerMethodField()
    scores_count = serializers.SerializerMethodField()
    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'code', 'description', 'kpi_type', 'kpi_type_display',
            'calculation_logic', 'calculation_logic_display', 'measure_type',
            'measure_type_display', 'unit', 'decimal_places', 'target_min', 'target_max',
            'formula', 'framework', 'framework_detail', 'category', 'category_detail',
            'sector', 'sector_detail', 'owner', 'department', 'is_active',
            'activation_date', 'deactivation_date', 'strategic_objective', 'metadata',
            'weights_count', 'actuals_count', 'scores_count',
            'tenant_id', 'created_at', 'updated_at', 'created_by_email', 'updated_by_email'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    def get_weights_count(self, obj):
        return obj.weights.count()
    def get_actuals_count(self, obj):
        return obj.actuals.count()
    def get_scores_count(self, obj):
        return obj.scores.count()
    def validate_code(self, value):
        validate_kpi_code(value)
        return value
    def validate_name(self, value):
        validate_kpi_name(value)
        return value
    def validate(self, data):
        target_min = data.get('target_min')
        target_max = data.get('target_max')
        if target_min is not None and target_max is not None:
            if target_min > target_max:
                raise serializers.ValidationError("Target minimum cannot be greater than target maximum")
        if data.get('kpi_type') == 'PERCENTAGE':
            if target_min and target_min > 100:
                raise serializers.ValidationError("Percentage target min cannot exceed 100")
            if target_max and target_max > 100:
                raise serializers.ValidationError("Percentage target max cannot exceed 100")
        return data

class KPIWeightSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    weight_percentage = serializers.SerializerMethodField()
    class Meta:
        model = KPIWeight
        fields = [
            'id', 'kpi', 'kpi_name', 'kpi_code', 'user', 'user_email',
            'user_full_name', 'weight', 'weight_percentage', 'effective_from',
            'effective_to', 'is_active', 'reason', 'approved_by',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    def get_weight_percentage(self, obj):
        return f"{obj.weight}%"
    def validate(self, data):
        weight = data.get('weight')
        if weight and (weight < 0 or weight > 100):
            raise serializers.ValidationError("Weight must be between 0 and 100") 
        effective_from = data.get('effective_from')
        effective_to = data.get('effective_to')
        if effective_from and effective_to and effective_from > effective_to:
            raise serializers.ValidationError("Effective from date cannot be after effective to date")
        return data

class StrategicLinkageSerializer(TenantAwareSerializer):
    linkage_type_display = serializers.CharField(source='get_linkage_type_display', read_only=True)
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    class Meta:
        model = StrategicLinkage
        fields = [
            'id', 'kpi', 'kpi_name', 'strategic_objective', 'objective_code',
            'linkage_type', 'linkage_type_display', 'weight', 'description',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class KPIDependencySerializer(TenantAwareSerializer):
    dependency_type_display = serializers.CharField(source='get_dependency_type_display', read_only=True)
    source_kpi_name = serializers.CharField(source='source_kpi.name', read_only=True)
    target_kpi_name = serializers.CharField(source='target_kpi.name', read_only=True)
    class Meta:
        model = KPIDependency
        fields = [
            'id', 'source_kpi', 'source_kpi_name', 'target_kpi', 'target_kpi_name',
            'dependency_type', 'dependency_type_display', 'impact_factor',
            'description', 'is_active',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
