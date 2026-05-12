import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from apps.billing.models import Subscription, Invoice, Payment
from apps.billing.services.audit_service import BillingAuditService
logger = logging.getLogger(__name__)

class BillingNotificationService:
    def __init__(self):
        self.audit = BillingAuditService()
    
    def send_subscription_created_notification(self, subscription: Subscription) -> bool:
        tenant = subscription.tenant
        context = {
            'tenant_name': tenant.name,
            'plan_name': subscription.plan.name,
            'status': subscription.status,
            'billing_interval': subscription.billing_interval,
            'trial_end': subscription.trial_end,
            'current_period_end': subscription.current_period_end,
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Subscription Created - {tenant.name}",
            template='billing/email/subscription_created.html',
            context=context
        )
    
    def send_subscription_updated_notification(self, subscription: Subscription, changes: Dict) -> bool:
        tenant = subscription.tenant
        context = {
            'tenant_name': tenant.name,
            'plan_name': subscription.plan.name,
            'status': subscription.status,
            'changes': changes,
            'current_period_end': subscription.current_period_end,
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Subscription Updated - {tenant.name}",
            template='billing/email/subscription_updated.html',
            context=context
        )
    
    def send_subscription_cancelled_notification(self, subscription: Subscription, at_period_end: bool) -> bool:
        tenant = subscription.tenant
        context = {
            'tenant_name': tenant.name,
            'plan_name': subscription.plan.name,
            'at_period_end': at_period_end,
            'effective_date': subscription.current_period_end if at_period_end else timezone.now(),
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Subscription Cancelled - {tenant.name}",
            template='billing/email/subscription_cancelled.html',
            context=context
        )
    
    def send_invoice_created_notification(self, invoice: Invoice) -> bool:
        tenant = invoice.tenant
        context = {
            'tenant_name': tenant.name,
            'invoice_number': invoice.invoice_number,
            'amount': invoice.amount_due,
            'currency': invoice.currency,
            'due_date': invoice.due_date,
            'invoice_url': invoice.invoice_pdf_url or f"{settings.FRONTEND_URL}/billing/invoices/{invoice.id}",
            'dashboard_url': f"{settings.FRONTEND_URL}/billing"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"New Invoice {invoice.invoice_number} - {tenant.name}",
            template='billing/email/invoice_created.html',
            context=context
        )
    
    def send_payment_received_notification(self, payment: Payment) -> bool:
        tenant = payment.tenant
        invoice = payment.invoice
        context = {
            'tenant_name': tenant.name,
            'amount': payment.amount,
            'currency': payment.currency,
            'payment_date': payment.payment_date,
            'invoice_number': invoice.invoice_number if invoice else 'N/A',
            'receipt_url': payment.receipt_url,
            'dashboard_url': f"{settings.FRONTEND_URL}/billing"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Payment Received - {tenant.name}",
            template='billing/email/payment_received.html',
            context=context
        )
    
    def send_payment_failed_notification(self, payment: Payment) -> bool:
        tenant = payment.tenant
        context = {
            'tenant_name': tenant.name,
            'amount': payment.amount,
            'currency': payment.currency,
            'failure_reason': payment.failure_reason,
            'retry_url': f"{settings.FRONTEND_URL}/billing/payment-methods",
            'dashboard_url': f"{settings.FRONTEND_URL}/billing"
        }
        self.audit.log_payment_failure(payment, payment.failure_reason)
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Payment Failed - {tenant.name}",
            template='billing/email/payment_failed.html',
            context=context
        )
    
    def send_upcoming_invoice_reminder(self, subscription: Subscription, days_before: int) -> bool:
        tenant = subscription.tenant
        amount = subscription.plan.price_monthly if subscription.billing_interval == 'month' else subscription.plan.price_yearly
        context = {
            'tenant_name': tenant.name,
            'plan_name': subscription.plan.name,
            'amount': amount,
            'currency': subscription.plan.currency,
            'days_before': days_before,
            'renewal_date': subscription.current_period_end,
            'dashboard_url': f"{settings.FRONTEND_URL}/billing"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Upcoming Invoice - {tenant.name}",
            template='billing/email/upcoming_invoice.html',
            context=context
        )
    
    def send_trial_ending_notification(self, subscription: Subscription) -> bool:
        tenant = subscription.tenant
        days_left = (subscription.trial_end - timezone.now()).days if subscription.trial_end else 0
        context = {
            'tenant_name': tenant.name,
            'plan_name': subscription.plan.name,
            'days_left': max(0, days_left),
            'trial_end': subscription.trial_end,
            'price_monthly': subscription.plan.price_monthly,
            'currency': subscription.plan.currency,
            'upgrade_url': f"{settings.FRONTEND_URL}/billing/upgrade",
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Trial Ending Soon - {tenant.name}",
            template='billing/email/trial_ending.html',
            context=context
        )
    
    def send_quota_alert(self, tenant, resource: str, current: int, max_limit: int) -> bool:
        context = {
            'tenant_name': tenant.name,
            'resource': resource.replace('_', ' ').title(),
            'current': current,
            'max_limit': max_limit,
            'percentage': round((current / max_limit) * 100, 2),
            'dashboard_url': f"{settings.FRONTEND_URL}/settings/billing"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Quota Alert - {tenant.name}",
            template='billing/email/quota_alert.html',
            context=context
        )
    
    def send_subscription_status_alert(self, subscription: Subscription) -> bool:
        tenant = subscription.tenant
        context = {
            'tenant_name': tenant.name,
            'status': subscription.status,
            'plan_name': subscription.plan.name,
            'current_period_end': subscription.current_period_end,
            'dashboard_url': f"{settings.FRONTEND_URL}/billing",
            'support_url': f"{settings.FRONTEND_URL}/support"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Subscription Alert: {subscription.status} - {tenant.name}",
            template='billing/email/subscription_alert.html',
            context=context
        )
    
    def send_overdue_invoice_alert(self, invoice: Invoice) -> bool:
        tenant = invoice.tenant
        context = {
            'tenant_name': tenant.name,
            'invoice_number': invoice.invoice_number,
            'amount': invoice.amount_due,
            'currency': invoice.currency,
            'due_date': invoice.due_date,
            'days_overdue': (timezone.now() - invoice.due_date).days if invoice.due_date else 0,
            'invoice_url': f"{settings.FRONTEND_URL}/billing/invoices/{invoice.id}",
            'dashboard_url': f"{settings.FRONTEND_URL}/billing"
        }
        return self._send_email(
            to_email=tenant.contact_email or tenant.settings.get('billing_email'),
            subject=f"Overdue Invoice {invoice.invoice_number} - {tenant.name}",
            template='billing/email/overdue_invoice.html',
            context=context
        )
    
    def _send_email(self, to_email: str, subject: str, template: str, context: Dict, from_email: str = None) -> bool:
        if not to_email:
            logger.warning(f"No email address provided for notification: {subject}")
            return False
        try:
            from_email = from_email or settings.DEFAULT_FROM_EMAIL
            html_message = render_to_string(template, context)
            plain_message = render_to_string(template.replace('.html', '.txt'), context)
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=from_email,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False
            )
            logger.info(f"Sent email notification to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False