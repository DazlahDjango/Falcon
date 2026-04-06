"""
Accounts app URL configuration.
Routes for API and WebSocket endpoints.
"""
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.urls import path, include
from django.views.generic import TemplateView
from .api.v1.views import (
    AuthViewSet, LoginView, MFAAuthView, MFASetupView, MFADeviceView, MFABackupCodesView, RefreshTokenView, LogoutView,
    UserViewSet, UserProfileView, CurrentUserView, UserChangePasswordView, UserInvitationsView, InvitationAcceptView,
    ProfileViewSet, RoleViewSet, PermissionViewSet, SessionViewSet, MFADeviceViewSet, MFAAuditLogViewSet,
    UserPreferenceViewSet, TenantPreferenceViewSet, AuditLogViewSet,
    AdminUserViewSet, AdminRoleViewSet, AdminTenantViewSet, AdminPermissionViewSet, AdminSystemView
)

@csrf_exempt
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'accounts',
        'timestamp': '2026-04-05T20:00:00Z'
    })

# API URL Patterns
# =================
urlpatterns = [
    # API v1 endpoints
    path('', include('apps.accounts.api.v1.urls')),
    # WebSocket endpoints (handled by channels routing)
    # Health check and public endpoints
    path('health/', health_check, name='health'),
    path('accept-invitation/', TemplateView.as_view(template_name='accounts/accept_invitation.html'), name='accept_invitation'),
    path('verify-email/', TemplateView.as_view(template_name='accounts/verify_email.html'), name='verify_email'),
    path('reset-password/', TemplateView.as_view(template_name='accounts/reset_password.html'), name='reset_password'),
]