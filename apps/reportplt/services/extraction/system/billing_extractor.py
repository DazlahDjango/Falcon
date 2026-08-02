# apps/reportplt/services/extraction/system/billing_extractor.py
import logging
from typing import Dict, Any, List, Optional
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from apps.billing.models import (
    Subscription, SubscriptionPlan, Invoice, Transaction,
    PaymentMethod, FailedPaymentRetry, UsageRecord,
    TenantSubscriptionOverride, BillingAuditLog
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 1. Subscription Summary Extractor
# ---------------------------------------------------------------------------
class BillingSubscriptionSummaryExtractor:
    """Extracts subscription statuses, plan distribution, MRR, ARR, and billing intervals."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        qs = Subscription.objects.all()
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_subscriptions = qs.count()
        active_count = qs.filter(status=Subscription.STATUS_ACTIVE).count()
        trialing_count = qs.filter(status=Subscription.STATUS_TRIALING).count()
        past_due_count = qs.filter(status=Subscription.STATUS_PAST_DUE).count()
        cancelled_count = qs.filter(status=Subscription.STATUS_CANCELLED).count()
        expired_count = qs.filter(status=Subscription.STATUS_EXPIRED).count()
        pending_cancel_count = qs.filter(status=Subscription.STATUS_PENDING_CANCELLATION).count()

        # MRR & ARR calculation (amounts stored in smallest currency unit, e.g. KES cents)
        active_subs = qs.filter(status__in=[Subscription.STATUS_ACTIVE, Subscription.STATUS_TRIALING])
        monthly_mrr_cents = sum(
            sub.amount if sub.billing_interval == SubscriptionPlan.INTERVAL_MONTHLY else int(sub.amount / 12)
            for sub in active_subs
        )
        mrr = round(monthly_mrr_cents / 100.0, 2)
        arr = round(mrr * 12.0, 2)

        # Plan distribution
        plan_distribution = list(
            qs.values('plan__name', 'plan__plan_type')
            .annotate(count=Count('id'), total_revenue=Sum('amount'))
            .order_by('-count')
        )
        for p in plan_distribution:
            p['revenue_display'] = round((p['total_revenue'] or 0) / 100.0, 2)

        # Interval distribution
        interval_distribution = list(
            qs.values('billing_interval').annotate(count=Count('id')).order_by('-count')
        )

        # Subscription rows (capped at 150)
        subscription_rows = []
        for s in qs.select_related('plan').order_by('-created_at')[:150]:
            subscription_rows.append({
                'id': str(s.id),
                'subscription_code': s.subscription_code,
                'tenant_id': str(s.tenant_id),
                'plan_name': s.plan.name if s.plan else 'Unknown',
                'plan_type': s.plan.plan_type if s.plan else '',
                'status': s.status,
                'billing_interval': s.billing_interval,
                'amount_display': f"{s.currency} {s.amount / 100.0:.2f}",
                'current_period_end': s.current_period_end.isoformat() if s.current_period_end else None,
                'auto_renew': s.auto_renew,
                'cancel_at_period_end': s.cancel_at_period_end,
            })

        return {
            'summary': {
                'total_subscriptions': total_subscriptions,
                'active_count': active_count,
                'trialing_count': trialing_count,
                'past_due_count': past_due_count,
                'cancelled_count': cancelled_count,
                'expired_count': expired_count,
                'pending_cancellation_count': pending_cancel_count,
                'mrr': mrr,
                'arr': arr,
                'currency': 'KES',
                'plan_distribution': plan_distribution,
                'interval_distribution': interval_distribution,
            },
            'subscriptions': subscription_rows,
        }


# ---------------------------------------------------------------------------
# 2. Revenue & Financial Extractor
# ---------------------------------------------------------------------------
class BillingRevenueFinancialExtractor:
    """Extracts revenue metrics, VAT collected, net revenue, and invoice payment statuses."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)

        qs = Invoice.objects.filter(invoice_date__gte=cutoff)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_invoices = qs.count()
        paid_invoices = qs.filter(status=Invoice.STATUS_PAID)
        paid_count = paid_invoices.count()
        pending_count = qs.filter(status=Invoice.STATUS_PENDING).count()
        overdue_count = qs.filter(status=Invoice.STATUS_OVERDUE).count()
        cancelled_count = qs.filter(status=Invoice.STATUS_CANCELLED).count()

        # Financial totals
        gross_cents = paid_invoices.aggregate(val=Sum('total_amount'))['val'] or 0
        tax_cents = paid_invoices.aggregate(val=Sum('tax_amount'))['val'] or 0
        subtotal_cents = paid_invoices.aggregate(val=Sum('subtotal'))['val'] or 0
        outstanding_cents = qs.filter(status__in=[Invoice.STATUS_PENDING, Invoice.STATUS_OVERDUE]).aggregate(val=Sum('total_amount'))['val'] or 0

        gross_revenue = round(gross_cents / 100.0, 2)
        vat_tax_collected = round(tax_cents / 100.0, 2)
        net_revenue = round(subtotal_cents / 100.0, 2)
        outstanding_amount = round(outstanding_cents / 100.0, 2)

        payment_rate = round((paid_count / total_invoices * 100), 2) if total_invoices else 0.0

        # Status breakdown
        status_breakdown = list(
            qs.values('status').annotate(count=Count('id'), total_cents=Sum('total_amount')).order_by('-count')
        )
        for sb in status_breakdown:
            sb['total_display'] = round((sb['total_cents'] or 0) / 100.0, 2)

        # Invoice rows (capped at 100)
        invoice_rows = []
        for inv in qs.order_by('-invoice_date')[:100]:
            invoice_rows.append({
                'invoice_number': inv.invoice_number,
                'tenant_id': str(inv.tenant_id),
                'invoice_date': inv.invoice_date.isoformat(),
                'due_date': inv.due_date.isoformat(),
                'status': inv.status,
                'subtotal_display': f"{inv.currency} {inv.subtotal / 100.0:.2f}",
                'tax_display': f"{inv.currency} {inv.tax_amount / 100.0:.2f}",
                'total_display': f"{inv.currency} {inv.total_amount / 100.0:.2f}",
                'paid_at': inv.paid_at.isoformat() if inv.paid_at else None,
            })

        return {
            'summary': {
                'period_days': days,
                'total_invoices': total_invoices,
                'paid_count': paid_count,
                'pending_count': pending_count,
                'overdue_count': overdue_count,
                'cancelled_count': cancelled_count,
                'payment_rate_pct': payment_rate,
                'gross_revenue': gross_revenue,
                'vat_tax_collected': vat_tax_collected,
                'net_revenue': net_revenue,
                'outstanding_amount': outstanding_amount,
                'status_breakdown': status_breakdown,
            },
            'invoices': invoice_rows,
        }


# ---------------------------------------------------------------------------
# 3. Payment Transactions Extractor
# ---------------------------------------------------------------------------
class BillingPaymentTransactionsExtractor:
    """Extracts transaction volume, success rates, payment method channels, and error analysis."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)

        qs = Transaction.objects.filter(created_at__gte=cutoff)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_transactions = qs.count()
        successes = qs.filter(status=Transaction.STATUS_SUCCESS).count()
        failures = qs.filter(status=Transaction.STATUS_FAILED).count()
        refunds = qs.filter(status=Transaction.STATUS_REFUNDED).count()
        pending = qs.filter(status=Transaction.STATUS_PENDING).count()

        success_rate = round((successes / total_transactions * 100), 2) if total_transactions else 0.0

        # Type breakdown
        type_breakdown = list(
            qs.values('transaction_type').annotate(count=Count('id'), total_cents=Sum('total_amount')).order_by('-count')
        )

        # Payment method channel breakdown
        method_breakdown = list(
            qs.values('payment_method').annotate(count=Count('id')).order_by('-count')
        )

        # Saved payment methods count
        pm_qs = PaymentMethod.objects.filter(status__in=[PaymentMethod.STATUS_ACTIVE, PaymentMethod.STATUS_DEFAULT])
        if self.tenant_id:
            pm_qs = pm_qs.filter(tenant_id=self.tenant_id)
        saved_payment_methods_count = pm_qs.count()

        # Transaction rows (capped at 100)
        recent_transactions = []
        for t in qs.select_related('subscription').order_by('-created_at')[:100]:
            recent_transactions.append({
                'reference': t.reference,
                'paystack_reference': t.paystack_reference or '',
                'transaction_type': t.transaction_type,
                'status': t.status,
                'amount_display': f"{t.currency} {t.amount / 100.0:.2f}",
                'total_display': f"{t.currency} {t.total_amount / 100.0:.2f}",
                'payment_method': t.payment_method or 'unknown',
                'card_brand': t.card_brand or '',
                'card_last4': t.card_last4 or '',
                'payment_date': t.payment_date.isoformat() if t.payment_date else None,
                'error_message': t.error_message or '',
            })

        return {
            'summary': {
                'period_days': days,
                'total_transactions': total_transactions,
                'successes': successes,
                'failures': failures,
                'refunds': refunds,
                'pending': pending,
                'success_rate_pct': success_rate,
                'saved_payment_methods_count': saved_payment_methods_count,
                'type_breakdown': type_breakdown,
                'method_breakdown': method_breakdown,
            },
            'recent_transactions': recent_transactions,
        }


# ---------------------------------------------------------------------------
# 4. Usage Quota Audit Extractor
# ---------------------------------------------------------------------------
class BillingUsageQuotaAuditExtractor:
    """Extracts tenant usage consumption across feature metrics and quota breach warnings."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        qs = UsageRecord.objects.all()
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_records = qs.count()

        # Alert counts
        alert_80_count = qs.filter(alert_80_sent_at__isnull=False).count()
        alert_90_count = qs.filter(alert_90_sent_at__isnull=False).count()
        alert_100_count = qs.filter(alert_100_sent_at__isnull=False).count()

        # High utilization records (>80% used)
        high_utilization = list(
            qs.filter(percentage_used__gte=80.0)
            .values('tenant_id', 'usage_type', 'current_value', 'limit_value', 'percentage_used')
            .order_by('-percentage_used')[:50]
        )

        # Usage type breakdown with avg utilization
        type_breakdown = list(
            qs.values('usage_type').annotate(
                count=Count('id'),
                avg_percentage=Avg('percentage_used'),
                total_current=Sum('current_value')
            ).order_by('-count')
        )
        for tb in type_breakdown:
            tb['avg_percentage'] = round(tb['avg_percentage'] or 0.0, 2)

        return {
            'summary': {
                'total_monitored_metrics': total_records,
                'alert_80_sent_count': alert_80_count,
                'alert_90_sent_count': alert_90_count,
                'alert_100_breached_count': alert_100_count,
                'high_utilization_count': len(high_utilization),
                'usage_type_breakdown': type_breakdown,
            },
            'high_utilization_records': high_utilization,
        }


# ---------------------------------------------------------------------------
# 5. Dunning & Recovery Extractor
# ---------------------------------------------------------------------------
class BillingDunningRecoveryExtractor:
    """Extracts dunning retry pipelines, past-due subscriptions, and payment recovery rates."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        qs = FailedPaymentRetry.objects.all()
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_retries = qs.count()
        pending = qs.filter(status=FailedPaymentRetry.RETRY_STATUS_PENDING).count()
        successful = qs.filter(status=FailedPaymentRetry.RETRY_STATUS_SUCCESS).count()
        failed = qs.filter(status=FailedPaymentRetry.RETRY_STATUS_FAILED).count()
        skipped = qs.filter(status=FailedPaymentRetry.RETRY_STATUS_SKIPPED).count()

        recovery_rate = round((successful / total_retries * 100), 2) if total_retries else 0.0

        # Subscriptions currently past due or in grace period
        past_due_subs = Subscription.objects.filter(status=Subscription.STATUS_PAST_DUE)
        if self.tenant_id:
            past_due_subs = past_due_subs.filter(tenant_id=self.tenant_id)

        past_due_count = past_due_subs.count()
        in_grace_period_count = past_due_subs.filter(grace_period_ends_at__gt=timezone.now()).count()

        past_due_rows = []
        for s in past_due_subs.select_related('plan')[:50]:
            past_due_rows.append({
                'subscription_code': s.subscription_code,
                'tenant_id': str(s.tenant_id),
                'plan_name': s.plan.name if s.plan else '',
                'amount_display': f"{s.currency} {s.amount / 100.0:.2f}",
                'grace_period_ends_at': s.grace_period_ends_at.isoformat() if s.grace_period_ends_at else None,
                'suspension_reason': s.suspension_reason or '',
            })

        return {
            'summary': {
                'total_retry_attempts': total_retries,
                'pending_retries': pending,
                'successful_recoveries': successful,
                'failed_retries': failed,
                'skipped_retries': skipped,
                'recovery_rate_pct': recovery_rate,
                'past_due_subscriptions_count': past_due_count,
                'in_grace_period_count': in_grace_period_count,
            },
            'past_due_subscriptions': past_due_rows,
        }


# ---------------------------------------------------------------------------
# 6. Master Billing Unified Extractor
# ---------------------------------------------------------------------------
class BillingUnifiedExtractor:
    """Master Unified Extractor orchestrating all real-data billing report extractions."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.sub_extractor = BillingSubscriptionSummaryExtractor(tenant_id, filters)
        self.revenue_extractor = BillingRevenueFinancialExtractor(tenant_id, filters)
        self.transaction_extractor = BillingPaymentTransactionsExtractor(tenant_id, filters)
        self.usage_extractor = BillingUsageQuotaAuditExtractor(tenant_id, filters)
        self.dunning_extractor = BillingDunningRecoveryExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        sub_data = self.sub_extractor.extract()
        rev_data = self.revenue_extractor.extract()
        tx_data = self.transaction_extractor.extract()
        usage_data = self.usage_extractor.extract()
        dunning_data = self.dunning_extractor.extract()

        ss = sub_data['summary']
        rs = rev_data['summary']
        ts = tx_data['summary']
        us = usage_data['summary']
        ds = dunning_data['summary']

        # Calculate Financial Health Score (0–100)
        # Components: payment rate (35%), recovery rate (25%), active ratio (20%), low quota breach ratio (20%)
        active_ratio = (ss.get('active_count', 0) / max(ss.get('total_subscriptions', 1), 1)) * 100
        payment_rate = rs.get('payment_rate_pct', 0.0)
        recovery_rate = ds.get('recovery_rate_pct', 0.0)
        health_score = round(
            (payment_rate * 0.35) +
            (recovery_rate * 0.25) +
            (active_ratio * 0.20) +
            (max(0, 100 - us.get('alert_100_breached_count', 0)) * 0.20),
            2
        )

        return {
            'source': 'billing',
            'extracted_at': timezone.now().isoformat(),
            'subscription_summary': sub_data,
            'revenue_financial': rev_data,
            'payment_transactions': tx_data,
            'usage_quota': usage_data,
            'dunning_recovery': dunning_data,
            'summary': {
                'mrr': ss.get('mrr', 0.0),
                'arr': ss.get('arr', 0.0),
                'total_subscriptions': ss.get('total_subscriptions', 0),
                'active_subscriptions': ss.get('active_count', 0),
                'trialing_subscriptions': ss.get('trialing_count', 0),
                'past_due_subscriptions': ss.get('past_due_count', 0),
                'gross_revenue': rs.get('gross_revenue', 0.0),
                'vat_tax_collected': rs.get('vat_tax_collected', 0.0),
                'net_revenue': rs.get('net_revenue', 0.0),
                'payment_rate_pct': rs.get('payment_rate_pct', 0.0),
                'transaction_success_rate_pct': ts.get('success_rate_pct', 0.0),
                'quota_breaches': us.get('alert_100_breached_count', 0),
                'dunning_recovery_rate_pct': ds.get('recovery_rate_pct', 0.0),
                'financial_health_score': health_score,
            }
        }


# Aliases for backwards compatibility
BillingDataExtractor = BillingUnifiedExtractor
