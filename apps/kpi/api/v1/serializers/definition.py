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
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    parent_kpi_name = serializers.CharField(source='parent_kpi.name', read_only=True, default=None)
    owner_email = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    target_value = serializers.SerializerMethodField()
    current_score = serializers.SerializerMethodField()
    trend = serializers.SerializerMethodField()
    traffic_light = serializers.SerializerMethodField()

    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'description', 'kpi_type', 'kpi_type_display',
            'calculation_logic', 'calculation_logic_display', 'measure_type',
            'measure_type_display', 'unit', 'decimal_places', 'baseline',
            'target_min', 'target_max', 'target_value', 'current_score',
            'trend', 'traffic_light',
            'category', 'category_name', 'parent_kpi', 'parent_kpi_name',
            'is_staff_created', 'approval_status', 'approval_status_display', 'rejection_reason',
            'owner', 'owner_email', 'owner_name', 'department', 'department_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        query_params = getattr(request, 'query_params', getattr(request, 'GET', {})) if request else {}
        scope = query_params.get('scope') if query_params else None
        if (scope == 'my' or (request and 'my-kpis' in getattr(request, 'path', ''))) and user:
            return user.get_full_name() or user.username
        return obj.owner.get_full_name() if obj.owner else (user.get_full_name() if user else None)

    def get_owner_email(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        query_params = getattr(request, 'query_params', getattr(request, 'GET', {})) if request else {}
        scope = query_params.get('scope') if query_params else None
        if (scope == 'my' or (request and 'my-kpis' in getattr(request, 'path', ''))) and user:
            return user.email
        return obj.owner.email if obj.owner else (user.email if user else None)

    def get_target_value(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        if user:
            at = obj.annual_targets.filter(user=user).order_by('-year').first()
            if at and at.target_value is not None:
                return float(at.target_value)
        if obj.target_max is not None:
            return float(obj.target_max)
        if obj.target_min is not None:
            return float(obj.target_min)
        return None

    def get_current_score(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        query_params = getattr(request, 'query_params', getattr(request, 'GET', {})) if request else {}
        scope = query_params.get('scope') if query_params else None

        if (scope == 'my' or (request and 'my-kpis' in getattr(request, 'path', ''))) and user:
            score = obj.scores.filter(user=user).order_by('-year', '-month').first()
            if score and score.score is not None:
                return float(score.score)

        if obj.owner_id:
            owner_score = obj.scores.filter(user_id=obj.owner_id).order_by('-year', '-month').first()
            if owner_score and owner_score.score is not None:
                return float(owner_score.score)

        latest_score = obj.scores.order_by('-year', '-month').first()
        return float(latest_score.score) if latest_score and latest_score.score is not None else 0.0

    def get_trend(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        scores_qs = obj.scores.filter(user=user) if user else obj.scores
        recent_scores = list(scores_qs.order_by('-year', '-month')[:2])
        if len(recent_scores) >= 2:
            if recent_scores[0].score > recent_scores[1].score:
                return 'up'
            elif recent_scores[0].score < recent_scores[1].score:
                return 'down'
        return 'stable'

    def get_traffic_light(self, obj):
        score = self.get_current_score(obj)
        if score >= 90:
            return 'green'
        if score >= 70:
            return 'amber'
        return 'red'


class KPIDetailSerializer(TenantAwareSerializer, AuditTrailSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    calculation_logic_display = serializers.CharField(source='get_calculation_logic_display', read_only=True)
    measure_type_display = serializers.CharField(source='get_measure_type_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    parent_kpi_name = serializers.CharField(source='parent_kpi.name', read_only=True, default=None)
    owner_email = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    category_detail = KPICategorySerializer(source='category', read_only=True)
    weights_count = serializers.SerializerMethodField()
    actuals_count = serializers.SerializerMethodField()
    scores_count = serializers.SerializerMethodField()
    sub_kpis_count = serializers.SerializerMethodField()

    def get_owner_name(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        query_params = getattr(request, 'query_params', getattr(request, 'GET', {})) if request else {}
        scope = query_params.get('scope') if query_params else None
        if (scope == 'my' or (request and 'my-kpis' in getattr(request, 'path', ''))) and user:
            return user.get_full_name() or user.username
        return obj.owner.get_full_name() if obj.owner else (user.get_full_name() if user else None)

    def get_owner_email(self, obj):
        request = self.context.get('request')
        user = request.user if request and getattr(request, 'user', None) and request.user.is_authenticated else None
        query_params = getattr(request, 'query_params', getattr(request, 'GET', {})) if request else {}
        scope = query_params.get('scope') if query_params else None
        if (scope == 'my' or (request and 'my-kpis' in getattr(request, 'path', ''))) and user:
            return user.email
        return obj.owner.email if obj.owner else (user.email if user else None)

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