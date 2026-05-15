import logging
from typing import Optional, Dict, Any
from django.conf import settings
from django.urls import reverse
from django.db import transaction
from ...models import Transaction, Subscription, SubscriptionPlan, Invoice
from ...exceptions import PaymentInitializationError, PlanNotFoundError
from ...utils import generate_transaction_reference, calculate_total_amount, calculate_tax
from ..paystack.client import PayStackClient
from ..audit.logger import audit_logger

logger = logging.getLogger(__name__)


class CheckoutService:
    """
    Manages checkout sessions for one-time payments and subscriptions.
    """
    
    def __init__(self):
        self.paystack_client = PayStackClient()
    
    @transaction.atomic
    def initialize_subscription_checkout(self, tenant_id: str, plan_id: str,
                                         email: str, callback_url: Optional[str] = None,
                                         metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Initialize checkout for a subscription plan.
        
        Args:
            tenant_id: Tenant UUID
            plan_id: Subscription plan ID
            email: Customer email
            callback_url: URL to redirect after payment
            metadata: Additional metadata
        
        Returns:
            Checkout data with authorization_url and reference
        """
        # Get plan
        try:
            plan = SubscriptionPlan.objects.get_by_id(plan_id)
        except SubscriptionPlan.DoesNotExist:
            raise PlanNotFoundError(f"Plan {plan_id} not found")
        
        # Calculate amount with tax
        subtotal = plan.price
        tax_amount = calculate_tax(subtotal)
        total_amount = calculate_total_amount(subtotal, tax_amount)
        
        # Generate transaction reference
        reference = generate_transaction_reference('SUB')
        
        # Create transaction record
        transaction_obj = Transaction.objects.create(
            tenant_id=tenant_id,
            reference=reference,
            transaction_type=Transaction.TYPE_SUBSCRIPTION,
            amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=plan.currency,
            status=Transaction.STATUS_PENDING,
            metadata={
                'plan_id': str(plan.id),
                'plan_name': plan.name,
                'plan_type': plan.plan_type,
                'billing_interval': plan.billing_interval,
                ** (metadata or {})
            }
        )
        
        # Prepare PayStack metadata
        paystack_metadata = {
            'tenant_id': str(tenant_id),
            'transaction_id': str(transaction_obj.id),
            'plan_id': str(plan.id),
            'transaction_type': 'subscription',
            ** (metadata or {})
        }
        
        try:
            # Initialize with PayStack
            paystack_response = self.paystack_client.initialize_transaction(
                email=email,
                amount=total_amount,
                reference=reference,
                callback_url=callback_url,
                metadata=paystack_metadata,
                channels=['card', 'bank', 'ussd', 'mobile_money']
            )
            
            # Update transaction with PayStack data
            transaction_obj.paystack_access_code = paystack_response.get('access_code')
            transaction_obj.paystack_response = paystack_response
            transaction_obj.save()
            
            # Log audit
            audit_logger.log(
                user=None,
                tenant_id=tenant_id,
                action='create',
                resource_type='transaction',
                resource_id=transaction_obj.id,
                after={'reference': reference, 'amount': total_amount},
                metadata={'checkout_type': 'subscription'}
            )
            
            logger.info(f"Subscription checkout initialized: {reference}")
            
            return {
                'authorization_url': paystack_response.get('authorization_url'),
                'access_code': paystack_response.get('access_code'),
                'reference': reference,
                'transaction_id': str(transaction_obj.id)
            }
            
        except Exception as e:
            transaction_obj.status = Transaction.STATUS_FAILED
            transaction_obj.error_message = str(e)
            transaction_obj.save()
            logger.error(f"Failed to initialize subscription checkout: {str(e)}")
            raise PaymentInitializationError(f"Checkout initialization failed: {str(e)}")
    
    @transaction.atomic
    def initialize_one_time_checkout(self, tenant_id: str, amount: int,
                                      email: str, description: str,
                                      callback_url: Optional[str] = None,
                                      metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Initialize checkout for one-time payment.
        
        Args:
            tenant_id: Tenant UUID
            amount: Amount in cents
            email: Customer email
            description: Payment description
            callback_url: URL to redirect after payment
            metadata: Additional metadata
        
        Returns:
            Checkout data
        """
        # Calculate tax
        tax_amount = calculate_tax(amount)
        total_amount = calculate_total_amount(amount, tax_amount)
        
        # Generate reference
        reference = generate_transaction_reference('ONETIME')
        
        # Create transaction
        transaction_obj = Transaction.objects.create(
            tenant_id=tenant_id,
            reference=reference,
            transaction_type=Transaction.TYPE_ONE_TIME,
            amount=amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=getattr(settings, 'BILLING_CURRENCY', 'KES'),
            status=Transaction.STATUS_PENDING,
            metadata={
                'description': description,
                ** (metadata or {})
            }
        )
        
        # PayStack metadata
        paystack_metadata = {
            'tenant_id': str(tenant_id),
            'transaction_id': str(transaction_obj.id),
            'transaction_type': 'one_time',
            'description': description,
            ** (metadata or {})
        }
        
        try:
            paystack_response = self.paystack_client.initialize_transaction(
                email=email,
                amount=total_amount,
                reference=reference,
                callback_url=callback_url,
                metadata=paystack_metadata
            )
            
            transaction_obj.paystack_access_code = paystack_response.get('access_code')
            transaction_obj.paystack_response = paystack_response
            transaction_obj.save()
            
            logger.info(f"One-time checkout initialized: {reference}")
            
            return {
                'authorization_url': paystack_response.get('authorization_url'),
                'access_code': paystack_response.get('access_code'),
                'reference': reference,
                'transaction_id': str(transaction_obj.id)
            }
            
        except Exception as e:
            transaction_obj.status = Transaction.STATUS_FAILED
            transaction_obj.error_message = str(e)
            transaction_obj.save()
            raise PaymentInitializationError(f"Checkout initialization failed: {str(e)}")
    
    def verify_checkout(self, reference: str) -> Dict[str, Any]:
        """
        Verify checkout payment status.
        
        Args:
            reference: Transaction reference
        
        Returns:
            Verification result
        """
        from ..paystack.verification import PaymentVerifier
        
        verifier = PaymentVerifier()
        result = verifier.verify_transaction(reference)
        
        # Update local transaction
        transaction_obj = Transaction.objects.get_by_reference(reference)
        if transaction_obj:
            verifier.process_verified_transaction(transaction_obj, result)
        
        return {
            'verified': result.get('status') == 'success',
            'reference': reference,
            'status': result.get('status'),
            'amount': result.get('amount'),
            'transaction': transaction_obj
        }