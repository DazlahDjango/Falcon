"""
Tenant Authentication Backend
Handles authentication with tenant isolation for multi-tenant SaaS platform
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.exceptions import MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class TenantAuthenticationBackend(ModelBackend):
    """
    Authentication backend that respects tenant isolation.

    This backend ensures users can only authenticate if they belong to the 
    tenant specified in the request context. It supports login using either
    email or username.

    How it works:
    1. Extract tenant_id from the request (set by tenant middleware)
    2. Find user by email or username
    3. Verify password
    4. Check that user belongs to the tenant
    5. Return user if all checks pass
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate a user with tenant isolation.

        Args:
            request: HTTP request object (contains tenant_id from middleware)
            username: Email address or username
            password: User's password

        Returns:
            User object if authentication successful, None otherwise
        """
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)

        # Get tenant_id from request (set by tenant middleware)
        tenant_id = None
        if request and hasattr(request, 'tenant_id'):
            tenant_id = request.tenant_id

        # For superusers, we might skip tenant check
        is_superuser_override = kwargs.get('is_superuser_override', False)

        try:
            # Try to find user by email OR username (case-insensitive)
            user = User.objects.get(
                Q(email__iexact=username) | Q(username__iexact=username)
            )
        except User.DoesNotExist:
            # Run default password hasher to prevent timing attacks
            User().set_password(password)
            logger.warning(
                f"Authentication failed: User '{username}' not found")
            return None
        except MultipleObjectsReturned:
            logger.error(
                f"Multiple users found for '{username}' - check unique constraints")
            return None

        # Check if the user can authenticate
        if not self.user_can_authenticate(user):
            logger.warning(
                f"Authentication blocked: User '{username}' cannot authenticate")
            return None

        # Verify password
        if not user.check_password(password):
            logger.warning(
                f"Authentication failed: Invalid password for user '{username}'")
            return None

        # Tenant isolation check (skip for superusers if configured)
        if tenant_id and not is_superuser_override:
            # Check if user has a tenant_id
            if not user.tenant_id:
                logger.warning(
                    f"Authentication blocked: User '{username}' has no tenant assigned")
                return None

            # Verify user belongs to the requesting tenant
            if str(user.tenant_id) != str(tenant_id):
                logger.warning(
                    f"Authentication blocked: User '{username}' (tenant: {user.tenant_id}) "
                    f"attempting to access tenant: {tenant_id}"
                )
                return None

        logger.info(
            f"User '{username}' authenticated successfully for tenant: {tenant_id}")
        return user

    def get_user(self, user_id):
        """Get user by ID for session persistence"""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class SuperuserTenantBackend(TenantAuthenticationBackend):
    """
    Authentication backend for superusers that bypasses tenant restrictions.
    Useful for platform administrators who need to access all tenants.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate superusers with tenant bypass.
        Superusers can log in regardless of tenant.
        """
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)

        try:
            user = User.objects.get(
                Q(email__iexact=username) | Q(username__iexact=username)
            )
        except User.DoesNotExist:
            User().set_password(password)
            return None

        # Check password AND superuser status
        if user.check_password(password) and user.is_superuser:
            logger.info(
                f"Superuser '{username}' authenticated (tenant bypass)")
            return user

        return None


class TenantOptionalBackend(ModelBackend):
    """
    Authentication backend that supports both tenant-isolated and tenant-less users.
    Useful for mixed-mode authentication during migration.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authenticate with optional tenant checking"""
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)

        # Get tenant_id from request if available
        tenant_id = None
        if request and hasattr(request, 'tenant_id'):
            tenant_id = request.tenant_id

        try:
            user = User.objects.get(
                Q(email__iexact=username) | Q(username__iexact=username)
            )
        except User.DoesNotExist:
            User().set_password(password)
            return None

        if not user.check_password(password) or not self.user_can_authenticate(user):
            return None

        # Only enforce tenant check if user has a tenant AND request has tenant
        if tenant_id and user.tenant_id:
            if str(user.tenant_id) != str(tenant_id):
                logger.warning(f"Tenant mismatch for user '{username}'")
                return None

        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
