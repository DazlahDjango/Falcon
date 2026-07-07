class OrganizationException(Exception):
    pass



class OrganizationNotFoundError(OrganizationException):
    pass

class OrganizationError(OrganizationException):
    pass

class OrganizationAlreadyExistsError(OrganizationException):
    pass


class OrganizationInvalidError(OrganizationException):
    pass


class OrganizationAccessDeniedError(OrganizationException):
    pass


class OrganizationProvisioningError(OrganizationException):
    pass


class SchemaError(OrganizationException):
    pass


class SchemaCreationError(OrganizationProvisioningError):
    pass


class SchemaNotFoundError(OrganizationException):
    pass


class SchemaAlreadyExistsError(OrganizationException):
    pass


class SchemaMigrationError(OrganizationProvisioningError):
    pass


class MigrationError(OrganizationProvisioningError):
    pass


class MigrationNotFoundError(OrganizationException):
    pass


class MigrationAlreadyAppliedError(OrganizationException):
    pass


class IsolationError(OrganizationException):
    pass


class QuotaExceededError(OrganizationException):
    pass


class ResourceNotFoundError(OrganizationException):
    pass


class ResourceAlreadyExistsError(OrganizationException):
    pass


class ResourceError(OrganizationException):
    pass


class MaintenanceError(OrganizationException):
    pass


class DomainValidationError(OrganizationException):
    pass

class DomainError(OrganizationException):
    """Base error for domain-related operations."""
    pass

class DomainNotFoundError(OrganizationException):
    pass


class DomainAlreadyExistsError(OrganizationException):
    pass


class DomainVerificationError(OrganizationException):
    pass


class DomainSSLError(OrganizationException):
    pass


class ConnectionError(OrganizationException):
    pass


class ConnectionNotFoundError(OrganizationException):
    pass


class ConnectionPoolExhaustedError(OrganizationException):
    pass


class ProvisioningError(OrganizationException):
    pass


class HealthCheckError(OrganizationException):
    pass


class SettingsError(OrganizationException):
    pass


class SettingsNotFoundError(OrganizationException):
    pass


class SettingsValidationError(OrganizationException):
    pass


class PermissionDeniedError(OrganizationException):
    pass


class InvalidOperationError(OrganizationException):
    pass


class ConfigurationError(OrganizationException):
    pass


class DependencyError(OrganizationException):
    pass