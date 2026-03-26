import logging
from typing import Optional, Tuple, Dict, Any
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from apps.accounts.models import User, UserPreference, Profile, AuditLog
from apps.accounts.services.auth.password import PasswordService
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class UserRegistrationService:
    def __init__(self):
        self.password_service = PasswordService()
        self.audit_service = AuditService()

    def register_user(self, email: str, username: str, password: str, tenant_id: str, first_name: str = '', last_name: str = '', role: str = 'staff', request=None) -> Tuple[Optional[User], Optional[str]]:
        if not email or not username or not password:
            return None, 'Email, username and password is required'
        if User.objects.filter(email__iexact=email).exists():
            return None, 'This email already exists'
        if User.objects.filter(email__iexact=username).exists():
            return None, 'This email user already exists'
        is_valid, errors = self.password_service.validate_password(password)
        if not is_valid:
            return None, errors[0]
        try:
            user = User.objects.create_user(
                email=email.lower().strip(),
                username=username.strip(),
                tenant_id=tenant_id,
                password=password,
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                role=role,
                is_verified=False,
                is_onboarded = False
            )
            Profile.objects.create(
                user=user,
                tenant_id=tenant_id
            )
            UserPreference.objects.create(
                user=user,
                tenant_id=tenant_id
            )
            self._send_verification_email(user)
            self.audit_service.log(
                user=user, action='user.register', action_type='create', request=request, severity='info', metadata={'role': role}
            )
            return user, None
        except Exception as e:
            logger.error(f"User registration error: {str(e)}")
            return None, 'Unable to create user. Please try again'
        
    def verify_email(self, token: str) -> Tuple[bool, str]:
        user = self._validate_verification_token(token)
        if not user:
            return False, 'Invalid or expired verification token'
        user.is_verified = True
        user.save(updated_fields=['is_verified'])
        self.audit_service.log(
            user=user, action='user.email_verified', action_type='update', severity='info'
        )
        return True, 'Email verified successful'
    
    def complete_onboarding(self, user: User, request=None) -> Tuple[bool, str]:
        try:
            user.is_onboarded = True
            user.save(update_fields=['is_onboarded'])
            self.audit_service.log(
                user=user, action='user.onboarded', action_type='update', request=request, severity='info'
            )
            return True, 'Onboading  completed'
        except Exception as e:
            logger.error(f"Onboarding error: {str(e)}")
            return False, 'Unable to complete onboarding'
    
    def resend_verification(self, email: str) -> Tuple[bool, str]:
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
            if user.is_verified:
                return False, 'Email already verified'
            self._send_verification_email(user)
            return True, 'Verification email sent'
        except User.DoesNotExist:
            return False, 'User not found'
        except Exception as e:
            logger.error(f"Resend verification error: {str(e)}")
            return False, 'Unable to send verification email'
        
    def _send_verification_email(self, user: User):
        token = self._generate_verification_token(user)
        subject = 'verifiy your email'
        context = {
            'user': user,
            'token': token,
            'verification_url': f"{settings.FRONTEND_URL}/verify-email?token={token}"
        }
        html_context = render_to_string('accounts/email/welcome.html', context)
        text_content = f"Click the link to verify your email: {context['verification_url']}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_context,
            fail_silently=False
        )
    
    def _generate_verification_token(self, user: User):
        import secrets
        import hashlib
        from django.core.cache import cache
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"email_verification:{token_hash}"
        cache.set(cache_key, str(user.id), timeout=86400)
        return token
    
    def _validate_verification_token(self, token: str) -> Optional[User]:
        import hashlib
        from django.core.cache import cache
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"email_verification:{token_hash}"
        user_id = cache.get(cache_key)
        if not user_id:
            return None
        try:
            return User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return None
        