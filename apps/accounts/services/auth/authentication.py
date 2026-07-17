import logging
from typing import Optional, Dict, Any, Tuple
from django.utils import timezone
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django_otp import match_token, devices_for_user
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User, LoginAttempt, AuditLog
from apps.accounts.managers import LoginAttemptManager, AuditLogManager
from .jwt import JWTServices
from .mfa import MFAService
from .session import SessionService
from ..audit.logger import AuditService
from ..policy import AccountsPolicyService
logger = logging.getLogger(__name__)

class AuthenticationService:
    def __init__(self):
        self.jwt_service = JWTServices()
        self.mfa_service = MFAService()
        self.session_service = SessionService()
        self.audit_service = AuditService()

    def authenticate(self, email: str, password: str, ip_address: str, user_agent: str, tenant_id: str = None, request=None) -> Tuple[Optional[User], Optional[Dict], Optional[str]]:
        if request is None:
            from django.http import HttpRequest
            request = HttpRequest()
            request.META = {
                'REMOTE_ADDR': ip_address,
                'HTTP_USER_AGENT': user_agent
            }
        if not hasattr(request, 'session'):
            from django.contrib.sessions.backends.db import SessionStore
            request.session = SessionStore()
        if not email or not password:
            return None, None, 'Email and password required'
        email = email.lower().strip()
        user = User.objects.filter(email=email).first()
        user_tenant_id = str(user.tenant_id) if user and user.tenant_id else None

        # Tenant validation for non-super-admins
        if user and user.role != 'super_admin':
            if not tenant_id:
                return None, None, 'Organization Tenant ID is required'
            if str(tenant_id) != user_tenant_id:
                return None, None, 'Invalid Organization Tenant ID for this user'

        
        # Skip lockout/rate limits for super admins
        if not (user and user.role == 'super_admin'):
            if self._is_rate_limited(email, ip_address, tenant_id=user_tenant_id):
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='locked', failure_reason='rate_limit', request=request, ip_address=ip_address, user_agent=user_agent
                )
                return None, None, 'Too many attempts. Please try again later'
            if user and user.is_locked():
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='locked',
                    failure_reason='account_locked', request=request,
                    ip_address=ip_address, user_agent=user_agent
                )
                return None, None, 'Account is locked due to many failed attempts.'
        
        try:
            user = authenticate(request, username=email, password=password)
            if user is None:
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='failure',
                    failure_reason='wrong_password', request=request,
                    ip_address=ip_address, user_agent=user_agent
                )
                if user and user.role != 'super_admin':
                    user.increment_login_attempts()
                return None, None, "Invalid email or password"
            if not user.is_active:
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='failure',
                    failure_reason='inactive', request=request,
                    ip_address=ip_address, user_agent=user_agent
                )
                return None, None, 'Account is inactive. Please contact administrator.'
            if user.mfa_enabled:
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='success',
                    request=request, ip_address=ip_address, user_agent=user_agent
                )
                partial_token = self.jwt_service.create_mfa_token(user)
                return user, {'requires_mfa': True, 'mfa_token': partial_token}, None
            if user.role != 'super_admin' and AccountsPolicyService.user_requires_mfa(user):
                # Allow user to set up MFA first
                LoginAttempt.record_attempt(
                    identifier=email, user=user, result='success',
                    request=request, ip_address=ip_address, user_agent=user_agent
                )
                partial_token = self.jwt_service.create_mfa_token(user)
                return user, {'requires_mfa': True, 'mfa_token': partial_token, 'mfa_setup_required': True}, None
            LoginAttempt.record_attempt(
                identifier=email, user=user, result='success',
                request=request, ip_address=ip_address, user_agent=user_agent
            )
            return self._complete_authentication(user, ip_address, user_agent, request)
        except Exception as e:
            logger.error(f"Authentication error for {email}: {str(e)}", exc_info=True)
            return None, None, f"Authentication failed: {str(e)}"
    
    def verify_mfa(self, user: User, mfa_token: str, otp: str, ip_address: str, user_agent: str, request=None) -> Tuple[Optional[User], Optional[Dict], Optional[str]]:
        try:
            is_valid, device = self.mfa_service.verify_otp(user, otp)
            if not is_valid:
                self.mfa_service.log_attempt(user, device, ip_address, user_agent, success=False, message='Invalid OTP')
                return None, None, 'Invalid MFA code.'
            if device:
                device.mark_used()
            self.mfa_service.log_attempt(user, device, ip_address, user_agent, success=True, message='MFA verified')
            return self._complete_authentication(user, ip_address, user_agent, request, mfa_verified=True)
        except Exception as e:
            logger.error(f"MFA verification error for {user.email}: {str(e)}")
            return None, None, 'MFA verification failed'
        
    def _complete_authentication(self, user: User, ip_address: str, user_agent: str, request=None, mfa_verified: bool = False) -> Tuple[User, Dict, Optional[str]]:
        """Complete the authentication process and return tokens."""
        logger.info(f"Completing authentication for user: {user.email}")
        
        try:
            # 1. Update user login info
            user.last_login = timezone.now()
            user.last_login_ip = ip_address
            user.last_login_agent = user_agent[:500]
            user.login_attempts = 0
            user.locked_until = None
            user.save(update_fields=['last_login', 'last_login_ip', 'last_login_agent', 'login_attempts', 'locked_until'])
            logger.debug("User login info updated")

            # 2. Create session
            session = self.session_service.create_session(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                mfa_verified=mfa_verified
            )
            logger.debug(f"Session created: {session.id}")

            # 3. Generate tokens
            tokens = self.jwt_service.create_token(user)
            tokens['session_id'] = str(session.id)
            tokens['password_change_required'] = user.password_change_required
            logger.debug("JWT tokens generated")

            # 4. Record successful login attempt
            LoginAttempt.record_attempt(
                identifier=user.email,
                user=user,
                result='success',
                request=request,
                ip_address=ip_address,
                user_agent=user_agent
            )
            logger.debug("Login attempt recorded")

            # 5. Audit log
            self.audit_service.log(
                user=user,
                action='user.login',
                action_type='login',
                request=request,
                severity='info',
                metadata={
                    'session_id': str(session.id),
                    'ip': ip_address,
                    'mfa_verified': mfa_verified
                }
            )
            logger.debug("Audit log created")

            return user, tokens, None
            
        except Exception as e:
            logger.error(f"Error in _complete_authentication for {user.email}: {str(e)}", exc_info=True)
            raise e
    
    def logout(self, user: User, session_id: str = None, token: str = None, request=None):
        try:
            if session_id:
                self.session_service.terminate_session(session_id)
            else:
                self.session_service.terminate_all_sessions(user)
            if token:
                self.jwt_service.blacklist_token(token, user)
            self.audit_service.log(
                user=user, action='user.logout', action_type='logout',
                request=request, severity='info'
            )
            return True, None
        except Exception as e:
            logger.error(f"Logout error for {user.email}: {str(e)}")
            return False, str(e)
        
    def refresh_token(self, refresh_token: str, ip_address: str, user_agent: str) -> Tuple[Optional[Dict], Optional[str]]:
        try:
            payload = self.jwt_service.verify_token(refresh_token, token_type='refresh')
            if not payload:
                return None, 'Invalid refresh token'
            user_id = payload.get('user_id')
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return None, 'User not found or inactive'
            jti = payload.get('jti')
            if self.jwt_service.is_blacklisted(jti):
                return None, 'Token has been revoked'
            tokens = self.jwt_service.create_token(user, refresh_token_jti=jti)
            self.audit_service.log(
                user=user, action='token.refresh', action_type='update',
                severity='info', metadata={'ip_address': ip_address}
            )
            return tokens, None
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return None, 'Token refresh failed'
        
    def _is_rate_limited(self, email: str, ip_address: str, tenant_id: str = None) -> bool:
        lockout = AccountsPolicyService.get_lockout_config(tenant_id)
        window = lockout.get('lockout_minutes', 15)
        email_limit = lockout.get('failure_limit', 5)
        ip_limit = lockout.get('ip_failure_limit', 5)
        if LoginAttempt.get_failure_count(email, minutes=window) >= email_limit:
            return True
        if LoginAttempt.get_ip_failure_count(ip_address, minutes=window) >= ip_limit:
            return True
        return False
    
    def get_session_info(self, user: User) -> Dict:
        active_sessions = self.session_service.get_active_sessions(user)
        return {
            'active_sessions_count': len(active_sessions),
            'sessions': [
                {
                    'id': str(s.id),
                    'ip_address': s.ip_address,
                    'device_type': s.device_type,
                    'browser': s.browser,
                    'os': s.os,
                    'login_time': s.login_time.isoformat(),
                    'last_activity': s.last_activity.isoformat(),
                    'is_current': s.session_key == user.current_session_key
                }
                for s in active_sessions
            ]
        }
    