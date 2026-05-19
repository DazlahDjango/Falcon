import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .constants import DashboardType, WidgetType, ExportFormat, ScheduleType, AlertType


# =============================================================================
# DASHBOARD VALIDATORS
# =============================================================================

def validate_dashboard_type(value):
    """Validate dashboard type against allowed choices."""
    allowed_types = [choice[0] for choice in DashboardType.CHOICES]
    if value not in allowed_types:
        raise ValidationError(
            _('%(value)s is not a valid dashboard type. Allowed: %(allowed)s'),
            params={'value': value, 'allowed': ', '.join(allowed_types)},
            code='invalid_dashboard_type'
        )


def validate_dashboard_layout(layout):
    """
    Validate dashboard layout structure.
    Security: Prevent malicious JSON injection.
    Stability: Ensure layout has required structure.
    """
    if not isinstance(layout, dict):
        raise ValidationError(_('Layout must be a dictionary'), code='invalid_layout_type')
    
    required_keys = ['widgets', 'columns']
    for key in required_keys:
        if key not in layout:
            raise ValidationError(
                _('Layout missing required key: %(key)s'),
                params={'key': key},
                code='missing_layout_key'
            )
    
    if not isinstance(layout.get('widgets'), list):
        raise ValidationError(_('Layout widgets must be a list'), code='invalid_widgets')
    
    columns = layout.get('columns', 12)
    if not isinstance(columns, int) or columns < 1 or columns > 24:
        raise ValidationError(_('Columns must be between 1 and 24'), code='invalid_columns')
    
    # Validate each widget position (Integrity)
    positions = set()
    for widget in layout.get('widgets', []):
        row = widget.get('row', 0)
        col = widget.get('col', 0)
        position_key = f"{row}_{col}"
        
        if position_key in positions:
            raise ValidationError(
                _('Duplicate widget position: row %(row)s, col %(col)s'),
                params={'row': row, 'col': col},
                code='duplicate_position'
            )
        positions.add(position_key)
        
        # Validate dimensions
        width = widget.get('width', 4)
        height = widget.get('height', 2)
        if width < 1 or width > 12:
            raise ValidationError(_('Widget width must be between 1 and 12'), code='invalid_width')
        if height < 1 or height > 12:
            raise ValidationError(_('Widget height must be between 1 and 12'), code='invalid_height')
        if col + width > columns:
            raise ValidationError(
                _('Widget at col %(col)s with width %(width)s exceeds %(columns)s columns'),
                params={'col': col, 'width': width, 'columns': columns},
                code='widget_overflow'
            )


def validate_dashboard_filters(filters):
    """
    Validate dashboard filter values.
    Security: Prevent SQL injection and malicious input.
    """
    if not isinstance(filters, dict):
        raise ValidationError(_('Filters must be a dictionary'), code='invalid_filters_type')
    
    allowed_filter_keys = ['period', 'department_ids', 'kpi_categories', 'status', 'date_from', 'date_to', 'owner_ids']
    
    for key, value in filters.items():
        if key not in allowed_filter_keys:
            raise ValidationError(
                _('Unknown filter key: %(key)s. Allowed: %(allowed)s'),
                params={'key': key, 'allowed': ', '.join(allowed_filter_keys)},
                code='unknown_filter_key'
            )
        
        # Validate period filter
        if key == 'period':
            allowed_periods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
            if value and value not in allowed_periods:
                raise ValidationError(
                    _('Invalid period: %(value)s. Allowed: %(allowed)s'),
                    params={'value': value, 'allowed': ', '.join(allowed_periods)},
                    code='invalid_period'
                )
        
        # Validate date ranges
        if key in ['date_from', 'date_to'] and value:
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(value)):
                raise ValidationError(
                    _('Date must be in YYYY-MM-DD format'),
                    code='invalid_date_format'
                )
        
        # Validate ID lists (Security: ensure they are UUIDs or integers)
        if key in ['department_ids', 'kpi_categories', 'owner_ids'] and value:
            if not isinstance(value, list):
                raise ValidationError(
                    _('%(key)s must be a list'),
                    params={'key': key},
                    code='filter_not_list'
                )


# =============================================================================
# WIDGET VALIDATORS
# =============================================================================

def validate_widget_type(value):
    """Validate widget type against allowed choices."""
    allowed_types = [choice[0] for choice in WidgetType.CHOICES]
    if value not in allowed_types:
        raise ValidationError(
            _('%(value)s is not a valid widget type. Allowed: %(allowed)s'),
            params={'value': value, 'allowed': ', '.join(allowed_types)},
            code='invalid_widget_type'
        )


def validate_widget_config(widget_type, config):
    """
    Validate widget configuration based on widget type.
    Security: Prevent malicious config injection.
    """
    if not isinstance(config, dict):
        raise ValidationError(_('Widget config must be a dictionary'), code='invalid_config_type')
    
    # Type-specific validations (Solidity)
    if widget_type == WidgetType.KPI_LIST:
        required = ['kpi_ids']
        for req in required:
            if req not in config:
                raise ValidationError(
                    _('KPI List widget requires %(req)s in config'),
                    params={'req': req},
                    code='missing_kpi_list_config'
                )
        if not isinstance(config.get('kpi_ids'), list):
            raise ValidationError(_('kpi_ids must be a list'), code='kpi_ids_not_list')
    
    elif widget_type == WidgetType.TREND_CHART:
        if 'kpi_id' not in config:
            raise ValidationError(_('Trend chart requires kpi_id in config'), code='missing_trend_config')
    
    elif widget_type == WidgetType.RED_ALERT:
        threshold_days = config.get('threshold_days', 30)
        if not isinstance(threshold_days, int) or threshold_days < 1 or threshold_days > 365:
            raise ValidationError(_('threshold_days must be between 1 and 365'), code='invalid_threshold')
    
    elif widget_type == WidgetType.TENANT_SUMMARY:
        if 'metrics' not in config:
            config['metrics'] = ['total_users', 'avg_score', 'submission_rate']
        allowed_metrics = ['total_users', 'active_users', 'avg_score', 'submission_rate', 'green_percentage']
        for metric in config.get('metrics', []):
            if metric not in allowed_metrics:
                raise ValidationError(
                    _('Unknown metric: %(metric)s. Allowed: %(allowed)s'),
                    params={'metric': metric, 'allowed': ', '.join(allowed_metrics)},
                    code='unknown_metric'
                )


def validate_widget_position(row, col, width, height, columns=12):
    """Validate widget position and dimensions."""
    if row < 0:
        raise ValidationError(_('Row cannot be negative'), code='negative_row')
    if col < 0:
        raise ValidationError(_('Column cannot be negative'), code='negative_col')
    if width < 1 or width > columns:
        raise ValidationError(_('Width must be between 1 and columns'), code='invalid_width')
    if height < 1 or height > 12:
        raise ValidationError(_('Height must be between 1 and 12'), code='invalid_height')
    if col + width > columns:
        raise ValidationError(_('Widget exceeds column boundary'), code='boundary_exceeded')


# =============================================================================
# ALERT VALIDATORS
# =============================================================================

def validate_alert_type(value):
    """Validate alert type against allowed choices."""
    allowed_types = [choice[0] for choice in AlertType.CHOICES]
    if value not in allowed_types:
        raise ValidationError(
            _('%(value)s is not a valid alert type'),
            params={'value': value},
            code='invalid_alert_type'
        )


def validate_alert_config(alert_type, config):
    """
    Validate alert configuration.
    Security: Prevent alert abuse.
    """
    if not isinstance(config, dict):
        raise ValidationError(_('Alert config must be a dictionary'), code='invalid_config')
    
    if alert_type == AlertType.RED_KPI:
        threshold_days = config.get('threshold_days', 30)
        if not isinstance(threshold_days, int) or threshold_days < 1 or threshold_days > 90:
            raise ValidationError(_('threshold_days must be between 1 and 90'), code='invalid_threshold')
    
    elif alert_type == AlertType.MISSING_DATA:
        grace_period = config.get('grace_period_days', 5)
        if not isinstance(grace_period, int) or grace_period < 1 or grace_period > 15:
            raise ValidationError(_('grace_period_days must be between 1 and 15'), code='invalid_grace_period')
    
    elif alert_type == AlertType.TENANT_EXPIRY:
        days_before = config.get('days_before_notice', 30)
        if not isinstance(days_before, int) or days_before < 1 or days_before > 90:
            raise ValidationError(_('days_before_notice must be between 1 and 90'), code='invalid_notice_days')


def validate_alert_frequency(frequency):
    """Validate alert frequency."""
    allowed_frequencies = [choice[0] for choice in AlertType.FREQUENCY_CHOICES]
    if frequency not in allowed_frequencies:
        raise ValidationError(
            _('%(frequency)s is not a valid frequency'),
            params={'frequency': frequency},
            code='invalid_frequency'
        )


# =============================================================================
# EXPORT VALIDATORS
# =============================================================================

def validate_export_format(value):
    """Validate export format."""
    allowed_formats = [choice[0] for choice in ExportFormat.CHOICES]
    if value not in allowed_formats:
        raise ValidationError(
            _('%(value)s is not a valid export format'),
            params={'value': value},
            code='invalid_export_format'
        )


def validate_schedule_type(value):
    """Validate schedule type."""
    allowed_schedules = [choice[0] for choice in ScheduleType.CHOICES]
    if value not in allowed_schedules:
        raise ValidationError(
            _('%(value)s is not a valid schedule type'),
            params={'value': value},
            code='invalid_schedule_type'
        )


def validate_schedule_config(schedule_type, config):
    """Validate schedule configuration based on type."""
    if not isinstance(config, dict):
        raise ValidationError(_('Schedule config must be a dictionary'), code='invalid_config')
    
    if schedule_type == ScheduleType.WEEKLY:
        day_of_week = config.get('day_of_week', 1)
        if not isinstance(day_of_week, int) or day_of_week < 0 or day_of_week > 6:
            raise ValidationError(_('day_of_week must be 0-6 (Monday=0, Sunday=6)'), code='invalid_day')
    
    elif schedule_type == ScheduleType.MONTHLY:
        day_of_month = config.get('day_of_month', 1)
        if not isinstance(day_of_month, int) or day_of_month < 1 or day_of_month > 28:
            raise ValidationError(_('day_of_month must be between 1 and 28'), code='invalid_day')
    time_of_day = config.get('time_of_day', '08:00')
    if not re.match(r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', time_of_day):
        raise ValidationError(_('time_of_day must be in HH:MM format'), code='invalid_time')

# =============================================================================
# COMPARISON VALIDATORS
# =============================================================================

def validate_comparison_type(value):
    from apps.dashboard.constants import ComparisonType
    allowed_types = [choice[0] for choice in ComparisonType.CHOICES]
    if value not in allowed_types:
        raise ValidationError(
            _('%(value)s is not a valid comparison type'),
            params={'value': value},
            code='invalid_comparison_type'
        )


def validate_period_definition(period):
    """Validate period definition (year, month, quarter)."""
    if not isinstance(period, dict):
        raise ValidationError(_('Period must be a dictionary'), code='invalid_period')
    
    required_keys = ['year']
    for key in required_keys:
        if key not in period:
            raise ValidationError(_('Period missing %(key)s'), params={'key': key}, code='missing_period_key')
    
    year = period.get('year')
    if not isinstance(year, int) or year < 2000 or year > 2100:
        raise ValidationError(_('Year must be between 2000 and 2100'), code='invalid_year')
    
    if 'month' in period:
        month = period['month']
        if not isinstance(month, int) or month < 1 or month > 12:
            raise ValidationError(_('Month must be between 1 and 12'), code='invalid_month')
    
    if 'quarter' in period:
        quarter = period['quarter']
        if not isinstance(quarter, int) or quarter < 1 or quarter > 4:
            raise ValidationError(_('Quarter must be between 1 and 4'), code='invalid_quarter')


# =============================================================================
# HIERARCHY VALIDATORS (SECURITY - Prevent infinite loops)
# =============================================================================

def validate_hierarchy_depth(depth, max_depth=10):
    """Validate hierarchy depth to prevent infinite loops."""
    if depth > max_depth:
        raise ValidationError(
            _('Hierarchy depth exceeds maximum of %(max_depth)s'),
            params={'max_depth': max_depth},
            code='max_depth_exceeded'
        )
    return depth


def validate_tenant_access(requested_tenant_id, user_tenant_id):
    """
    Validate tenant access.
    Security: Enforce tenant isolation.
    """
    if str(requested_tenant_id) != str(user_tenant_id):
        raise ValidationError(
            _('Access denied: tenant mismatch'),
            code='tenant_mismatch'
        )


# =============================================================================
# ROLE VALIDATORS (SECURITY - Role-based access)
# =============================================================================

def validate_role_dashboard_access(role, dashboard_type):
    """Validate if a role can access a dashboard type."""
    allowed = DashboardType.ROLE_DASHBOARD_MAP.get(role, [])
    if dashboard_type not in allowed:
        raise ValidationError(
            _('Role %(role)s cannot access %(dashboard_type)s dashboard'),
            params={'role': role, 'dashboard_type': dashboard_type},
            code='unauthorized_dashboard_access'
        )
    return True

def validate_widget_role_access(role, widget_type):
    allowed_roles = WidgetType.REQUIRED_ROLES.get(widget_type, [])
    if role not in allowed_roles:
        raise ValidationError(
            _('Role %(role)s cannot use %(widget_type)s widget'),
            params={'role': role, 'widget_type': widget_type},
            code='unauthorized_widget_access'
        )
    return True