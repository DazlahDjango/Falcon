"""
Tenant Role-Based Access Control (RBAC) Middleware.

NOTE: This middleware is currently PENDING ACTIVATION (dormant).
Do not register in config/settings/components/middleware.py until explicitly activated.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from apps.accounts.services.authorization.rbac import RBACService
from apps.accounts.constants import UserRoles

logger = logging.getLogger(__name__)


class TenantRBACMiddleware(MiddlewareMixin):
    """
    Middleware that attaches cached effective permissions to the authenticated request
    and enforces tenant-level access isolation across all tenant requests.
    """

    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.rbac_service = RBACService()

    def process_request(self, request):
        # 1. Skip unauthenticated or public paths
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            request.effective_permissions = []
            request.has_perm = lambda perm, obj=None: False
            return None

        user = request.user

        # 2. Attach effective permissions & has_perm helper
        effective_perms = self.rbac_service.get_user_effective_permissions(user)
        request.effective_permissions = effective_perms
        request.has_perm = lambda perm, obj=None: self.rbac_service.user_has_permission(user, perm, obj)

        # 3. Superadmin bypasses tenant matching checks
        if user.is_superuser or user.role == UserRoles.SUPER_ADMIN:
            return None

        # 4. Enforce tenant isolation if tenant is specified in headers or params
        target_tenant = (
            request.headers.get('X-Tenant-ID')
            or request.headers.get('X-Tenant-Id')
            or request.GET.get('tenant_id')
        )

        if target_tenant and str(user.tenant_id) != str(target_tenant):
            logger.warning(
                f"[TenantRBACMiddleware] Tenant mismatch: User {user.email} (tenant {user.tenant_id}) "
                f"attempted to access tenant {target_tenant} at {request.path}"
            )
            return JsonResponse(
                {'error': 'Cross-tenant access denied.', 'code': 'TENANT_MISMATCH'},
                status=403
            )

        return None
