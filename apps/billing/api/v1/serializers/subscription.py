from rest_framework import serializers
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from ....models import Subscription, SubscriptionPlan
from ....constants import SubscriptionStatus, BillingInterval
from .plan import PlanSerializer

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.UUIDField(write_only=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active_status = serializers.SerializerMethodField()
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'subscription_code', 'tenant_id', 'plan', 'plan_id',
            'status', 'status_display', 'is_active_status',
            'start_date', 'trial_end_date', 'current_period_start',
            'current_period_end', 'billing_interval', 'amount', 'amount_display',
            'currency', 'auto_renew', 'cancel_at_period_end',
            'cancelled_at', 'ended_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'subscription_code', 'tenant_id', 'created_at', 'updated_at',
            'cancelled_at', 'ended_at', 'start_date'
        ]
    
    def get_is_active_status(self, obj):
        return {
            'is_active': obj.is_active,
            'is_on_trial': obj.is_on_trial,
            'trial_days_remaining': obj.trial_days_remaining,
            'days_until_expiry': obj.days_until_expiry,
            'is_expiring_soon': obj.is_expiring_soon
        }
    
    def get_amount_display(self, obj):
        return f"{obj.currency} {obj.amount / 100:.2f}"


class SubscriptionListSerializer(SubscriptionSerializer):
    """Lightweight serializer for list views."""
    
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_type = serializers.CharField(source='plan.plan_type', read_only=True)
    
    class Meta(SubscriptionSerializer.Meta):
        fields = [
            'id', 'subscription_code', 'plan_name', 'plan_type',
            'status', 'is_active_status', 'current_period_end',
            'amount', 'currency', 'amount_display', 'auto_renew'
        ]


class SubscriptionDetailSerializer(SubscriptionSerializer):
    """Full detail serializer with nested data."""
    
    plan_detail = PlanSerializer(source='plan', read_only=True)
    recent_transactions = serializers.SerializerMethodField()
    upcoming_invoice = serializers.SerializerMethodField()
    
    class Meta(SubscriptionSerializer.Meta):
        fields = SubscriptionSerializer.Meta.fields + [
            'plan_detail', 'recent_transactions', 'upcoming_invoice',
            'paystack_subscription_code', 'paystack_authorization_code'
        ]
    
    def get_recent_transactions(self, obj):
        """Get recent transactions for this subscription."""
        from ....models import Transaction
        transactions = Transaction.objects.filter(subscription=obj).order_by('-created_at')[:5]
        from .transaction import TransactionListSerializer
        return TransactionListSerializer(transactions, many=True).data
    
    def get_upcoming_invoice(self, obj):
        """Get upcoming invoice amount."""
        if obj.is_active and obj.current_period_end > timezone.now():
            return {
                'amount': obj.amount,
                'amount_display': f"{obj.currency} {obj.amount / 100:.2f}",
                'due_date': obj.current_period_end,
                'days_until_due': obj.days_until_expiry
            }
        return None


class SubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating a new subscription."""
    
    plan_id = serializers.UUIDField(required=True, help_text="ID of the plan to subscribe to")
    billing_interval = serializers.ChoiceField(
        choices=BillingInterval.choices,
        default=BillingInterval.MONTHLY,
        required=False
    )
    auto_renew = serializers.BooleanField(default=True, required=False)
    trial_days = serializers.IntegerField(default=14, min_value=0, max_value=30, required=False)
    payment_method_id = serializers.UUIDField(required=False, help_text="Saved payment method ID")
    
    def validate_plan_id(self, value):
        """Validate plan exists and is active."""
        try:
            plan = SubscriptionPlan.objects.get_by_id(value)
            if not plan.is_active:
                raise serializers.ValidationError("Plan is not active")
            return value
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Plan not found")
    
    def validate(self, data):
        """Check if tenant already has active subscription."""
        tenant_id = self.context.get('tenant_id')
        if tenant_id:
            existing = Subscription.objects.get_current_for_tenant(tenant_id)
            if existing and existing.is_active:
                raise serializers.ValidationError(
                    "Tenant already has an active subscription. Please cancel it first."
                )
        return data


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating subscription settings."""
    
    class Meta:
        model = Subscription
        fields = ['auto_renew', 'billing_interval']
    
    def validate_billing_interval(self, value):
        """Validate billing interval change."""
        instance = self.instance
        if instance and instance.billing_interval != value:
            if instance.cancel_at_period_end:
                raise serializers.ValidationError(
                    "Cannot change billing interval while subscription is scheduled for cancellation"
                )
        return value


class SubscriptionCancelSerializer(serializers.Serializer):
    """Serializer for cancelling a subscription."""
    
    at_period_end = serializers.BooleanField(
        default=True,
        help_text="If true, cancel at end of period. If false, cancel immediately."
    )
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate subscription can be cancelled."""
        subscription = self.context.get('subscription')
        
        if not subscription:
            raise serializers.ValidationError("Subscription not found")
        
        if not subscription.is_active:
            raise serializers.ValidationError("Cannot cancel an inactive subscription")
        
        if subscription.cancel_at_period_end:
            raise serializers.ValidationError("Subscription is already scheduled for cancellation")
        
        return data


class SubscriptionRenewSerializer(serializers.Serializer):
    payment_method_id = serializers.UUIDField(required=False, help_text="Payment method to use")
    
    def validate(self, data):
        """Validate subscription can be renewed."""
        subscription = self.context.get('subscription')
        
        if not subscription:
            raise serializers.ValidationError("Subscription not found")
        
        if not subscription.is_active:
            raise serializers.ValidationError("Cannot renew an inactive subscription")
        
        if subscription.cancel_at_period_end:
            raise serializers.ValidationError("Cannot renew a subscription scheduled for cancellation")
        
        return data