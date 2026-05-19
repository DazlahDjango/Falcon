"""
Billing App Custom Exceptions
Provides granular exception handling for different billing scenarios.
"""


class BillingException(Exception):
    """Base exception for all billing-related errors."""
    pass


class PaymentError(BillingException):
    """Base exception for payment processing errors."""
    pass


class PaymentInitializationError(PaymentError):
    """Raised when payment initialization fails."""
    def __init__(self, message, paystack_response=None):
        self.paystack_response = paystack_response
        super().__init__(message)


class PaymentVerificationError(PaymentError):
    """Raised when payment verification fails."""
    pass


class PaymentTimeoutError(PaymentError):
    """Raised when payment takes too long to complete."""
    pass


class SubscriptionError(BillingException):
    """Base exception for subscription errors."""
    pass


class SubscriptionNotFoundError(SubscriptionError):
    """Raised when subscription is not found."""
    pass


class SubscriptionAlreadyActiveError(SubscriptionError):
    """Raised when trying to create subscription that already exists."""
    pass


class SubscriptionExpiredError(SubscriptionError):
    """Raised when operation on expired subscription."""
    pass


class SubscriptionCancellationError(SubscriptionError):
    """Raised when subscription cancellation fails."""
    pass


class SubscriptionUpgradeError(SubscriptionError):
    """Raised when plan upgrade fails."""
    pass


class SubscriptionDowngradeError(SubscriptionError):
    """Raised when plan downgrade fails."""
    pass


class WebhookError(BillingException):
    """Base exception for webhook errors."""
    pass


class WebhookSignatureError(WebhookError):
    """Raised when webhook signature verification fails."""
    pass


class WebhookIdempotencyError(WebhookError):
    """Raised when duplicate webhook is detected (not an error, just info)."""
    pass


class WebhookProcessingError(WebhookError):
    """Raised when webhook processing fails."""
    pass


class InvoiceError(BillingException):
    """Base exception for invoice errors."""
    pass


class InvoiceGenerationError(InvoiceError):
    """Raised when invoice generation fails."""
    pass


class InvoiceNotFoundError(InvoiceError):
    """Raised when invoice is not found."""
    pass


class PlanError(BillingException):
    """Base exception for plan-related errors."""
    pass


class PlanNotFoundError(PlanError):
    """Raised when plan is not found."""
    pass


class InvalidPlanUpgradeError(PlanError):
    """Raised when trying to upgrade to invalid plan."""
    pass


class InvalidPlanDowngradeError(PlanError):
    """Raised when trying to downgrade to invalid plan."""
    pass


class PaymentMethodError(BillingException):
    """Base exception for payment method errors."""
    pass


class PaymentMethodNotFoundError(PaymentMethodError):
    """Raised when payment method is not found."""
    pass


class NoDefaultPaymentMethodError(PaymentMethodError):
    """Raised when no default payment method exists."""
    pass


class PaymentMethodExpiredError(PaymentMethodError):
    """Raised when payment method is expired."""
    pass


class TenantBillingError(BillingException):
    """Base exception for tenant billing errors."""
    pass


class TenantLimitExceededError(TenantBillingError):
    """Raised when tenant exceeds plan limits."""
    def __init__(self, limit_type, current, maximum):
        self.limit_type = limit_type
        self.current = current
        self.maximum = maximum
        message = f"Tenant exceeded {limit_type} limit: {current}/{maximum}"
        super().__init__(message)


class TenantInactiveError(TenantBillingError):
    """Raised when tenant is inactive."""
    pass


class TenantSubscriptionRequiredError(TenantBillingError):
    """Raised when tenant has no active subscription."""
    pass


class TransactionError(BillingException):
    """Base exception for transaction errors."""
    pass


class TransactionNotFoundError(TransactionError):
    """Raised when transaction is not found."""
    pass


class TransactionAlreadyProcessedError(TransactionError):
    """Raised when trying to process already processed transaction."""
    pass


class RefundError(BillingException):
    """Base exception for refund errors."""
    pass


class RefundNotAllowedError(RefundError):
    """Raised when refund is not allowed for transaction."""
    pass


class APIError(BillingException):
    """Base exception for PayStack API errors."""
    def __init__(self, message, status_code=None, paystack_error=None):
        self.status_code = status_code
        self.paystack_error = paystack_error
        super().__init__(message)


class RateLimitError(APIError):
    """Raised when PayStack rate limit is hit."""
    pass


class AuthenticationError(APIError):
    """Raised when PayStack authentication fails."""
    pass