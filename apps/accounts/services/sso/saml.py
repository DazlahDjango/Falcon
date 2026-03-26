import logging
import base64
import xml.etree.ElementTree as ET
from typing import Optional, Dict, Any, Tuple
from django.conf import settings
from django.urls import reverse
from apps.accounts.models import User
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService
from apps.accounts.services.auth.password import PasswordService
logger = logging.getLogger(__name__)

class SAMLService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()

    def get_saml_metadata(self, tenant_id: str) -> str:
        config = self._get_tenant_config(tenant_id)
        if not config:
            return ''
        metadata = f'''<?xml version="1.0"?>
<EntityDescriptor entityID="{config['sp_entity_id']}" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
    <SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
        <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="{config['acs_url']}" index="0"/>
        <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="{config['sls_url']}"/>
    </SPSSODescriptor>
</EntityDescriptor>'''
        return metadata
    
    def process_saml_response(self, saml_response: str, tenant_id: str, request=None) -> Tuple[Optional[User], Optional[str]]:
        try: 
            decode = base64.b64decode(saml_response).decode('utf-8')
            root = ET.fromstring(decode)
            ns = {'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
                  'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol'}
            assertion = root.find('.//saml:Assertion', ns)
            if assertion is None:
                return None, 'Invalid SAML response'
            user_info = self._extract_attributes(assertion, ns)
            email = user_info.get('email')
            if not email:
                return None, 'Email not found in SAML response'
            user = self._get_or_create_user(email, user_info, tenant_id)
            if not user:
                return None, 'Unable to create or find user'
            return user, None
        except Exception as e:
            logger.error(f"SAML response processing error: {str(e)}")
            return None, 'SAML authentication failed.'
    
    def _extract_attributes(self, assertion, ns: Dict) -> Dict:
        attributes = {}
        for attr in assertion.findall('.//saml:Attribute', ns):
            name = attr.get('Name')
            attr_value = attr.find('.//saml:AttributeValue', ns)
            if attr_value is not None and attr_value.text:
                if name == 'email':
                    attributes['email'] = attr_value.text
                elif name == 'firstName':
                    attributes['first_name'] = attr_value.text
                elif name == 'lastName':
                    attributes['last_name'] = attr_value.text
                elif name == 'role':
                    attributes['role'] = attr_value.text
        if 'email' not in attributes:
            name_id = assertion.find('.//saml:NameID', ns)
            if name_id is not None and name_id.text:
                attributes['email'] = name_id.text
        return attributes
    
    def _get_tenant_config(self, tenant_id: str) -> Optional[Dict]:
        from apps.accounts.models import TenantPreference
        
        preferences = TenantPreference.objects.filter(client_id=tenant_id).first()
        if not preferences or not preferences.features.get('saml_enabled'):
            return None
        return {
            'sp_entity_id': preferences.features.get('saml_sp_entity_id', ''),
            'acs_url': preferences.features.get('saml_acs_url', ''),
            'sls_url': preferences.features.get('saml_sls_url', ''),
            'idp_metadata_url': preferences.features.get('saml_idp_metadata_url', ''),
            'idp_entity_id': preferences.features.get('saml_idp_entity_id', ''),
            'idp_sso_url': preferences.features.get('saml_idp_sso_url', ''),
            'idp_certificate': preferences.features.get('saml_idp_certificate', ''),
        }
    
    def _get_or_create_user(self, email: str, user_info: Dict, tenant_id: str) -> Optional[User]:
        user = User.objects.filter(email__iexact=email, tenant_id=tenant_id).first()
        if user:
            return user
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
            logger.error(f"SAML user creation error: {error}")
            return None
        return user
