import logging
from typing import Tuple, Optional
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from apps.accounts.models import User
from apps.accounts.services import MFAService
logger = logging.getLogger(__name__)

class StepUpAuthenticationService:
    CACHE_PREFIX = 'step_up_verified'
    VERIFICATION_TTL = 300  
    
    def __init__(self):
        self.mfa_service = MFAService()
    
    def require_step_up(self, user: User, action: str, ip_address: str = None, user_agent: str = None) -> bool:
        cache_key = self._get_cache_key(user, action)
        verified = cache.get(cache_key)
        if verified:
            return False
        return True
    
    def verify_step_up(self, user: User, action: str, otp: str, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str]:
        devices = user.auth_devices.filter(
            is_active=True, 
            is_verified=True, 
            device_type='totp'
        )
        if not devices.exists():
            return False, "No verified MFA device found"
        for device in devices:
            secret = device.secret
            if not secret:
                continue
            import pyotp
            totp = pyotp.TOTP(secret)
            if totp.verify(otp, valid_window=1):
                cache_key = self._get_cache_key(user, action)
                cache.set(cache_key, timezone.now().isoformat(), self.VERIFICATION_TTL)
                from apps.accounts.models import MFAAuditLog
                MFAAuditLog.objects.create(
                    user=user,
                    device=device,
                    event_type='step_up',
                    ip_address=ip_address or '',
                    user_agent=user_agent or '',
                    success=True,
                    message=f'Step-up authentication for {action}',
                    metadata={'action': action},
                    tenant_id=user.tenant_id
                )
                logger.info(f"Step-up verification successful for {user.email} for action: {action}")
                return True, "Step-up verification successful"
        from apps.accounts.models import MFAAuditLog
        MFAAuditLog.objects.create(
            user=user,
            device=None,
            event_type='step_up_failed',
            ip_address=ip_address or '',
            user_agent=user_agent or '',
            success=False,
            message=f'Failed step-up authentication for {action}',
            metadata={'action': action},
            tenant_id=user.tenant_id
        )
        return False, "Invalid verification code"
    
    def invalidate_step_up(self, user: User, action: str = None):
        if action:
            cache_key = self._get_cache_key(user, action)
            cache.delete(cache_key)
        else:
            pattern = f"{self.CACHE_PREFIX}:{user.id}:*"
            pass
    
    def _get_cache_key(self, user: User, action: str) -> str:
        return f"{self.CACHE_PREFIX}:{user.id}:{action}"

step_up_service = StepUpAuthenticationService()