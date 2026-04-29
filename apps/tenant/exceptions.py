class TenantException(Exception):
    """Base exception for all tenant-related errors"""
    pass


class TenantNotFoundError(TenantException):
    """Raised when a tenant cannot be found"""
    pass


class TenantAlreadyExistsError(TenantException):
    """Raised when trying to create a tenant that already exists"""
    pass


class TenantInvalidError(TenantException):
    """Raised when tenant data is invalid"""
    pass


class TenantAccessDeniedError(TenantException):
    """Raised when user does not have access to a tenant"""
    pass


class TenantProvisioningError(TenantException):
    """Raised when tenant provisioning fails"""
    pass


class SchemaCreationError(TenantProvisioningError):
    """Raised when database schema creation fails"""
    pass


class MigrationError(TenantProvisioningError):
    """Raised when tenant migrations fail"""
    pass


class TenantIsolationError(TenantException):
    """Raised when cross-tenant access is detected"""
    pass


class TenantQuotaExceededError(TenantException):
    """Raised when a tenant exceeds resource limits"""
    pass


class TenantMaintenanceError(TenantException):
    """Raised when trying to access a tenant in maintenance mode"""
    pass


class DomainValidationError(TenantException):
    """Raised when custom domain validation fails"""
    pass


class DomainNotFoundError(TenantException):
    """Raised when a domain cannot be found"""
    pass


class BackupError(TenantException):
    """Raised when backup operations fail"""
    pass