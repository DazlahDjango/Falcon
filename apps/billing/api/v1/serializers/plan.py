from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ....models import SubscriptionPlan
from ....constants import PlanType, BillingInterval

class PlanSerializer(serializers.ModelSerializer):
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    billing_interval_display = serializers.CharField(source='get_billing_interval_display', read_only=True)
    price_display = serializers.SerializerMethodField()
    yearly_price_display = serializers.SerializerMethodField()
    features_list_display = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'slug', 'plan_type', 'plan_type_display',
            'billing_interval', 'billing_interval_display',
            'price', 'price_display', 'yearly_price', 'yearly_price_display',
            'currency', 'description', 'features_list', 'features_list_display',
            'max_users', 'max_kpis', 'max_departments', 'max_storage_mb',
            'custom_branding', 'api_access', 'sso_enabled',
            'advanced_analytics', 'audit_logs', 'custom_reports', 'priority_support',
            'is_active', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']
    
    def get_price_display(self, obj):
        return obj.price_display
    
    def get_yearly_price_display(self, obj):
        return obj.yearly_price_display
    
    def get_features_list_display(self, obj):
        features = []
        if obj.features_list:
            features = obj.features_list
        else:
            # Build from feature flags
            if obj.custom_branding:
                features.append("Custom Branding & Theming")
            if obj.api_access:
                features.append("REST API Access")
            if obj.sso_enabled:
                features.append("Single Sign-On (SSO)")
            if obj.advanced_analytics:
                features.append("Advanced Analytics & Reports")
            if obj.audit_logs:
                features.append("Audit Logs")
            if obj.custom_reports:
                features.append("Custom Report Builder")
            if obj.priority_support:
                features.append("Priority 24/7 Support")
            if obj.max_users == -1:
                features.append("Unlimited Users")
            elif obj.max_users:
                features.append(f"Up to {obj.max_users} Users")
            if obj.max_kpis == -1:
                features.append("Unlimited KPIs")
            elif obj.max_kpis:
                features.append(f"Up to {obj.max_kpis} KPIs")
        return features


class PlanListSerializer(PlanSerializer):
    """Lightweight serializer for list views."""
    
    class Meta(PlanSerializer.Meta):
        fields = [
            'id', 'name', 'slug', 'plan_type', 'plan_type_display',
            'billing_interval', 'price_display', 'currency',
            'max_users', 'max_kpis', 'is_active', 'display_order'
        ]


class PlanDetailSerializer(PlanSerializer):
    """Full detail serializer with computed fields."""
    
    yearly_savings = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    
    class Meta(PlanSerializer.Meta):
        fields = PlanSerializer.Meta.fields + ['yearly_savings', 'is_popular']
    
    def get_yearly_savings(self, obj):
        """Calculate savings for yearly plan vs monthly."""
        if obj.billing_interval == BillingInterval.MONTHLY and obj.yearly_price:
            monthly_cost = obj.price * 12
            savings = monthly_cost - obj.yearly_price
            savings_percent = (savings / monthly_cost) * 100
            return {
                'amount': savings,
                'display': f"{obj.currency} {savings / 100:.2f}",
                'percent': round(savings_percent)
            }
        return None
    
    def get_is_popular(self, obj):
        """Mark professional plan as popular."""
        return obj.plan_type == PlanType.PROFESSIONAL


class PlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new plans (admin only)."""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'name', 'plan_type', 'billing_interval', 'price', 'yearly_price',
            'currency', 'description', 'features_list', 'max_users', 'max_kpis',
            'max_departments', 'max_storage_mb', 'custom_branding', 'api_access',
            'sso_enabled', 'advanced_analytics', 'audit_logs', 'custom_reports',
            'priority_support', 'display_order'
        ]
    
    def validate_price(self, value):
        """Validate price is positive."""
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        if value == 0 and self.initial_data.get('plan_type') != PlanType.TRIAL:
            raise serializers.ValidationError("Only trial plans can have zero price")
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        plan_type = data.get('plan_type')
        
        # Trial plan validations
        if plan_type == PlanType.TRIAL:
            if data.get('price', 0) != 0:
                raise serializers.ValidationError({"price": "Trial plans must have price 0"})
            if data.get('yearly_price'):
                raise serializers.ValidationError({"yearly_price": "Trial plans cannot have yearly price"})
        
        # Enterprise unlimited validations
        if plan_type == PlanType.ENTERPRISE:
            if data.get('max_users', -1) != -1:
                data['max_users'] = -1
            if data.get('max_kpis', -1) != -1:
                data['max_kpis'] = -1
        
        return data
    
    def create(self, validated_data):
        """Create plan with auto-generated slug."""
        from django.utils.text import slugify
        
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class PlanUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'name', 'price', 'yearly_price', 'description', 'features_list',
            'max_users', 'max_kpis', 'max_departments', 'max_storage_mb',
            'custom_branding', 'api_access', 'sso_enabled', 'advanced_analytics',
            'audit_logs', 'custom_reports', 'priority_support', 'is_active',
            'display_order'
        ]
    
    def validate_price(self, value):
        """Validate price changes."""
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value