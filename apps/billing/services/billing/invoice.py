import logging
from typing import Optional, List, Dict, Any
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from django.core.mail import send_mail
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from ...models import Invoice, Subscription, Transaction
from ...exceptions import InvoiceGenerationError
from ...utils import generate_invoice_number, calculate_tax, format_currency
from ..audit.logger import audit_logger

logger = logging.getLogger(__name__)

class InvoiceService:
    @transaction.atomic
    def create_for_subscription(self, subscription: Subscription, is_renewal: bool = False) -> Invoice:
        subtotal = subscription.amount
        tax_amount = calculate_tax(subtotal)
        total_amount = subtotal + tax_amount
        due_date = timezone.now() + timedelta(days=30)
        line_items = [{'description': f"{subscription.plan.name} Plan - {subscription.billing_interval}", 'quantity': 1, 'unit_price': subtotal, 'total': subtotal, 'currency': subscription.currency}, {'description': f"Tax ({getattr(settings, 'BILLING_TAX_RATE', 16)}% VAT)", 'quantity': 1, 'unit_price': tax_amount, 'total': tax_amount, 'currency': subscription.currency, 'is_tax': True}]
        if is_renewal:
            line_items.insert(0, {'description': f"Renewal - {subscription.plan.name} Plan", 'quantity': 1, 'unit_price': subtotal, 'total': subtotal, 'currency': subscription.currency})
        invoice = Invoice.objects.create(tenant_id=subscription.tenant_id, subscription=subscription, invoice_number=generate_invoice_number(subscription.tenant_id), invoice_date=timezone.now(), due_date=due_date, subtotal=subtotal, tax_rate=getattr(settings, 'BILLING_TAX_RATE', 0.16), tax_amount=tax_amount, total_amount=total_amount, currency=subscription.currency, status=Invoice.STATUS_PENDING, line_items=line_items, metadata={'subscription_code': subscription.subscription_code, 'is_renewal': is_renewal, 'billing_period_start': subscription.current_period_start.isoformat(), 'billing_period_end': subscription.current_period_end.isoformat()})
        logger.info(f"Created invoice {invoice.invoice_number} for subscription {subscription.subscription_code}")
        self.generate_pdf_async(invoice.id)
        return invoice

    @transaction.atomic
    def create_for_one_time(self, tenant_id: str, amount: int, description: str, currency: str = 'KES') -> Invoice:
        tax_amount = calculate_tax(amount)
        total_amount = amount + tax_amount
        line_items = [{'description': description, 'quantity': 1, 'unit_price': amount, 'total': amount, 'currency': currency}, {'description': f"Tax ({getattr(settings, 'BILLING_TAX_RATE', 16)}% VAT)", 'quantity': 1, 'unit_price': tax_amount, 'total': tax_amount, 'currency': currency, 'is_tax': True}]
        invoice = Invoice.objects.create(tenant_id=tenant_id, invoice_number=generate_invoice_number(tenant_id), invoice_date=timezone.now(), due_date=timezone.now() + timedelta(days=30), subtotal=amount, tax_rate=getattr(settings, 'BILLING_TAX_RATE', 0.16), tax_amount=tax_amount, total_amount=total_amount, currency=currency, status=Invoice.STATUS_PENDING, line_items=line_items, metadata={'description': description})
        logger.info(f"Created one-time invoice {invoice.invoice_number}")
        return invoice

    def generate_pdf(self, invoice_id: str) -> bytes:
        invoice = Invoice.objects.get_by_id(invoice_id)
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#2563eb'))
        heading_style = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1f2937'))
        normal_style = styles['Normal']
        story = []
        story.append(Paragraph("INVOICE", title_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"Invoice Number: {invoice.invoice_number}", normal_style))
        story.append(Paragraph(f"Date: {invoice.invoice_date.strftime('%B %d, %Y')}", normal_style))
        story.append(Paragraph(f"Due Date: {invoice.due_date.strftime('%B %d, %Y')}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("Bill To:", heading_style))
        story.append(Paragraph(f"Tenant ID: {invoice.tenant_id}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        table_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
        for item in invoice.line_items:
            unit_price = format_currency(item['unit_price'], invoice.currency)
            total = format_currency(item['total'], invoice.currency)
            table_data.append([item['description'], str(item['quantity']), unit_price, total])
        table_data.append(['', '', 'Subtotal:', format_currency(invoice.subtotal, invoice.currency)])
        table_data.append(['', '', 'Tax:', format_currency(invoice.tax_amount, invoice.currency)])
        table_data.append(['', '', 'Total:', format_currency(invoice.total_amount, invoice.currency)])
        table = Table(table_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1f2937')), ('ALIGN', (0, 0), (-1, -1), 'LEFT'), ('ALIGN', (1, 1), (-1, -1), 'CENTER'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 10), ('BOTTOMPADDING', (0, 0), (-1, 0), 12), ('BACKGROUND', (0, len(table_data)-3), (-1, -1), colors.HexColor('#f9fafb')), ('FONTNAME', (0, len(table_data)-3), (-1, -1), 'Helvetica-Bold'), ('GRID', (0, 0), (-1, -4), 0.5, colors.HexColor('#e5e7eb'))]))
        story.append(table)
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("Thank you for your business!", normal_style))
        story.append(Paragraph(f"Payment Terms: Due within 30 days", normal_style))
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        invoice.pdf_generated_at = timezone.now()
        invoice.save(update_fields=['pdf_generated_at'])
        logger.info(f"Generated PDF for invoice {invoice.invoice_number}")
        return pdf_bytes

    def generate_pdf_async(self, invoice_id: str):
        from ...tasks import generate_invoice_pdf
        generate_invoice_pdf.delay(invoice_id)

    def send_invoice_email(self, invoice_id: str, recipient_email: str):
        invoice = Invoice.objects.get_by_id(invoice_id)
        if not invoice.pdf_url:
            pdf_bytes = self.generate_pdf(invoice_id)
        else:
            pdf_bytes = None
        subject = f"Invoice {invoice.invoice_number} from Falcon PMS"
        message = f"Dear Customer,\n\nPlease find attached invoice {invoice.invoice_number} for your records.\n\nInvoice Details:\n- Amount: {format_currency(invoice.total_amount, invoice.currency)}\n- Due Date: {invoice.due_date.strftime('%B %d, %Y')}\n\nYou can view and pay your invoice online at:\n{getattr(settings, 'BASE_URL', '')}/invoices/{invoice.id}\n\nThank you for choosing Falcon PMS!\n\nBest regards,\nFalcon PMS Team"
        send_mail(subject=subject, message=message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), recipient_list=[recipient_email], fail_silently=False)
        logger.info(f"Sent invoice email for {invoice.invoice_number} to {recipient_email}")

    def mark_as_paid(self, invoice_id: str, transaction_ref: str = None):
        invoice = Invoice.objects.get_by_id(invoice_id)
        invoice.mark_paid()
        audit_logger.log(user=None, tenant_id=invoice.tenant_id, action='update', resource_type='invoice', resource_id=invoice.id, after={'status': 'paid'}, metadata={'transaction_reference': transaction_ref})
        logger.info(f"Marked invoice {invoice.invoice_number} as paid")