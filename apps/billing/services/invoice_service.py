import logging
from decimal import Decimal
from typing import Optional, Dict, Any, List
from django.db import transaction
from django.utils import timezone
from apps.billing.models import Invoice, InvoiceLineItem, Subscription
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.audit_service import BillingAuditService
from apps.billing.exceptions import InvoiceError
logger = logging.getLogger(__name__)

class InvoiceService:
    def __init__(self):
        self.stripe = StripeClient()
        self.audit = BillingAuditService()
    
    def sync_invoice(self, stripe_invoice_id: str) -> Optional[Invoice]:
        try:
            stripe_invoice = self.stripe.get_invoice(stripe_invoice_id)
            subscription = None
            if stripe_invoice.subscription:
                subscription = Subscription.objects.filter(
                    stripe_subscription_id=stripe_invoice.subscription
                ).first()
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
                        'hosted_invoice_url': stripe_invoice.hosted_invoice_url
                    }
                }
            )
            self._sync_line_items(invoice, stripe_invoice)
            if created:
                self.audit.log_invoice_generated(invoice)
                logger.info(f"Created invoice: {invoice.invoice_number}")
            else:
                logger.info(f"Updated invoice: {invoice.invoice_number}")
            return invoice
        except Exception as e:
            logger.error(f"Failed to sync invoice {stripe_invoice_id}: {str(e)}")
            raise InvoiceError(f"Invoice sync failed: {str(e)}")
    
    def _sync_line_items(self, invoice: Invoice, stripe_invoice) -> None:
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
    
    def get_invoice_pdf(self, invoice: Invoice) -> Optional[str]:
        if invoice.invoice_pdf_url:
            return invoice.invoice_pdf_url
        try:
            stripe_invoice = self.stripe.get_invoice(invoice.stripe_invoice_id)
            if stripe_invoice.invoice_pdf:
                invoice.invoice_pdf_url = stripe_invoice.invoice_pdf
                invoice.save(update_fields=['invoice_pdf_url'])
                return stripe_invoice.invoice_pdf
        except Exception as e:
            logger.error(f"Failed to fetch PDF for invoice {invoice.id}: {str(e)}")
        return None
    
    def get_tenant_invoices(self, tenant, limit: int = 50) -> List[Invoice]:
        return Invoice.objects.filter(
            tenant=tenant,
            is_deleted=False
        ).order_by('-invoice_date')[:limit]
    
    def get_outstanding_invoices(self, tenant) -> List[Invoice]:
        return Invoice.objects.filter(
            tenant=tenant,
            status__in=['draft', 'open'],
            is_deleted=False
        ).order_by('due_date')
    
    def get_total_outstanding(self, tenant) -> Decimal:
        outstanding = self.get_outstanding_invoices(tenant)
        total = sum(inv.amount_remaining for inv in outstanding)
        return total
    
    def _map_invoice_status(self, stripe_status: str) -> str:
        status_map = {
            'draft': 'draft',
            'open': 'open',
            'paid': 'paid',
            'uncollectible': 'uncollectible',
            'void': 'void',
        }
        return status_map.get(stripe_status, 'open')
    
    def _extract_tenant_id(self, metadata: Dict) -> Optional[str]:
        if metadata and 'tenant_id' in metadata:
            return metadata['tenant_id']
        return None