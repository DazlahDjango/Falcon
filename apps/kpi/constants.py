from django.db import models


class KPIStatus(models.TextChoices):
    """KPI lifecycle status"""
    DRAFT = 'DRAFT', 'Draft'
    ACTIVE = 'ACTIVE', 'Active'
    ARCHIVED = 'ARCHIVED', 'Archived'
    SUSPENDED = 'SUSPENDED', 'Suspended'


class KPIType(models.TextChoices):
    """KPI data types"""
    COUNT = 'COUNT', 'Count / Number'
    PERCENTAGE = 'PERCENTAGE', 'Percentage (%)'
    FINANCIAL = 'FINANCIAL', 'Financial Amount'
    MILESTONE = 'MILESTONE', 'Yes / No Milestone'
    TIME = 'TIME', 'Time / Turnaround'
    IMPACT = 'IMPACT', 'Impact Score'


class CalculationLogic(models.TextChoices):
    """Calculation formula types"""
    HIGHER_IS_BETTER = 'HIGHER_IS_BETTER', 'Higher is Better'
    LOWER_IS_BETTER = 'LOWER_IS_BETTER', 'Lower is Better'


class MeasureType(models.TextChoices):
    """Cumulative vs non-cumulative measures"""
    CUMULATIVE = 'CUMULATIVE', 'Cumulative (YTD)'
    NON_CUMULATIVE = 'NON_CUMULATIVE', 'Non-Cumulative (Period Only)'


class TrafficLightStatus(models.TextChoices):
    """Traffic light status"""
    GREEN = 'GREEN', 'On Track'
    YELLOW = 'YELLOW', 'At Risk'
    RED = 'RED', 'Off Track'


class ValidationStatus(models.TextChoices):
    """Validation status for actual data"""
    PENDING = 'PENDING', 'Pending Validation'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    ADJUSTED = 'ADJUSTED', 'Adjusted'


class EscalationStatus(models.TextChoices):
    """Escalation status"""
    PENDING = 'PENDING', 'Pending'
    REVIEWING = 'REVIEWING', 'Under Review'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'


class FrameworkStatus(models.TextChoices):
    """KPI Framework status"""
    DRAFT = 'DRAFT', 'Draft'
    PUBLISHED = 'PUBLISHED', 'Published'
    ARCHIVED = 'ARCHIVED', 'Archived'


class SectorType(models.TextChoices):
    """Sector types for multi-sector flexibility"""
    COMMERCIAL = 'COMMERCIAL', 'Commercial / Corporate'
    NGO = 'NGO', 'NGO / Non-Profit'
    PUBLIC = 'PUBLIC', 'Public Sector / Government'
    CONSULTING = 'CONSULTING', 'Consulting / Professional Services'


class CategoryType(models.TextChoices):
    """KPI category types"""
    FINANCIAL = 'FINANCIAL', 'Financial'
    IMPACT = 'IMPACT', 'Impact / Outcomes'
    OPERATIONAL = 'OPERATIONAL', 'Operational'
    CUSTOMER = 'CUSTOMER', 'Customer / Stakeholder'
    INTERNAL = 'INTERNAL', 'Internal Process'
    GROWTH = 'GROWTH', 'Growth & Learning'
    COMPLIANCE = 'COMPLIANCE', 'Compliance & Risk'


class DependencyType(models.TextChoices):
    """KPI dependency types"""
    DRIVER = 'DRIVER', 'Driver (affects)'
    OUTCOME = 'OUTCOME', 'Outcome (affected by)'
    CORRELATED = 'CORRELATED', 'Correlated'
    CONSTRAINT = 'CONSTRAINT', 'Constraint'


class LinkageType(models.TextChoices):
    """Strategic linkage types"""
    PRIMARY = 'PRIMARY', 'Primary Driver'
    SECONDARY = 'SECONDARY', 'Secondary Driver'
    INDICATOR = 'INDICATOR', 'Leading Indicator'
    LAGGING = 'LAGGING', 'Lagging Indicator'


class AggregationLevel(models.TextChoices):
    """Score aggregation levels"""
    INDIVIDUAL = 'INDIVIDUAL', 'Individual'
    TEAM = 'TEAM', 'Team'
    DEPARTMENT = 'DEPARTMENT', 'Department'
    ORGANIZATION = 'ORGANIZATION', 'Organization'


class CalculationType(models.TextChoices):
    """Calculation log types"""
    SCORE = 'SCORE', 'Score Calculation'
    AGGREGATE = 'AGGREGATE', 'Aggregation'
    TRAFFIC_LIGHT = 'TRAFFIC_LIGHT', 'Traffic Light'
    TREND = 'TREND', 'Trend Analysis'
    CASCADE = 'CASCADE', 'Cascade Calculation'


class CascadeRuleType(models.TextChoices):
    """Cascade rule types"""
    EQUAL_SPLIT = 'EQUAL_SPLIT', 'Equal Split'
    WEIGHTED = 'WEIGHTED', 'Weighted by Headcount'
    WEIGHTED_BY_BUDGET = 'WEIGHTED_BY_BUDGET', 'Weighted by Budget'
    CUSTOM = 'CUSTOM', 'Custom'


class PhasingStrategy(models.TextChoices):
    """Target phasing strategies"""
    EQUAL_SPLIT = 'EQUAL_SPLIT', 'Equal Split Across Months'
    SEASONAL = 'SEASONAL', 'Seasonal Distribution'
    CUSTOM_PATTERN = 'CUSTOM_PATTERN', 'Custom Pattern'


class TrendDirection(models.TextChoices):
    """Trend analysis directions"""
    IMPROVING = 'IMPROVING', 'Improving'
    DECLINING = 'DECLINING', 'Declining'
    STABLE = 'STABLE', 'Stable'
    VOLATILE = 'VOLATILE', 'Volatile'


class RiskLevel(models.TextChoices):
    """Risk prediction levels"""
    LOW = 'LOW', 'Low Risk'
    MEDIUM = 'MEDIUM', 'Medium Risk'
    HIGH = 'HIGH', 'High Risk'
    CRITICAL = 'CRITICAL', 'Critical Risk'


# Default threshold values
DEFAULT_GREEN_THRESHOLD = 90
DEFAULT_YELLOW_THRESHOLD = 50

# Notification thresholds
RED_ALERT_CONSECUTIVE_MONTHS = 2
VALIDATION_REMINDER_HOURS = 48
MISSING_DATA_DAY = 5

# Performance periods
MONTHS_IN_YEAR = 12
QUARTERS_IN_YEAR = 4

# Calculation precision
SCALE_DECIMAL_PLACES = 2
MAX_DECIMAL_DIGITS = 20
CURRENCY_DECIMAL_PLACES = 2

# Cache timeouts (seconds)
CACHE_SCORE_TIMEOUT = 3600
CACHE_DASHBOARD_TIMEOUT = 300
CACHE_AGGREGATION_TIMEOUT = 1800

# Batch sizes
BULK_CREATE_BATCH_SIZE = 1000
BULK_UPDATE_BATCH_SIZE = 500
CALCULATION_BATCH_SIZE = 100

# API rate limits
RATE_LIMIT_CALCULATIONS = '10/hour'
RATE_LIMIT_BULK_UPLOAD = '5/minute'
RATE_LIMIT_DASHBOARD = '100/minute'