from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Department, Team, Position, Employment, ReportingLine, CostCenter, Location, HierarchyVersion

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'parent', 'depth', 'is_active', 'headcount_limit', 'sensitivity_level', 'created_at']
    list_filter = ['is_active', 'is_deleted', 'sensitivity_level', 'tenant_id', 'created_at']
    search_fields = ['code', 'name', 'description', 'cost_center_id']
    readonly_fields = ['id', 'path', 'depth', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('parent', 'path', 'depth')}),
        (_('Business'), {'fields': ('cost_center_id', 'budget_code', 'headcount_limit')}),
        (_('Security'), {'fields': ('sensitivity_level',)}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    list_select_related = ['parent']
    raw_id_fields = ['parent']
    ordering = ['code']
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user.id
        obj.updated_by = request.user.id
        super().save_model(request, obj, form, change)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'department', 'parent_team', 'team_lead', 'is_active', 'max_members']
    list_filter = ['is_active', 'is_deleted', 'department', 'tenant_id']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Relationships'), {'fields': ('department', 'parent_team', 'team_lead')}),
        (_('Capacity'), {'fields': ('max_members',)}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['department', 'parent_team']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['job_code', 'title', 'grade', 'level', 'reports_to', 'current_incumbents_count', 'is_single_incumbent']
    list_filter = ['grade', 'level', 'default_reporting_type', 'is_single_incumbent', 'tenant_id', 'is_deleted']
    search_fields = ['job_code', 'title', 'grade']
    readonly_fields = ['id', 'created_at', 'updated_at', 'current_incumbents_count']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'job_code', 'title', 'grade', 'level')}),
        (_('Reporting'), {'fields': ('reports_to', 'default_reporting_type')}),
        (_('Department'), {'fields': ('default_department',)}),
        (_('Requirements'), {'fields': ('min_tenure_months', 'required_competencies')}),
        (_('Occupancy'), {'fields': ('is_single_incumbent', 'max_incumbents', 'current_incumbents_count')}),
        (_('Security'), {'fields': ('requires_supervisor_approval',)}),
        (_('Status'), {'fields': ('is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['reports_to', 'default_department']

@admin.register(Employment)
class EmploymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'position', 'department', 'team', 'is_current', 'is_manager', 'employment_type']
    list_filter = ['is_current', 'is_manager', 'is_executive', 'is_board_member', 'employment_type', 'tenant_id', 'is_deleted']
    search_fields = ['user_id', 'change_reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Assignment'), {'fields': ('id', 'tenant_id', 'user_id', 'position', 'department', 'team')}),
        (_('Period'), {'fields': ('effective_from', 'effective_to', 'is_current')}),
        (_('Type'), {'fields': ('employment_type', 'is_manager', 'is_executive', 'is_board_member')}),
        (_('Matrix'), {'fields': ('dotted_line_manager',)}),
        (_('Audit'), {'fields': ('change_reason', 'approved_by_id', 'is_active')}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['position', 'department', 'team', 'dotted_line_manager']
    show_facets = admin.ShowFacets.ALWAYS

@admin.register(ReportingLine)
class ReportingLineAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'manager', 'relation_type', 'is_active', 'reporting_weight', 'can_approve_kpi']
    list_filter = ['relation_type', 'is_active', 'can_approve_kpi', 'can_conduct_review', 'tenant_id', 'is_deleted']
    search_fields = ['change_reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Relationship'), {'fields': ('id', 'tenant_id', 'employee', 'manager', 'relation_type', 'reporting_weight')}),
        (_('Temporal'), {'fields': ('effective_from', 'effective_to', 'is_active')}),
        (_('Permissions'), {'fields': ('can_approve_kpi', 'can_conduct_review', 'can_approve_leave', 'can_approve_expenses')}),
        (_('Audit'), {'fields': ('change_reason', 'approved_by_id')}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['employee', 'manager']
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('employee', 'manager')

@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'fiscal_year', 'budget_amount', 'is_active', 'allocation_percentage']
    list_filter = ['category', 'is_active', 'is_shared', 'fiscal_year', 'tenant_id', 'is_deleted']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('parent',)}),
        (_('Financial'), {'fields': ('category', 'budget_amount', 'fiscal_year', 'allocation_percentage')}),
        (_('Status'), {'fields': ('is_active', 'is_shared')}),
        (_('Approvals'), {'fields': ('requires_budget_approval', 'authorized_approver_ids')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['parent']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'type', 'city', 'country', 'is_headquarters', 'is_active', 'seating_capacity']
    list_filter = ['type', 'is_headquarters', 'is_active', 'country', 'tenant_id', 'is_deleted']
    search_fields = ['code', 'name', 'city', 'state_province', 'country']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'type')}),
        (_('Hierarchy'), {'fields': ('parent',)}),
        (_('Address'), {'fields': ('address_line1', 'address_line2', 'city', 'state_province', 'postal_code', 'country', 'timezone')}),
        (_('Capacity'), {'fields': ('seating_capacity', 'current_occupancy')}),
        (_('Contact'), {'fields': ('phone_number', 'email')}),
        (_('Status'), {'fields': ('is_headquarters', 'is_active')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['parent']

@admin.register(HierarchyVersion)
class HierarchyVersionAdmin(admin.ModelAdmin):
    list_display = ['version_number', 'name', 'version_type', 'effective_from', 'effective_to', 'is_current', 'created_at']
    list_filter = ['version_type', 'is_current', 'tenant_id', 'is_deleted', 'created_at']
    search_fields = ['name', 'description', 'snapshot_hash']
    readonly_fields = ['id', 'snapshot_hash', 'created_at', 'updated_at']
    fieldsets = (
        (_('Version'), {'fields': ('id', 'tenant_id', 'version_number', 'name', 'description', 'version_type')}),
        (_('Snapshot'), {'fields': ('snapshot', 'snapshot_hash')}),
        (_('Temporal'), {'fields': ('effective_from', 'effective_to', 'is_current')}),
        (_('Changes'), {'fields': ('changes_summary',)}),
        (_('Approval'), {'fields': ('approved_by_id', 'approved_at', 'approved_notes')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    exclude = ['is_deleted', 'deleted_at', 'deleted_by']