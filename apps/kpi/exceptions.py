# exceptions.py
from django.core.exceptions import ValidationError

class KPIException(Exception):
    pass

class KPIValidationError(ValidationError, KPIException):
    pass

class CalculationError(KPIException):
    pass

class TargetPhasingError(KPIException):
    pass

class CascadeError(KPIException):
    pass

class PhasingLockedError(TargetPhasingError):
    pass

class CascadeIntegrityError(CascadeError):
    pass

class CascadeSumError(CascadeError):
    pass

class DuplicatePhasingError(TargetPhasingError):
    pass

class InvalidCalculationLogicError(CalculationError):
    pass

class InvalidKPITypeError(CalculationError):
    pass

class InvalidMeasureTypeError(CalculationError):
    pass

class TargetNotFoundError(CalculationError):
    pass

class ActualNotFoundError(CalculationError):
    pass

class ScoreNotFoundError(CalculationError):
    pass

class ValidationNotAllowedError(KPIException):
    pass

class ApprovalError(KPIException):
    pass

class EscalationError(KPIException):
    pass

class AggregationError(CalculationError):
    pass

class MaterializedViewError(KPIException):
    pass

class TenantIsolationError(KPIException):
    pass

class PermissionDeniedError(KPIException):
    pass

class PermissionDenied(KPIException):
    """Raised when a user lacks permission for an operation"""
    pass

class DuplicateKPICodeError(KPIException):
    pass

class WeightSumError(KPIException):
    pass

class InactiveKPICalculationError(CalculationError):
    pass

class HistoricalDataError(KPIException):
    pass

class ConcurrentCalculationError(CalculationError):
    pass

class LockAcquisitionError(CalculationError):
    pass

class PhasingValidationError(TargetPhasingError):
    pass

class SeasonalityPatternError(TargetPhasingError):
    pass

class CustomPatternError(TargetPhasingError):
    pass

class CascadeRuleNotFoundError(CascadeError):
    pass

class CascadeTargetNotFoundError(CascadeError):
    pass

class RejectionReasonNotFoundError(ValidationError):
    pass

class EvidenceUploadError(KPIException):
    pass

class ReportGenerationError(KPIException):
    pass

class InvalidPeriodError(ValidationError):
    pass

class FuturePeriodError(ValidationError):
    pass

class PastPeriodLockedError(ValidationError):
    pass

class ThresholdConfigurationError(KPIException):
    pass

class TrendAnalysisError(CalculationError):
    pass

class RiskPredictionError(CalculationError):
    pass

# ============================================================================
# Budget & Cascade Exceptions
# ============================================================================

class BudgetAllocationError(KPIException):
    """Raised when budget allocation is invalid"""
    pass

class CascadeWeightError(KPIException):
    """Raised when cascade weights are invalid"""
    pass

class DepartmentBudgetError(KPIException):
    """Raised when department budget is invalid"""
    pass

class CascadeValidationError(KPIException):
    """Raised when cascade validation fails"""
    pass

# ============================================================================
# Data Sync Exceptions
# ============================================================================

class DataSyncError(KPIException):
    """Raised when data synchronization fails"""
    pass

class ExternalSourceError(DataSyncError):
    """Raised when external source connection fails"""
    pass

class DataMappingError(DataSyncError):
    """Raised when data mapping fails"""
    pass

class SyncConflictError(DataSyncError):
    """Raised when sync conflict occurs"""
    pass

# ============================================================================
# Report Exceptions
# ============================================================================

class ReportNotFoundError(ReportGenerationError):
    """Raised when report is not found"""
    pass

class ExportError(ReportGenerationError):
    """Raised when export fails"""
    pass

class UnsupportedFormatError(ExportError):
    """Raised when export format is not supported"""
    pass

# ============================================================================
# Notification Exceptions
# ============================================================================

class NotificationError(KPIException):
    """Raised when notification fails"""
    pass

class NotificationDeliveryError(NotificationError):
    """Raised when notification delivery fails"""
    pass

class NotificationTemplateError(NotificationError):
    """Raised when notification template is invalid"""
    pass

# ============================================================================
# Validation Exceptions
# ============================================================================

class ValidationRuleError(KPIException):
    """Raised when validation rule is violated"""
    pass

class ThresholdValidationError(ValidationRuleError):
    """Raised when threshold validation fails"""
    pass

class CrossModelValidationError(ValidationRuleError):
    """Raised when cross-model validation fails"""
    pass

class ReferentialIntegrityError(ValidationRuleError):
    """Raised when referential integrity is violated"""
    pass

class UniqueConstraintError(ValidationRuleError):
    """Raised when unique constraint is violated"""
    pass

# ============================================================================
# Import/Export Exceptions
# ============================================================================

class ImportError(KPIException):
    """Raised when data import fails"""
    pass

class CSVFormatError(ImportError):
    """Raised when CSV format is invalid"""
    pass

class ExcelFormatError(ImportError):
    """Raised when Excel format is invalid"""
    pass

class MissingHeadersError(ImportError):
    """Raised when required headers are missing"""
    pass

class DataValidationError(ImportError):
    """Raised when imported data fails validation"""
    pass

# ============================================================================
# Weight & Score Exceptions
# ============================================================================

class WeightDistributionError(KPIException):
    """Raised when weight distribution is invalid"""
    pass

class ScoreCalculationError(KPIException):
    """Raised when score calculation fails"""
    pass

class InvalidFormulaError(ScoreCalculationError):
    """Raised when formula is invalid"""
    pass

class DivisionByZeroError(ScoreCalculationError):
    """Raised when division by zero occurs"""
    pass

# ============================================================================
# Performance Exceptions
# ============================================================================

class PerformanceThresholdError(KPIException):
    """Raised when performance thresholds are invalid"""
    pass

class TargetRangeError(PerformanceThresholdError):
    """Raised when target range is invalid"""
    pass

class ConsecutiveRedError(PerformanceThresholdError):
    """Raised when consecutive red threshold is exceeded"""
    pass

# ============================================================================
# Batch Operation Exceptions
# ============================================================================

class BatchOperationError(KPIException):
    """Raised when batch operation fails"""
    pass

class BatchSizeExceededError(BatchOperationError):
    """Raised when batch size exceeds limit"""
    pass

class PartialBatchError(BatchOperationError):
    """Raised when only part of batch succeeds"""
    pass

# ============================================================================
# WebSocket Exceptions
# ============================================================================

class WebSocketError(KPIException):
    """Raised when WebSocket connection fails"""
    pass

class WebSocketAuthError(WebSocketError):
    """Raised when WebSocket authentication fails"""
    pass

class WebSocketConnectionError(WebSocketError):
    """Raised when WebSocket connection fails"""
    pass

# ============================================================================
# Task Exceptions
# ============================================================================

class TaskExecutionError(KPIException):
    """Raised when Celery task execution fails"""
    pass

class TaskTimeoutError(TaskExecutionError):
    """Raised when task times out"""
    pass

class TaskRetryExhaustedError(TaskExecutionError):
    """Raised when task retries are exhausted"""
    pass


# ============================================================================
# Exception to HTTP Status Mapping
# ============================================================================

EXCEPTION_STATUS_MAP = {
    KPIValidationError: 400,
    InvalidPeriodError: 400,
    FuturePeriodError: 400,
    PastPeriodLockedError: 400,
    TargetPhasingError: 400,
    PhasingLockedError: 403,
    DuplicatePhasingError: 409,
    CascadeError: 400,
    CascadeIntegrityError: 400,
    CascadeSumError: 400,
    CascadeRuleNotFoundError: 404,
    CascadeTargetNotFoundError: 404,
    ValidationNotAllowedError: 403,
    ApprovalError: 403,
    EscalationError: 403,
    PermissionDeniedError: 403,
    PermissionDenied: 403,
    TenantIsolationError: 403,
    CalculationError: 500,
    ConcurrentCalculationError: 409,
    LockAcquisitionError: 503,
    TargetNotFoundError: 404,
    ActualNotFoundError: 404,
    ScoreNotFoundError: 404,
    InvalidKPITypeError: 400,
    InvalidCalculationLogicError: 400,
    InvalidMeasureTypeError: 400,
    InactiveKPICalculationError: 400,
    HistoricalDataError: 409,
    WeightSumError: 400,
    DuplicateKPICodeError: 409,
    RejectionReasonNotFoundError: 404,
    EvidenceUploadError: 500,
    ReportGenerationError: 500,
    MaterializedViewError: 500,
    BudgetAllocationError: 400,
    CascadeWeightError: 400,
    DepartmentBudgetError: 400,
    CascadeValidationError: 400,
    DataSyncError: 500,
    ExternalSourceError: 502,
    DataMappingError: 400,
    SyncConflictError: 409,
    ReportNotFoundError: 404,
    ExportError: 500,
    UnsupportedFormatError: 400,
    NotificationError: 500,
    NotificationDeliveryError: 500,
    NotificationTemplateError: 400,
    ValidationRuleError: 400,
    ThresholdValidationError: 400,
    CrossModelValidationError: 400,
    ReferentialIntegrityError: 400,
    UniqueConstraintError: 409,
    ImportError: 400,
    CSVFormatError: 400,
    ExcelFormatError: 400,
    MissingHeadersError: 400,
    DataValidationError: 400,
    WeightDistributionError: 400,
    ScoreCalculationError: 400,
    InvalidFormulaError: 400,
    DivisionByZeroError: 400,
    PerformanceThresholdError: 400,
    TargetRangeError: 400,
    ConsecutiveRedError: 400,
    BatchOperationError: 400,
    BatchSizeExceededError: 400,
    PartialBatchError: 207,
    WebSocketError: 500,
    WebSocketAuthError: 401,
    WebSocketConnectionError: 500,
    TaskExecutionError: 500,
    TaskTimeoutError: 504,
    TaskRetryExhaustedError: 500,
}