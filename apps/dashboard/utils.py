import json
import hashlib
import hmac
from datetime import datetime, timedelta
from decimal import Decimal, DecimalException
import re
from typing import Dict, List, Any, Optional, Tuple
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# CACHE UTILITIES (STABILITY)
# =============================================================================

def get_cache_key(prefix: str, **kwargs) -> str:
    """
    Generate standardized cache key.
    Security: Use HMAC for sensitive keys.
    """
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    
    key = ":".join(str(p) for p in key_parts)
    
    # For sensitive data, use HMAC (Security)
    if kwargs.get('sensitive'):
        secret = getattr(settings, 'SECRET_KEY', '')
        key = hmac.new(
            secret.encode(),
            key.encode(),
            hashlib.sha256
        ).hexdigest()
    
    return key


def safe_cache_get(key: str, default=None):
    """
    Safely get from cache with error handling.
    Stability: Prevents cache failures from breaking dashboard.
    """
    try:
        return cache.get(key, default)
    except Exception as e:
        logger.warning(f"Cache get failed for key {key}: {e}")
        return default


def safe_cache_set(key: str, value, timeout: int = None):
    """
    Safely set cache with error handling.
    Stability: Prevents cache failures from breaking dashboard.
    """
    try:
        cache.set(key, value, timeout)
        return True
    except Exception as e:
        logger.warning(f"Cache set failed for key {key}: {e}")
        return False


def safe_cache_delete(key: str):
    """Safely delete from cache."""
    try:
        cache.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Cache delete failed for key {key}: {e}")
        return False


# =============================================================================
# SCORE & TRAFFIC LIGHT UTILITIES (SOLIDITY)
# =============================================================================

def calculate_traffic_light(score: float) -> str:
    """
    Calculate traffic light status from score.
    From proposal: Green >=90%, Yellow 50-89%, Red <50%
    """
    from .constants import TrafficLight
    
    if score is None:
        return TrafficLight.YELLOW
    
    if score >= 90:
        return TrafficLight.GREEN
    elif score >= 50:
        return TrafficLight.YELLOW
    else:
        return TrafficLight.RED


def get_traffic_light_color(status: str) -> str:
    """Get CSS color for traffic light status."""
    from .constants import TrafficLight
    
    colors = {
        TrafficLight.GREEN: '#10b981',  # Emerald
        TrafficLight.YELLOW: '#f59e0b',  # Amber
        TrafficLight.RED: '#ef4444',     # Red
    }
    return colors.get(status, '#6b7280')  # Gray default


def aggregate_scores(scores: List[float], weights: List[float] = None) -> float:
    """
    Aggregate multiple scores with optional weights.
    Solidity: Handles edge cases.
    """
    if not scores:
        return 0.0
    
    if weights and len(weights) == len(scores):
        total_weight = sum(weights)
        if total_weight == 0:
            return 0.0
        weighted_sum = sum(s * w for s, w in zip(scores, weights))
        return round(weighted_sum / total_weight, 2)
    
    # Simple average
    return round(sum(scores) / len(scores), 2)


# =============================================================================
# PERIOD UTILITIES (STABILITY)
# =============================================================================

def get_period_dates(period_type: str, reference_date: datetime = None) -> Tuple[datetime, datetime]:
    """
    Get start and end dates for a given period.
    Security: Validates period type.
    """
    if reference_date is None:
        reference_date = timezone.now()
    
    from .constants import Defaults
    
    if period_type == 'daily':
        start = reference_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
    
    elif period_type == 'weekly':
        start = reference_date - timedelta(days=reference_date.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7)
    
    elif period_type == 'monthly':
        start = reference_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
    
    elif period_type == 'quarterly':
        quarter = (reference_date.month - 1) // 3
        start_month = quarter * 3 + 1
        start = reference_date.replace(month=start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        if start_month == 10:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start_month + 3)
    
    elif period_type == 'yearly':
        start = reference_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = start.replace(year=start.year + 1)
    
    else:
        raise ValueError(f"Unknown period type: {period_type}")
    
    return start, end


def get_previous_period(period_type: str, current_start: datetime) -> Tuple[datetime, datetime]:
    """Get previous period dates for comparison."""
    if period_type == 'monthly':
        prev_start = current_start - timedelta(days=1)
        prev_start = prev_start.replace(day=1)
        prev_end = current_start
    elif period_type == 'quarterly':
        prev_start = current_start - timedelta(days=1)
        prev_start = prev_start.replace(month=((prev_start.month - 1) // 3) * 3 + 1, day=1)
        prev_end = current_start
    elif period_type == 'yearly':
        prev_start = current_start.replace(year=current_start.year - 1)
        prev_end = current_start
    else:
        prev_start = current_start - timedelta(days=7)
        prev_end = current_start
    
    return prev_start, prev_end


# =============================================================================
# JSON UTILITIES (SECURITY - Safe parsing)
# =============================================================================

def safe_json_parse(json_string: str, default=None):
    """
    Safely parse JSON with error handling.
    Security: Prevents JSON injection.
    """
    if not json_string:
        return default or {}
    
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse failed: {e}")
        return default or {}


def safe_json_dumps(data: Any, default=None) -> str:
    """Safely dump to JSON."""
    if data is None:
        return default or '{}'
    
    try:
        return json.dumps(data, default=str)
    except TypeError as e:
        logger.warning(f"JSON dump failed: {e}")
        return default or '{}'


# =============================================================================
# PERCENTAGE UTILITIES (SOLIDITY)
# =============================================================================

def calculate_percentage(actual: Decimal, target: Decimal, higher_is_better: bool = True) -> Optional[float]:
    """
    Calculate percentage score based on proposal formulas.
    Higher is Better: (actual / target) * 100
    Lower is Better: (target / actual) * 100
    """
    if target is None or target == 0:
        return None
    
    if actual is None:
        return None
    
    try:
        actual = Decimal(str(actual))
        target = Decimal(str(target))
        
        if higher_is_better:
            score = float((actual / target) * 100)
        else:
            score = float((target / actual) * 100)
        
        # Cap at 100%
        return min(100.0, max(0.0, score))
    
    except (TypeError, DecimalException) as e:
        logger.warning(f"Percentage calculation failed: {e}")
        return None


# =============================================================================
# COLOR UTILITIES (STABILITY)
# =============================================================================

def get_status_color(status: str) -> str:
    """Get status color for UI."""
    colors = {
        'green': '#10b981',
        'yellow': '#f59e0b',
        'red': '#ef4444',
        'pending': '#f59e0b',
        'approved': '#10b981',
        'rejected': '#ef4444',
        'active': '#10b981',
        'inactive': '#9ca3af',
        'expired': '#ef4444',
    }
    return colors.get(status.lower(), '#6b7280')


def get_status_badge_class(status: str) -> str:
    """Get CSS badge class for status."""
    classes = {
        'green': 'badge-success',
        'yellow': 'badge-warning',
        'red': 'badge-danger',
        'pending': 'badge-warning',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
    }
    return classes.get(status.lower(), 'badge-secondary')


# =============================================================================
# VALIDATION UTILITIES (SECURITY)
# =============================================================================

def sanitize_filter_value(value: Any, filter_type: str) -> Any:
    """
    Sanitize filter values to prevent injection.
    Security: Critical for user input.
    """
    if filter_type in ['department_ids', 'kpi_ids', 'owner_ids']:
        if isinstance(value, list):
            # Ensure all items are strings (UUID format)
            return [str(v) for v in value if v]
        return []
    
    if filter_type == 'status':
        allowed = ['green', 'yellow', 'red', 'pending', 'approved', 'rejected']
        return value if value in allowed else None
    
    if filter_type in ['date_from', 'date_to']:
        if value and isinstance(value, str):
            # Validate date format
            if re.match(r'^\d{4}-\d{2}-\d{2}$', value):
                return value
        return None
    
    return value


# =============================================================================
# HIERARCHY UTILITIES (STABILITY)
# =============================================================================

def build_org_tree_path(user_ids: List[str], manager_map: Dict[str, str]) -> Dict[str, Any]:
    """
    Build organization tree path for hierarchy.
    Security: Prevent infinite loops with depth limit.
    """
    from .constants import Defaults
    
    tree = {}
    visited = set()
    
    def build_path(user_id: str, depth: int = 0) -> List[str]:
        if depth > Defaults.MAX_HIERARCHY_DEPTH:
            return []
        
        if user_id in visited:
            return []
        
        visited.add(user_id)
        
        path = [user_id]
        manager_id = manager_map.get(user_id)
        
        if manager_id and manager_id != user_id:
            parent_path = build_path(manager_id, depth + 1)
            path.extend(parent_path)
        
        return path
    
    for user_id in user_ids:
        tree[user_id] = build_path(user_id)
    
    return tree


# =============================================================================
# EXPORT UTILITIES (AVAILABILITY)
# =============================================================================

def get_export_filename(dashboard_type: str, format: str, include_timestamp: bool = True) -> str:
    """Generate export filename."""
    from .constants import ExportFormat
    
    timestamp = f"_{datetime.now().strftime('%Y%m%d_%H%M%S')}" if include_timestamp else ""
    extension = ExportFormat.EXTENSIONS.get(format, '.pdf')
    
    return f"{dashboard_type}_dashboard{timestamp}{extension}"


def sanitize_export_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize data before export.
    Security: Remove sensitive information.
    """
    sensitive_keys = ['password', 'secret', 'token', 'api_key', 'mfa_secret']
    
    def clean_dict(d):
        if not isinstance(d, dict):
            return d
        return {
            k: '***REDACTED***' if k.lower() in sensitive_keys else clean_dict(v)
            for k, v in d.items()
        }
    
    return clean_dict(data)


# =============================================================================
# RATE LIMIT UTILITIES (AVAILABILITY)
# =============================================================================

def get_rate_limit_key(user_id: str, action: str) -> str:
    """Generate rate limit cache key."""
    return f"rate_limit:{action}:{user_id}:{datetime.now().strftime('%Y%m%d%H')}"


def check_rate_limit(user_id: str, action: str, limit: int, period_seconds: int) -> bool:
    """
    Check if user has exceeded rate limit.
    Returns True if within limit, False if exceeded.
    """
    key = get_rate_limit_key(user_id, action)
    current = safe_cache_get(key, 0)
    
    if current >= limit:
        return False
    
    safe_cache_set(key, current + 1, period_seconds)
    return True


# =============================================================================
# LOGGING UTILITIES (AUDIT)
# =============================================================================

def log_dashboard_action(user_id: str, dashboard_type: str, action: str, details: Dict = None, tenant_id: str = None):
    """
    Log dashboard action for audit trail.
    Security: Complete audit logging.
    """
    from .models import DashboardAccessLog
    
    try:
        DashboardAccessLog.objects.log_access(
            user_id=user_id,
            tenant_id=tenant_id,
            dashboard_type=dashboard_type,
            action=action,
            details=details or {}
        )
    except Exception as e:
        logger.error(f"Failed to log dashboard action: {e}")


# =============================================================================
# DEFAULT CONFIGURATION UTILITIES (SOLIDITY)
# =============================================================================

def get_default_widgets_for_role(role: str, dashboard_type: str) -> List[Dict]:
    """Get default widget configuration for a role."""
    from .constants import WidgetType, DashboardType
    
    # Default widgets for Executive
    if dashboard_type == DashboardType.EXECUTIVE:
        return [
            {
                'widget_type': WidgetType.EXECUTIVE_SCORECARD,
                'width': 12, 'height': 3,
                'config': {},
                'title': 'Executive Scorecard'
            },
            {
                'widget_type': WidgetType.ORG_TREE,
                'width': 4, 'height': 6,
                'config': {},
                'title': 'Organization Structure'
            },
            {
                'widget_type': WidgetType.DEPARTMENT_HEATMAP,
                'width': 8, 'height': 6,
                'config': {},
                'title': 'Department Performance'
            },
            {
                'widget_type': WidgetType.RED_ALERT,
                'width': 6, 'height': 4,
                'config': {'threshold_days': 30},
                'title': 'Critical Alerts'
            },
            {
                'widget_type': WidgetType.TREND_CHART,
                'width': 6, 'height': 4,
                'config': {},
                'title': 'Key Trends'
            }
        ]
    
    # Default widgets for Client Admin
    elif dashboard_type == DashboardType.CLIENT_ADMIN:
        return [
            {
                'widget_type': WidgetType.COMPLIANCE,
                'width': 6, 'height': 4,
                'config': {},
                'title': 'Compliance Overview'
            },
            {
                'widget_type': WidgetType.PENDING_APPROVALS,
                'width': 6, 'height': 4,
                'config': {},
                'title': 'Pending Approvals'
            },
            {
                'widget_type': WidgetType.CLIENT_KPI_BREAKDOWN,
                'width': 12, 'height': 5,
                'config': {},
                'title': 'KPI Breakdown'
            },
            {
                'widget_type': WidgetType.MISSING_DATA,
                'width': 6, 'height': 4,
                'config': {'grace_period_days': 5},
                'title': 'Missing Data Alerts'
            },
            {
                'widget_type': WidgetType.RED_ALERT,
                'width': 6, 'height': 4,
                'config': {'threshold_days': 30},
                'title': 'Red KPIs'
            }
        ]
    
    # Default widgets for Super Admin
    elif dashboard_type == DashboardType.SUPER_ADMIN:
        return [
            {
                'widget_type': WidgetType.TENANT_SUMMARY,
                'width': 12, 'height': 5,
                'config': {},
                'title': 'Tenants Overview'
            },
            {
                'widget_type': WidgetType.SUBSCRIPTION_STATUS,
                'width': 6, 'height': 4,
                'config': {},
                'title': 'Subscription Status'
            },
            {
                'widget_type': WidgetType.COMPLIANCE,
                'width': 6, 'height': 4,
                'config': {},
                'title': 'System Health'
            }
        ]
    
    return []


def get_default_filters_for_role(role: str, dashboard_type: str) -> Dict:
    """Get default filters for a role."""
    from .constants import DashboardType
    
    defaults = {
        'period': 'monthly',
        'status': None,
        'department_ids': [],
        'kpi_categories': [],
    }
    
    if dashboard_type == DashboardType.SUPER_ADMIN:
        defaults['show_inactive'] = False
        defaults['subscription_status'] = 'active'
    
    elif dashboard_type == DashboardType.EXECUTIVE:
        defaults['include_subdepartments'] = True
        defaults['aggregate_by'] = 'department'
    
    return defaults