class ConfigAppException(Exception):
    """Base exception for config app."""
    pass

class BackupError(ConfigAppException):
    """Raised when backup operation fails."""
    pass

class BackupNotFoundError(BackupError):
    """Raised when backup artifact not found."""
    pass

class BackupCorruptError(BackupError):
    """Raised when backup verification fails."""
    pass

class BackupQuotaExceededError(BackupError):
    """Raised when tenant backup quota is exceeded."""
    pass

class RestoreError(ConfigAppException):
    """Raised when restore operation fails."""
    pass

class RestoreValidationError(RestoreError):
    """Raised when restored data fails validation."""
    pass

class MaintenanceActiveError(ConfigAppException):
    """Raised when attempting to access system during full maintenance."""
    pass

class MaintenanceConflictError(ConfigAppException):
    """Raised when maintenance windows overlap."""
    pass

class DisasterRecoveryError(ConfigAppException):
    """Raised when DR operation fails."""
    pass

class DisasterRecoveryPlanNotFoundError(DisasterRecoveryError):
    """Raised when DR plan not found."""
    pass

class FailoverError(DisasterRecoveryError):
    """Raised when failover operation fails."""
    pass

class HealthCheckError(ConfigAppException):
    """Raised when health check fails."""
    pass

class EncryptionError(ConfigAppException):
    """Raised when encryption/decryption fails."""
    pass

class KeyNotFoundError(EncryptionError):
    """Raised when encryption key not found."""
    pass

class KeyExpiredError(EncryptionError):
    """Raised when encryption key is expired."""
    pass

class ScheduleError(ConfigAppException):
    """Raised when schedule operation fails."""
    pass

class ScheduleConflictError(ScheduleError):
    """Raised when schedules conflict."""
    pass

class InvalidCronExpressionError(ScheduleError):
    """Raised when cron expression is invalid."""
    pass

class QuotaError(ConfigAppException):
    """Raised when quota operations fail."""
    pass

class QuotaExceededError(QuotaError):
    """Raised when quota is exceeded."""
    pass

class RiskAssessmentError(ConfigAppException):
    """Raised when risk assessment fails."""
    pass

class PermissionDeniedError(ConfigAppException):
    """Raised when user lacks permission for config operation."""
    pass

class SuperAdminRequiredError(PermissionDeniedError):
    """Raised when operation requires Super Admin role."""
    pass

class ClientAdminRequiredError(PermissionDeniedError):
    """Raised when operation requires Client Admin role."""
    pass

class AppNotRegisteredError(ConfigAppException):
    """Raised when app is not registered in config."""
    pass

class DependencyCycleError(ConfigAppException):
    """Raised when app dependencies form a cycle."""
    pass

class ValidationError(ConfigAppException):
    """Raised when validation fails."""
    pass

class RetentionPolicyError(ConfigAppException):
    """Raised when retention policy application fails."""
    pass

class StorageError(ConfigAppException):
    """Raised when storage operation fails."""
    pass