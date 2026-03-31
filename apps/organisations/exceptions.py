"""
Custom exceptions for organisations app
"""


class OrganisationError(Exception):
    """Base exception for organisation errors"""
    pass


class OrganisationNotFoundError(OrganisationError):
    """Organisation not found"""
    pass


class OrganisationSuspendedError(OrganisationError):
    """Organisation is suspended"""
    pass


class SubscriptionError(Exception):
    """Base exception for subscription errors"""
    pass


class SubscriptionExpiredError(SubscriptionError):
    """Subscription has expired"""
    pass


class SubscriptionLimitExceededError(SubscriptionError):
    """Subscription limit exceeded"""
    pass


class DomainError(Exception):
    """Base exception for domain errors"""
    pass


class DomainVerificationError(DomainError):
    """Domain verification failed"""
    pass


class DomainAlreadyExistsError(DomainError):
    """Domain already exists for another organisation"""
    pass


class DNSVerificationError(DomainError):
    """DNS verification failed"""
    pass


class HierarchyError(Exception):
    """Base exception for hierarchy errors"""
    pass


class CircularHierarchyError(HierarchyError):
    """Circular reference detected in hierarchy"""
    pass


class MaxHierarchyDepthError(HierarchyError):
    """Maximum hierarchy depth exceeded"""
    pass


class ProvisioningError(Exception):
    """Base exception for provisioning errors"""
    pass


class QuotaExceededError(Exception):
    """Organisation has exceeded their quota"""
    pass