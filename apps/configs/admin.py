from django.contrib import admin
from django.utils.html import format_html
from .models import (
    RegisteredApp, AppDependency, BackupPolicy, BackupJob, BackupJobDetail,
    BackupArtifact, MaintenanceWindow, MaintenanceLog, DisasterRecoveryPlan,
    DisasterRecoveryExecution, HealthCheck, HealthCheckHistory, RiskAssessment,
    Schedule, BackupQuota, EncryptionKey, ConfigAuditLog
)

@admin.register(RegisteredApp)
class RegisteredAppAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'is_registered', 'is_critical', 'recovery_priority', 'rto_minutes']
    list_filter = ['is_registered', 'is_critical', 'recovery_priority']
    search_fields = ['name', 'display_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = [(None, {'fields': ('name', 'display_name', 'is_registered', 'is_critical', 'recovery_priority', 'rpo_minutes', 'rto_minutes', 'backup_retention_days', 'database_table_name', 'health_check_endpoint', 'recovery_script_path', 'metadata')})]

@admin.register(AppDependency)
class AppDependencyAdmin(admin.ModelAdmin):
    list_display = ['source_app', 'target_app', 'dependency_type']
    list_filter = ['dependency_type']
    search_fields = ['source_app__name', 'target_app__name']

@admin.register(BackupPolicy)
class BackupPolicyAdmin(admin.ModelAdmin):
    list_display = ['app', 'backup_type', 'status', 'retention_days', 'encryption_enabled']
    list_filter = ['backup_type', 'status', 'encryption_enabled']
    search_fields = ['app__name']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(BackupJob)
class BackupJobAdmin(admin.ModelAdmin):
    list_display = ['app', 'backup_type', 'status', 'started_at', 'duration_seconds', 'size_bytes_display', 'triggered_by_role']
    list_filter = ['backup_type', 'status', 'triggered_by_role']
    search_fields = ['app__name', 'error_message']
    readonly_fields = ['id', 'created_at', 'updated_at', 'started_at', 'completed_at', 'duration_seconds', 'size_bytes', 'checksum']
    def size_bytes_display(self, obj):
        if obj.size_bytes:
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if obj.size_bytes < 1024.0:
                    return f"{obj.size_bytes:.2f} {unit}"
                obj.size_bytes /= 1024.0
        return "N/A"
    size_bytes_display.short_description = "Size"

@admin.register(BackupJobDetail)
class BackupJobDetailAdmin(admin.ModelAdmin):
    list_display = ['backup_job', 'detail_type', 'name', 'rows_processed', 'status']
    list_filter = ['detail_type', 'status']
    search_fields = ['name']

@admin.register(BackupArtifact)
class BackupArtifactAdmin(admin.ModelAdmin):
    list_display = ['backup_job', 'storage_location', 'storage_path_short', 'status', 'verified_at']
    list_filter = ['storage_location', 'status']
    search_fields = ['storage_path']
    readonly_fields = ['id', 'created_at', 'updated_at']
    def storage_path_short(self, obj):
        return obj.storage_path[:50] + '...' if len(obj.storage_path) > 50 else obj.storage_path
    storage_path_short.short_description = "Storage Path"

@admin.register(MaintenanceWindow)
class MaintenanceWindowAdmin(admin.ModelAdmin):
    list_display = ['title', 'maintenance_type', 'status', 'scheduled_start', 'scheduled_end', 'triggered_by_role']
    list_filter = ['maintenance_type', 'status', 'triggered_by_role', 'is_weekday_only']
    search_fields = ['title', 'reason']
    readonly_fields = ['id', 'created_at', 'updated_at', 'actual_start', 'actual_end', 'notification_sent_at']
    filter_horizontal = ['affected_apps']

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ['maintenance_window', 'action', 'performed_by_role', 'performed_at', 'duration_seconds']
    list_filter = ['action', 'performed_by_role']
    search_fields = ['maintenance_window__title']
    readonly_fields = ['id', 'created_at']

@admin.register(DisasterRecoveryPlan)
class DisasterRecoveryPlanAdmin(admin.ModelAdmin):
    list_display = ['app', 'name', 'version', 'status', 'last_tested_at', 'test_successful']
    list_filter = ['status', 'approval_required']
    search_fields = ['app__name', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_tested_at', 'reviewed_at', 'approved_at']

@admin.register(DisasterRecoveryExecution)
class DisasterRecoveryExecutionAdmin(admin.ModelAdmin):
    list_display = ['dr_plan', 'execution_type', 'status', 'triggered_at', 'rto_achieved_minutes', 'rpo_achieved_minutes']
    list_filter = ['execution_type', 'status', 'triggered_by_role']
    search_fields = ['dr_plan__app__name']
    readonly_fields = ['id', 'created_at', 'triggered_at', 'started_at', 'completed_at']

@admin.register(HealthCheck)
class HealthCheckAdmin(admin.ModelAdmin):
    list_display = ['app', 'status', 'response_time_ms', 'error_rate_percent', 'consecutive_failures', 'created_at']
    list_filter = ['status']
    search_fields = ['app__name']
    readonly_fields = ['id', 'created_at']

@admin.register(HealthCheckHistory)
class HealthCheckHistoryAdmin(admin.ModelAdmin):
    list_display = ['app', 'previous_status', 'new_status', 'changed_at', 'trigger_conditional_maintenance']
    list_filter = ['previous_status', 'new_status', 'trigger_conditional_maintenance']
    search_fields = ['app__name']
    readonly_fields = ['id', 'changed_at']

@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ['app', 'risk_level', 'risk_score', 'assessed_at', 'expires_at', 'requires_super_admin']
    list_filter = ['risk_level', 'requires_super_admin']
    search_fields = ['app__name']
    readonly_fields = ['id', 'assessed_at']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'schedule_type', 'status', 'cron_expression', 'next_run_at', 'last_run_status']
    list_filter = ['schedule_type', 'status', 'weekday_only', 'is_disaster_override']
    search_fields = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_run_at', 'next_run_at', 'run_count', 'failure_count']

@admin.register(BackupQuota)
class BackupQuotaAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'app', 'total_backup_storage_gb', 'used_backup_storage_gb', 'usage_percent', 'warning_threshold_percent']
    list_filter = ['warning_threshold_percent']
    search_fields = ['tenant__name', 'app__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'used_backup_storage_bytes', 'alert_sent_at']
    def total_backup_storage_gb(self, obj):
        return f"{obj.total_backup_storage_bytes / (1024**3):.2f} GB"
    total_backup_storage_gb.short_description = "Total Storage"
    def used_backup_storage_gb(self, obj):
        return f"{obj.used_backup_storage_bytes / (1024**3):.2f} GB"
    used_backup_storage_gb.short_description = "Used Storage"
    def usage_percent(self, obj):
        if obj.total_backup_storage_bytes > 0:
            percent = (obj.used_backup_storage_bytes / obj.total_backup_storage_bytes) * 100
            return format_html('<span style="color: {};">{:.1f}%</span>', 'red' if percent > 80 else 'green', percent)
        return "0%"
    usage_percent.short_description = "Usage"

@admin.register(EncryptionKey)
class EncryptionKeyAdmin(admin.ModelAdmin):
    list_display = ['key_alias', 'key_source', 'key_status', 'is_default', 'activated_at', 'expires_at', 'usage_count']
    list_filter = ['key_source', 'key_status', 'is_default']
    search_fields = ['key_alias', 'key_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_used_at', 'usage_count']

@admin.register(ConfigAuditLog)
class ConfigAuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'performed_by_role', 'performed_by_email', 'performed_at', 'result', 'target_app']
    list_filter = ['action', 'performed_by_role', 'result']
    search_fields = ['performed_by_email', 'request_id', 'target_id']
    readonly_fields = ['id', 'created_at', 'performed_at']
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False