# apps/reportplt/exceptions.py
from django.core.exceptions import ValidationError
from rest_framework.exceptions import APIException

class ReportError(APIException):
    """Base exception for report errors"""
    status_code = 400
    default_detail = 'A report error occurred.'
    default_code = 'report_error'

class ReportGenerationError(ReportError):
    """Raised when report generation fails"""
    pass

class ReportRenderError(ReportError):
    """Raised when report rendering fails"""
    pass

class ReportExportError(ReportError):
    """Raised when report export fails"""
    pass

class ReportScheduleError(ReportError):
    """Raised when report scheduling fails"""
    pass

class ReportExecutionError(ReportError):
    """Raised when report execution fails"""
    pass

class ReportCacheError(ReportError):
    """Raised when report caching fails"""
    pass

class ReportValidationError(ReportError, ValidationError):
    """Raised when report validation fails"""
    pass

class ReportPermissionError(ReportError):
    """Raised when user lacks permission for report action"""
    status_code = 403
    default_detail = 'Permission denied'
    default_code = 'permission_denied'

class ReportNotFoundError(ReportError):
    """Raised when report is not found"""
    status_code = 404
    default_detail = 'Report not found'
    default_code = 'report_not_found'

class TemplateNotFoundError(ReportError):
    """Raised when template is not found"""
    status_code = 404
    default_detail = 'Template not found'
    default_code = 'template_not_found'

class TemplateRenderError(ReportError):
    """Raised when template rendering fails"""
    pass

class InvalidReportTypeError(ReportError):
    """Raised when invalid report type is specified"""
    pass

class InvalidFormatError(ReportError):
    """Raised when invalid export format is specified"""
    pass

class DataSourceError(ReportError):
    """Raised when data source query fails"""
    pass

class QueryBuilderError(ReportError):
    """Raised when query building fails"""
    pass

class AggregationError(ReportError):
    """Raised when data aggregation fails"""
    pass

class ChartRenderError(ReportError):
    """Raised when chart rendering fails"""
    pass

class ExportTooLargeError(ReportExportError):
    """Raised when export exceeds size limit"""
    pass

class ExportTooManyRowsError(ReportExportError):
    """Raised when export exceeds row limit"""
    pass

class DashboardError(ReportError):
    """Raised when dashboard operation fails"""
    pass

class WidgetError(ReportError):
    """Raised when widget operation fails"""
    pass

class WidgetDataError(ReportError):
    """Raised when widget data fetching fails"""
    pass

class FilterError(ReportError):
    """Raised when filter operation fails"""
    pass

class FilterValidationError(FilterError):
    """Raised when filter validation fails"""
    pass

class ShareError(ReportError):
    """Raised when share operation fails"""
    pass

class ShareExpiredError(ShareError):
    """Raised when share link is expired"""
    pass

class ShareInvalidTokenError(ShareError):
    """Raised when share token is invalid"""
    pass

class AuditError(ReportError):
    """Raised when audit logging fails"""
    pass

class SchedulerError(ReportError):
    """Raised when scheduler operation fails"""
    pass

class DeliveryError(ReportError):
    """Raised when report delivery fails"""
    pass

class ReportAPIError(APIException):
    """Base API exception for report endpoints"""
    status_code = 400
    default_detail = 'Report API error'
    default_code = 'report_error'

class ReportNotFoundAPIError(ReportAPIError):
    status_code = 404
    default_detail = 'Report not found'
    default_code = 'report_not_found'

class ReportPermissionAPIError(ReportAPIError):
    status_code = 403
    default_detail = 'Permission denied'
    default_code = 'permission_denied'

class ReportValidationAPIError(ReportAPIError):
    status_code = 400
    default_detail = 'Validation error'
    default_code = 'validation_error'

class ReportGenerationAPIError(ReportAPIError):
    status_code = 500
    default_detail = 'Report generation failed'
    default_code = 'generation_failed'

class ReportExportAPIError(ReportAPIError):
    status_code = 500
    default_detail = 'Report export failed'
    default_code = 'export_failed'

class RateLimitExceededError(ReportError):
    """Raised when rate limit is exceeded"""
    pass

class ConcurrentGenerationError(ReportError):
    """Raised when report is already being generated"""
    pass

class StaleDataError(ReportError):
    """Raised when data is stale and needs refresh"""
    pass

class IncompatibleDataError(ReportError):
    """Raised when data is incompatible with report configuration"""
    pass

class MissingParameterError(ReportError):
    """Raised when required parameter is missing"""
    pass

class InvalidParameterError(ReportError):
    """Raised when parameter is invalid"""
    pass

class ParameterTypeError(ReportError):
    """Raised when parameter type is incorrect"""
    pass

class DataNotFoundError(ReportError):
    """Raised when no data is found for report"""
    pass