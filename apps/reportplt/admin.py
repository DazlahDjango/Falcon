# apps/reportplt/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Report, ReportTemplate, ReportSchedule, ReportExecution,
    ReportExport, ReportDashboard, ReportWidget, ReportFilter,
    ReportShare, ReportAudit, ReportCache
)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'report_type', 'status', 'owner', 'created_at', 'is_published')
    list_filter = ('report_type', 'status', 'category', 'is_published', 'is_archived', 'is_public')
    search_fields = ('name', 'description', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_generated_at', 'version')
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'description', 'report_type', 'category')}),
        ('Status & Configuration', {'fields': ('status', 'default_format', 'data_source', 'config')}),
        ('Ownership & Access', {'fields': ('owner', 'is_public', 'allowed_roles', 'allowed_departments')}),
        ('Flags', {'fields': ('is_scheduled', 'is_system', 'is_published', 'is_archived', 'needs_refresh')}),
        ('Content Settings', {'fields': ('include_executive_summary', 'include_charts', 'include_tables', 'include_commentary')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'last_generated_at', 'version')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'sector', 'is_system', 'is_published', 'is_default')
    list_filter = ('template_type', 'sector', 'is_system', 'is_published', 'is_default', 'is_popular')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at', 'version')
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'description', 'template_type', 'category', 'sector')}),
        ('Configuration', {'fields': ('layout_config', 'widget_config', 'filter_config', 'chart_config')}),
        ('Flags', {'fields': ('is_system', 'is_published', 'is_default', 'is_popular', 'has_prebuilt_charts')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'version')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = ('name', 'report', 'frequency', 'status', 'is_active', 'next_run_at')
    list_filter = ('frequency', 'status', 'is_active', 'is_paused')
    search_fields = ('name', 'report__name', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_run_at', 'started_at', 'completed_at')
    fieldsets = (
        ('Schedule Information', {'fields': ('report', 'name', 'frequency', 'cron_expression')}),
        ('Status & Timing', {'fields': ('status', 'is_active', 'is_paused', 'next_run_at', 'expires_at')}),
        ('Delivery', {'fields': ('recipients', 'delivery_method', 'webhook_url', 's3_path')}),
        ('Retry Configuration', {'fields': ('retry_count', 'max_retries', 'retry_delay')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-next_run_at',)

@admin.register(ReportExecution)
class ReportExecutionAdmin(admin.ModelAdmin):
    list_display = ('id', 'report', 'status', 'triggered_by', 'started_at', 'duration')
    list_filter = ('status',)
    search_fields = ('report__name', 'triggered_by__email')
    readonly_fields = ('id', 'created_at', 'started_at', 'completed_at', 'duration')
    fieldsets = (
        ('Execution Information', {'fields': ('report', 'schedule', 'triggered_by', 'status')}),
        ('Timing', {'fields': ('started_at', 'completed_at', 'duration')}),
        ('Results', {'fields': ('result_summary', 'row_count', 'data_size', 'execution_log')}),
        ('Errors', {'fields': ('error_message', 'error_traceback', 'retry_count')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportExport)
class ReportExportAdmin(admin.ModelAdmin):
    list_display = ('report', 'format', 'status', 'exported_by', 'file_size', 'created_at')
    list_filter = ('format', 'status', 'is_compressed', 'is_encrypted', 'password_protected')
    search_fields = ('report__name', 'exported_by__email', 'file_name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'delivered_at', 'last_downloaded_at')
    fieldsets = (
        ('Export Information', {'fields': ('report', 'execution', 'format', 'status')}),
        ('File Details', {'fields': ('file_path', 'file_name', 'file_size', 'mime_type', 'page_count')}),
        ('Security', {'fields': ('is_encrypted', 'password_protected', 'has_watermark')}),
        ('Delivery', {'fields': ('delivered_via', 'delivered_at', 'download_count')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'expires_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportDashboard)
class ReportDashboardAdmin(admin.ModelAdmin):
    list_display = ('name', 'dashboard_type', 'owner', 'is_default', 'is_shared', 'view_count')
    list_filter = ('dashboard_type', 'is_default', 'is_shared', 'is_published')
    search_fields = ('name', 'description', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_viewed_at', 'view_count')
    fieldsets = (
        ('Dashboard Information', {'fields': ('name', 'description', 'dashboard_type', 'owner')}),
        ('Configuration', {'fields': ('layout', 'config', 'theme', 'widgets_order', 'refresh_interval')}),
        ('Access Control', {'fields': ('is_shared', 'is_published', 'allowed_roles', 'allowed_users')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'view_count')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportWidget)
class ReportWidgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'widget_type', 'dashboard', 'is_active', 'is_visible')
    list_filter = ('widget_type', 'is_active', 'is_visible', 'auto_refresh')
    search_fields = ('name', 'title', 'dashboard__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Widget Information', {'fields': ('dashboard', 'name', 'widget_type', 'title', 'subtitle')}),
        ('Configuration', {'fields': ('config', 'data_config', 'style_config', 'position', 'size')}),
        ('Data Settings', {'fields': ('data_source', 'data_query', 'filters', 'sort', 'aggregation', 'limit')}),
        ('Behavior', {'fields': ('is_active', 'is_visible', 'auto_refresh', 'refresh_interval')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportFilter)
class ReportFilterAdmin(admin.ModelAdmin):
    list_display = ('name', 'filter_type', 'owner', 'is_global', 'is_system', 'is_default')
    list_filter = ('filter_type', 'is_global', 'is_system', 'is_default', 'required')
    search_fields = ('name', 'display_label', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Filter Information', {'fields': ('name', 'filter_type', 'display_label', 'placeholder', 'help_text')}),
        ('Configuration', {'fields': ('config', 'values', 'options', 'default_values')}),
        ('Validation', {'fields': ('required', 'multiple', 'validation', 'dependencies')}),
        ('Access', {'fields': ('owner', 'is_global', 'is_system', 'is_default')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportShare)
class ReportShareAdmin(admin.ModelAdmin):
    list_display = ('report', 'shared_by', 'shared_with', 'share_type', 'permission', 'is_active')
    list_filter = ('share_type', 'permission', 'is_active', 'password_protected')
    search_fields = ('report__name', 'shared_by__email', 'shared_with__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_accessed_at', 'access_count')
    fieldsets = (
        ('Share Information', {'fields': ('report', 'shared_by', 'shared_with', 'share_type', 'permission')}),
        ('Link & Security', {'fields': ('share_link', 'share_token', 'password_protected', 'password', 'expires_at')}),
        ('Access', {'fields': ('is_active', 'last_accessed_at', 'access_count')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportAudit)
class ReportAuditAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'report', 'created_at', 'success')
    list_filter = ('action', 'success')
    search_fields = ('user__email', 'report__name', 'ip_address')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Audit Information', {'fields': ('user', 'action', 'report', 'dashboard')}),
        ('Request Details', {'fields': ('ip_address', 'user_agent', 'session_id')}),
        ('Changes', {'fields': ('details', 'changes', 'previous_value', 'new_value')}),
        ('Result', {'fields': ('success', 'error_message', 'duration')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

@admin.register(ReportCache)
class ReportCacheAdmin(admin.ModelAdmin):
    list_display = ('report', 'cache_key', 'size', 'created_at', 'expires_at', 'access_count')
    list_filter = ('format', 'compressed', 'is_stale')
    search_fields = ('report__name', 'cache_key')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Cache Information', {'fields': ('report', 'execution', 'cache_key')}),
        ('Data', {'fields': ('data', 'raw_data', 'format', 'size', 'compressed')}),
        ('Timing', {'fields': ('created_at', 'expires_at', 'last_accessed_at')}),
        ('Status', {'fields': ('access_count', 'version', 'is_stale', 'parameters_hash')}),
        ('Metadata', {'fields': ('id', 'tenant_id', 'updated_at')}),
    )
    ordering = ('-created_at',)