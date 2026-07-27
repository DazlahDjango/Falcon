"""
Custom JWT Authentication for multi-tenant schema isolation.

Problem:
    SimpleJWT's default JWTAuthentication.get_user() runs
    User.objects.get(id=user_id) AFTER the tenant middleware has already set
    PostgreSQL's search_path to the tenant schema (e.g. 'org_falcon_technologies').
    Because 'apps.accounts' is listed in ORG_APPS, the tenant schema may contain
    its own accounts_user table — and the user isn't there.  → 401 "User not found".

Solution:
    Override get_user() to temporarily reset search_path to "public" before
    querying the User model, then restore the original search_path afterward.
    This ensures the User lookup always hits the public schema where users live.
"""

import logging
from django.db import connection
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.utils import get_md5_hash_password
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class TenantAwareJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that always looks up users in the *public* schema,
    regardless of the current PostgreSQL search_path set by tenant middleware.
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError as e:
            raise InvalidToken(
                _("Token contained no recognizable user identification")
            ) from e

        # ── Temporarily switch to public schema for the user lookup ──
        try:
            with connection.cursor() as cursor:
                # Save current search_path
                cursor.execute("SHOW search_path")
                original_search_path = cursor.fetchone()[0]

                # Switch to public
                cursor.execute('SET search_path TO "public"')
        except Exception as e:
            logger.warning(f"Could not switch search_path for user lookup: {e}")
            original_search_path = None

        try:
            user = self.user_model.objects.get(
                **{api_settings.USER_ID_FIELD: user_id}
            )
        except self.user_model.DoesNotExist as e:
            raise AuthenticationFailed(
                _("User not found"), code="user_not_found"
            ) from e
        finally:
            # ── Restore original search_path ──
            if original_search_path is not None:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            f"SET search_path TO {original_search_path}"
                        )
                except Exception as e:
                    logger.warning(f"Could not restore search_path: {e}")

        if api_settings.CHECK_USER_IS_ACTIVE and not user.is_active:
            raise AuthenticationFailed(
                _("User is inactive"), code="user_inactive"
            )

        if api_settings.CHECK_REVOKE_TOKEN:
            if validated_token.get(
                api_settings.REVOKE_TOKEN_CLAIM
            ) != get_md5_hash_password(user.password):
                raise AuthenticationFailed(
                    _("The user's password has been changed."),
                    code="password_changed",
                )

        return user
