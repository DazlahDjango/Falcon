import logging
from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from apps.billing.models import Invoice, Subscription
from apps.billing.exceptions import InvoiceError as SyncError
logger = logging.getLogger(__name__)

class InvoiceSync:
    def __init__(self):
        self.stripe = StripeClient()
    
    @transaction.atomic
    def sync_invoice(self, stripe_invoice_id: str) -> Optional[Invoice]:
        try:
            stripe_invoice = self.stripe.get_invoice(stripe_invoice_id)
            return self._sync_single_invoice(stripe_invoice)
        except Exception as e:
            logger.error(f"Failed to sync invoice {stripe_invoice_id}: {str(e)}")
            raise SyncError(f"Failed to sync invoice: {str(e)}")
    
    def _sync_single_invoice(self, stripe_invoice) -> Invoice:
        subscription = None
        if stripe_invoice.subscription:
            try:
                subscription = Subscription.objects.get(
                    stripe_subscription_id=stripe_invoice.subscription
                )
            except Subscription.DoesNotExist:
                logger.warning(f"Subscription not found for {stripe_invoice.subscription}")
        status = self._map_invoice_status(stripe_invoice.status)
        invoice, created = Invoice.objects.update_or_create(
            stripe_invoice_id=stripe_invoice.id,
            defaults={
                'subscription': subscription,
                'tenant_id': self._extract_tenant_id(stripe_invoice.metadata),
                'invoice_number': stripe_invoice.number or '',
                'status': status,
                'amount_due': Decimal(stripe_invoice.amount_due) / 100,
                'amount_paid': Decimal(stripe_invoice.amount_paid) / 100,
                'amount_remaining': Decimal(stripe_invoice.amount_remaining) / 100,
                'currency': stripe_invoice.currency.upper(),
                'invoice_date': timezone.fromtimestamp(stripe_invoice.created),
                'due_date': timezone.fromtimestamp(stripe_invoice.due_date) if stripe_invoice.due_date else None,
                'period_start': timezone.fromtimestamp(stripe_invoice.period_start),
                'period_end': timezone.fromtimestamp(stripe_invoice.period_end),
                'invoice_pdf_url': stripe_invoice.invoice_pdf,
                'metadata': {
                    'stripe_metadata': stripe_invoice.metadata,
                    'hosted_invoice_url': stripe_invoice.hosted_invoice_url,
                    'last_synced': timezone.now().isoformat()
                }
            }
        )
        self._sync_line_items(invoice, stripe_invoice)
        if created:
            logger.info(f"Created invoice: {invoice.invoice_number}")
        else:
            logger.info(f"Updated invoice: {invoice.invoice_number}")
        return invoice
    
    def _sync_line_items(self, invoice: Invoice, stripe_invoice):
        InvoiceLineItem.objects.filter(invoice=invoice).delete()
        for stripe_line_item in stripe_invoice.lines.auto_paging_iter():
            InvoiceLineItem.objects.create(
                invoice=invoice,
                description=stripe_line_item.description or '',
                quantity=stripe_line_item.quantity or 1,
                unit_amount=Decimal(stripe_line_item.unit_amount or 0) / 100,
                amount=Decimal(stripe_line_item.amount) / 100,
                stripe_price_id=stripe_line_item.price.id if stripe_line_item.price else '',
                metadata={
                    'stripe_line_item_id': stripe_line_item.id,
                    'plan_name': stripe_line_item.plan.nickname if stripe_line_item.plan else None
                }
            )
        logger.info(f"Synced {InvoiceLineItem.objects.filter(invoice=invoice).count()} line items for invoice {invoice.invoice_number}")
    
    def _map_invoice_status(self, stripe_status: str) -> str:
        status_map = {
            'draft': Invoice.STATUS_DRAFT,
            'open': Invoice.STATUS_OPEN,
            'paid': Invoice.STATUS_PAID,
            'uncollectible': Invoice.STATUS_UNCOLLECTIBLE,
            'void': Invoice.STATUS_VOID,
        }
        return status_map.get(stripe_status, Invoice.STATUS_OPEN)
    
    def _extract_tenant_id(self, metadata: Dict) -> Optional[str]:
        if metadata and 'tenant_id' in metadata:
            return metadata['tenant_id']
        return None
    
    def sync_invoices_for_subscription(self, subscription: Subscription) -> List[Invoice]:
        try:
            invoices = self.stripe.stripe.Invoice.list(
                subscription=subscription.stripe_subscription_id,
                limit=100
            )
            synced_invoices = []
            for stripe_invoice in invoices.auto_paging_iter():
                invoice = self._sync_single_invoice(stripe_invoice)
                synced_invoices.append(invoice)
            logger.info(f"Synced {len(synced_invoices)} invoices for subscription {subscription.id}")
            return synced_invoices    
        except Exception as e:
            logger.error(f"Failed to sync invoices for subscription {subscription.id}: {str(e)}")
            raise SyncError(f"Failed to sync invoices: {str(e)}")
    
    def sync_outstanding_invoices(self, tenant) -> List[Invoice]:
        subscription = getattr(tenant, 'subscription', None)
        if not subscription or not subscription.stripe_customer_id:
            return []
        try:
            invoices = self.stripe.stripe.Invoice.list(
                customer=subscription.stripe_customer_id,
                status='open',
                limit=50
            )
            synced_invoices = []
            for stripe_invoice in invoices.auto_paging_iter():
                invoice = self._sync_single_invoice(stripe_invoice)
                synced_invoices.append(invoice)
            return synced_invoices
        except Exception as e:
            logger.error(f"Failed to sync outstanding invoices: {str(e)}")
            return []