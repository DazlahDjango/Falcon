from rest_framework import serializers
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from apps.billing.models import Plan, PlanFeature
from apps.billing.constants import PlanType

class PlanFeatureSerializer(serializers.ModelSerializer):
    display_value = serializers.ReadOnlyField()
    is_boolean = serializers.ReadOnlyField()
    boolean_value = serializers.ReadOnlyField()
    class Meta:
        moodel = PlanFeature
        fields = [
            'id', 'name', 'value', 'description', 'is_highlight',
            'display_order', 'display_value', 'is_boolean', 'boolean_value',
            'numeric_value', 'is_unlimited'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PlanSerializer(serializers.ModelSerializer):
    features = PlanFeatureSerializer(many=True, read_only=True)
    formatted_monthly_price = serializers.SerializerMethodField()
    formatted_yearly_price = serializers.SerializerMethodField()
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'slug', 'description', 'plan_type',
            'price_monthly', 'price_yearly', 'currency', 'trial_days',
            'display_order', 'is_active', 'is_recommended',
            'features', 'formatted_monthly_price', 'formatted_yearly_price'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    def get_formatted_monthly_price(self, obj):
        return self._format_price(obj.price_monthly, obj.currency)
    def get_formatted_yearly_price(self, obj):
        if obj.price_yearly:
            return self._format_price(obj.price_yearly, obj.currency)
        return self._format_price(obj.price_monthly * 12, obj.currency)
    def _format_price(self, amount, currency):
        return f"{currency}{amount:,.2f}"

class PlanDetailSerializer(PlanSerializer):
    feature_count = serializers.SerializerMethodField()
    yearly_savings = serializers.SerializerMethodField()
    class Meta(PlanSerializer.Meta):
        fields = PlanSerializer.Meta.fields + [
            'metadata', 'feature_count', 'yearly_savings',
            'stripe_product_id', 'stripe_price_id_monthly', 'stripe_price_id_yearly'
        ]
    def get_feature_count(self, obj):
        return obj.features.count()
    def get_yearly_savings(self, obj):
        if obj.price_yearly and obj.price_monthly:
            yearly_monthly_total = obj.price_monthly * 12
            savings = yearly_monthly_total - obj.price_yearly
            return float(savings) if savings > 0 else 0
        return 0
    
class PlanListSerializer(serializers.ModelSerializer):
    formatted_price = serializers.SerializerMethodField()
    is_popular = serializers.BooleanField(source='is_recommended')
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'slug', 'plan_type', 'price_monthly', 
            'currency', 'trial_days', 'is_recommended', 'is_popular',
            'formatted_price', 'display_order'
        ]
    def get_formatted_price(self, obj):
        return f"{obj.currency} {obj.price_monthly:,.2f}/month"
    
class PlanCompareSerializer(serializers.Serializer):
    plan_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        help_text="List of plan IDs to compare"
    )
    comparison = serializers.DictField(read_only=True)
    def validate_plan_ids(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("At least 2 plans required for comparison")
        if len(value) > 4:
            raise serializers.ValidationError("Maximum 4 plans for comparison")
        return value