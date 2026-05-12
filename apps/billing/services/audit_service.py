import logging
import json
from typing import Optional, Dict, Any
from django.utils import timezone
from django.db import transaction
from django.db.models import Model
from apps.billing.models import Subscription, Invoice, Payment, SubscriptionHistory
logger = logging.getLogger(__name__)

class BillingAuditService:
    def __init__(self):
        self._audit_logger = logging.getLogger('billing.audit')
    def log_subscription_creation(self, subscription: Subscription, user=None, metadata: Dict = None) -> None:
        self._log_event(
            event_type='subscription.created',
            entity_type='subscription',
            entity_id=str(subscription.id),
            user=user,
            data={
                'tenant_id': str(subscription.tenant_id),
                'plan_id': str(subscription.plan_id),
                'plan_name': subscription.plan.name,
                'billing_interval': subscription.billing_interval,
                'status': subscription.status,
                'metadata': metadata or {}
            }
        )
        SubscriptionHistory.objects.create(
            subscription=subscription,
            previous_status=None,
            new_status=subscription.status,
            change_reason='Subscription created',
            metadata=metadata or {}
        )
    def log_subscription_change(self, subscription: Subscription, user=None, old_value: Dict = None, new_value: Dict = None, reason: str = None) -> None:
        self._log_event(
            event_type='subscription.updated',
            entity_type='subscription',
            entity_id=str(subscription.id),
            user=user,
            data={
                'tenant_id': str(subscription.tenant_id),
                'old': old_value,
                'new': new_value,
                'reason': reason
            }
        )
        SubscriptionHistory.objects.create(
            subscription=subscription,
            previous_plan_id=old_value.get('plan_id') if old_value else None,
            new_plan_id=new_value.get('plan_id') if new_value else None,
            previous_status=old_value.get('status') if old_value else None,
            new_status=new_value.get('status') if new_value else None,
            change_reason=reason or 'Subscription updated',
            metadata={
                'old': old_value,
                'new': new_value
            }
        )
    def log_subscription_cancellation(self, subscription: Subscription, user=None, metadata: Dict = None, at_period_end: bool = True) -> None:
        self._log_event(
            event_type='subscription.cancelled',
            entity_type='subscription',
            entity_id=str(subscription.id),
            user=user,
            data={
                'tenant_id': str(subscription.tenant_id),
                'at_period_end': at_period_end,
                'canceled_at': timezone.now().isoformat(),
                'metadata': metadata or {}
            }
        )
        SubscriptionHistory.objects.create(
            subscription=subscription,
            previous_status=subscription.status,
            new_status='canceled' if not at_period_end else subscription.status,
            change_reason=f"Cancelled {'at period end' if at_period_end else 'immediately'}",
            metadata=metadata or {}
        )
    def log_payment_received(
        self,
        payment: Payment,
        amount: float,
        currency: str,
        user=None
    ) -> None:
        """Log payment received event."""
        self._log_event(
            event_type='payment.received',
            entity_type='payment',
            entity_id=str(payment.id),
            user=user,
            data={
                'tenant_id': str(payment.tenant_id),
                'amount': str(amount),
                'currency': currency,
                'stripe_payment_intent_id': payment.stripe_payment_intent_id,
                'status': payment.status
            },
            severity='info'
        )
    
    def log_payment_failure(
        self,
        payment: Payment,
        failure_reason: str,
        user=None
    ) -> None:
        """Log payment failure event."""
        self._log_event(
            event_type='payment.failed',
            entity_type='payment',
            entity_id=str(payment.id),
            user=user,
            data={
                'tenant_id': str(payment.tenant_id),
                'amount': str(payment.amount),
                'currency': payment.currency,
                'failure_reason': failure_reason,
                'stripe_payment_intent_id': payment.stripe_payment_intent_id
            },
            severity='warning'
        )
    
    def log_invoice_generated(
        self,
        invoice: Invoice,
        user=None,
        metadata: Dict = None
    ) -> None:
        """Log invoice generation event."""
        self._log_event(
            event_type='invoice.generated',
            entity_type='invoice',
            entity_id=invoice.invoice_number,
            user=user,
            data={
                'tenant_id': str(invoice.tenant_id),
                'amount': str(invoice.amount_due),
                'currency': invoice.currency,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'metadata': metadata or {}
            }
        )
    
    def log_webhook_received(
        self,
        event_type: str,
                stripe_event_id: str,
        payload: Dict,
        processed: bool = False,
        error: str = None
    ) -> None:
        """Log webhook event received from Stripe."""
        self._log_event(
            event_type=f'webhook.{event_type}',
            entity_type='webhook',
            entity_id=stripe_event_id,
            user=None,
            data={
                'stripe_event_id': stripe_event_id,
                'event_type': event_type,
                'processed': processed,
                'error': error,
                'payload_summary': self._summarize_payload(payload)
            },
            severity='info' if processed else 'error'
        )
    
    def log_quota_exceeded(self, tenant_id: str, resource: str, current: int, limit: int, user=None) -> None:
        self._log_event(
            event_type='quota.exceeded',
            entity_type='tenant',
            entity_id=tenant_id,
            user=user,
            data={
                'resource': resource,
                'current': current,
                'limit': limit
            },
            severity='warning'
        )
    
    def log_feature_access_denied(
        self,
        tenant_id: str,
        feature: str,
        required_plan: str,
        user=None,
        request_path: str = None
    ) -> None:
        """Log feature access denied event."""
        self._log_event(
            event_type='feature.access_denied',
            entity_type='tenant',
            entity_id=tenant_id,
            user=user,
            data={
                'feature': feature,
                'required_plan': required_plan,
                'request_path': request_path
            },
            severity='warning'
        )
    
    def log_stripe_sync(self, operation: str, entity_type: str, entity_id: str, success: bool, error: str = None, user=None) -> None:
        self._log_event(
            event_type=f'sync.{operation}',
            entity_type=entity_type,
            entity_id=entity_id,
            user=user,
            data={
                'success': success,
                'error': error,
                'operation': operation
            },
            severity='info' if success else 'error'
        )
    
    def log_billing_operation(self, operation: str, tenant_id: str, details: Dict, user=None, success: bool = True, error: str = None) -> None:
        self._log_event(
            event_type=f'billing.{operation}',
            entity_type='tenant',
            entity_id=tenant_id,
            user=user,
            data={
                'operation': operation,
                'details': details,
                'success': success,
                'error': error
            },
            severity='info' if success else 'error'
        )
    
    def _log_event(self, event_type: str, entity_type: str, entity_id: str, user, data: Dict, severity: str = 'info') -> None:
        log_entry = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'severity': severity,
            'data': data
        }
        if user:
            log_entry['user_id'] = str(user.id) if hasattr(user, 'id') else str(user)
            log_entry['user_email'] = getattr(user, 'email', None)
        if severity == 'error':
            self._audit_logger.error(json.dumps(log_entry))
        elif severity == 'warning':
            self._audit_logger.warning(json.dumps(log_entry))
        else:
            self._audit_logger.info(json.dumps(log_entry))
        logger.debug(f"Audit: {event_type} - {entity_type}:{entity_id}")
    
    def _summarize_payload(self, payload: Dict, max_size: int = 500) -> Dict:
        if not payload:
            return {}
        safe_payload = {}
        sensitive_fields = ['card', 'cvc', 'number', 'exp_month', 'exp_year']
        for key, value in payload.items():
            if key in sensitive_fields:
                safe_payload[key] = '[REDACTED]'
            elif isinstance(value, dict):
                safe_payload[key] = self._summarize_payload(value, max_size)
            elif isinstance(value, str) and len(value) > max_size:
                safe_payload[key] = value[:max_size] + '...'
            else:
                safe_payload[key] = value
        return safe_payload