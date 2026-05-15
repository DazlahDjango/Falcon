from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ....services.audit.logger import audit_logger
from ..serializers import BillingPortalAccessSerializer, BillingPortalResponseSerializer
from ..permissions import CanAccessBillingPortal
from ..throttles import BillingReportThrottle


class BillingPortalView(APIView):
    """
    Billing Portal endpoint.
    
    Provides access to customer billing portal for:
    - Managing payment methods
    - Viewing invoices
    - Updating subscription
    - Cancelling subscription
    """
    
    permission_classes = [IsAuthenticated, CanAccessBillingPortal]
    throttle_classes = [BillingReportThrottle]
    
    def post(self, request):
        """
        Create a billing portal session.
        
        Returns a URL to redirect the user to the billing portal.
        """
        serializer = BillingPortalAccessSerializer(
            data=request.data,
            context={'tenant_id': request.tenant_id, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        tenant_id = request.tenant_id
        subscription = serializer.context.get('subscription')
        
        # Build portal URL (using PayStack customer portal or custom)
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
        # Generate portal session (simplified - in production, use PayStack customer portal)
        portal_url = f"{base_url}/billing/portal?tenant={tenant_id}"
        
        # Log audit
        audit_logger.log(
            user=request.user,
            tenant_id=tenant_id,
            action='view',
            resource_type='subscription',
            resource_id=subscription.id if subscription else None,
            metadata={'action': 'billing_portal_access'},
            request=request
        )
        
        return Response({
            'portal_url': portal_url,
            'session_id': f"portal_{tenant_id}_{request.user.id}",
            'expires_at': None  # Custom portal doesn't expire
        })
    
    def get(self, request):
        """
        Get billing portal information.
        
        Returns subscription and billing summary for the portal.
        """
        tenant_id = request.tenant_id
        
        from ....models import Subscription, Invoice, PaymentMethod
        from ..serializers import BillingSummarySerializer
        
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        invoices = Invoice.objects.for_tenant(tenant_id).order_by('-invoice_date')[:10]
        payment_methods = PaymentMethod.objects.for_tenant(tenant_id).active()
        
        # Build summary
        summary = {
            'tenant_id': tenant_id,
            'has_active_subscription': subscription is not None and subscription.is_active,
            'current_plan': {
                'name': subscription.plan.name,
                'plan_type': subscription.plan.plan_type,
                'amount': subscription.amount,
                'amount_display': f"{subscription.currency} {subscription.amount / 100:.2f}",
                'billing_interval': subscription.billing_interval
            } if subscription and subscription.is_active else None,
            'subscription_status': subscription.status if subscription else None,
            'trial_info': {
                'is_on_trial': subscription.is_on_trial if subscription else False,
                'days_remaining': subscription.trial_days_remaining if subscription else 0,
                'trial_end_date': subscription.trial_end_date if subscription else None
            } if subscription else None,
            'billing_info': {
                'auto_renew': subscription.auto_renew if subscription else False,
                'next_billing_date': subscription.current_period_end if subscription else None,
                'cancel_at_period_end': subscription.cancel_at_period_end if subscription else False
            } if subscription else None,
            'recent_invoices': [
                {
                    'invoice_number': inv.invoice_number,
                    'total_display': inv.total_display,
                    'status': inv.status,
                    'due_date': inv.due_date,
                    'pdf_url': inv.pdf_url
                }
                for inv in invoices
            ],
            'payment_methods': [
                {
                    'id': str(pm.id),
                    'display_name': f"{pm.card_brand} •••• {pm.card_last4}" if pm.payment_type == 'card' else pm.payment_type,
                    'is_default': pm.is_default,
                    'expiry': f"{pm.card_expiry_month}/{pm.card_expiry_year}" if pm.card_expiry_month else None
                }
                for pm in payment_methods
            ],
            'has_payment_method': payment_methods.exists()
        }
        
        return Response(summary)