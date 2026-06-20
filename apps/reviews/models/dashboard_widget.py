# apps/reviews/models/dashboard_widget.py
"""
Dashboard Widget Model - User-configurable dashboard widgets
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError
from apps.reviews.constants import WidgetType, WidgetSize
from .base import ReviewBaseModel



class DashboardWidget(ReviewBaseModel):
    """
    User-configurable dashboard widgets for personalized dashboards.
    Users can add/remove/rearrange widgets on their dashboard.
    """
    
    class WidgetType(models.TextChoices):
        # KPI Widgets
        KPI_SCORECARD = 'kpi_scorecard', 'KPI Scorecard'
        KPI_TREND = 'kpi_trend', 'KPI Trend'
        
        # Review Widgets
        PENDING_REVIEWS = 'pending_reviews', 'Pending Reviews'
        CYCLE_PROGRESS = 'cycle_progress', 'Cycle Progress'
        COMPLETION_RATE = 'completion_rate', 'Completion Rate'
        RATING_DISTRIBUTION = 'rating_distribution', 'Rating Distribution'
        
        # Employee Widgets
        TOP_PERFORMERS = 'top_performers', 'Top Performers'
        AT_RISK_EMPLOYEES = 'at_risk', 'At Risk Employees'
        PIP_STATUS = 'pip_status', 'PIP Status'
        
        # Analytics Widgets
        DEPARTMENT_COMPARISON = 'dept_comparison', 'Department Comparison'
        MANAGER_RANKING = 'manager_ranking', 'Manager Ranking'
        TREND_CHART = 'trend_chart', 'Trend Chart'
        SKILL_GAP = 'skill_gap', 'Skill Gap Analysis'
        
        # Activity Widgets
        RECENT_ACTIVITY = 'recent_activity', 'Recent Activity'
        UPCOMING_DEADLINES = 'deadlines', 'Upcoming Deadlines'
        NOTIFICATIONS = 'notifications', 'Notifications'
        CALIBRATION_ALERTS = 'calibration_alerts', 'Calibration Alerts'
        
        # Report Widgets
        QUICK_REPORTS = 'quick_reports', 'Quick Reports'
        SAVED_REPORTS = 'saved_reports', 'Saved Reports'
    
    class WidgetSize(models.TextChoices):
        SMALL = 'small', 'Small (1 column)'
        MEDIUM = 'medium', 'Medium (2 columns)'
        LARGE = 'large', 'Large (3 columns)'
        FULL = 'full', 'Full Width'
    
    # Basic Information
    # tenant (inherited from ReviewBaseModel)
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='dashboard_widgets'
    )
    
    widget_type = models.CharField(
        max_length=30,
        choices=WidgetType.choices,
        help_text="Type of widget to display"
    )
    
    title = models.CharField(
        max_length=100,
        help_text="Custom title for the widget"
    )
    
    # Position
    order = models.IntegerField(
        default=0,
        help_text="Display order on dashboard"
    )
    
    size = models.CharField(
        max_length=10,
        choices=WidgetSize.choices,
        default=WidgetSize.MEDIUM,
        help_text="Widget size"
    )
    
    # Configuration (JSON)
    config = models.JSONField(
        default=dict,
        help_text="Widget-specific configuration (filters, date ranges, etc.)"
    )
    
    # Display Preferences
    show_title = models.BooleanField(default=True)
    show_refresh = models.BooleanField(default=True)
    show_expand = models.BooleanField(default=True)
    refresh_interval = models.IntegerField(
        default=0,
        help_text="Auto-refresh interval in seconds (0 = no auto-refresh)"
    )
    
    # Status
    is_visible = models.BooleanField(default=True)
    is_collapsed = models.BooleanField(default=False)
    
    # Data Caching
    cached_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Cached widget data"
    )
    
    last_refreshed = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the cached data was last refreshed"
    )
    
    class Meta:
        db_table = 'reviews_dashboard_widgets'
        ordering = ['order']
        indexes = [
            models.Index(fields=['user', 'is_visible']),
            models.Index(fields=['user', 'widget_type']),
        ]
        unique_together = [['user', 'order']]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_widget_type_display()}"
    
    def clean(self):
        """Basic validation"""
        super().clean()
        
        # Validate config based on widget type
        if self.widget_type == WidgetType.PENDING_REVIEWS:
            if 'status_filter' not in self.config:
                self.config['status_filter'] = 'pending'
        
        if self.widget_type == WidgetType.CYCLE_PROGRESS:
            if 'cycle_id' not in self.config:
                raise ValidationError({
                    'config': 'Cycle ID is required for Cycle Progress widget'
                })
        
        if self.refresh_interval < 0:
            raise ValidationError({
                'refresh_interval': 'Refresh interval must be 0 or greater'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)