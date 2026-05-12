from django.core.exceptions import ValidationError

class BillingException(Exception):
    """Base exception for all billing errors."""
    default_message = "A billing error occurred."
    
    def __init__(self, message=None, code=None, details=None):
        self.message = message or self.default_message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class SubscriptionError(BillingException):
    """Raised when subscription operations fail."""
    default_message = "Subscription operation failed."


class PaymentError(BillingException):
    """Raised when payment operations fail."""
    default_message = "Payment processing failed."


class QuotaError(BillingException):
    """Raised when quota limits are exceeded."""
    default_message = "Quota limit exceeded."


class WebhookError(BillingException):
    """Raised when webhook processing fails."""
    default_message = "Webhook processing failed."


class SyncError(BillingException):
    """Raised when Stripe sync operations fail."""
    default_message = "Synchronization with Stripe failed."


class InvoiceError(BillingException):
    """Raised when invoice operations fail."""
    default_message = "Invoice operation failed."


class PlanError(BillingException):
    """Raised when plan operations fail."""
    default_message = "Plan operation failed."


class TenantBillingError(BillingException):
    """Raised when tenant billing configuration is invalid."""
    default_message = "Tenant billing configuration error."


class SubscriptionValidationError(ValidationError):
    """Validation error for subscription data."""
    pass


class PaymentValidationError(ValidationError):
    """Validation error for payment data."""
    pass