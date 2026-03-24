from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _ 
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.db.models import Count
from .models import User, Role, Permission, Profile, UserSession, SessionBlacklist, MFADevice, MFABackupCode, MFAAuditLog, LoginAttempt, AuditLog, UserPreference, TenantPreference

class TenantFilter(admin.SimpleListFilter):
    title = _('tenant')
    parameter_name = 'tenant'

    def lookups(self, request, model_admin):
        if request.user.is_superuser:
            from apps.core.models import Client
            return [(str(t.id), t.name) for t in Client.objects.filter(is_deleted=False)]
        if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
            return [(str(request.user.tenant_id), 'My Tenant')]
        return []
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(tenant_id=self.value())
        if not request.user.is_superuser and hasattr(request.user, 'tenant_id'):
            return queryset.filter(tenant_id=request.user.tenant_id)
        return queryset

class BaseAdmin(admin.ModelAdmin):
    list_filter = [TenantFilter]
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'tenant_id'):
            return qs.filter(tenant_id=request.user.tenant_id)
        return qs
    
    def save_model(self, request, obj, form, change):
        if not change and hasattr(obj, 'tenant_id') and not obj.tenant_id:
            obj.tenant_id = request.user.tenant_id
        if hasattr(obj, 'set_modifier'):
            obj.set_modifier(request.user)
        super().save_model(request, obj, form, change)
    
    def has_module_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.role in ['client_admin', 'executive']
    
@admin.register(User)
class UserAdmin(BaseUserAdmin, BaseAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'is_verified', 'mfa_enabled', 'created_at']
    list_filter = BaseAdmin.list_filter + ['role', 'is_active', 'is_verified', 'is_staff', 'is_superuser', 'mfa_enabled']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'deleted_at', 'last_login', 'login_attempts', 'locked_until']
    fieldsets = (
        (None, {'fields': ('id', 'email', 'username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone')}),
        (_('Organization'), {'fields': ('tenant_id', 'role', 'manager', 'department')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'is_onboarded', 'groups', 'user_permissions')}),
        (_('Security'), {'fields': ('mfa_enabled', 'mfa_secret', 'mfa_backup_codes', 'login_attempts', 'locked_until', 'last_login_ip', 'last_login_agent')}),
        (_('Session'), {'fields': ('current_session_key', 'session_expires_at')}),
        (_('Preferences'), {'fields': ('language', 'timezone')}),
        (_('Metadata'), {'fields': ('title', 'employee_id', 'joined_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'tenant_id', 'password1', 'password2', 'role'),
        }),
    )
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'tenant_id'):
            return qs.filter(tenant_id=request.user.tenant_id)
        return qs
    
    def get_form(self, request, obj =None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not request.user.is_superuser:
            form.base_fields['role'].choices = [
                (c, n) for c, n in form.base_fields['role'].choices
                if c not in ['super_admin', 'client_admin'] or request.user.role == 'client_admin'
            ]
        return form
    
@admin.register(Role)
class RoleAdmin(BaseAdmin):
    list_display = ['name', 'code', 'role_type', 'is_system', 'is_assignable', 'parent', 'order']
    list_filter = BaseAdmin.list_filter + ['role_type', 'is_system', 'is_assignable']
    search_fields = ['name', 'code']
    filter_horizontal = ['permissions']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'name', 'code', 'description')}),
        (_('Hierarchy'), {'fields': ('parent', 'order')}),
        (_('Permissions'), {'fields': ('permissions',)}),
        (_('Settings'), {'fields': ('role_type', 'is_system', 'is_assignable')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )
    
    def has_delete_permission(self, request, obj=None):
        if obj and obj.is_system:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(Permission)
class PermissionAdmin(BaseAdmin):
    """Permission admin."""
    list_display = ['name', 'codename', 'category', 'level', 'is_active']
    list_filter = BaseAdmin.list_filter + ['category', 'level', 'is_active']
    search_fields = ['name', 'codename']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'name', 'codename', 'description')}),
        (_('Classification'), {'fields': ('category', 'level', 'content_type')}),
        (_('Status'), {'fields': ('is_active',)}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )


@admin.register(Profile)
class ProfileAdmin(BaseAdmin):
    """Profile admin."""
    list_display = ['user', 'employee_type', 'city', 'country', 'has_avatar']
    list_filter = BaseAdmin.list_filter + ['employee_type', 'city', 'country']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'employee_type']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'user')}),
        (_('Personal'), {'fields': ('avatar', 'bio', 'date_of_birth')}),
        (_('Contact'), {'fields': ('alternative_email', 'work_phone', 'mobile_phone', 'address', 'city', 'country')}),
        (_('Professional'), {'fields': ('employee_type', 'cost_center', 'reports_to', 'title')}),
        (_('Skills'), {'fields': ('skills', 'certifications', 'education')}),
        (_('Emergency'), {'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation')}),
        (_('Preferences'), {'fields': ('timezone', 'date_format', 'number_format')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )
    
    def has_avatar(self, obj):
        return bool(obj.avatar)
    has_avatar.boolean = True
    has_avatar.short_description = _('has avatar')


@admin.register(UserSession)
class UserSessionAdmin(BaseAdmin):
    """User session admin."""
    list_display = ['user', 'ip_address', 'device_type', 'status', 'login_time', 'last_activity', 'mfa_verified']
    list_filter = BaseAdmin.list_filter + ['status', 'device_type', 'mfa_verified']
    search_fields = ['user__email', 'ip_address', 'session_key']
    readonly_fields = ['id', 'created_at', 'login_time', 'last_activity']
    
    fieldsets = (
        (None, {'fields': ('id', 'user', 'session_key', 'jwt_token_id')}),
        (_('Device'), {'fields': ('ip_address', 'user_agent', 'device_type', 'browser', 'os')}),
        (_('Location'), {'fields': ('location_city', 'location_country', 'location_lat', 'location_lng')}),
        (_('Timing'), {'fields': ('login_time', 'last_activity', 'expires_at', 'logout_time')}),
        (_('Security'), {'fields': ('status', 'mfa_verified', 'mfa_verified_at', 'is_trusted_device', 'security_alerts')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )
    
    actions = ['terminate_sessions']
    
    def terminate_sessions(self, request, queryset):
        count = queryset.update(status='revoked', logout_time=timezone.now())
        self.message_user(request, f'{count} sessions terminated.')
    terminate_sessions.short_description = _('Terminate selected sessions')


@admin.register(SessionBlacklist)
class SessionBlacklistAdmin(BaseAdmin):
    """Session blacklist admin."""
    list_display = ['token_id', 'token_type', 'user', 'blacklisted_at', 'expires_at', 'reason']
    list_filter = BaseAdmin.list_filter + ['token_type']
    search_fields = ['token_id', 'user__email']
    readonly_fields = ['id', 'created_at', 'blacklisted_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'token_id', 'token_type', 'user')}),
        (_('Details'), {'fields': ('blacklisted_at', 'expires_at', 'reason')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )


@admin.register(MFADevice)
class MFADeviceAdmin(BaseAdmin):
    """MFA device admin."""
    list_display = ['user', 'name', 'device_type', 'is_active', 'is_primary', 'is_verified', 'last_used_at']
    list_filter = BaseAdmin.list_filter + ['device_type', 'is_active', 'is_primary', 'is_verified']
    search_fields = ['user__email', 'name', 'phone', 'email']
    readonly_fields = ['id', 'created_at', 'verified_at', 'last_used_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'user', 'name', 'device_type')}),
        (_('Credentials'), {'fields': ('secret', 'phone', 'email')}),
        (_('Status'), {'fields': ('is_active', 'is_primary', 'is_verified', 'verified_at')}),
        (_('Usage'), {'fields': ('last_used_at', 'fail_count', 'locked_until')}),
        (_('Metadata'), {'fields': ('device_info',)}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )


@admin.register(MFABackupCode)
class MFABackupCodeAdmin(BaseAdmin):
    """MFA backup code admin."""
    list_display = ['user', 'code', 'is_used', 'used_at', 'expires_at']
    list_filter = BaseAdmin.list_filter + ['is_used']
    search_fields = ['user__email', 'code']
    readonly_fields = ['id', 'created_at', 'code_hash']
    
    fieldsets = (
        (None, {'fields': ('id', 'user', 'code', 'code_hash')}),
        (_('Status'), {'fields': ('is_used', 'used_at', 'expires_at')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )


@admin.register(MFAAuditLog)
class MFAAuditLogAdmin(BaseAdmin):
    """MFA audit log admin."""
    list_display = ['user', 'event_type', 'success', 'ip_address', 'created_at']
    list_filter = BaseAdmin.list_filter + ['event_type', 'success']
    search_fields = ['user__email', 'ip_address', 'message']
    readonly_fields = ['id', 'created_at', 'user', 'device', 'event_type', 'ip_address', 'user_agent', 'success', 'message', 'metadata']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(LoginAttempt)
class LoginAttemptAdmin(BaseAdmin):
    """Login attempt admin."""
    list_display = ['identifier', 'user', 'result', 'failure_reason', 'ip_address', 'attempted_at']
    list_filter = BaseAdmin.list_filter + ['result', 'failure_reason']
    search_fields = ['identifier', 'user__email', 'ip_address']
    readonly_fields = ['id', 'created_at', 'identifier', 'user', 'result', 'failure_reason', 'ip_address', 'user_agent', 'referer', 'attempted_at', 'metadata']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(AuditLog)
class AuditLogAdmin(BaseAdmin):
    """Audit log admin."""
    list_display = ['user', 'action', 'action_type', 'severity', 'ip_address', 'timestamp']
    list_filter = BaseAdmin.list_filter + ['action_type', 'severity']
    search_fields = ['user__email', 'action', 'content_type', 'object_id', 'ip_address']
    readonly_fields = ['id', 'created_at', 'user', 'action', 'action_type', 'severity', 'ip_address', 'user_agent', 'referer', 'timestamp', 'old_value', 'new_value', 'changes', 'metadata', 'content_type', 'object_id', 'object_repr']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserPreference)
class UserPreferenceAdmin(BaseAdmin):
    """User preference admin."""
    list_display = ['user', 'items_per_page', 'collapsed_sidebar', 'public_profile']
    list_filter = BaseAdmin.list_filter + ['collapsed_sidebar', 'public_profile']
    search_fields = ['user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'user')}),
        (_('Display'), {'fields': ('items_per_page', 'default_dashboard', 'collapsed_sidebar')}),
        (_('Notifications'), {'fields': ('notification_settings',)}),
        (_('Dashboard'), {'fields': ('dashboard_preferences',)}),
        (_('Privacy'), {'fields': ('public_profile', 'show_email', 'show_phone')}),
        (_('Working Hours'), {'fields': ('work_start_time', 'work_end_time', 'working_days')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )


@admin.register(TenantPreference)
class TenantPreferenceAdmin(BaseAdmin):
    """Tenant preference admin."""
    list_display = ['client_id', 'primary_color', 'default_language', 'api_rate_limit']
    search_fields = ['client_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'client_id')}),
        (_('Branding'), {'fields': ('logo_url', 'favicon_url', 'primary_color', 'secondary_color')}),
        (_('Features'), {'fields': ('features',)}),
        (_('Security'), {'fields': ('mfa_required_roles', 'password_expiry_days', 'session_timeout_minutes')}),
        (_('Localization'), {'fields': ('default_language', 'available_languages', 'default_timezone')}),
        (_('Data Retention'), {'fields': ('audit_log_retention_days', 'session_retention_days')}),
        (_('API'), {'fields': ('api_rate_limit', 'webhook_url')}),
        (_('Audit'), {'fields': ('created_at', 'updated_at', 'deleted_at', 'created_by', 'modified_by', 'tenant_id')}),
    )