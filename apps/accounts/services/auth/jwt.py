import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from apps.accounts.models import User, SessionBlacklist
from apps.accounts.managers import SessionBlacklistManager
from ...exceptions import TokenError
logger = logging.getLogger(__name__)

class JWTServices:
    def __init__(self):
        self.access_token_lifetime = settings.SIMPLE_JWT.get("ACCESS_TOKEN_LIFETIME", timedelta(minutes=30))
        self.refresh_token_lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME", timedelta(days=7))
        self.blacklist_manager = SessionBlacklist.objects
    
    def create_token(self, user: User, refresh_token_jti: str = None) -> Dict[str, Any]:
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['tenant_id'] = str(user.tenant_id)
        access = refresh.access_token
        access['email'] = user.email
        access['role'] = user.role
        access['tenant_id'] = str(user.tenant_id)
        access_jti = access.get('jti')
        refresh_jti = refresh.get('jti')
        tokens = {
            'access': str(access),
            'refresh': str(refresh),
            'access_expires_in': self.access_token_lifetime.total_seconds(),
            'refresh_expires_in': self.refresh_token_lifetime.total_seconds(),
            'token_type': 'Bearer',
            'jti': str(access_jti) if access_jti else None,
            'refresh_jti': str(refresh_jti) if refresh_jti else None,
        }
        if refresh_token_jti:
            self.blacklist_token_by_jti(refresh_token_jti, user, reason='refreshed')
        return tokens
    
    def create_mfa_token(self, user: User) -> str:
        refresh = RefreshToken.for_user(user)
        refresh.set_exp(lifetime=timedelta(minutes=5))
        refresh['mfa_pending'] = True
        refresh['purpose'] = 'mfa'
        refresh['user_id'] = str(user.id)
        refresh['tenant_id'] = str(user.tenant_id)
        return str(refresh)
    
    def verify_token(self, token: str, token_type: str = 'access') -> Optional[Dict]:
        try:
            if token_type == 'access':
                access = AccessToken(token)
                if self.is_blacklisted(access.get('jti')):
                    return None
                return access.payload
            else:
                refresh = RefreshToken(token)
                if self.is_blacklisted(refresh.get('jti')):
                    return None
                if refresh.get('mfa_pending'):
                    return refresh.payload
                return refresh.payload
        except TokenError as e:
            logger.debug(f"Token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return None
        
    def blacklist_token(self, token: str, user: User = None, reason: str = 'logout') -> bool:
        try:
            refresh = RefreshToken(token)
            jti = refresh.get('jti')
            expires_at = timezone.now() + timedelta(days=7)
            self.blacklist_manager.blacklist_token(
                token_id=jti,
                token_type='refresh',
                user=user,
                reason=reason,
                expires_at=expires_at
            )
            return True
        except TokenError:
            return False
        except Exception as e:
            logger.error(f"Token blacklist error: {str(e)}")
            return False
        
    def blacklist_token_by_jti(self, jti: str, user: User = None, reason: str = 'revoked') -> bool:
        try:
            expires_at = timezone.now() + timedelta(days=7)
            self.blacklist_manager.blacklist_token(
                token_id=jti,
                token_type='refresh',
                user=user,
                reason=reason,
                expires_at=expires_at
            )
            logger.debug(f"Token {jti} blacklisted")
            return True
        except Exception as e:
            logger.error(f"Token blacklist by jti error: {str(e)}")
            return False
        
    def is_blacklisted(self, jti: str) -> bool:
        try:
            return self.blacklist_manager.is_blacklisted(jti)
        except Exception as e:
            logger.error(f"Error checking blacklist: {e}")
            return False
    
    def get_token_payload(self, token: str) -> Optional[Dict]:
        try: 
            from jose import jwt
            payload = jwt.get_unverified_claims(token)
            return payload
        except Exception:
            return None
        
    def cleanup_expired_blacklist(self) -> int:
        return SessionBlacklist.objects.cleanup_expired()
    