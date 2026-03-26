import logging
import uuid
from typing import Optional, Dict, Any, List
from django.utils import timezone
from user_agents import parse
from apps.accounts.models import User, UserSession
from apps.accounts.managers import UserSessionManager
logger = logging.getLogger(__name__)

class SessionService:
    def create_session(self, user: User, session_key: str = None, jwt_token_id: str = None,ip_address: str = None, user_agent: str = None, mfa_verified: bool = False, **kwargs) -> UserSession:
        device_info = self._parse_user_agent(user_agent) if user_agent else {}
        is_trusted = self._is_trusted_device(user, ip_address, user_agent)
        session = UserSessionManager.create_session(
            user=user,
            session_key=session_key or str(uuid.uuid4()),
            jwt_token_id=jwt_token_id,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else '',
            device_type=device_info.get('device_type', ''),
            browser=device_info.get('browser', ''),
            os=device_info.get('os', ''),
            is_trusted_device=is_trusted,
            mfa_verified=mfa_verified,
            **kwargs
        )
        if session_key:
            user.current_session_key = session_key
            user.save(update_fields=['current_session_key'])
        self._enforce_session_limit(user)
        return session
    
    def get_active_sessions(self, user: User) -> List[UserSession]:
        return UserSession.objects.filter(user=user, status='active', expires_at__gt=timezone.now())
    
    def terminate_session(self, session_id: str) -> bool:
        try:
            session = UserSession.objects.get(id=session_id)
            session.logout()
            return True
        except UserSession.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Session termination error: {str(e)}")
            return False
    
    def terminate_all_sessions(self, user: User, except_session_id: str = None) -> int:
        qs = UserSession.objects.filter(user=user, status='active')
        if except_session_id:
            qs = qs.exclude(id=except_session_id)
        count = qs.update(status='revoked', logout_time=timezone.now())
        if count > 0 and not except_session_id:
            user.current_session_key = ''
            user.save(update_fields=['current_session_key'])
        return count
    
    def update_activity(self, session_id: str) -> bool:
        try:
            UserSession.objects.filter(id=session_id).update(last_activity=timezone.now())
            return True
        except Exception:
            return False
        
    def refresh_session(self, session_id: str, duration_hours: int = 24) -> bool:
        try:
            session = UserSession.objects.get(id=session_id)
            session.refresh_expiry(duration_hours)
            return True
        except UserSession.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Session refresh error: {str(e)}")
            return False
        
    def get_session_info(self, session_id: str) -> Optional[Dict]:
        try: 
            session = UserSession.objects.get(id=session_id)
            return {
                'id': str(session.id),
                'user_email': session.user.email,
                'ip_address': session.ip_address,
                'device_type': session.device_type,
                'browser': session.browser,
                'os': session.os,
                'login_time': session.login_time.isoformat(),
                'last_activity': session.last_activity.isoformat(),
                'expires_at': session.expires_at.isoformat(),
                'is_trusted': session.is_trusted_device,
                'mfa_verified': session.mfa_verified,
                'status': session.status
            }
        except UserSession.DoesNotExist:
            return None
        
    def cleanup_expired_sessions(self) -> int:
        return UserSessionManager.cleanup_expired()
    
    def _parse_user_agent(self, user_agent_string: str) -> Dict[str, str]:
        try:
            user_agent = parse(user_agent_string)
            return {
                'device_type': 'mobile' if user_agent.is_mobile else 'tablet' if user_agent.is_tablet else 'desktop',
                'browser': user_agent.browser.family,
                'os': user_agent.os.family,
            }
        except Exception:
            return {
                'device_type': 'unknown',
                'browser': 'unknown',
                'os': 'unknown',
            }
        
    def _is_trusted_device(self, user: User, ip_address: str, user_agent: str) -> bool:
        existing = UserSession.objects.filter(
            user=user, ip_address=ip_address, user_agent=user_agent[:500], status='active', is_trusted_device=True
        ).exists()

    def _enforce_session_limit(self, user: User, max_sessions: int = 5):
        active_sessions = self.get_active_sessions(user)
        if len(active_sessions) > max_sessions:
            to_terminate = active_sessions[:len(active_sessions) - max_sessions]
            for session in to_terminate:
                session.revoke()
    
    def add_security_alert(self, session_id: str, alert_type: str, details: Dict = None) -> bool:
        try: 
            session = UserSession.objects.get(id=session_id)
            session.add_security_alert(alert_type, details)
            return True
        except UserSession.DoesNotExist:
            return False
        