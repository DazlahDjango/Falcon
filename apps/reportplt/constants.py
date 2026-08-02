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
    BACKUP_AUDIT = 'backup_audit'
    DR_COMPLIANCE = 'dr_compliance'
    HEALTH_SLA = 'health_sla'
    MAINTENANCE_AUDIT = 'maintenance_audit'
    KMS_SECURITY = 'kms_security'
    SYSTEM_AUDIT = 'system_audit'
    TENANT_QUOTA = 'tenant_quota'
    RISK_MATRIX = 'risk_matrix'
    TENANT_LIFECYCLE = 'tenant_lifecycle'
    TENANT_RESOURCE_QUOTA = 'tenant_resource_quota'
    TENANT_SCHEMA_HEALTH = 'tenant_schema_health'
    TENANT_DOMAIN_SSL = 'tenant_domain_ssl'
    TENANT_BACKUP_AUDIT = 'tenant_backup_audit'
    TENANT_EXECUTIVE_SUMMARY = 'tenant_executive_summary'
    KPI_INDIVIDUAL_SCORECARD = 'kpi_individual_scorecard'
    KPI_DEPARTMENTAL_HEATMAP = 'kpi_departmental_heatmap'
    KPI_CASCADE_TREE = 'kpi_cascade_tree'
    KPI_RED_ALERTS = 'kpi_red_alerts'
    KPI_VALIDATION_COMPLIANCE = 'kpi_validation_compliance'
    KPI_EXECUTIVE_SUMMARY = 'kpi_executive_summary'
    STRUCTURE_ORG_CHART = 'structure_org_chart'
    STRUCTURE_SPAN_OF_CONTROL = 'structure_span_of_control'
    STRUCTURE_INTERIM_DELEGATION = 'structure_interim_delegation'
    STRUCTURE_COST_CENTER_ALLOCATION = 'structure_cost_center_allocation'
    STRUCTURE_SECURITY_SENSITIVITY = 'structure_security_sensitivity'
    STRUCTURE_EXECUTIVE_SUMMARY = 'structure_executive_summary'
    ACCOUNTS_USER_DIRECTORY = 'accounts_user_directory'
    ACCOUNTS_LOGIN_SECURITY = 'accounts_login_security'
    ACCOUNTS_MFA_COMPLIANCE = 'accounts_mfa_compliance'
    ACCOUNTS_AUDIT_TRAIL = 'accounts_audit_trail'
    ACCOUNTS_ROLE_PERMISSION_AUDIT = 'accounts_role_permission_audit'
    ACCOUNTS_SESSION_ACTIVITY = 'accounts_session_activity'
    ACCOUNTS_PASSWORD_HYGIENE = 'accounts_password_hygiene'
    ACCOUNTS_SECURITY_ANOMALIES = 'accounts_security_anomalies'
    ACCOUNTS_EXECUTIVE_SUMMARY = 'accounts_executive_summary'
    BILLING_SUBSCRIPTION_SUMMARY = 'billing_subscription_summary'
    BILLING_REVENUE_FINANCIAL = 'billing_revenue_financial'
    BILLING_PAYMENT_TRANSACTIONS = 'billing_payment_transactions'
    BILLING_USAGE_QUOTA_AUDIT = 'billing_usage_quota_audit'
    BILLING_DUNNING_RECOVERY = 'billing_dunning_recovery'
    BILLING_EXECUTIVE_SUMMARY = 'billing_executive_summary'
    REVIEWS_INDIVIDUAL_SUMMARY = 'reviews_individual_summary'
    REVIEWS_CYCLE_COMPLIANCE = 'reviews_cycle_compliance'
    REVIEWS_ORGANIZATION_PERFORMANCE = 'reviews_organization_performance'
    REVIEWS_CALIBRATION_IMPACT = 'reviews_calibration_impact'
    REVIEWS_PIP_TRACKER = 'reviews_pip_tracker'
    REVIEWS_EXECUTIVE_SUMMARY = 'reviews_executive_summary'
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
        (BACKUP_AUDIT, _('Backup Execution & Storage Report')),
        (DR_COMPLIANCE, _('Disaster Recovery Readiness Report')),
        (HEALTH_SLA, _('Platform Health & SLA Report')),
        (MAINTENANCE_AUDIT, _('System Maintenance Audit Report')),
        (KMS_SECURITY, _('Security & KMS Rotation Report')),
        (SYSTEM_AUDIT, _('Control-Plane Audit Trail Report')),
        (TENANT_QUOTA, _('Tenant Storage Quota Report')),
        (RISK_MATRIX, _('System Risk Matrix Report')),
        (TENANT_LIFECYCLE, _('Tenant Onboarding & Lifecycle Report')),
        (TENANT_RESOURCE_QUOTA, _('Tenant Resource & Quota Breach Report')),
        (TENANT_SCHEMA_HEALTH, _('Tenant Schema & Migration Health Report')),
        (TENANT_DOMAIN_SSL, _('Tenant Domain & SSL Compliance Report')),
        (TENANT_BACKUP_AUDIT, _('Tenant Data Backup Audit Report')),
        (TENANT_EXECUTIVE_SUMMARY, _('Tenant Multi-Tenant Executive Summary')),
        (KPI_INDIVIDUAL_SCORECARD, _('Individual KPI Performance Scorecard')),
        (KPI_DEPARTMENTAL_HEATMAP, _('Departmental KPI Rollup & Heatmap')),
        (KPI_CASCADE_TREE, _('Chain of Command Target Cascading Tree')),
        (KPI_RED_ALERTS, _('KPI Underperformance & Red Alerts Audit')),
        (KPI_VALIDATION_COMPLIANCE, _('KPI Data Submission & Validation Compliance')),
        (KPI_EXECUTIVE_SUMMARY, _('Organization KPI Strategic Performance Summary')),
        (STRUCTURE_ORG_CHART, _('Organizational Chart & Hierarchy Tree')),
        (STRUCTURE_SPAN_OF_CONTROL, _('Managerial Span of Control Audit')),
        (STRUCTURE_INTERIM_DELEGATION, _('Interim Manager & Delegation Audit')),
        (STRUCTURE_COST_CENTER_ALLOCATION, _('Cost Center & Location Allocation Audit')),
        (STRUCTURE_SECURITY_SENSITIVITY, _('Department Sensitivity & Security Scope Audit')),
        (STRUCTURE_EXECUTIVE_SUMMARY, _('Organizational Structure Executive Summary')),
        (ACCOUNTS_USER_DIRECTORY, _('User Directory & Roster Report')),
        (ACCOUNTS_LOGIN_SECURITY, _('Login Security & Brute-Force Audit')),
        (ACCOUNTS_MFA_COMPLIANCE, _('MFA Adoption & Compliance Report')),
        (ACCOUNTS_AUDIT_TRAIL, _('Accounts Full Audit Trail Report')),
        (ACCOUNTS_ROLE_PERMISSION_AUDIT, _('Role & Permission Coverage Audit')),
        (ACCOUNTS_SESSION_ACTIVITY, _('Active Session Activity Report')),
        (ACCOUNTS_PASSWORD_HYGIENE, _('Password Age & Hygiene Audit')),
        (ACCOUNTS_SECURITY_ANOMALIES, _('Security Anomaly & Threat Detection Report')),
        (ACCOUNTS_EXECUTIVE_SUMMARY, _('IAM & Security Executive Summary')),
        (BILLING_SUBSCRIPTION_SUMMARY, _('Tenant Subscription & MRR/ARR Report')),
        (BILLING_REVENUE_FINANCIAL, _('Revenue Ledger & Tax (VAT) Report')),
        (BILLING_PAYMENT_TRANSACTIONS, _('Payment Transactions & Method Audit')),
        (BILLING_USAGE_QUOTA_AUDIT, _('Tenant Usage & Quota Breach Audit')),
        (BILLING_DUNNING_RECOVERY, _('Dunning Pipeline & Payment Recovery Report')),
        (BILLING_EXECUTIVE_SUMMARY, _('Billing & Monetization Executive Summary')),
        (REVIEWS_INDIVIDUAL_SUMMARY, _('Individual 360 Performance Scorecard Report')),
        (REVIEWS_CYCLE_COMPLIANCE, _('Review Cycle Compliance & Completion Status')),
        (REVIEWS_ORGANIZATION_PERFORMANCE, _('Organization Strategic Review & Bell Curve Report')),
        (REVIEWS_CALIBRATION_IMPACT, _('Calibration Session & Score Shift Impact Audit')),
        (REVIEWS_PIP_TRACKER, _('Performance Improvement Plan (PIP) Tracker')),
        (REVIEWS_EXECUTIVE_SUMMARY, _('Strategic Performance & Talent Executive Summary')),
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

class ReportDataSource:
    KPI = 'kpi'
    REVIEWS = 'reviews'
    TASKS = 'tasks'
    PIP = 'pip'
    COMBINED = 'combined'
    CONFIGS = 'configs'
    TENANT = 'tenant'
    STRUCTURE = 'structure'
    ACCOUNTS = 'accounts'
    BILLING = 'billing'
    CHOICES = [
        (KPI, _('KPI Data')),
        (REVIEWS, _('Review Data')),
        (TASKS, _('Task Data')),
        (PIP, _('PIP Data')),
        (COMBINED, _('Combined Data')),
        (CONFIGS, _('System Configs Data')),
        (TENANT, _('Multi-Tenant Data')),
        (STRUCTURE, _('Org Structure Data')),
        (ACCOUNTS, _('Accounts & Security Data')),
        (BILLING, _('Billing & Financial Data')),
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
    CONFIGS = 'configs'
    TENANT = 'tenant'
    CHOICES = [
        (KPI, _('KPI Data')),
        (REVIEWS, _('Review Data')),
        (TASKS, _('Task Data')),
        (PIP, _('PIP Data')),
        (COMBINED, _('Combined Data')),
        (CONFIGS, _('System Configs Data')),
        (TENANT, _('Tenant Platform Data')),
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