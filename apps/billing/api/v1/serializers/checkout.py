from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from ....constants import BillingInterval

class CheckoutInitializeSerializer(serializers.Serializer):
    # For subscription checkout
    plan_id = serializers.UUIDField(required=False, help_text="Plan ID for subscription")
    billing_interval = serializers.ChoiceField(
        choices=BillingInterval.choices,
        default=BillingInterval.MONTHLY,
        required=False
    )
    
    # For one-time payment
    amount = serializers.IntegerField(required=False, min_value=1, help_text="Amount in cents")
    description = serializers.CharField(required=False, max_length=500, help_text="Payment description")
    
    # Common fields
    success_url = serializers.URLField(required=False, help_text="URL to redirect after successful payment")
    cancel_url = serializers.URLField(required=False, help_text="URL to redirect after cancelled payment")
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data):
        """Validate either plan_id or amount is provided."""
        has_plan = bool(data.get('plan_id'))
        has_amount = bool(data.get('amount'))
        
        if not has_plan and not has_amount:
            raise serializers.ValidationError(
                "Either plan_id (for subscription) or amount (for one-time) must be provided"
            )
        
        if has_plan and has_amount:
            raise serializers.ValidationError(
                "Cannot provide both plan_id and amount. Choose one checkout type."
            )
        
        # Validate plan exists if provided
        if has_plan:
            from ....models import SubscriptionPlan
            try:
                plan = SubscriptionPlan.objects.get_by_id(data['plan_id'])
                if not plan.is_active:
                    raise serializers.ValidationError({"plan_id": "Plan is not active"})
                data['plan'] = plan
            except SubscriptionPlan.DoesNotExist:
                raise serializers.ValidationError({"plan_id": "Plan not found"})
        
        # Validate amount range
        if has_amount:
            if data['amount'] > 100000000:  # Max 1,000,000 KES
                raise serializers.ValidationError({"amount": "Amount exceeds maximum allowed"})
            if not data.get('description'):
                raise serializers.ValidationError({"description": "Description is required for one-time payment"})
        
        # Set default callback URLs
        base_url = getattr(settings, 'BASE_URL', '')
        if not data.get('success_url'):
            data['success_url'] = f"{base_url}/payment/success"
        if not data.get('cancel_url'):
            data['cancel_url'] = f"{base_url}/payment/cancelled"
        
        return data


class CheckoutResponseSerializer(serializers.Serializer):
    """Serializer for checkout response."""
    
    authorization_url = serializers.URLField(help_text="URL to redirect user for payment")
    access_code = serializers.CharField(help_text="PayStack access code")
    reference = serializers.CharField(help_text="Transaction reference")
    transaction_id = serializers.UUIDField(help_text="Internal transaction ID")


class CheckoutVerifySerializer(serializers.Serializer):
    """Serializer for verifying checkout status."""
    
    reference = serializers.CharField(required=True, help_text="Transaction reference to verify")
    
    def validate_reference(self, value):
        """Validate reference exists."""
        from ....models import Transaction
        
        transaction = Transaction.objects.get_by_reference(value)
        if not transaction:
            raise serializers.ValidationError(f"Transaction with reference {value} not found")
        
        self.context['transaction'] = transaction
        return value