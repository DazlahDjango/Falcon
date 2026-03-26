"""
LDAP service - LDAP/Active Directory integration.
"""

import logging
import ldap3
from typing import Optional, Dict, Any, Tuple
from django.conf import settings
from django.core.cache import cache
from apps.accounts.models import User
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class LDAPService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()
    
    def authenticate(self, username: str, password: str, tenant_id: str,
                     request=None) -> Tuple[Optional[User], Optional[str]]:
        config = self._get_tenant_config(tenant_id)
        if not config:
            return None, 'LDAP not configured for this tenant.'
        try:
            # Connect to LDAP server
            server = ldap3.Server(config['server'], get_info=ldap3.ALL)
            # Bind with user credentials
            user_dn = self._build_user_dn(username, config)
            conn = ldap3.Connection(server, user=user_dn, password=password, auto_bind=True)
            # Search for user
            search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"
            conn.search(
                search_base=config['base_dn'],
                search_filter=search_filter,
                attributes=['mail', 'givenName', 'sn', 'displayName']
            )
            if not conn.entries:
                conn.unbind()
                return None, 'User not found in LDAP.'
            # Extract user info
            entry = conn.entries[0]
            user_info = {
                'email': str(entry.mail.value) if entry.mail else f"{username}@{config['domain']}",
                'first_name': str(entry.givenName.value) if entry.givenName else '',
                'last_name': str(entry.sn.value) if entry.sn else '',
                'display_name': str(entry.displayName.value) if entry.displayName else username
            }
            conn.unbind()
            # Get or create user
            user = self._get_or_create_user(user_info, tenant_id)
            if not user:
                return None, 'Unable to create or find user.'
            return user, None
        except ldap3.core.exceptions.LDAPException as e:
            logger.error(f"LDAP authentication error: {str(e)}")
            return None, 'LDAP authentication failed.'
        except Exception as e:
            logger.error(f"LDAP error: {str(e)}")
            return None, 'Authentication failed.'
    
    def sync_users(self, tenant_id: str) -> Dict[str, Any]:
        config = self._get_tenant_config(tenant_id)
        if not config:
            return {'error': 'LDAP not configured'}
        try:
            # Connect with service account
            server = ldap3.Server(config['server'])
            conn = ldap3.Connection(
                server,
                user=config['service_user'],
                password=config['service_password'],
                auto_bind=True
            )
            # Search for all users
            search_filter = "(&(objectClass=user)(objectCategory=person))"
            conn.search(
                search_base=config['base_dn'],
                search_filter=search_filter,
                attributes=['sAMAccountName', 'mail', 'givenName', 'sn', 'displayName']
            )
            created = 0
            updated = 0
            errors = []
            for entry in conn.entries:
                username = str(entry.sAMAccountName.value) if entry.sAMAccountName else None
                email = str(entry.mail.value) if entry.mail else None
                if not username or not email:
                    continue
                try:
                    user = User.objects.filter(email__iexact=email, tenant_id=tenant_id).first()
                    user_info = {
                        'email': email,
                        'first_name': str(entry.givenName.value) if entry.givenName else '',
                        'last_name': str(entry.sn.value) if entry.sn else '',
                    }
                    if user:
                        # Update existing user
                        user.first_name = user_info['first_name']
                        user.last_name = user_info['last_name']
                        user.save(update_fields=['first_name', 'last_name'])
                        updated += 1
                    else:
                        # Create new user
                        import secrets
                        random_password = secrets.token_urlsafe(16)
                        
                        user, error = self.user_registration.register_user(
                            email=email,
                            username=username,
                            password=random_password,
                            tenant_id=tenant_id,
                            first_name=user_info['first_name'],
                            last_name=user_info['last_name'],
                            role='staff',
                            is_verified=True
                        )
                        if error:
                            errors.append(f"{email}: {error}")
                        else:
                            created += 1
                except Exception as e:
                    errors.append(f"{email}: {str(e)}")
            conn.unbind()
            return {
                'created': created,
                'updated': updated,
                'errors': errors,
                'total': created + updated
            }
        except Exception as e:
            logger.error(f"LDAP sync error: {str(e)}")
            return {'error': str(e)}
    
    def _get_tenant_config(self, tenant_id: str) -> Optional[Dict]:
        from apps.accounts.models import TenantPreference
        preferences = TenantPreference.objects.filter(client_id=tenant_id).first()
        if not preferences or not preferences.features.get('ldap_enabled'):
            return None
        return {
            'server': preferences.features.get('ldap_server', ''),
            'domain': preferences.features.get('ldap_domain', ''),
            'base_dn': preferences.features.get('ldap_base_dn', ''),
            'service_user': preferences.features.get('ldap_service_user', ''),
            'service_password': preferences.features.get('ldap_service_password', ''),
        }
    
    def _build_user_dn(self, username: str, config: Dict) -> str:
        return f"cn={username},{config['base_dn']}"
    
    def _get_or_create_user(self, user_info: Dict, tenant_id: str) -> Optional[User]:
        email = user_info.get('email')
        if not email:
            return None
        user = User.objects.filter(email__iexact=email, tenant_id=tenant_id).first()
        if user:
            return user
        # Create new user
        import secrets
        random_password = secrets.token_urlsafe(16)
        user, error = self.user_registration.register_user(
            email=email,
            username=email.split('@')[0],
            password=random_password,
            tenant_id=tenant_id,
            first_name=user_info.get('first_name', ''),
            last_name=user_info.get('last_name', ''),
            role='staff',
            is_verified=True
        )
        if error:
            logger.error(f"LDAP user creation error: {error}")
            return None
        return user