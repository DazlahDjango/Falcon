from django_filters import rest_framework as filters
from django.utils import timezone
import django.db.models as models
from datetime import timedelta
from ...models import Subscription, Transaction, Invoice, WebhookEventLog, PaymentMethod
from ...constants import SubscriptionStatus, TransactionStatus, InvoiceStatus, TransactionType

class SubscriptionFilter(filters.FilterSet):
    """Filter set for Subscription model."""
    
    # Basic filters
    status = filters.ChoiceFilter(choices=SubscriptionStatus.choices)
    plan_type = filters.CharFilter(field_name='plan__plan_type', lookup_expr='exact')
    billing_interval = filters.ChoiceFilter(choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')])
    
    # Date filters
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    expires_after = filters.DateTimeFilter(field_name='current_period_end', lookup_expr='gte')
    expires_before = filters.DateTimeFilter(field_name='current_period_end', lookup_expr='lte')
    
    # Boolean filters
    is_active = filters.BooleanFilter(method='filter_is_active')
    is_on_trial = filters.BooleanFilter(method='filter_is_on_trial')
    auto_renew = filters.BooleanFilter(field_name='auto_renew')
    cancel_at_period_end = filters.BooleanFilter(field_name='cancel_at_period_end')
    
    # Range filters
    amount_min = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    
    # Search filter
    search = filters.CharFilter(method='filter_search')
    
    # Custom date ranges
    expiring_soon = filters.BooleanFilter(method='filter_expiring_soon')
    recently_created = filters.BooleanFilter(method='filter_recently_created')
    
    class Meta:
        model = Subscription
        fields = [
            'status', 'plan_type', 'billing_interval', 'auto_renew',
            'cancel_at_period_end', 'is_active', 'is_on_trial'
        ]
    
    def filter_is_active(self, queryset, name, value):
        """Filter by active status."""
        if value:
            return queryset.active()
        return queryset.exclude(status__in=['active', 'trialing'])
    
    def filter_is_on_trial(self, queryset, name, value):
        """Filter by trial status."""
        if value:
            return queryset.trialing()
        return queryset.exclude(status='trialing')
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        return queryset.filter(
            models.Q(subscription_code__icontains=value) |
            models.Q(plan__name__icontains=value) |
            models.Q(paystack_subscription_code__icontains=value)
        )
    
    def filter_expiring_soon(self, queryset, name, value):
        """Filter subscriptions expiring in next 7 days."""
        if value:
            return queryset.expiring_soon(7)
        return queryset
    
    def filter_recently_created(self, queryset, name, value):
        """Filter subscriptions created in last 30 days."""
        if value:
            cutoff = timezone.now() - timedelta(days=30)
            return queryset.filter(created_at__gte=cutoff)
        return queryset


class TransactionFilter(filters.FilterSet):
    """Filter set for Transaction model."""
    
    # Basic filters
    status = filters.ChoiceFilter(choices=TransactionStatus.choices)
    transaction_type = filters.ChoiceFilter(choices=TransactionType.choices)
    currency = filters.CharFilter(lookup_expr='iexact')
    
    # Date filters
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    payment_after = filters.DateTimeFilter(field_name='payment_date', lookup_expr='gte')
    payment_before = filters.DateTimeFilter(field_name='payment_date', lookup_expr='lte')
    
    # Amount filters
    amount_min = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    total_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    # Search filter
    search = filters.CharFilter(method='filter_search')
    
    # Reference filters
    reference = filters.CharFilter(lookup_expr='icontains')
    paystack_reference = filters.CharFilter(lookup_expr='icontains')
    
    # Related subscription
    subscription_id = filters.UUIDFilter(field_name='subscription__id')
    subscription_code = filters.CharFilter(field_name='subscription__subscription_code', lookup_expr='icontains')
    
    # Success rate filter
    is_successful = filters.BooleanFilter(field_name='status', lookup_expr='exact', method='filter_is_successful')
    
    class Meta:
        model = Transaction
        fields = [
            'status', 'transaction_type', 'currency', 'reference',
            'paystack_reference', 'subscription_id', 'is_successful'
        ]
    
    def filter_search(self, queryset, name, value):
        """Search across transaction fields."""
        return queryset.filter(
            models.Q(reference__icontains=value) |
            models.Q(paystack_reference__icontains=value) |
            models.Q(transaction_type__icontains=value)
        )
    
    def filter_is_successful(self, queryset, name, value):
        """Filter by successful transactions."""
        if value:
            return queryset.successful()
        return queryset.exclude(status='success')


class InvoiceFilter(filters.FilterSet):
    """Filter set for Invoice model."""
    
    # Basic filters
    status = filters.ChoiceFilter(choices=InvoiceStatus.choices)
    currency = filters.CharFilter(lookup_expr='iexact')
    
    # Date filters
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    due_after = filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    due_before = filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    paid_after = filters.DateTimeFilter(field_name='paid_at', lookup_expr='gte')
    paid_before = filters.DateTimeFilter(field_name='paid_at', lookup_expr='lte')
    
    # Amount filters
    total_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    # Search filter
    search = filters.CharFilter(method='filter_search')
    
    # Invoice number
    invoice_number = filters.CharFilter(lookup_expr='icontains')
    
    # Related subscription
    subscription_id = filters.UUIDFilter(field_name='subscription__id')
    subscription_code = filters.CharFilter(field_name='subscription__subscription_code', lookup_expr='icontains')
    
    # Status filters
    is_overdue = filters.BooleanFilter(method='filter_is_overdue')
    is_paid = filters.BooleanFilter(method='filter_is_paid')
    is_unpaid = filters.BooleanFilter(method='filter_is_unpaid')
    
    class Meta:
        model = Invoice
        fields = [
            'status', 'currency', 'invoice_number', 'subscription_id',
            'is_overdue', 'is_paid', 'is_unpaid'
        ]
    
    def filter_search(self, queryset, name, value):
        """Search across invoice fields."""
        return queryset.filter(
            models.Q(invoice_number__icontains=value) |
            models.Q(subscription__subscription_code__icontains=value)
        )
    
    def filter_is_overdue(self, queryset, name, value):
        """Filter overdue invoices."""
        if value:
            return queryset.filter(
                status='pending',
                due_date__lt=timezone.now()
            )
        return queryset
    
    def filter_is_paid(self, queryset, name, value):
        """Filter paid invoices."""
        if value:
            return queryset.filter(status='paid')
        return queryset.exclude(status='paid')
    
    def filter_is_unpaid(self, queryset, name, value):
        """Filter unpaid invoices."""
        if value:
            return queryset.filter(status__in=['pending', 'overdue'])
        return queryset.exclude(status__in=['pending', 'overdue'])


class WebhookLogFilter(filters.FilterSet):
    """Filter set for WebhookEventLog model."""
    
    # Basic filters
    event_type = filters.ChoiceFilter(choices=WebhookEventLog.EVENT_CHOICES)
    processing_status = filters.ChoiceFilter(choices=WebhookEventLog.PROCESSING_STATUS_CHOICES)
    
    # Date filters
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    processed_after = filters.DateTimeFilter(field_name='processed_at', lookup_expr='gte')
    processed_before = filters.DateTimeFilter(field_name='processed_at', lookup_expr='lte')
    
    # Signature filter
    signature_valid = filters.BooleanFilter(field_name='signature_valid')
    
    # Retry filter
    has_retries = filters.BooleanFilter(method='filter_has_retries')
    
    # Search filter
    search = filters.CharFilter(method='filter_search')
    
    # Event ID filters
    paystack_event_id = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = WebhookEventLog
        fields = [
            'event_type', 'processing_status', 'signature_valid',
            'paystack_event_id', 'has_retries'
        ]
    
    def filter_search(self, queryset, name, value):
        """Search across webhook fields."""
        return queryset.filter(
            models.Q(event_type__icontains=value) |
            models.Q(paystack_event_id__icontains=value) |
            models.Q(event_idempotency_key__icontains=value)
        )
    
    def filter_has_retries(self, queryset, name, value):
        """Filter webhooks that have been retried."""
        if value:
            return queryset.filter(retry_count__gt=0)
        return queryset.filter(retry_count=0)


class PaymentMethodFilter(filters.FilterSet):
    """Filter set for PaymentMethod model."""
    
    # Basic filters
    payment_type = filters.ChoiceFilter(choices=PaymentMethod.TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=PaymentMethod.STATUS_CHOICES)
    card_brand = filters.CharFilter(lookup_expr='iexact')
    
    # Boolean filters
    is_default = filters.BooleanFilter(field_name='is_default')
    is_expired = filters.BooleanFilter(method='filter_is_expired')
    is_active = filters.BooleanFilter(method='filter_is_active')
    
    # Search filter
    search = filters.CharFilter(method='filter_search')
    
    class Meta:
        model = PaymentMethod
        fields = [
            'payment_type', 'status', 'card_brand', 'is_default', 'is_active', 'is_expired'
        ]
    
    def filter_search(self, queryset, name, value):
        """Search across payment method fields."""
        return queryset.filter(
            models.Q(card_last4__icontains=value) |
            models.Q(card_brand__icontains=value) |
            models.Q(bank_name__icontains=value) |
            models.Q(account_name__icontains=value)
        )
    
    def filter_is_expired(self, queryset, name, value):
        """Filter expired cards."""
        if value:
            # Filter cards with expiry date in the past
            current_year = timezone.now().year
            current_month = timezone.now().month
            return queryset.filter(
                models.Q(card_expiry_year__lt=current_year) |
                models.Q(
                    card_expiry_year=current_year,
                    card_expiry_month__lt=current_month
                )
            )
        return queryset
    
    def filter_is_active(self, queryset, name, value):
        """Filter active payment methods."""
        if value:
            return queryset.filter(status__in=['active', 'default'])
        return queryset.exclude(status__in=['active', 'default'])


class BillingAnalyticsFilter(filters.FilterSet):
    """
    Filter set for billing analytics.
    Used for generating reports and dashboards.
    """
    
    # Date range filters
    start_date = filters.DateTimeFilter(method='filter_start_date')
    end_date = filters.DateTimeFilter(method='filter_end_date')
    date_range = filters.CharFilter(method='filter_date_range')
    
    # Period filters
    period = filters.ChoiceFilter(choices=[
        ('today', 'Today'),
        ('yesterday', 'Yesterday'),
        ('this_week', 'This Week'),
        ('last_week', 'Last Week'),
        ('this_month', 'This Month'),
        ('last_month', 'Last Month'),
        ('this_quarter', 'This Quarter'),
        ('last_quarter', 'Last Quarter'),
        ('this_year', 'This Year'),
        ('last_year', 'Last Year'),
    ], method='filter_period')
    
    # Group by
    group_by = filters.ChoiceFilter(choices=[
        ('day', 'Day'),
        ('week', 'Week'),
        ('month', 'Month'),
        ('quarter', 'Quarter'),
        ('year', 'Year'),
    ], method='filter_group_by')
    
    def filter_start_date(self, queryset, name, value):
        """Filter by start date."""
        if hasattr(queryset, 'filter_start_date'):
            return queryset.filter_start_date(value)
        return queryset
    
    def filter_end_date(self, queryset, name, value):
        """Filter by end date."""
        if hasattr(queryset, 'filter_end_date'):
            return queryset.filter_end_date(value)
        return queryset
    
    def filter_date_range(self, queryset, name, value):
        """Filter by predefined date range."""
        today = timezone.now().date()
        
        ranges = {
            'today': (today, today),
            'yesterday': (today - timedelta(days=1), today - timedelta(days=1)),
            'this_week': (today - timedelta(days=today.weekday()), today),
            'last_week': (today - timedelta(days=today.weekday() + 7), today - timedelta(days=today.weekday() + 1)),
            'this_month': (today.replace(day=1), today),
            'last_month': (
                (today.replace(day=1) - timedelta(days=1)).replace(day=1),
                today.replace(day=1) - timedelta(days=1)
            ),
            'this_quarter': (
                today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1),
                today
            ),
            'this_year': (today.replace(month=1, day=1), today),
        }
        
        if value in ranges:
            start, end = ranges[value]
            return queryset.filter(
                created_at__date__gte=start,
                created_at__date__lte=end
            )
        
        return queryset
    
    def filter_period(self, queryset, name, value):
        """Filter by period."""
        # Handled by date_range
        return self.filter_date_range(queryset, name, value)
    
    def filter_group_by(self, queryset, name, value):
        """Set group by for analytics."""
        # This is handled in the view, not the queryset
        return queryset
