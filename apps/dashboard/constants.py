# apps/dashboard/constants.py
"""
Dashboard constants following 3S strategy.
Security: Role-based constants with clear boundaries.
Stability: Immutable constant definitions.
Solidity: Comprehensive coverage of all dashboard types.
"""

from django.utils.translation import gettext_lazy as _


# =============================================================================
# DASHBOARD TYPES (SECURITY - Role Mapping)
# =============================================================================

class DashboardType:
    """Dashboard type constants with role access mapping."""
    
    EXECUTIVE = 'executive'
    CLIENT_ADMIN = 'client_admin'
    SUPER_ADMIN = 'super_admin'
    MANAGER = 'manager'
    STAFF = 'staff'
    CHAMPION = 'champion'
    READ_ONLY = 'read_only'
    
    CHOICES = [
        (EXECUTIVE, _('Executive Dashboard')),
        (CLIENT_ADMIN, _('Client Admin Dashboard')),
        (SUPER_ADMIN, _('Super Admin Dashboard')),
        (MANAGER, _('Manager Dashboard')),
        (STAFF, _('Staff Dashboard')),
        (CHAMPION, _('Dashboard Champion Dashboard')),
        (READ_ONLY, _('Read-Only Dashboard')),
    ]
    
    # Role to allowed dashboard types mapping (SECURITY)
    ROLE_DASHBOARD_MAP = {
        'super_admin': [SUPER_ADMIN, EXECUTIVE, CLIENT_ADMIN, MANAGER, STAFF, CHAMPION],
        'client_admin': [CLIENT_ADMIN, EXECUTIVE, MANAGER, STAFF, CHAMPION],
        'executive': [EXECUTIVE],
        'dashboard_champion': [CHAMPION, EXECUTIVE],
        'supervisor': [MANAGER, STAFF],
        'staff': [STAFF],
        'read_only': [READ_ONLY],
    }
    
    # Dashboard features per type (STABILITY)
    FEATURES = {
        EXECUTIVE: ['org_wide_view', 'drill_down', 'trend_analysis', 'export', 'comparisons'],
        CLIENT_ADMIN: ['full_config', 'user_management', 'kpi_cascade', 'export', 'alerts'],
        SUPER_ADMIN: ['multi_tenant', 'billing_view', 'system_health', 'all_exports'],
        MANAGER: ['team_view', 'drill_down', 'pending_approvals', 'mission_status'],
        STAFF: ['self_view', 'data_entry', 'mission_status', 'basic_charts'],
        CHAMPION: ['company_targets', 'cascade', 'compliance_tracking', 'aggregate_reports'],
        READ_ONLY: ['view_only', 'no_data_entry', 'no_config'],
    }


# =============================================================================
# WIDGET TYPES (STABILITY - Predefined widgets)
# =============================================================================

class WidgetType:
    """Widget type constants for dashboard customization."""
    
    # Executive & Admin widgets
    KPI_LIST = 'kpi_list'
    TREND_CHART = 'trend_chart'
    DEPARTMENT_HEATMAP = 'department_heatmap'
    COMPLIANCE = 'compliance'
    
    # Alert widgets
    RED_ALERT = 'red_alert'
    PENDING_APPROVALS = 'pending_approvals'
    MISSING_DATA = 'missing_data'
    
    # Super Admin specific
    TENANT_SUMMARY = 'tenant_summary'
    SUBSCRIPTION_STATUS = 'subscription_status'
    
    # Executive specific
    ORG_TREE = 'org_tree'
    EXECUTIVE_SCORECARD = 'executive_scorecard'
    
    # Client Admin specific
    CLIENT_KPI_BREAKDOWN = 'client_kpi_breakdown'
    
    CHOICES = [
        (KPI_LIST, _('KPI List')),
        (TREND_CHART, _('Trend Chart')),
        (DEPARTMENT_HEATMAP, _('Department Heatmap')),
        (COMPLIANCE, _('Compliance Report')),
        (RED_ALERT, _('Red Alert KPIs')),
        (PENDING_APPROVALS, _('Pending Approvals')),
        (MISSING_DATA, _('Missing Data Alert')),
        (TENANT_SUMMARY, _('Tenant Summary')),
        (SUBSCRIPTION_STATUS, _('Subscription Status')),
        (ORG_TREE, _('Organization Tree')),
        (EXECUTIVE_SCORECARD, _('Executive Scorecard')),
        (CLIENT_KPI_BREAKDOWN, _('Client KPI Breakdown')),
    ]
    
    # Widget permissions (SECURITY)
    REQUIRED_ROLES = {
        KPI_LIST: ['staff', 'manager', 'executive', 'client_admin', 'super_admin'],
        TREND_CHART: ['manager', 'executive', 'client_admin', 'super_admin'],
        DEPARTMENT_HEATMAP: ['executive', 'client_admin', 'super_admin'],
        COMPLIANCE: ['client_admin', 'super_admin'],
        RED_ALERT: ['manager', 'executive', 'client_admin', 'super_admin'],
        PENDING_APPROVALS: ['manager', 'client_admin', 'super_admin'],
        MISSING_DATA: ['manager', 'client_admin', 'super_admin'],
        TENANT_SUMMARY: ['super_admin'],
        SUBSCRIPTION_STATUS: ['super_admin'],
        ORG_TREE: ['executive', 'client_admin', 'super_admin'],
        EXECUTIVE_SCORECARD: ['executive', 'client_admin', 'super_admin'],
        CLIENT_KPI_BREAKDOWN: ['client_admin', 'super_admin'],
    }


# =============================================================================
# ALERT TYPES (SECURITY + AVAILABILITY)
# =============================================================================

class AlertType:
    """Alert type constants for dashboard notifications."""
    
    RED_KPI = 'red_kpi'
    MISSING_DATA = 'missing_data'
    PENDING_APPROVAL = 'pending_approval'
    SUBMISSION_DUE = 'submission_due'
    TARGET_ACHIEVED = 'target_achieved'
    KPI_TREND = 'kpi_trend'
    TENANT_EXPIRY = 'tenant_expiry'
    LOW_UTILIZATION = 'low_utilization'
    
    CHOICES = [
        (RED_KPI, _('KPI Red Status')),
        (MISSING_DATA, _('Missing Data')),
        (PENDING_APPROVAL, _('Pending Approval')),
        (SUBMISSION_DUE, _('Submission Due')),
        (TARGET_ACHIEVED, _('Target Achieved')),
        (KPI_TREND, _('KPI Trend Alert')),
        (TENANT_EXPIRY, _('Tenant Expiry')),
        (LOW_UTILIZATION, _('Low Utilization')),
    ]
    
    # Alert severity levels
    SEVERITY_CRITICAL = 'critical'
    SEVERITY_WARNING = 'warning'
    SEVERITY_INFO = 'info'
    
    SEVERITY_CHOICES = [
        (SEVERITY_CRITICAL, _('Critical')),
        (SEVERITY_WARNING, _('Warning')),
        (SEVERITY_INFO, _('Info')),
    ]
    
    # Alert severity mapping (SECURITY - proper escalation)
    DEFAULT_SEVERITY = {
        RED_KPI: SEVERITY_CRITICAL,
        TENANT_EXPIRY: SEVERITY_CRITICAL,
        MISSING_DATA: SEVERITY_WARNING,
        PENDING_APPROVAL: SEVERITY_WARNING,
        SUBMISSION_DUE: SEVERITY_WARNING,
        LOW_UTILIZATION: SEVERITY_WARNING,
        TARGET_ACHIEVED: SEVERITY_INFO,
        KPI_TREND: SEVERITY_INFO,
    }
    
    # Alert frequency options (AVAILABILITY)
    FREQUENCY_REALTIME = 'realtime'
    FREQUENCY_HOURLY = 'hourly'
    FREQUENCY_DAILY = 'daily'
    FREQUENCY_WEEKLY = 'weekly'
    
    FREQUENCY_CHOICES = [
        (FREQUENCY_REALTIME, _('Real-time')),
        (FREQUENCY_HOURLY, _('Hourly')),
        (FREQUENCY_DAILY, _('Daily')),
        (FREQUENCY_WEEKLY, _('Weekly')),
    ]


# =============================================================================
# EXPORT FORMATS (AVAILABILITY)
# =============================================================================

class ExportFormat:
    """Export format constants."""
    
    PDF = 'pdf'
    EXCEL = 'excel'
    CSV = 'csv'
    PNG = 'png'
    
    CHOICES = [
        (PDF, _('PDF')),
        (EXCEL, _('Excel')),
        (CSV, _('CSV')),
        (PNG, _('PNG Image')),
    ]
    
    # MIME types for response headers
    MIME_TYPES = {
        PDF: 'application/pdf',
        EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        CSV: 'text/csv',
        PNG: 'image/png',
    }
    
    # File extensions
    EXTENSIONS = {
        PDF: '.pdf',
        EXCEL: '.xlsx',
        CSV: '.csv',
        PNG: '.png',
    }


# =============================================================================
# SCHEDULE TYPES (STABILITY)
# =============================================================================

class ScheduleType:
    """Schedule type constants for recurring exports/alerts."""
    
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    
    CHOICES = [
        (DAILY, _('Daily')),
        (WEEKLY, _('Weekly')),
        (MONTHLY, _('Monthly')),
        (QUARTERLY, _('Quarterly')),
    ]
    
    # Cron expression mappings (for celery beat)
    CRON_EXPRESSIONS = {
        DAILY: '0 8 * * *',      # 8 AM daily
        WEEKLY: '0 8 * * 1',     # 8 AM Monday
        MONTHLY: '0 8 1 * *',    # 8 AM 1st of month
        QUARTERLY: '0 8 1 */3 *', # 8 AM first day of quarter
    }


# =============================================================================
# COMPARISON TYPES (ANALYTICS)
# =============================================================================

class ComparisonType:
    """Period comparison type constants."""
    
    MONTH_OVER_MONTH = 'mom'
    QUARTER_OVER_QUARTER = 'qoq'
    YEAR_OVER_YEAR = 'yoy'
    CUSTOM = 'custom'
    
    CHOICES = [
        (MONTH_OVER_MONTH, _('Month over Month')),
        (QUARTER_OVER_QUARTER, _('Quarter over Quarter')),
        (YEAR_OVER_YEAR, _('Year over Year')),
        (CUSTOM, _('Custom Periods')),
    ]


# =============================================================================
# CACHE KEYS (STABILITY - Standardized keys)
# =============================================================================

class CacheKeys:
    """Standardized cache key constants."""
    
    DASHBOARD_CONFIG = 'dashboard:config:{tenant_id}:{user_id}:{dashboard_type}'
    DASHBOARD_WIDGETS = 'dashboard:widgets:{tenant_id}:{dashboard_id}'
    DASHBOARD_FAVORITES = 'dashboard:favorites:{tenant_id}:{user_id}'
    DASHBOARD_COMPARISON = 'dashboard:comparison:{tenant_id}:{comparison_id}:{user_id}'
    EXECUTIVE_VIEWS = 'dashboard:executive_views:{tenant_id}:{user_id}'
    TENANT_SNAPSHOT = 'dashboard:tenant_snapshot:{tenant_id}:{client_id}'
    ORG_TREE = 'dashboard:org_tree:{tenant_id}'
    TEAM_AGGREGATE = 'dashboard:team_aggregate:{tenant_id}:{user_id}'
    
    # TTL values (seconds)
    TTL_SHORT = 300      # 5 minutes
    TTL_MEDIUM = 1800    # 30 minutes
    TTL_LONG = 3600      # 1 hour
    TTL_DAY = 86400      # 24 hours
    
    @classmethod
    def format(cls, key_template, **kwargs):
        """Format cache key with provided values."""
        return key_template.format(**kwargs)


# =============================================================================
# RATE LIMITS (AVAILABILITY - Prevent abuse)
# =============================================================================

class RateLimits:
    """Rate limit constants for dashboard API endpoints."""
    
    # Dashboard views per minute per user
    DASHBOARD_VIEW_LIMIT = 60
    DASHBOARD_VIEW_PERIOD = 60  # seconds
    
    # Export requests per hour per user
    EXPORT_LIMIT = 20
    EXPORT_PERIOD = 3600  # seconds
    
    # Widget configuration changes per minute
    WIDGET_CONFIG_LIMIT = 30
    WIDGET_CONFIG_PERIOD = 60
    
    # Dashboard refresh requests
    REFRESH_LIMIT = 120
    REFRESH_PERIOD = 60


# =============================================================================
# DEFAULT VALUES (SOLIDITY - Sensible defaults)
# =============================================================================

class Defaults:
    """Default configuration values."""
    
    # Dashboard layout defaults
    DASHBOARD_LAYOUT = {
        'widgets': [],
        'columns': 12,
        'cell_height': 100,
        'margin': 10,
        'container_padding': 20,
        'breakpoints': {
            'lg': 1200,
            'md': 996,
            'sm': 768,
            'xs': 480,
            'xxs': 0
        }
    }
    
    # Default time period
    DEFAULT_TIME_PERIOD = 'monthly'
    
    # Default refresh interval (seconds)
    DEFAULT_REFRESH_INTERVAL = 60
    
    # Widget default dimensions
    DEFAULT_WIDGET_WIDTH = 4
    DEFAULT_WIDGET_HEIGHT = 2
    
    # Export defaults
    DEFAULT_EXPORT_FORMAT = ExportFormat.PDF
    
    # Alert defaults
    DEFAULT_ALERT_SUPPRESS_MINUTES = 60
    DEFAULT_ALERT_FREQUENCY = AlertType.FREQUENCY_DAILY
    
    # Cache TTL (using CacheKeys TTL values)
    CACHE_TTL = CacheKeys.TTL_MEDIUM
    
    # Pagination
    ITEMS_PER_PAGE = 50
    
    # Hierarchy depth limit (prevent infinite loops)
    MAX_HIERARCHY_DEPTH = 10
    
    # Performance thresholds
    SLOW_QUERY_THRESHOLD_MS = 500
    CACHE_MISS_THRESHOLD = 100  # per minute


# =============================================================================
# TRAFFIC LIGHT CONSTANTS (STABILITY - KPI status)
# =============================================================================

class TrafficLight:
    GREEN = 'green'
    YELLOW = 'yellow'
    RED = 'red'
    CHOICES = [
        (GREEN, _('On Track')),
        (YELLOW, _('At Risk')),
        (RED, _('Off Track')),
    ]
    SCORE_RANGES = {
        GREEN: (90, 100),
        YELLOW: (50, 89),
        RED: (0, 49),
    }
    CSS_CLASSES = {
        GREEN: 'status-green',
        YELLOW: 'status-yellow',
        RED: 'status-red',
    }
    ICONS = {
        GREEN: '✅',
        YELLOW: '⚠️',
        RED: '🔴',
    }