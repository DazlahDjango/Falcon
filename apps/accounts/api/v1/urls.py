from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    AuthViewSet, LoginView, MFAAuthView, MFASetupView, MFADeviceView, MFABackupCodesView, RefreshTokenView, LogoutView,
    UserViewSet, UserProfileView, CurrentUserView, UserChangePasswordView, UserInvitationsView, InvitationAcceptView,
    ProfileViewSet, RoleViewSet, PermissionViewSet, SessionViewSet, MFADeviceViewSet, MFAAuditLogViewSet,
    UserPreferenceViewSet, TenantPreferenceViewSet, AuditLogViewSet,
    AdminUserViewSet, AdminRoleViewSet, AdminTenantViewSet, AdminPermissionViewSet, AdminSystemView
)

# Router configs
# =============
router = DefaultRouter()
router.trailing_slash = '/?'
# Register viewsets
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'mfa/devices', MFADeviceViewSet, basename='mfa-device')
router.register(r'mfa/audit-logs', MFAAuditLogViewSet, basename='mfa-audit-log')
router.register(r'preferences/users', UserPreferenceViewSet, basename='user-preference')
router.register(r'preferences/tenants', TenantPreferenceViewSet, basename='tenant-preference')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
# Admin routes
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/roles', AdminRoleViewSet, basename='admin-role')
router.register(r'admin/permissions', AdminPermissionViewSet, basename='admin-permission')
router.register(r'admin/tenants', AdminTenantViewSet, basename='admin-tenant')

# Nested Routers
# ==============
# User nested routes
users_router = NestedDefaultRouter(router, r'users', lookup='user')
users_router.register(r'profile', ProfileViewSet, basename='user-profile')
users_router.register(r'sessions', SessionViewSet, basename='user-sessions')
users_router.register(r'mfa-devices', MFADeviceViewSet, basename='user-mfa-devices')
users_router.register(r'preferences', UserPreferenceViewSet, basename='user-preferences')

# Direct API views
auth_urls = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    # MFA endpoints
    path('mfa/setup/', MFASetupView.as_view(), name='mfa-setup'),
    path('mfa/verify/', MFAAuthView.as_view(), name='mfa-verify'),
    path('mfa/devices/', MFADeviceView.as_view(), name='mfa-devices-list'),
    path('mfa/devices/<uuid:device_id>/', MFADeviceView.as_view(), name='mfa-device-detail'),
    path('mfa/backup-codes/', MFABackupCodesView.as_view(), name='mfa-backup-codes'),
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
]

# URL Patterns
urlpatterns = [
    path('', include(router.urls)),
    path('', include(users_router.urls)),
    path('auth/', include(auth_urls)),
    path('', include(admin_urls))
]