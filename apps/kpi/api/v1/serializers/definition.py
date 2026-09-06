# definition.py
from rest_framework import serializers
from ....models import KPI, KPIWeight, KPIDependency
from ....validators import validate_kpi_code, validate_kpi_name
from .base import TenantAwareSerializer, AuditTrailSerializer
from .framework import KPICategorySerializer


class KPIListSerializer(TenantAwareSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    calculation_logic_display = serializers.CharField(source='get_calculation_logic_display', read_only=True)
    measure_type_display = serializers.CharField(source='get_measure_type_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    parent_kpi_name = serializers.CharField(source='parent_kpi.name', read_only=True, default=None)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)

    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'description', 'kpi_type', 'kpi_type_display',
            'calculation_logic', 'calculation_logic_display', 'measure_type',
            'measure_type_display', 'unit', 'decimal_places', 'baseline',
            'category', 'category_name', 'parent_kpi', 'parent_kpi_name',
            'is_staff_created', 'approval_status', 'approval_status_display', 'rejection_reason',
            'owner', 'owner_email', 'department', 'department_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class KPIDetailSerializer(TenantAwareSerializer, AuditTrailSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    calculation_logic_display = serializers.CharField(source='get_calculation_logic_display', read_only=True)
    measure_type_display = serializers.CharField(source='get_measure_type_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    parent_kpi_name = serializers.CharField(source='parent_kpi.name', read_only=True, default=None)
    owner_email = serializers.EmailField(source='owner.email', read_only=True, default=None)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True, default=None)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    category_detail = KPICategorySerializer(source='category', read_only=True)
    weights_count = serializers.SerializerMethodField()
    actuals_count = serializers.SerializerMethodField()
    scores_count = serializers.SerializerMethodField()
    sub_kpis_count = serializers.SerializerMethodField()

    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'description', 'kpi_type', 'kpi_type_display',
            'calculation_logic', 'calculation_logic_display', 'measure_type',
            'measure_type_display', 'unit', 'decimal_places', 'baseline',
            'formula', 'category', 'category_name', 'category_detail',
            'parent_kpi', 'parent_kpi_name', 'is_staff_created', 'approval_status', 'approval_status_display',
            'rejection_reason', 'approved_by', 'approved_by_email',
            'owner', 'owner_email', 'owner_name', 'department', 'department_name', 'is_active',
            'activation_date', 'deactivation_date', 'metadata',
            'weights_count', 'actuals_count', 'scores_count', 'sub_kpis_count',
            'tenant_id', 'created_at', 'updated_at', 'created_by_email', 'updated_by_email'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def get_sub_kpis_count(self, obj):
        return obj.sub_kpis.count() if hasattr(obj, 'sub_kpis') else 0


    def get_weights_count(self, obj):
        return obj.weights.count() if hasattr(obj, 'weights') else 0

    def get_actuals_count(self, obj):
        return obj.actuals.count() if hasattr(obj, 'actuals') else 0

    def get_scores_count(self, obj):
        return obj.scores.count()

    def validate_name(self, value):
        validate_kpi_name(value)
        return value

    def validate_category(self, value):
        if value:
            from apps.tenant.services.isolation_service import IsolationEnforcer
            enforcer = IsolationEnforcer(self.context.get('request'))
            try:
                enforcer.assert_org_context(value, self.context['request'].user.tenant_id)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return value

    def validate_owner(self, value):
        if value:
            from apps.tenant.services.isolation_service import IsolationEnforcer
            enforcer = IsolationEnforcer(self.context.get('request'))
            try:
                enforcer.assert_org_context(value, self.context['request'].user.tenant_id)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return value

    def validate_department(self, value):
        if value:
            from apps.tenant.services.isolation_service import IsolationEnforcer
            enforcer = IsolationEnforcer(self.context.get('request'))
            try:
                enforcer.assert_org_context(value, self.context['request'].user.tenant_id)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return value

    def validate(self, data):
        return data


class KPIWeightSerializer(TenantAwareSerializer):
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)
    kpi_code = serializers.CharField(source='kpi.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    weight_percentage = serializers.SerializerMethodField()
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)

    class Meta:
        model = KPIWeight
        fields = [
            'id', 'kpi', 'kpi_name', 'kpi_code', 'user', 'user_email',
            'user_full_name', 'weight', 'weight_percentage', 'effective_from',
            'effective_to', 'is_active', 'reason', 'approved_by', 'approved_by_email',
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