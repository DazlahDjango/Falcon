import logging
from typing import Optional, Dict, Any, List
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from ...models import Subscription, Transaction, Invoice
from ...exceptions import SubscriptionError
from ..paystack.client import PayStackClient
from ..billing.invoice import InvoiceService
from ..audit.logger import audit_logger

logger = logging.getLogger(__name__)

class RenewalService:
    def __init__(self):
        self.paystack_client = PayStackClient()
        self.invoice_service = InvoiceService()

    @transaction.atomic
    def process_auto_renewal(self, subscription: Subscription) -> bool:
        if not subscription.auto_renew:
            logger.info(f"Auto-renew disabled for {subscription.subscription_code}")
            return False
        if subscription.cancel_at_period_end:
            logger.info(f"Subscription {subscription.subscription_code} scheduled for cancellation")
            return False
        try:
            invoice = self.invoice_service.create_for_subscription(subscription, is_renewal=True)
            if subscription.paystack_authorization_code:
                charge_result = self._charge_with_auth_code(subscription, invoice)
                if charge_result['success']:
                    self._complete_renewal(subscription, invoice, charge_result)
                    return True
                else:
                    subscription.mark_past_due()
                    self._send_renewal_failed_notification(subscription)
                    return False
            else:
                self._send_renewal_invoice_notification(subscription, invoice)
                return False
        except Exception as e:
            logger.error(f"Auto-renewal failed for {subscription.subscription_code}: {str(e)}")
            subscription.mark_past_due()
            return False

    def _charge_with_auth_code(self, subscription: Subscription, invoice: Invoice) -> Dict[str, Any]:
        try:
            from apps.tenant.models import Organization
            tenant = Organization.objects.get(id=subscription.tenant_id)
            email = tenant.contact_email or f"tenant-{subscription.tenant_id}@falconpms.com"
            response = self.paystack_client.initialize_transaction(email=email, amount=invoice.total_amount, reference=None, metadata={'tenant_id': str(subscription.tenant_id), 'subscription_code': subscription.subscription_code, 'invoice_id': str(invoice.id), 'renewal': True})
            charge_response = self.paystack_client._request('POST', '/transaction/charge_authorization', data={'authorization_code': subscription.paystack_authorization_code, 'email': email, 'amount': invoice.total_amount, 'reference': response.get('reference')})
            if charge_response.get('status') == 'success':
                return {'success': True, 'reference': response.get('reference'), 'data': charge_response}
            else:
                return {'success': False, 'error': charge_response.get('message')}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _complete_renewal(self, subscription: Subscription, invoice: Invoice, charge_result: Dict):
        from .lifecycle import SubscriptionLifecycleService
        lifecycle = SubscriptionLifecycleService()
        new_period_end = subscription.current_period_end + timedelta(days=30 if subscription.billing_interval == 'monthly' else 365)
        subscription.renew(new_period_end)
        invoice.mark_paid()
        Transaction.objects.create(tenant_id=subscription.tenant_id, subscription=subscription, invoice=invoice, reference=charge_result.get('reference'), transaction_type=Transaction.TYPE_RENEWAL, amount=invoice.subtotal, tax_amount=invoice.tax_amount, total_amount=invoice.total_amount, currency=invoice.currency, status=Transaction.STATUS_SUCCESS, payment_date=timezone.now())
        audit_logger.log(user=None, tenant_id=subscription.tenant_id, action='renew', resource_type='subscription', resource_id=subscription.id, after={'current_period_end': subscription.current_period_end.isoformat()}, metadata={'renewal_type': 'auto'})
        logger.info(f"Auto-renewal successful for {subscription.subscription_code}")

    def process_due_renewals(self) -> Dict[str, int]:
        due_subscriptions = Subscription.objects.subscriptions_due_for_renewal()
        stats = {'total_due': due_subscriptions.count(), 'successful': 0, 'failed': 0}
        for subscription in due_subscriptions:
            if self.process_auto_renewal(subscription):
                stats['successful'] += 1
            else:
                stats['failed'] += 1
        logger.info(f"Processed renewals: {stats}")
        return stats

    def send_renewal_reminders(self, days_before: List[int] = [30, 14, 7, 3, 1]) -> int:
        sent_count = 0
        for days in days_before:
            expiring_subs = Subscription.objects.expiring_soon(days)
            for subscription in expiring_subs:
                reminder_key = f"renewal_reminder_{days}_sent"
                if subscription.metadata.get(reminder_key):
                    continue
                self._send_renewal_reminder(subscription, days)
                metadata = subscription.metadata or {}
                metadata[reminder_key] = True
                subscription.metadata = metadata
                subscription.save(update_fields=['metadata'])
                sent_count += 1
        return sent_count

    def _send_renewal_reminder(self, subscription: Subscription, days_left: int):
        from apps.tenant.models import Organization
        try:
            tenant = Organization.objects.get(id=subscription.tenant_id)
            email = tenant.contact_email
            if not email:
                return
            subject = f"Subscription Renewal Reminder - {days_left} days left"
            message = f"Dear {tenant.name},\n\nYour {subscription.plan.name} subscription will expire in {days_left} days on {subscription.current_period_end.strftime('%B %d, %Y')}.\n\nTo avoid service interruption, please ensure your payment method is up to date or manually renew at:\n{getattr(settings, 'BASE_URL', '')}/billing/subscriptions/{subscription.id}\n\nBest regards,\nFalcon PMS Team"
            send_mail(subject=subject, message=message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), recipient_list=[email], fail_silently=True)
            logger.info(f"Sent renewal reminder to {email} for {subscription.subscription_code}")
        except Client.DoesNotExist:
            logger.warning(f"Tenant not found for subscription {subscription.subscription_code}")

    def _send_renewal_failed_notification(self, subscription: Subscription):
        from apps.tenant.models import Organization
        try:
            tenant = Organization.objects.get(id=subscription.tenant_id)
            email = tenant.contact_email
            if not email:
                return
            subject = "Subscription Renewal Failed - Action Required"
            message = f"Dear {tenant.name},\n\nWe were unable to automatically renew your {subscription.plan.name} subscription.\n\nPlease update your payment method or manually renew at:\n{getattr(settings, 'BASE_URL', '')}/billing/subscriptions/{subscription.id}\n\nIf not renewed by {subscription.current_period_end.strftime('%B %d, %Y')}, your subscription will expire.\n\nBest regards,\nFalcon PMS Team"
            send_mail(subject=subject, message=message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), recipient_list=[email], fail_silently=True)
        except Client.DoesNotExist:
            logger.warning(f"Tenant not found for subscription {subscription.subscription_code}")

    def _send_renewal_invoice_notification(self, subscription: Subscription, invoice: Invoice):
        from apps.tenant.models import Organization
        try:
            tenant = Organization.objects.get(id=subscription.tenant_id)
            email = tenant.contact_email
            if not email:
                return
            subject = f"Subscription Renewal Invoice Ready - {invoice.invoice_number}"
            message = f"Dear {tenant.name},\n\nYour {subscription.plan.name} subscription is due for renewal.\n\nInvoice Amount: {invoice.total_amount/100} {invoice.currency}\nDue Date: {invoice.due_date.strftime('%B %d, %Y')}\n\nPlease pay your invoice at:\n{getattr(settings, 'BASE_URL', '')}/invoices/{invoice.id}\n\nBest regards,\nFalcon PMS Team"
            send_mail(subject=subject, message=message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), recipient_list=[email], fail_silently=True)
        except Organization.DoesNotExist:
            logger.warning(f"Tenant not found for subscription {subscription.subscription_code}")
