# apps/reportplt/constants.py
from django.utils.translation import gettext_lazy as _

class ReportType:
    KPI = 'kpi'
    DEPARTMENTAL = 'departmental'
    EXECUTIVE = 'executive'
    COMPLIANCE = 'compliance'
    TREND = 'trend'
    COMPARATIVE = 'comparative'
    MISSION = 'mission'
    PIP = 'pip'
    CUSTOM = 'custom'
    CHOICES = [
        (KPI, _('KPI Performance Report')),
        (DEPARTMENTAL, _('Departmental Performance Report')),
        (EXECUTIVE, _('Executive Summary Report')),
        (COMPLIANCE, _('Compliance Report')),
        (TREND, _('Trend Analysis Report')),
        (COMPARATIVE, _('Comparative Report')),
        (MISSION, _('Mission Status Report')),
        (PIP, _('PIP Tracking Report')),
        (CUSTOM, _('Custom Report')),
    ]

class ReportStatus:
    DRAFT = 'draft'
    QUEUED = 'queued'
    GENERATING = 'generating'
    COMPLETED = 'completed'
    FAILED = 'failed'
    ARCHIVED = 'archived'
    CHOICES = [
        (DRAFT, _('Draft')),
        (QUEUED, _('Queued')),
        (GENERATING, _('Generating')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
        (ARCHIVED, _('Archived')),
    ]

class ReportFormat:
    PDF = 'pdf'
    EXCEL = 'excel'
    CSV = 'csv'
    JSON = 'json'
    PPTX = 'pptx'
    HTML = 'html'
    XML = 'xml'
    CHOICES = [
        (PDF, _('PDF')),
        (EXCEL, _('Excel')),
        (CSV, _('CSV')),
        (JSON, _('JSON')),
        (PPTX, _('PowerPoint')),
        (HTML, _('HTML')),
        (XML, _('XML')),
    ]

class ReportCategory:
    OPERATIONAL = 'operational'
    STRATEGIC = 'strategic'
    FINANCIAL = 'financial'
    HR = 'hr'
    COMPLIANCE = 'compliance'
    IMPACT = 'impact'
    PROJECT = 'project'
    CUSTOM = 'custom'
    CHOICES = [
        (OPERATIONAL, _('Operational')),
        (STRATEGIC, _('Strategic')),
        (FINANCIAL, _('Financial')),
        (HR, _('Human Resources')),
        (COMPLIANCE, _('Compliance')),
        (IMPACT, _('Impact')),
        (PROJECT, _('Project')),
        (CUSTOM, _('Custom')),
    ]

class ScheduleFrequency:
    DAILY = 'daily'
    WEEKLY = 'weekly'
    BIWEEKLY = 'biweekly'
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    BIANNUAL = 'biannual'
    ANNUAL = 'annual'
    CUSTOM = 'custom'
    CHOICES = [
        (DAILY, _('Daily')),
        (WEEKLY, _('Weekly')),
        (BIWEEKLY, _('Bi-Weekly')),
        (MONTHLY, _('Monthly')),
        (QUARTERLY, _('Quarterly')),
        (BIANNUAL, _('Bi-Annual')),
        (ANNUAL, _('Annual')),
        (CUSTOM, _('Custom')),
    ]

class TemplateType:
    EXECUTIVE = 'executive'
    DEPARTMENTAL = 'departmental'
    KPI = 'kpi'
    MISSION = 'mission'
    COMPLIANCE = 'compliance'
    TREND = 'trend'
    COMPARATIVE = 'comparative'
    PIP = 'pip'
    CUSTOM = 'custom'
    CHOICES = [
        (EXECUTIVE, _('Executive Dashboard')),
        (DEPARTMENTAL, _('Departmental Scorecard')),
        (KPI, _('KPI Report')),
        (MISSION, _('Mission Status Report')),
        (COMPLIANCE, _('Compliance Report')),
        (TREND, _('Trend Analysis')),
        (COMPARATIVE, _('Comparative Analysis')),
        (PIP, _('PIP Report')),
        (CUSTOM, _('Custom Template')),
    ]

class SectorType:
    COMMERCIAL = 'commercial'
    NGO = 'ngo'
    PUBLIC = 'public'
    CONSULTING = 'consulting'
    ALL = 'all'
    CHOICES = [
        (COMMERCIAL, _('Commercial/Corporate')),
        (NGO, _('NGO/Non-Profit')),
        (PUBLIC, _('Public Sector')),
        (CONSULTING, _('Consulting')),
        (ALL, _('All Sectors')),
    ]

class DashboardType:
    EXECUTIVE = 'executive'
    DEPARTMENTAL = 'departmental'
    TEAM = 'team'
    PERSONAL = 'personal'
    CUSTOM = 'custom'
    CHOICES = [
        (EXECUTIVE, _('Executive Dashboard')),
        (DEPARTMENTAL, _('Departmental Dashboard')),
        (TEAM, _('Team Dashboard')),
        (PERSONAL, _('Personal Dashboard')),
        (CUSTOM, _('Custom Dashboard')),
    ]

class WidgetType:
    KPI = 'kpi'
    CHART = 'chart'
    TABLE = 'table'
    HEATMAP = 'heatmap'
    TREND = 'trend'
    GAUGE = 'gauge'
    PIE = 'pie'
    BAR = 'bar'
    LINE = 'line'
    AREA = 'area'
    SCATTER = 'scatter'
    MAP = 'map'
    LIST = 'list'
    SUMMARY = 'summary'
    MISSION = 'mission'
    PIP = 'pip'
    COMPLIANCE = 'compliance'
    CUSTOM = 'custom'
    CHOICES = [
        (KPI, _('KPI Card')),
        (CHART, _('Chart')),
        (TABLE, _('Table')),
        (HEATMAP, _('Heatmap')),
        (TREND, _('Trend Chart')),
        (GAUGE, _('Gauge')),
        (PIE, _('Pie Chart')),
        (BAR, _('Bar Chart')),
        (LINE, _('Line Chart')),
        (AREA, _('Area Chart')),
        (SCATTER, _('Scatter Plot')),
        (MAP, _('Map')),
        (LIST, _('List')),
        (SUMMARY, _('Summary Card')),
        (MISSION, _('Mission Status')),
        (PIP, _('PIP Tracker')),
        (COMPLIANCE, _('Compliance Status')),
        (CUSTOM, _('Custom Widget')),
    ]

class FilterType:
    DATE_RANGE = 'date_range'
    DROPDOWN = 'dropdown'
    MULTI_SELECT = 'multi_select'
    TEXT = 'text'
    NUMBER = 'number'
    BOOLEAN = 'boolean'
    HIERARCHY = 'hierarchy'
    CUSTOM = 'custom'
    CHOICES = [
        (DATE_RANGE, _('Date Range')),
        (DROPDOWN, _('Dropdown')),
        (MULTI_SELECT, _('Multi-Select')),
        (TEXT, _('Text')),
        (NUMBER, _('Number')),
        (BOOLEAN, _('Boolean')),
        (HIERARCHY, _('Hierarchical')),
        (CUSTOM, _('Custom')),
    ]

class ShareType:
    INTERNAL = 'internal'
    EXTERNAL = 'external'
    PUBLIC = 'public'
    CHOICES = [
        (INTERNAL, _('Internal Share')),
        (EXTERNAL, _('External Share')),
        (PUBLIC, _('Public Link')),
    ]

class SharePermission:
    VIEW = 'view'
    COMMENT = 'comment'
    EDIT = 'edit'
    EXPORT = 'export'
    CHOICES = [
        (VIEW, _('View Only')),
        (COMMENT, _('View & Comment')),
        (EDIT, _('View, Comment & Edit')),
        (EXPORT, _('View, Comment, Edit & Export')),
    ]

class AuditAction:
    VIEW = 'view'
    CREATE = 'create'
    EDIT = 'edit'
    DELETE = 'delete'
    EXPORT = 'export'
    SHARE = 'share'
    SCHEDULE = 'schedule'
    GENERATE = 'generate'
    REFRESH = 'refresh'
    ARCHIVE = 'archive'
    RESTORE = 'restore'
    PERMISSION_CHANGE = 'permission_change'
    CONFIG_CHANGE = 'config_change'
    LOGIN = 'login'
    LOGOUT = 'logout'
    CHOICES = [
        (VIEW, _('View')),
        (CREATE, _('Create')),
        (EDIT, _('Edit')),
        (DELETE, _('Delete')),
        (EXPORT, _('Export')),
        (SHARE, _('Share')),
        (SCHEDULE, _('Schedule')),
        (GENERATE, _('Generate')),
        (REFRESH, _('Refresh')),
        (ARCHIVE, _('Archive')),
        (RESTORE, _('Restore')),
        (PERMISSION_CHANGE, _('Permission Change')),
        (CONFIG_CHANGE, _('Configuration Change')),
        (LOGIN, _('Login')),
        (LOGOUT, _('Logout')),
    ]

class ExecutionStatus:
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    TIMEOUT = 'timeout'
    CHOICES = [
        (PENDING, _('Pending')),
        (RUNNING, _('Running')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
        (CANCELLED, _('Cancelled')),
        (TIMEOUT, _('Timeout')),
    ]

class DeliveryMethod:
    DOWNLOAD = 'download'
    EMAIL = 'email'
    S3 = 's3'
    WEBHOOK = 'webhook'
    CHOICES = [
        (DOWNLOAD, _('Download')),
        (EMAIL, _('Email')),
        (S3, _('S3 Storage')),
        (WEBHOOK, _('Webhook')),
    ]

class DataSource:
    KPI = 'kpi'
    REVIEWS = 'reviews'
    TASKS = 'tasks'
    PIP = 'pip'
    COMBINED = 'combined'
    CHOICES = [
        (KPI, _('KPI Data')),
        (REVIEWS, _('Review Data')),
        (TASKS, _('Task Data')),
        (PIP, _('PIP Data')),
        (COMBINED, _('Combined Data')),
    ]

DEFAULT_REPORT_CONFIG = {
    'page_size': 'A4',
    'orientation': 'portrait',
    'margins': {'top': 25, 'bottom': 25, 'left': 20, 'right': 20},
    'font_family': 'Arial',
    'font_size': 10,
    'show_page_numbers': True,
    'show_timestamp': True,
    'date_format': '%Y-%m-%d',
    'datetime_format': '%Y-%m-%d %H:%M:%S',
}

DEFAULT_CHART_CONFIG = {
    'width': 800,
    'height': 400,
    'responsive': True,
    'show_legend': True,
    'show_tooltip': True,
    'animation': True,
    'theme': 'light',
}

DEFAULT_TABLE_CONFIG = {
    'responsive': True,
    'striped': True,
    'bordered': True,
    'hover': True,
    'small': False,
    'show_footer': True,
}

DEFAULT_DASHBOARD_CONFIG = {
    'grid_columns': 12,
    'row_height': 100,
    'spacing': 10,
    'theme': 'light',
    'auto_refresh': True,
    'refresh_interval': 300,
}

CACHE_TTL = {
    'default': 3600,
    'short': 300,
    'medium': 1800,
    'long': 86400,
    'very_long': 604800,
}

MAX_EXPORT_SIZE = 50 * 1024 * 1024
MAX_ROWS_PER_EXPORT = 100000
MAX_ROWS_PER_REPORT = 50000
DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 1000

REPORT_TEMPLATE_VERSIONS = {
    'v1': '1.0.0',
    'v2': '2.0.0',
    'current': '2.0.0',
}

REPORT_MIME_TYPES = {
    'pdf': 'application/pdf',
    'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'json': 'application/json',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'html': 'text/html',
    'xml': 'application/xml',
}

REPORT_FILE_EXTENSIONS = {
    'pdf': '.pdf',
    'excel': '.xlsx',
    'csv': '.csv',
    'json': '.json',
    'pptx': '.pptx',
    'html': '.html',
    'xml': '.xml',
}