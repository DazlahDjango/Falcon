class BillingError(Exception):
    """Base exception for all billing errors."""
    pass

# Subscription Exceptions
class SubscriptionError(BillingError):
    """Base exception for subscription-related errors."""
    pass

class SubscriptionNotFoundError(SubscriptionError):
    """Raised when a subscription is not found."""
    pass

class SubscriptionAlreadyActiveError(SubscriptionError):
    """Raised when trying to create a subscription for a tenant that already has an active one."""
    pass

class SubscriptionExpiredError(SubscriptionError):
    """Raised when trying to perform an action on an expired subscription."""
    pass

class SubscriptionCancellationError(SubscriptionError):
    """Raised when subscription cancellation fails."""
    pass

class SubscriptionUpgradeError(SubscriptionError):
    """Raised when subscription upgrade fails."""
    pass

class SubscriptionDowngradeError(SubscriptionError):
    """Raised when subscription downgrade fails."""
    pass

# Plan Exceptions
class PlanError(BillingError):
    """Base exception for plan-related errors."""
    pass

class PlanNotFoundError(PlanError):
    """Raised when a plan is not found."""
    pass

class PlanSyncError(PlanError):
    """Raised when syncing a plan to PayStack fails."""
    pass

class PlanAlreadyExistsError(PlanError):
    """Raised when trying to create a plan that already exists."""
    pass

# Payment Exceptions
class PaymentError(BillingError):
    """Base exception for payment-related errors."""
    pass

class PaymentInitializationError(PaymentError):
    """Raised when payment initialization fails."""
    pass

class PaymentVerificationError(PaymentError):
    """Raised when payment verification fails."""
    pass

class PaymentRefundError(PaymentError):
    """Raised when refund fails."""
    pass

class PaymentMethodError(PaymentError):
    """Raised when payment method operations fail."""
    pass

# Invoice Exceptions
class InvoiceError(BillingError):
    """Base exception for invoice-related errors."""
    pass

class InvoiceNotFoundError(InvoiceError):
    """Raised when an invoice is not found."""
    pass

class InvoiceGenerationError(InvoiceError):
    """Raised when invoice generation fails."""
    pass

# Webhook Exceptions
class WebhookError(BillingError):
    """Base exception for webhook-related errors."""
    pass

class WebhookSignatureError(WebhookError):
    """Raised when webhook signature verification fails."""
    pass

class WebhookProcessingError(WebhookError):
    """Raised when webhook processing fails."""
    pass

class WebhookIdempotencyError(WebhookError):
    """Raised when duplicate webhook is detected."""
    pass

# API Exceptions
class APIError(BillingError):
    """Base exception for API-related errors."""
    pass

class AuthenticationError(APIError):
    """Raised when authentication fails."""
    pass

class RateLimitError(APIError):
    """Raised when rate limit is exceeded."""
    pass

# Usage Exceptions
class UsageError(BillingError):
    """Base exception for usage-related errors."""
    pass

class UsageLimitExceededError(UsageError):
    """Raised when usage limit is exceeded."""
    pass

class UsageTrackingError(UsageError):
    """Raised when usage tracking fails."""
    pass

# Audit Exceptions
class AuditError(BillingError):
    """Base exception for audit-related errors."""
    pass

class AuditLoggingError(AuditError):
    """Raised when audit logging fails."""
    pass

# Enterprise Exceptions
class EnterpriseError(BillingError):
    """Base exception for enterprise-related errors."""
    pass

class TenantOverrideError(EnterpriseError):
    """Raised when tenant override operations fail."""
    pass

class InvalidOverrideError(TenantOverrideError):
    """Raised when override data is invalid."""
    pass