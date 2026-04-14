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

class InvalidFrameworkError(KPIException):
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

# Exception to HTTP status mapping for API responses
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
    InvalidFrameworkError: 400,
    RejectionReasonNotFoundError: 404,
    EvidenceUploadError: 500,
    ReportGenerationError: 500,
    MaterializedViewError: 500,
}