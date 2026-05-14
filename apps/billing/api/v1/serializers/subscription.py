from rest_framework import serializers
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.billing.models import Subscription, SubscriptionHistory
from apps.billing.constants import SubscriptionStatus, BillingInterval
from .plan import PlanSerializer

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    formatted_current_period_end = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = Subscription
        fields = [
            'id', 'tenant', 'tenant_name', 'plan', 'plan_details',
            'status', 'status_display', 'billing_interval', 'is_active',
            'trial_start', 'trial_end', 'current_period_start', 'current_period_end',
            'cancel_at_period_end', 'canceled_at', 'ended_at', 'auto_renew',
            'days_until_expiry', 'formatted_current_period_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'tenant', 'stripe_customer_id', 'stripe_subscription_id',
            'features_snapshot', 'created_at', 'updated_at'
        ]    
    def get_formatted_current_period_end(self, obj):
        if obj.current_period_end:
            return obj.current_period_end.strftime('%Y-%m-%d')
        return None

class SubscriptionDetailSerializer(SubscriptionSerializer):
    features = serializers.DictField(source='features_snapshot', read_only=True)
    quota_limits = serializers.SerializerMethodField()
    history_count = serializers.SerializerMethodField()
    health_status = serializers.SerializerMethodField()
    class Meta(SubscriptionSerializer.Meta):
        fields = SubscriptionSerializer.Meta.fields + [
            'features', 'quota_limits', 'history_count', 'health_status'
        ]
    def get_quota_limits(self, obj):
        if hasattr(obj, 'quota_limits'):
            return {
                'max_users': obj.quota_limits.max_users,
                'max_kpis': obj.quota_limits.max_kpis,
                'max_storage_mb': obj.quota_limits.max_storage_mb,
                'max_api_calls_per_day': obj.quota_limits.max_api_calls_per_day,
            }
        return None
    def get_history_count(self, obj):
        return obj.history.count()    
    def get_health_status(self, obj):
        from billing.services.subscription_service import SubscriptionService
        service = SubscriptionService()
        return service._check_subscription_health(obj)

class SubscriptionCreateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=True, help_text="ID of the plan to subscribe to")
    billing_interval = serializers.ChoiceField(
        choices=BillingInterval.CHOICES,
        default=BillingInterval.MONTHLY
    )
    trial_days = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=365,
        help_text="Custom trial days (overrides plan default)"
    )
    payment_method_id = serializers.CharField(
        required=False,
        help_text="Stripe payment method ID"
    )
    def validate_plan_id(self, value):
        from billing.models import Plan
        try:
            plan = Plan.objects.get(id=value, is_active=True, is_deleted=False)
            return plan
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Plan not found or inactive")    
    def validate(self, data):
        tenant = self.context.get('tenant')
        if tenant and hasattr(tenant, 'subscription'):
            existing = tenant.subscription
            if existing.is_active:
                raise serializers.ValidationError(
                    "Tenant already has an active subscription. Cancel existing subscription first."
                )
        return data

class SubscriptionUpdateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=False, help_text="New plan ID")
    billing_interval = serializers.ChoiceField(
        choices=BillingInterval.CHOICES,
        required=False
    )
    auto_renew = serializers.BooleanField(required=False)    
    def validate_plan_id(self, value):
        from billing.models import Plan
        try:
            plan = Plan.objects.get(id=value, is_active=True, is_deleted=False)
            return plan
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Plan not found or inactive")

class SubscriptionCancelSerializer(serializers.Serializer):
    at_period_end = serializers.BooleanField(
        default=True,
        help_text="If true, cancel at period end. If false, cancel immediately."
    )
    reason = serializers.CharField(
        required=False,
        max_length=500,
        allow_blank=True,
        help_text="Reason for cancellation"
    )

class SubscriptionReactivateSerializer(serializers.Serializer):
    pass

class SubscriptionStatusSerializer(serializers.Serializer):
    has_subscription = serializers.BooleanField()
    subscription_id = serializers.UUIDField(required=False)
    status = serializers.CharField(required=False)
    plan = serializers.DictField(required=False)
    billing_interval = serializers.CharField(required=False)
    current_period_start = serializers.DateTimeField(required=False)
    current_period_end = serializers.DateTimeField(required=False)
    trial_end = serializers.DateTimeField(required=False)
    cancel_at_period_end = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField()
    health = serializers.DictField(required=False)
    requires_action = serializers.BooleanField()
    action_type = serializers.CharField(required=False)

class SubscriptionHistorySerializer(serializers.ModelSerializer):
    previous_plan_name = serializers.CharField(source='previous_plan.name', read_only=True)
    new_plan_name = serializers.CharField(source='new_plan.name', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    class Meta:
        model = SubscriptionHistory
        fields = [
            'id', 'subscription', 'previous_plan', 'previous_plan_name',
            'new_plan', 'new_plan_name', 'previous_status', 'new_status',
            'change_reason', 'metadata', 'created_at', 'created_by_name'
        ]
        read_only_fields = '__all__'
    def get_created_by_name(self, obj):
        if obj.created_by:
            from apps.accounts.models import User
            try:
                user = User.objects.get(id=obj.created_by)
                return user.email
            except User.DoesNotExist:
                pass
        return None