# apps/accounts/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    AuthViewSet, LoginView, MFAAuthView, RefreshTokenView, LogoutView,
    UserViewSet, UserProfileView, CurrentUserView, UserChangePasswordView, UserInvitationsView, InvitationAcceptView,
    ProfileViewSet, RoleViewSet, PermissionViewSet, SessionViewSet, MFADeviceViewSet, MFAAuditLogViewSet,
    UserPreferenceViewSet, TenantPreferenceViewSet, AuditLogViewSet,
    AdminUserViewSet, AdminRoleViewSet, AdminTenantViewSet, AdminPermissionViewSet, AdminSystemView,
    AccountsSystemSettingsView, AccountsSystemSettingsResetView, AccountsSyncPolicyView,
    TenantMFAPolicyView, UserMFAPolicyView, UserMFAStatusView,
    AdminMfaResetView, AdminMfaDeviceClearView, AdminMFAStatusView,
    StepUpVerifyView
)
from .views.security_views import LoginAttemptViewSet, TenantPolicyView, LockoutSummaryView

# Router configs
router = DefaultRouter()
router.trailing_slash = '/?'

# Register viewsets
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'sessions', SessionViewSet, basename='session')

# MFA Viewsets (NEW - these provide all MFA functionality)
router.register(r'mfa/devices', MFADeviceViewSet, basename='mfa-device')
router.register(r'mfa/audit-logs', MFAAuditLogViewSet, basename='mfa-audit-log')

router.register(r'preferences/users', UserPreferenceViewSet, basename='user-preference')
router.register(r'preferences/tenants', TenantPreferenceViewSet, basename='tenant-preference')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'security/login-attempts', LoginAttemptViewSet, basename='login-attempt')

# Admin routes
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/roles', AdminRoleViewSet, basename='admin-role')
router.register(r'admin/permissions', AdminPermissionViewSet, basename='admin-permission')
router.register(r'admin/tenants', AdminTenantViewSet, basename='admin-tenant')

# Nested Routers
users_router = NestedDefaultRouter(router, r'users', lookup='user')
users_router.register(r'profile', ProfileViewSet, basename='user-profile')
users_router.register(r'sessions', SessionViewSet, basename='user-sessions')
users_router.register(r'mfa-devices', MFADeviceViewSet, basename='user-mfa-devices')
users_router.register(r'preferences', UserPreferenceViewSet, basename='user-preferences')

# Direct API views (removed conflicting MFA endpoints)
auth_urls = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    
    # MFA endpoints - NOW USING VIEWSETS via router, so these are removed:
    # The ViewSet provides these endpoints automatically:
    # - POST /mfa/devices/setup-totp/ (setup TOTP)
    # - POST /mfa/devices/verify-totp-setup/ (verify setup)
    # - POST /mfa/devices/{id}/verify/ (verify device)
    # - POST /mfa/devices/verify-backup/ (verify backup code)
    # - POST /mfa/devices/generate-backup-codes/ (generate codes)
    # - GET /mfa/devices/backup-codes-status/ (check remaining)
    # - GET /mfa/devices/status/ (MFA status)
    # - POST /mfa/devices/disable/ (disable MFA)
    
    # User Management endpoints
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('me/change-password/', UserChangePasswordView.as_view(), name='change-password'),
    path('invitations/', UserInvitationsView.as_view(), name='invitations'),
    path('invitation/accept/', InvitationAcceptView.as_view(), name='accept-invitation'),
]

# Admin API views
admin_urls = [
    path('admin/system/', AdminSystemView.as_view({'get': 'list'}), name='admin-system'),
    path('admin/system/clear-cache/', AdminSystemView.as_view({'post': 'clear_cache'}), name='admin-clear-cache'),
    path('admin/system/health/', AdminSystemView.as_view({'get': 'health'}), name='admin-system-health'),
]

security_urls = [
    path('security/policy/', TenantPolicyView.as_view(), name='tenant-security-policy'),
    path('security/lockout-summary/', LockoutSummaryView.as_view(), name='lockout-summary'),
    path('system-settings/', AccountsSystemSettingsView.as_view(), name='accounts-system-settings'),
    path('system-settings/reset/', AccountsSystemSettingsView.as_view(), name='accounts-system-settings-reset'),
    path('system-settings/sync-policy/', AccountsSyncPolicyView.as_view(), name='accounts-sync-policy'),
    path('security/mfa/policy/', TenantMFAPolicyView.as_view(), name='tenant-mfa-policy'),
    path('security/mfa/users/', UserMFAPolicyView.as_view(), name='user-mfa-policy-list'),
    path('security/mfa/users/<uuid:user_id>/', UserMFAPolicyView.as_view(), name='user-mfa-policy-detail'),
    path('security/mfa/users/<uuid:user_id>/status/', UserMFAStatusView.as_view(), name='user-mfa-status'),
    path('admin/mfa/reset/<uuid:user_id>/', AdminMfaResetView.as_view(), name='admin-mfa-reset'),
    path('admin/mfa/devices/<uuid:user_id>/', AdminMfaDeviceClearView.as_view(), name='admin-mfa-devices-clear'),
    path('admin/mfa/devices/<uuid:user_id>/<uuid:device_id>/', AdminMfaDeviceClearView.as_view(), name='admin-mfa-device-clear'),
    path('admin/mfa/status/<uuid:user_id>/', AdminMFAStatusView.as_view(), name='admin-mfa-status'),
    path('auth/step-up/verify/', StepUpVerifyView.as_view(), name='step-up-verify'),
]

# URL Patterns
urlpatterns = [
    path('', include(router.urls)),
    path('', include(users_router.urls)),
    path('auth/', include(auth_urls)),
    path('', include(admin_urls)),
    path('', include(security_urls)),
]