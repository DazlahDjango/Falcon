from django_filters import rest_framework as filters
from django.db.models import Q
from apps.billing.models import (
    Plan, Subscription, Invoice, Payment, 
    PaymentMethod, WebhookEvent
)

class PlanFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price_monthly', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price_monthly', lookup_expr='lte')
    plan_type = filters.ChoiceFilter(choices=[
        ('trial', 'Trial'),
        ('basic', 'Basic'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ])
    is_active = filters.BooleanFilter()
    is_recommended = filters.BooleanFilter()
    currency = filters.CharFilter(lookup_expr='iexact')    
    class Meta:
        model = Plan
        fields = ['plan_type', 'is_active', 'is_recommended', 'currency']

class SubscriptionFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=[
        ('trialing', 'Trialing'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('suspended', 'Suspended'),
    ])
    billing_interval = filters.ChoiceFilter(choices=[
        ('month', 'Monthly'),
        ('year', 'Yearly'),
    ])
    plan_type = filters.CharFilter(field_name='plan__plan_type')
    cancel_at_period_end = filters.BooleanFilter()
    auto_renew = filters.BooleanFilter()
    expires_after = filters.DateFilter(field_name='current_period_end', lookup_expr='gte')
    expires_before = filters.DateFilter(field_name='current_period_end', lookup_expr='lte')
    trial_ends_after = filters.DateFilter(field_name='trial_end', lookup_expr='gte')
    trial_ends_before = filters.DateFilter(field_name='trial_end', lookup_expr='lte')    
    class Meta:
        model = Subscription
        fields = ['status', 'billing_interval', 'cancel_at_period_end', 'auto_renew']

class InvoiceFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=[
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('uncollectible', 'Uncollectible'),
        ('void', 'Void'),
    ])
    currency = filters.CharFilter(lookup_expr='iexact')
    min_amount = filters.NumberFilter(field_name='amount_due', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount_due', lookup_expr='lte')
    date_from = filters.DateFilter(field_name='invoice_date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='invoice_date', lookup_expr='lte')
    due_from = filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_to = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    is_overdue = filters.BooleanFilter(method='filter_is_overdue')
    def filter_is_overdue(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(
                status__in=['open', 'draft'],
                due_date__lt=timezone.now()
            )
        return queryset.exclude(
            status__in=['open', 'draft'],
            due_date__lt=timezone.now()
        )    
    class Meta:
        model = Invoice
        fields = ['status', 'currency']

class PaymentFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=[
        ('succeeded', 'Succeeded'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ])
    currency = filters.CharFilter(lookup_expr='iexact')
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    date_from = filters.DateFilter(field_name='payment_date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='payment_date', lookup_expr='lte')    
    class Meta:
        model = Payment
        fields = ['status', 'currency']

class PaymentMethodFilter(filters.FilterSet):
    method_type = filters.ChoiceFilter(choices=[
        ('card', 'Card'),
        ('bank_account', 'Bank Account'),
        ('mobile_money', 'Mobile Money'),
    ])
    brand = filters.ChoiceFilter(choices=[
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
    ])
    is_default = filters.BooleanFilter()
    is_active = filters.BooleanFilter()
    is_expired = filters.BooleanFilter()    
    class Meta:
        model = PaymentMethod
        fields = ['method_type', 'brand', 'is_default', 'is_active', 'is_expired']

class WebhookEventFilter(filters.FilterSet):
    event_type = filters.ChoiceFilter(choices=[
        ('customer.subscription.created', 'Subscription Created'),
        ('customer.subscription.updated', 'Subscription Updated'),
        ('customer.subscription.deleted', 'Subscription Deleted'),
        ('invoice.paid', 'Invoice Paid'),
        ('invoice.payment_failed', 'Payment Failed'),
        ('payment_intent.succeeded', 'Payment Succeeded'),
    ])
    is_processed = filters.BooleanFilter()
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    class Meta:
        model = WebhookEvent
        fields = ['event_type', 'is_processed']