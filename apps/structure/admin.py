from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    OrganizationalUnit, Division, Department, Section, Unit,
    Position, Employment, InterimAssignment,
    CostCenter, Location, HierarchyVersion
)


@admin.register(OrganizationalUnit)
class OrganizationalUnitAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'level', 'parent', 'depth', 'is_active', 'headcount_limit', 'created_at']
    list_filter = ['level', 'is_active', 'is_deleted', 'tenant_id', 'created_at']
    search_fields = ['code', 'name', 'description', 'cost_center_id']
    readonly_fields = ['id', 'path', 'depth', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('level', 'parent', 'path', 'depth')}),
        (_('Business'), {'fields': ('cost_center_id', 'budget_code', 'headcount_limit')}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    list_select_related = ['parent']
    raw_id_fields = ['parent']
    ordering = ['level', 'code']


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'depth', 'is_active', 'headcount_limit', 'created_at']
    list_filter = ['is_active', 'is_deleted', 'tenant_id']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'path', 'depth', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('path', 'depth')}),
        (_('Business'), {'fields': ('cost_center_id', 'budget_code', 'headcount_limit')}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    ordering = ['code']


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


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'parent', 'depth', 'is_active', 'headcount_limit', 'created_at']
    list_filter = ['is_active', 'is_deleted', 'tenant_id']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'path', 'depth', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('parent', 'path', 'depth')}),
        (_('Business'), {'fields': ('cost_center_id', 'budget_code', 'headcount_limit')}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['parent']
    ordering = ['code']


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'parent', 'depth', 'is_active', 'headcount_limit', 'created_at']
    list_filter = ['is_active', 'is_deleted', 'tenant_id']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'path', 'depth', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Hierarchy'), {'fields': ('parent', 'path', 'depth')}),
        (_('Business'), {'fields': ('cost_center_id', 'budget_code', 'headcount_limit')}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['parent']
    ordering = ['code']


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['job_code', 'title', 'grade', 'level', 'reports_to', 'current_incumbents_count', 'is_single_incumbent']
    list_filter = ['grade', 'level', 'is_single_incumbent', 'tenant_id', 'is_deleted']
    search_fields = ['job_code', 'title', 'grade']
    readonly_fields = ['id', 'created_at', 'updated_at', 'current_incumbents_count']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'job_code', 'title', 'grade', 'level')}),
        (_('Reporting'), {'fields': ('reports_to',)}),
        (_('Requirements'), {'fields': ('min_tenure_months', 'required_competencies')}),
        (_('Occupancy'), {'fields': ('is_single_incumbent', 'max_incumbents', 'current_incumbents_count')}),
        (_('Security'), {'fields': ('requires_supervisor_approval',)}),
        (_('Status'), {'fields': ('is_active', 'is_deleted', 'deleted_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['reports_to']


@admin.register(Employment)
class EmploymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'position', 'is_current', 'is_primary', 'fte_allocation', 'is_manager', 'employment_type']
    list_filter = ['is_current', 'is_primary', 'is_manager', 'is_executive', 'is_board_member', 'employment_type', 'tenant_id', 'is_deleted']
    search_fields = ['user_id', 'change_reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Assignment'), {'fields': ('id', 'tenant_id', 'user_id', 'position', 'fte_allocation', 'is_primary')}),
        (_('Period'), {'fields': ('effective_from', 'effective_to', 'is_current')}),
        (_('Type'), {'fields': ('employment_type', 'is_manager', 'is_executive', 'is_board_member', 'is_team_lead')}),
        (_('Audit'), {'fields': ('change_reason', 'approved_by_id', 'is_active')}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['position']


@admin.register(InterimAssignment)
class InterimAssignmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'interim_manager', 'effective_from', 'effective_to', 'is_active']
    list_filter = ['reporting_type', 'is_active', 'tenant_id', 'is_deleted']
    search_fields = ['reason', 'notes']
    readonly_fields = ['id', 'approved_at', 'created_at', 'updated_at']
    fieldsets = (
        (_('Assignment'), {'fields': ('id', 'tenant_id', 'employee', 'interim_manager', 'reporting_type')}),
        (_('Period'), {'fields': ('effective_from', 'effective_to', 'is_active')}),
        (_('Details'), {'fields': ('reason', 'notes')}),
        (_('Approval'), {'fields': ('approved_by_id', 'approved_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['employee', 'interim_manager']


@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'fiscal_year', 'budget_amount', 'is_active']
    list_filter = ['category', 'is_active', 'is_shared', 'fiscal_year', 'tenant_id', 'is_deleted']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'description')}),
        (_('Financial'), {'fields': ('category', 'budget_amount', 'fiscal_year', 'allocation_percentage')}),
        (_('Status'), {'fields': ('is_active', 'is_shared')}),
        (_('Approvals'), {'fields': ('requires_budget_approval', 'authorized_approver_ids')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'type', 'city', 'country', 'is_headquarters', 'is_active']
    list_filter = ['type', 'is_headquarters', 'is_active', 'country', 'tenant_id', 'is_deleted']
    search_fields = ['code', 'name', 'city', 'state_province', 'country']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        (_('Identity'), {'fields': ('id', 'tenant_id', 'code', 'name', 'type')}),
        (_('Management'), {'fields': ('cost_center', 'manager')}),
        (_('Hierarchy'), {'fields': ('parent',)}),
        (_('Address'), {'fields': ('address_line1', 'address_line2', 'city', 'state_province', 'postal_code', 'country', 'timezone')}),
        (_('Capacity'), {'fields': ('seating_capacity', 'current_occupancy')}),
        (_('Contact'), {'fields': ('phone_number', 'email')}),
        (_('Status'), {'fields': ('is_headquarters', 'is_active')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by')}),
    )
    list_per_page = 50
    raw_id_fields = ['parent', 'cost_center', 'manager']


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