from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.html import format_html
from .models import (
    DashboardConfig, WidgetConfig, FavoriteKPI, DashboardAlert,
    ExportSchedule, PeriodComparison, DashboardAccessLog,
    ExecutiveViewPreset, TenantOverviewSnapshot
)

@admin.register(DashboardConfig)
class DashboardConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'dashboard_type', 'name', 'is_default', 'is_shared', 'created_at')
    list_filter = ('dashboard_type', 'is_default', 'is_shared', 'created_at')
    search_fields = ('user_id', 'name', 'description')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'tenant_id', 'user_id', 'dashboard_type', 'name', 'description')
        }),
        (_('Configuration'), {
            'fields': ('layout', 'default_filters', 'default_time_period', 'default_view')
        }),
        (_('Sharing & Default'), {
            'fields': ('is_default', 'is_shared', 'shared_with_roles')
        }),
        (_('Metadata'), {
            'fields': ('version', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs
    def save_model(self, request, obj, form, change):
        if not obj.tenant_id and hasattr(request.user, 'tenant_id'):
            obj.tenant_id = request.user.tenant_id
        super().save_model(request, obj, form, change)

@admin.register(WidgetConfig)
class WidgetConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'dashboard_link', 'widget_type', 'row', 'col', 'width', 'height', 'is_visible')
    list_filter = ('widget_type', 'is_visible', 'created_at')
    search_fields = ('title', 'dashboard__name')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at')
    def dashboard_link(self, obj):
        url = reverse('admin:dashboard_dashboardconfig_change', args=[obj.dashboard.id])
        return format_html('<a href="{}">{}</a>', url, obj.dashboard.name)
    dashboard_link.short_description = _('Dashboard')
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(FavoriteKPI)
class FavoriteKPIAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'kpi_name', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user_id', 'kpi_name', 'notes')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at')
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(DashboardAlert)
class DashboardAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'alert_type', 'severity', 'frequency', 'is_active', 'last_triggered_at')
    list_filter = ('alert_type', 'severity', 'frequency', 'is_active', 'created_at')
    search_fields = ('user_id', 'config')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at', 'last_triggered_at', 'trigger_count')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'tenant_id', 'user_id', 'alert_type', 'severity')
        }),
        (_('Configuration'), {
            'fields': ('config', 'frequency')
        }),
        (_('Channels'), {
            'fields': ('send_email', 'send_in_app', 'send_sms')
        }),
        (_('State'), {
            'fields': ('is_active', 'last_triggered_at', 'trigger_count', 'suppress_until')
        }),
    )
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(ExportSchedule)
class ExportScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'dashboard_type', 'format', 'schedule_type', 'is_active', 'next_run_at')
    list_filter = ('dashboard_type', 'format', 'schedule_type', 'is_active', 'created_at')
    search_fields = ('user_id', 'recipients')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at', 'last_run_at', 'last_run_status')    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(PeriodComparison)
class PeriodComparisonAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'name', 'comparison_type', 'is_public', 'cached_at')
    list_filter = ('comparison_type', 'is_public', 'created_at')
    search_fields = ('user_id', 'name')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at', 'cached_at')    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(DashboardAccessLog)
class DashboardAccessLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'dashboard_type', 'action', 'created_at', 'response_time_ms')
    list_filter = ('dashboard_type', 'action', 'created_at')
    search_fields = ('user_id', 'ip_address', 'user_agent')
    readonly_fields = ('id', 'tenant_id', 'user_id', 'dashboard_type', 'action', 'ip_address', 
                       'user_agent', 'details', 'response_time_ms', 'created_at')
    
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs

@admin.register(ExecutiveViewPreset)
class ExecutiveViewPresetAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'name', 'view_type', 'is_default', 'created_at')
    list_filter = ('view_type', 'is_default', 'created_at')
    search_fields = ('user_id', 'name')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at')
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs


@admin.register(TenantOverviewSnapshot)
class TenantOverviewSnapshotAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'subscription_status', 'snapshot_date', 'total_users', 'avg_individual_score')
    list_filter = ('subscription_status', 'subscription_plan', 'snapshot_date', 'is_stale')
    search_fields = ('client_name', 'client_id')
    readonly_fields = ('id', 'tenant_id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Client Information'), {
            'fields': ('client_id', 'client_name', 'subscription_status', 'subscription_plan', 'subscription_expires_at')
        }),
        (_('Usage Metrics'), {
            'fields': ('total_users', 'active_users', 'total_kpis')
        }),
        (_('Performance Metrics'), {
            'fields': ('kpi_green_count', 'kpi_yellow_count', 'kpi_red_count', 
                      'avg_individual_score', 'avg_department_score')
        }),
        (_('Compliance & Activity'), {
            'fields': ('data_submission_rate', 'review_completion_rate', 
                      'last_active_at', 'total_logins_30d')
        }),
        (_('Snapshot Metadata'), {
            'fields': ('snapshot_date', 'is_stale'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return request.user.is_superuser
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(tenant_id=getattr(request.user, 'tenant_id', None))
        return qs