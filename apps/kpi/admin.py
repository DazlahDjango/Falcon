from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from .models import (
    Sector, KPIFramework, KPICategory, KPITemplate,
    KPI, KPIHistory, KPIWeight, StrategicLinkage, KPIDependency,
    AnnualTarget, MonthlyPhasing, PhasingLock, TargetHistory,
    MonthlyActual, ActualHistory, ActualAdjustment, Evidence,
    ValidationRecord, ValidationComment, RejectionReason, Escalation,
    Score, AggregatedScore, TrafficLight, Trend, CalculationLog,
    CascadeMap, CascadeRule, CascadeHistory,
    KPISummary, DepartmentRollup, OrganizationHealth, RefreshTracker
)

class TenantAwareAdmin(ModelAdmin):
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if hasattr(request, 'tenant') and request.tenant:
            return queryset.filter(tenant_id=request.tenant.id)
        return queryset
    def save_model(self, request, obj, form, change):
        if not change and hasattr(request, 'tenant') and request.tenant:
            obj.tenant_id = request.tenant.id
        if not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Sector)
class SectorAdmin(TenantAwareAdmin):
    list_display = ['name', 'code', 'sector_type', 'is_active', 'created_at']
    list_filter = ['sector_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'code', 'sector_type', 'description')}),
        ('Display', {'fields': ('icon',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Metadata', {'fields': ('metadata',)}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(KPIFramework)
class KPIFrameworkAdmin(TenantAwareAdmin):
    list_display = ['name', 'sector', 'version', 'status', 'is_default', 'kpi_count']
    list_filter = ['status', 'sector', 'is_default']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            kpi_count=Count('kpis')
        )
    def kpi_count(self, obj):
        return obj.kpi_count
    kpi_count.short_description = 'Total KPIs'
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'code', 'sector', 'description')}),
        ('Version Control', {'fields': ('version', 'status', 'is_default')}),
        ('Effective Period', {'fields': ('effective_from', 'effective_to')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(KPICategory)
class KPICategoryAdmin(TenantAwareAdmin):
    list_display = ['name', 'code', 'category_type', 'framework', 'parent', 'is_active', 'display_order']
    list_filter = ['category_type', 'is_active', 'framework']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'code', 'category_type', 'framework', 'parent')}),
        ('Display', {'fields': ('description', 'color', 'icon', 'display_order')}),
        ('Status', {'fields': ('is_active',)}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(KPITemplate)
class KPITemplateAdmin(TenantAwareAdmin):
    list_display = ['name', 'code', 'sector', 'difficulty', 'is_published', 'usage_count']
    list_filter = ['sector', 'difficulty', 'is_published']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'usage_count']
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'code', 'sector', 'category', 'description')}),
        ('KPI Definition', {'fields': ('kpi_definition',)}),
        ('Target Configuration', {'fields': ('target_phasing_pattern',)}),
        ('Status', {'fields': ('difficulty', 'is_published', 'usage_count')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(KPI)
class KPIAdmin(TenantAwareAdmin):
    list_display = ['name', 'code', 'kpi_type', 'sector', 'owner', 'is_active', 'display_status']
    list_filter = ['kpi_type', 'calculation_logic', 'measure_type', 'is_active', 'sector']
    search_fields = ['name', 'code', 'description', 'strategic_objective']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['owner', 'framework', 'category', 'department']
    def display_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">Active</span>')
        return format_html('<span style="color: red;">Inactive</span>')
    display_status.short_description = 'Status'
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'code', 'description', 'framework', 'category', 'sector')}),
        ('KPI Configuration', {'fields': ('kpi_type', 'calculation_logic', 'measure_type')}),
        ('Target Settings', {'fields': ('unit', 'decimal_places', 'target_min', 'target_max')}),
        ('Formula', {'fields': ('formula',)}),
        ('Ownership', {'fields': ('owner', 'department')}),
        ('Strategic Alignment', {'fields': ('strategic_objective',)}),
        ('Lifecycle', {'fields': ('is_active', 'activation_date', 'deactivation_date')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(KPIWeight)
class KPIWeightAdmin(TenantAwareAdmin):
    list_display = ['kpi', 'user', 'weight', 'effective_from', 'effective_to', 'is_active']
    list_filter = ['is_active', 'effective_from']
    search_fields = ['kpi__name', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['kpi', 'user', 'approved_by']
    fieldsets = (
        ('Assignment', {'fields': ('kpi', 'user', 'weight')}),
        ('Effective Period', {'fields': ('effective_from', 'effective_to')}),
        ('Status', {'fields': ('is_active', 'reason', 'approved_by')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(AnnualTarget)
class AnnualTargetAdmin(TenantAwareAdmin):
    list_display = ['kpi', 'user', 'year', 'target_value', 'approved_by', 'approved_at']
    list_filter = ['year']
    search_fields = ['kpi__name', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['kpi', 'user', 'approved_by']
    fieldsets = (
        ('Target', {'fields': ('kpi', 'user', 'year', 'target_value')}),
        ('Approval', {'fields': ('approved_by', 'approved_at', 'notes')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(MonthlyPhasing)
class MonthlyPhasingAdmin(TenantAwareAdmin):
    list_display = ['annual_target', 'month', 'target_value', 'is_locked']
    list_filter = ['month', 'is_locked']
    search_fields = ['annual_target__kpi__name', 'annual_target__user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'locked_at']
    raw_id_fields = ['annual_target', 'locked_by']
    fieldsets = (
        ('Phasing', {'fields': ('annual_target', 'month', 'target_value')}),
        ('Lock Status', {'fields': ('is_locked', 'locked_at', 'locked_by')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(MonthlyActual)
class MonthlyActualAdmin(TenantAwareAdmin):
    list_display = ['kpi', 'user', 'year', 'month', 'actual_value', 'status', 'submitted_at']
    list_filter = ['status', 'year', 'month']
    search_fields = ['kpi__name', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'submitted_at']
    raw_id_fields = ['kpi', 'user', 'submitted_by']
    actions = ['approve_selected', 'reject_selected']
    def approve_selected(self, request, queryset):
        for actual in queryset:
            actual.approve(request.user)
        self.message_user(request, f"{queryset.count()} entries approved.")
    approve_selected.short_description = "Approve selected entries"
    def reject_selected(self, request, queryset):
        for actual in queryset:
            actual.reject(request.user, None, "Rejected via admin")
        self.message_user(request, f"{queryset.count()} entries rejected.")
    reject_selected.short_description = "Reject selected entries"
    fieldsets = (
        ('Performance Data', {'fields': ('kpi', 'user', 'year', 'month', 'actual_value')}),
        ('Status', {'fields': ('status', 'submitted_at', 'submitted_by', 'notes')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(Score)
class ScoreAdmin(TenantAwareAdmin):
    list_display = ['kpi', 'user', 'year', 'month', 'score', 'calculated_at']
    list_filter = ['year', 'month']
    search_fields = ['kpi__name', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'calculated_at']
    raw_id_fields = ['kpi', 'user']
    fieldsets = (
        ('Score', {'fields': ('kpi', 'user', 'year', 'month', 'score', 'actual_value', 'target_value')}),
        ('Calculation', {'fields': ('formula_used', 'calculated_at', 'calculated_by')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )

@admin.register(TrafficLight)
class TrafficLightAdmin(TenantAwareAdmin):
    list_display = ['score', 'status', 'score_value', 'consecutive_red_count']
    list_filter = ['status']
    search_fields = ['score__kpi__name', 'score__user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'calculated_at']
    fieldsets = (
        ('Status', {'fields': ('score', 'status', 'score_value')}),
        ('Thresholds', {'fields': ('green_threshold', 'yellow_threshold')}),
        ('Analysis', {'fields': ('consecutive_red_count', 'calculated_at')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )

@admin.register(ValidationRecord)
class ValidationRecordAdmin(TenantAwareAdmin):
    list_display = ['actual', 'status', 'validated_by', 'validated_at']
    list_filter = ['status']
    search_fields = ['actual__kpi__name', 'validated_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'validated_at']
    fieldsets = (
        ('Validation', {'fields': ('actual', 'status', 'validated_by', 'validated_at')}),
        ('Details', {'fields': ('rejection_reason', 'comment')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )

@admin.register(RejectionReason)
class RejectionReasonAdmin(TenantAwareAdmin):
    list_display = ['reason', 'category', 'is_active', 'display_order']
    list_filter = ['category', 'is_active']
    search_fields = ['reason', 'description']
    fieldsets = (
        ('Reason', {'fields': ('category', 'reason', 'description')}),
        ('Display', {'fields': ('display_order', 'is_active')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(Escalation)
class EscalationAdmin(TenantAwareAdmin):
    list_display = ['actual', 'escalated_by', 'escalated_to', 'status', 'escalated_at']
    list_filter = ['status']
    search_fields = ['actual__kpi__name', 'escalated_by__email', 'escalated_to__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'escalated_at', 'resolved_at']
    fieldsets = (
        ('Escalation', {'fields': ('actual', 'escalated_by', 'escalated_to', 'escalated_at', 'reason')}),
        ('Resolution', {'fields': ('status', 'resolution', 'resolved_by', 'resolved_at')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at')}),
    )

@admin.register(CascadeRule)
class CascadeRuleAdmin(TenantAwareAdmin):
    list_display = ['name', 'rule_type', 'is_default', 'is_active']
    list_filter = ['rule_type', 'is_default', 'is_active']
    search_fields = ['name', 'description']
    fieldsets = (
        ('Rule', {'fields': ('name', 'rule_type', 'description')}),
        ('Configuration', {'fields': ('configuration',)}),
        ('Status', {'fields': ('is_default', 'is_active')}),
        ('System', {'fields': ('id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

@admin.register(CalculationLog)
class CalculationLogAdmin(TenantAwareAdmin):
    list_display = ['calculation_type', 'status', 'duration_ms', 'records_affected', 'triggered_at']
    list_filter = ['calculation_type', 'status']
    search_fields = ['error_message']
    readonly_fields = ['id', 'triggered_at']
    fieldsets = (
        ('Calculation', {'fields': ('calculation_type', 'kpi', 'user', 'period_year', 'period_month')}),
        ('Result', {'fields': ('status', 'duration_ms', 'records_affected')}),
        ('Error', {'fields': ('error_message', 'traceback')}),
        ('System', {'fields': ('triggered_by', 'triggered_at', 'id')}),
    )

# Materialized views - read-only admin
@admin.register(KPISummary)
class KPISummaryAdmin(TenantAwareAdmin):
    list_display = ['kpi', 'year', 'month', 'average_score', 'green_count', 'yellow_count', 'red_count']
    list_filter = ['year', 'month']
    search_fields = ['kpi__name']
    readonly_fields = ['kpi', 'tenant_id', 'year', 'month', 'average_score', 'green_count', 'yellow_count', 'red_count', 'total_users', 'last_calculated']
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(OrganizationHealth)
class OrganizationHealthAdmin(TenantAwareAdmin):
    list_display = ['tenant_id', 'year', 'month', 'overall_health_score', 'red_kpi_count']
    list_filter = ['year', 'month']
    readonly_fields = ['tenant_id', 'year', 'month', 'overall_health_score', 'kpi_completion_rate', 
                       'validation_compliance_rate', 'red_kpi_count', 'total_kpi_count', 
                       'active_employees', 'last_calculated']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False