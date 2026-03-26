import logging
import requests
from typing import Optional, Dict, Tuple, List, Any
from urllib.parse import urlencode
from django.conf import settings
from django.urls import reverse
from apps.accounts.models import User
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService
from apps.accounts.services.auth.password import PasswordService
logger = logging.getLogger(__name__)

class OAuthService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()

    def get_authorization_url(self, provider: str, redirect_uri: str = None) -> str:
        config = self._get_provider_config(provider)
        if not config:
            return ''
        params = {
            'client_id': config['client_id'],
            'redirect_uri': redirect_uri or config['redirect_uri'],
            'response_type': 'code',
            'scope': config['scope'],
        }
        if 'state' in config:
            params['state'] = config['state']
        return f"{config['auth_url']}?{urlencode(params)}"
    
    def authenticate(self, provider: str, code: str, redirect_uri: str = None, request=None) -> Tuple[Optional[User], Optional[str]]:
        try:
            token_data = self._exchange_code(provider, code, redirect_uri)
            if not token_data:
                return None, 'Failed to exchange authorization data'
            user_info = self._get_user_info(provider, token_data)
            if not user_info:
                return None, 'Failed to get user information'
            user, is_new = self._get_or_create_user(provider, user_info)
            if is_new:
                self.audit_service.log(
                    user=user, action='user.oauth_registered', action_type='create',
                    request=request, severity='info',
                    metadata={'provider': provider}
                )
            return user, None
        except Exception as e:
            logger.error(f"OAuth authentication error: {str(e)}")
            return None, 'OAuth authentication failed'
        
    def _get_provider_config(self, provider: str) -> Optional[Dict]:
        providers = getattr(settings, 'OAUTH_PROVIDERS', {})
        return providers.get(provider)
    
    def _exchange_code(self, provider: str, code: str, redirect_uri: str = None) -> Optional[Dict]:
        config = self._get_provider_config(provider)
        if not config:
            return None
        data = {
            'client_id': config['client_id'],
            'client_secret': config['client_secret'],
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri or config['redirect_uri']
        }
        try:
            response = requests.post(config['token_url'], data=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Tokne exchange error for {provider}: {str(e)}")
            return None
        
    def _get_user_info(self, provider: str, token_data: Dict) -> Optional[Dict]:
        config = self._get_provider_config(provider)
        if not config:
            return None
        headers = {
            'Authorization': f"{token_data['token_type']} {token_data['access_token']}"
        }
        try:
            response = requests.get(config['userinfo_url'], headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"User info error for {provider}: {str(e)}")
            return None
        
    def _get_or_create_user(self, provider: str, user_info: Dict) -> Tuple[Optional[User], bool]:
        email = user_info.get('email')
        if not email:
            return None, False
        user = User.objects.filter(email__iexact=email).first()
        if user:
            return user, False
        password_service = PasswordService()
        import secrets
        random_password = secrets.token_urlsafe(16)
        from apps.core.models import Client
        defaul_tenant = Client.objects.filter(is_deleted=False).first()
        if not defaul_tenant:
            return None, None
        user, error = self.user_registration.register_user(
            email=email,
            username=email.split('@')[0],
            password=random_password,
            tenant_id=str(defaul_tenant.id),
            first_name=user_info.get('given_name', ''),
            last_name=user_info.get('family_name', ''),
            role='staff',
            is_verified=True
        )
        if error:
            logger.error(f"User creation error: {error}")
            return None, False
        return user, True