from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    SubscriptionPlan,
    Subscription,
    Transaction,
    Invoice,
    WebhookEventLog,
    PaymentMethod,
    BillingAuditLog
)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plan_type', 'billing_interval', 'price_display', 
        'max_users', 'max_kpis', 'is_active', 'display_order'
    ]
    list_filter = ['plan_type', 'billing_interval', 'is_active']
    search_fields = ['name', 'slug', 'plan_type']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'plan_type', 'billing_interval', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'yearly_price', 'currency')
        }),
        ('Limits', {
            'fields': ('max_users', 'max_kpis', 'max_departments', 'max_storage_mb')
        }),
        ('Features', {
            'fields': (
                'custom_branding', 'api_access', 'sso_enabled', 
                'advanced_analytics', 'audit_logs', 'custom_reports', 
                'priority_support'
            )
        }),
        ('PayStack Integration', {
            'fields': ('paystack_plan_code', 'paystack_plan_id'),
            'classes': ('collapse',)
        }),
        ('Display', {
            'fields': ('display_order', 'is_active', 'features_list')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def price_display(self, obj):
        return obj.price_display
    price_display.short_description = 'Price'
    
    actions = ['activate_plans', 'deactivate_plans']
    
    def activate_plans(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} plan(s) activated.")
    activate_plans.short_description = "Activate selected plans"
    
    def deactivate_plans(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} plan(s) deactivated.")
    deactivate_plans.short_description = "Deactivate selected plans"


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin for subscriptions."""
    
    list_display = [
        'subscription_code', 'tenant_link', 'plan_link', 'status', 
        'amount_display', 'current_period_end', 'is_active_status'
    ]
    list_filter = ['status', 'plan', 'billing_interval', 'auto_renew']
    search_fields = ['subscription_code', 'paystack_subscription_code', 'tenant_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'subscription_code']
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('subscription_code', 'tenant_id', 'plan', 'status')
        }),
        ('Dates', {
            'fields': ('start_date', 'trial_end_date', 'current_period_start', 'current_period_end')
        }),
        ('Billing', {
            'fields': ('billing_interval', 'amount', 'currency', 'auto_renew')
        }),
        ('PayStack Integration', {
            'fields': ('paystack_subscription_code', 'paystack_authorization_code', 'paystack_customer_code'),
            'classes': ('collapse',)
        }),
        ('Cancellation', {
            'fields': ('cancel_at_period_end', 'cancelled_at', 'ended_at')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        })
    )
    
    def tenant_link(self, obj):
        """Link to tenant in admin (if tenant admin exists)."""
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=obj.tenant_id)
            url = reverse('admin:tenant_client_change', args=[tenant.id])
            return format_html('<a href="{}">{}</a>', url, tenant.name)
        except:
            return obj.tenant_id
    tenant_link.short_description = 'Tenant'
    
    def plan_link(self, obj):
        url = reverse('admin:billing_subscriptionplan_change', args=[obj.plan.id])
        return format_html('<a href="{}">{}</a>', url, obj.plan.name)
    plan_link.short_description = 'Plan'
    
    def amount_display(self, obj):
        return f"{obj.currency} {obj.amount/100:.2f}"
    amount_display.short_description = 'Amount'
    
    def is_active_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ Inactive</span>')
    is_active_status.short_description = 'Status'
    
    actions = ['activate_subscriptions', 'cancel_subscriptions', 'renew_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        for sub in queryset:
            sub.activate()
        self.message_user(request, f"{queryset.count()} subscription(s) activated.")
    activate_subscriptions.short_description = "Activate selected subscriptions"
    
    def cancel_subscriptions(self, request, queryset):
        for sub in queryset:
            sub.cancel(at_period_end=True)
        self.message_user(request, f"{queryset.count()} subscription(s) cancelled.")
    cancel_subscriptions.short_description = "Cancel selected subscriptions"
    
    def renew_subscriptions(self, request, queryset):
        for sub in queryset:
            sub.renew()
        self.message_user(request, f"{queryset.count()} subscription(s) renewed.")
    renew_subscriptions.short_description = "Renew selected subscriptions"


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin for transactions."""
    
    list_display = [
        'reference', 'transaction_type', 'amount_display', 'status', 
        'payment_date', 'tenant_id_short'
    ]
    list_filter = ['status', 'transaction_type', 'currency']
    search_fields = ['reference', 'paystack_reference', 'tenant_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'reference']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('reference', 'tenant_id', 'subscription', 'invoice')
        }),
        ('Transaction Details', {
            'fields': ('transaction_type', 'amount', 'currency', 'tax_amount', 'total_amount')
        }),
        ('Status', {
            'fields': ('status', 'payment_date', 'error_message')
        }),
        ('Payment Method', {
            'fields': ('payment_method', 'card_last4', 'card_brand')
        }),
        ('PayStack Integration', {
            'fields': ('paystack_reference', 'paystack_access_code', 'paystack_response'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'metadata', 'retry_count'),
            'classes': ('collapse',)
        })
    )
    
    def amount_display(self, obj):
        return obj.amount_display
    amount_display.short_description = 'Amount'
    
    def tenant_id_short(self, obj):
        return str(obj.tenant_id)[:8]
    tenant_id_short.short_description = 'Tenant ID'
    
    actions = ['refund_transactions']
    
    def refund_transactions(self, request, queryset):
        # Only allow refund for successful transactions
        for transaction in queryset.filter(status='success'):
            transaction.status = 'refunded'
            transaction.save()
        self.message_user(request, f"{queryset.count()} transaction(s) marked as refunded.")
    refund_transactions.short_description = "Mark selected transactions as refunded"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin for invoices."""
    
    list_display = [
        'invoice_number', 'tenant_id_short', 'total_display', 'status', 
        'invoice_date', 'due_date', 'is_overdue'
    ]
    list_filter = ['status', 'currency']
    search_fields = ['invoice_number', 'tenant_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'invoice_number']
    
    fieldsets = (
        ('Invoice Information', {
            'fields': ('invoice_number', 'tenant_id', 'subscription')
        }),
        ('Dates', {
            'fields': ('invoice_date', 'due_date', 'paid_at')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'total_amount', 'currency')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('PDF', {
            'fields': ('pdf_url', 'pdf_generated_at')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'line_items', 'metadata'),
            'classes': ('collapse',)
        })
    )
    
    def total_display(self, obj):
        return obj.total_display
    total_display.short_description = 'Total'
    
    def tenant_id_short(self, obj):
        return str(obj.tenant_id)[:8]
    tenant_id_short.short_description = 'Tenant ID'
    
    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">⚠ Overdue</span>')
        return format_html('<span style="color: green;">✓ On Time</span>')
    is_overdue.short_description = 'Status'
    
    actions = ['mark_as_paid', 'mark_as_overdue']
    
    def mark_as_paid(self, request, queryset):
        for invoice in queryset:
            invoice.mark_paid()
        self.message_user(request, f"{queryset.count()} invoice(s) marked as paid.")
    mark_as_paid.short_description = "Mark selected invoices as paid"
    
    def mark_as_overdue(self, request, queryset):
        for invoice in queryset.filter(status='pending'):
            invoice.mark_overdue()
        self.message_user(request, f"{queryset.count()} invoice(s) marked as overdue.")
    mark_as_overdue.short_description = "Mark selected invoices as overdue"


@admin.register(WebhookEventLog)
class WebhookEventLogAdmin(admin.ModelAdmin):
    """Admin for webhook event logs."""
    
    list_display = [
        'event_type', 'processing_status', 'created_at', 'signature_valid_display'
    ]
    list_filter = ['event_type', 'processing_status', 'signature_valid']
    search_fields = ['event_idempotency_key', 'paystack_event_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'raw_payload']
    
    fieldsets = (
        ('Event Information', {
            'fields': ('event_type', 'event_idempotency_key', 'paystack_event_id', 'paystack_data_id')
        }),
        ('Processing', {
            'fields': ('processing_status', 'processed_at', 'processing_error', 'retry_count', 'last_retry_at')
        }),
        ('Signature', {
            'fields': ('signature_valid', 'signature_error')
        }),
        ('Payload', {
            'fields': ('raw_payload',),
            'classes': ('collapse',)
        }),
        ('Related', {
            'fields': ('related_transaction', 'related_subscription')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def signature_valid_display(self, obj):
        if obj.signature_valid:
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Invalid</span>')
    signature_valid_display.short_description = 'Signature'
    
    actions = ['retry_failed_webhooks']
    
    def retry_failed_webhooks(self, request, queryset):
        for webhook in queryset.filter(processing_status='failed', retry_count__lt=3):
            webhook.increment_retry()
            # Queue for retry
            from .tasks import process_webhook
            process_webhook.delay(webhook.id)
        self.message_user(request, f"{queryset.count()} webhook(s) queued for retry.")
    retry_failed_webhooks.short_description = "Retry selected failed webhooks"


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """Admin for payment methods."""
    
    list_display = [
        'payment_type', 'display_name', 'is_default', 'status', 'created_at'
    ]
    list_filter = ['payment_type', 'status', 'is_default']
    search_fields = ['authorization_code', 'customer_code', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Method', {
            'fields': ('tenant_id', 'payment_type', 'authorization_code', 'customer_code', 'email')
        }),
        ('Card Details', {
            'fields': ('card_last4', 'card_brand', 'card_expiry_month', 'card_expiry_year'),
            'classes': ('collapse',)
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_name'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('status', 'is_default', 'reusable')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        })
    )
    
    def display_name(self, obj):
        if obj.payment_type == 'card':
            return f"{obj.card_brand} •••• {obj.card_last4}"
        return obj.payment_type
    display_name.short_description = 'Details'


@admin.register(BillingAuditLog)
class BillingAuditLogAdmin(admin.ModelAdmin):
    """Admin for billing audit logs."""
    
    list_display = [
        'user_email', 'action', 'resource_type', 'success', 'created_at'
    ]
    list_filter = ['action', 'resource_type', 'success']
    search_fields = ['user_email', 'resource_id', 'tenant_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'before', 'after']
    
    fieldsets = (
        ('Audit Information', {
            'fields': ('user_id', 'user_email', 'user_role', 'tenant_id')
        }),
        ('Action', {
            'fields': ('action', 'resource_type', 'resource_id', 'resource_name')
        }),
        ('Changes', {
            'fields': ('before', 'after', 'changes', 'reason')
        }),
        ('Status', {
            'fields': ('success', 'error_message')
        }),
        ('Request Context', {
            'fields': ('user_ip', 'user_agent')
        }),
        ('Related', {
            'fields': ('related_transaction_id', 'related_subscription_id', 'related_invoice_id')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        })
    )
    
    def has_add_permission(self, request):
        """Prevent manual creation of audit logs."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent modification of audit logs."""
        return False