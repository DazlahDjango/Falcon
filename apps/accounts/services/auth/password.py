import secrets
import hashlib
import logging
from typing import Optional, Tuple, List
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from django.conf import settings
from django.core.cache import cache
from apps.accounts.models import User
from apps.accounts.validators import validate_password_strength
from ..audit.logger import AuditService
logger = logging.getLogger(__name__)
class PasswordService:
    def __init__(self):
        self.audit_service = AuditService()
    def validate_password(self, password: str, user: User = None) -> Tuple[bool, List[str]]:
        is_valid, errors = validate_password_strength(password)
        if user and self._is_password_reused(password, user):
            errors.append('You cannot reuse a previous password.')
            is_valid = False
        return is_valid, errors
    def change_password(self, user: User, old_password: str, new_password: str, request=None) -> Tuple[bool, str]:
        if not user.check_password(old_password):
            self.audit_service.log(
                user=user, action='password.change_failed', action_type='update',
                request=request, severity='warning',
                metadata={'reason': 'wrong_old_password'}
            )
            return False, 'Current password is incorrect.'
        is_valid, errors = self.validate_password(new_password, user)
        if not is_valid:
            return False, errors[0]
        self._record_password_history(user)
        user.set_password(new_password)
        user.password_last_changed = timezone.now()
        user.password_change_required = False
        user.is_verified = True
        user.save(update_fields=['password', 'password_last_changed', 'password_history', 'password_change_required', 'is_verified'])
        from apps.accounts.services.auth.session import SessionService
        curr_session = getattr(request, 'session_key', None) if request else None
        SessionService().terminate_all_sessions(user, except_session_id=curr_session)
        # Flush Redis refresh token blacklist keys for user
        cache.delete_pattern(f"user_jwt_tokens:{user.id}:*")
        self.audit_service.log(
            user=user, action='password.changed', action_type='update',
            request=request, severity='info'
        )
        return True, 'Password changed successfully.'
    def reset_password(self, email: str, request=None) -> Tuple[bool, str]:
        try:
            user = User.objects.get(email__iexact=email, is_active=True, is_deleted=False)
            reset_token = self._generate_reset_token(user)
            from apps.accounts.tasks import send_password_reset_email
            send_password_reset_email.delay(str(user.id), reset_token)
            self.audit_service.log(
                user=user, action='password.reset_requested', action_type='create',
                request=request, severity='info'
            )
        except User.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return False, 'Unable to process password reset. Please try again'
        return True, 'Password reset email sent if account exists.'
    def confirm_reset(self, token: str, new_password: str, request=None) -> Tuple[bool, str]:
        user = self._validate_reset_token(token)
        if not user:
            return False, 'Invalid or expired reset token.'
        is_valid, errors = self.validate_password(new_password, user)
        if not is_valid:
            return False, errors[0]
        self._record_password_history(user)
        user.set_password(new_password)
        user.password_last_changed = timezone.now()
        user.password_change_required = False
        user.is_verified = True
        user.save(update_fields=['password', 'password_last_changed', 'password_history', 'password_change_required', 'is_verified'])
        from apps.accounts.services.auth.session import SessionService
        SessionService().terminate_all_sessions(user)
        self.audit_service.log(
            user=user, action='password.reset_completed', action_type='update',
            request=request, severity='info'
        )
        return True, 'Password reset successfully.'
    def _generate_reset_token(self, user: User, timeout: int = 3600) -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'password_reset:{token_hash}'
        cache.set(cache_key, str(user.id), timeout=timeout)
        return token
    def _validate_reset_token(self, token: str) -> Optional[User]:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'password_reset:{token_hash}'
        user_id = cache.get(cache_key)
        if not user_id:
            return None
        try:
            return User.objects.get(id=user_id, is_active=True, is_deleted=False)
        except User.DoesNotExist:
            return None
    def _is_password_reused(self, new_password: str, user: User) -> bool:
        if check_password(new_password, user.password):
            return True
        history = getattr(user, 'password_history', None) or []
        for entry in history:
            h = entry.get('password_hash') if isinstance(entry, dict) else entry
            if h and check_password(new_password, h):
                return True
        return False
    def _record_password_history(self, user: User):
        history = getattr(user, 'password_history', None) or []
        history.append({
            'password_hash': user.password,
            'changed_at': timezone.now().isoformat()
        })
        user.password_history = history[-5:]

    def generate_default_password_for_user(self, user: User, tenant_id: str):
        """
        Generate default password for a user based on tenant settings.
        Returns: (raw_password, password_change_required, mode)
        """
        from apps.accounts.models import TenantPreference
        pref = TenantPreference.objects.filter(client_id=tenant_id).first()
        if not pref:
            import secrets
            raw_password = secrets.token_urlsafe(9)[:12]
            return raw_password, True, 'system_generated'
            
        mode = pref.default_password_mode
        force_change = pref.force_password_change_on_first_login
        
        if mode == 'system_generated':
            import secrets
            raw_password = secrets.token_urlsafe(9)[:12]
            return raw_password, force_change, mode
        elif mode == 'email':
            return user.email, force_change, mode
        elif mode == 'employee_id':
            if not user.employee_id:
                import secrets
                raw_password = secrets.token_urlsafe(9)[:12]
                return raw_password, force_change, 'system_generated'
            return user.employee_id, force_change, mode
        elif mode == 'custom_static':
            static_val = pref.default_password_custom_value or "FalconDefault123!"
            return static_val, force_change, mode
        else: # invite_only
            return None, False, 'invite_only'

