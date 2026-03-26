import secrets
import hashlib
import logging
from typing import Optional, Tuple, List
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from apps.accounts.models import User, AuditLog
from ..audit.logger import AuditService
logger = logging.getLogger(__name__)

class PasswordService:
    def __init__(self):
        self.audit_service = AuditService()
        self.min_length = 8
        self.require_uppercase = True
        self.require_special = True
        self.require_numbers = True
    
    def validate_password(self, password: str, user: User = None) -> Tuple[bool, List[str]]:
        errors = []
        if len(password) < self.min_length:
            errors.append(f'Password must be at least {self.min_length} characters.')
        if self.require_uppercase and not any(c.isupper() for c in password):
            errors.append('Password must contain at least one uppercase letter.')
        if self.require_special and not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            errors.append('Password must contain at least one special character.')
        if self.require_numbers and not any(c.isdigit() for c in password):
            errors.append('Password must contain at least one number.')
        if self._is_common_password(password):
            errors.append('Password is too common. Please choose a more secure password.')
        if user:
            if self._is_password_reused(password, user):
                errors.append('You cannot reuse a previous password.')
        return len(errors) == 0, errors
    
    def change_password(self, user: User, old_password: str, new_password: str, request=None) -> Tuple[bool, str]:
        if not user.check_password(old_password):
            self.audit_service.log(
                user=user, action='password.change_failed', action_type='update', request=request, severity='warning', metadata={'reason': 'wrong_old_password'}
            )
            return False
        is_valid, errors = self.validate_password(new_password, user)
        if not is_valid:
            return False, errors[0]
        user.set_password(new_password)
        user.save(update_fields=['password'])
        # Log password change
        self.audit_service.log(
            user=user, action='password.changed', action_type='update',
            request=request, severity='info'
        )
        return True, 'Password changed successfully'
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
        # Set pass
        user.set_password(new_password)
        user.save(update_fields=['password'])
        self.audit_service.log(
            user=user, action='password.changed', action_type='update',
            request=request, severity='info'
        )
        return True, 'Password changed successfully.'
    
    def reset_password(self, email: str, request=None) -> Tuple[bool, str]:
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
            reset_token = self._generate_reset_token(user)
            self._send_reset_email(user, reset_token)
            self.audit_service.log(
                user=user, action='password.reset_requested', action_type='create',
                request=request, severity='info'
            )
            return True, 'Password reset email sent if account exists.'
        except User.DoesNotExist:
            return True, 'Password reset email sent if account exists.'
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return False, 'Unable to process password reset. Please try again'
        
    def confirm_reset(self, token: str, new_password: str, request=None) -> Tuple[bool, str]:
        user = self._validate_reset_token(token)
        if not user:
            return False, 'Invalid or expired reset token.'
        is_valid, errors = self.validate_password(new_password, user)
        if not is_valid:
            return False, errors[0]
        user.set_password(new_password)
        user.save(update_fields=['password'])
        from apps.accounts.services.auth.session import SessionService
        session_service = SessionService()
        session_service.terminate_all_sessions(user)
        self.audit_service.log(
            user=user, action='password.reset_completed', action_type='update',
            request=request, severity='info'
        )
        return True, 'Password reset successfully.'
    
    def _generate_reset_token(self, user: User) -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        from django.core.cache import cache
        cache_key = f'password_reset:{token_hash}'
        cache.set(cache_key, str(user.id), timeout=3600)  # 1 hour expiry
        return token
    
    def _validate_reset_token(self, token: str) -> Optional[User]:
        from django.core.cache import cache
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'password_reset:{token_hash}'
        user_id = cache.get(cache_key)
        if not user_id:
            return None
        try:
            return User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return None
    
    def _send_reset_email(self, user: User, token: str):
        subject = 'Password Reset Request'
        context = {
            'user': user,
            'token': token,
            'reset_url': f"{settings.FRONTEND_URL}/reset-password?token={token}"
        }
        html_content = render_to_string('accounts/email/password_reset.html', context)
        text_content = f"Click the link to reset your password: {context['reset_url']}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
    
    def _is_common_password(self, password: str) -> bool:
        common_passwords = {
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'monkey', 'letmein', 'dragon', 'baseball', 'football',
            'admin', 'welcome', 'login', 'password123', 'admin123'
        }
        return password.lower() in common_passwords
    
    def _is_password_reused(self, new_password: str, user: User) -> bool:
        # Check against password history (implemented later)
        # For now, just check against current password
        return user.check_password(new_password)
