import logging
import secrets
import hashlib
from typing import Optional, Tuple, Dict, List
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.core.cache import cache
from apps.accounts.models import User, AuditLog
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService

logger = logging.getLogger(__name__)


import os
import json
from pathlib import Path

PERSISTENT_STORE_PATH = Path(settings.BASE_DIR) / 'media' / 'invitations_store.json'


def _load_persistent_store() -> Dict[str, Dict]:
    try:
        if os.path.exists(PERSISTENT_STORE_PATH):
            with open(PERSISTENT_STORE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Error reading invitations store: {e}")
    return {}


def _save_persistent_store(store: Dict[str, Dict]) -> None:
    try:
        os.makedirs(os.path.dirname(PERSISTENT_STORE_PATH), exist_ok=True)
        with open(PERSISTENT_STORE_PATH, 'w', encoding='utf-8') as f:
            json.dump(store, f, indent=2)
    except Exception as e:
        logger.warning(f"Error writing invitations store: {e}")


class InvitationService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()
    
    def send_invitation(self, email: str, role: str, tenant_id: str, invited_by: User, department_id: str = None, message: str = '', request=None) -> Tuple[bool, str]:
        existing_user = User.objects.filter(email__iexact=email, tenant_id=tenant_id).first()
        if existing_user:
            return False, 'A user with this email already exists in your organization.'
        
        token = self._generate_invitation_token(email, tenant_id, role, department_id, invited_by, message)
        
        try:
            self._send_invitation_email(email, token, invited_by, role, message)
            self.audit_service.log(
                user=invited_by, action='user.invited', action_type='create',
                request=request, severity='info',
                metadata={'email': email, 'role': role}
            )
            return True, 'Invitation sent successfully.'
        except Exception as e:
            logger.error(f"Invitation sending error: {str(e)}")
            return False, 'Unable to send invitation. Please try again.'
    
    def accept_invitation(self, token: str, password: str, first_name: str = '', last_name: str = '', request=None) -> Tuple[Optional[User], Optional[str]]:
        invitation_data = self._validate_invitation_token(token)
        if not invitation_data:
            return None, 'Invalid or expired invitation.'
        
        email = invitation_data['email']
        tenant_id = invitation_data['tenant_id']
        role = invitation_data['role']
        
        if User.objects.filter(email__iexact=email, tenant_id=tenant_id).exists():
            return None, 'An account with this email already exists.'
        
        user, error = self.user_registration.register_user(
            email=email,
            username=email.split('@')[0],
            password=password,
            tenant_id=tenant_id,
            first_name=first_name,
            last_name=last_name,
            role=role,
            request=request
        )
        if error:
            return None, error
        
        # Clean up invitation after successful acceptance
        self._delete_invitation_token(token)
        
        self.audit_service.log(
            user=user, action='user.invitation_accepted', action_type='create',
            request=request, severity='info'
        )
        return user, None
    
    def resend_invitation(self, invitation_id: str, request=None) -> Tuple[bool, str]:
        invitation_data = self._get_invitation_data(invitation_id)
        if not invitation_data:
            return False, 'Invitation not found or expired.'
        return self.send_invitation(
            email=invitation_data['email'],
            role=invitation_data['role'],
            tenant_id=invitation_data['tenant_id'],
            invited_by=invitation_data['invited_by'],
            message=invitation_data.get('message', ''),
            request=request
        )
    
    def cancel_invitation(self, invitation_id: str, request=None) -> Tuple[bool, str]:
        self._delete_invitation_token(invitation_id)
        return True, 'Invitation cancelled.'
    
    # ✅ IMPLEMENTED: Get pending invitations for tenant
    def get_pending_invitations(self, tenant_id: str) -> List[Dict]:
        """
        Get all pending invitations for a tenant.
        """
        pending = []
        tenant_cache_key = f'invitations:tenant:{tenant_id}'
        invitation_ids = cache.get(tenant_cache_key, [])
        
        for invitation_id in invitation_ids:
            cache_key = f'invitation:{invitation_id}'
            invitation_data = cache.get(cache_key)
            if not invitation_data:
                invitation_data = self._get_invitation_data(invitation_id)
            if invitation_data:
                invitation_data['invitation_id'] = invitation_id
                pending.append(invitation_data)
            else:
                invitation_ids.remove(invitation_id)
                cache.set(tenant_cache_key, invitation_ids, timeout=604800)
        
        return pending
    
    def _generate_invitation_token(self, email: str, tenant_id: str, role: str, department_id: str = None, invited_by: User = None, message: str = '') -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'invitation:{token_hash}'
        
        invitation_data = {
            'email': email,
            'tenant_id': str(tenant_id),
            'role': role,
            'department_id': department_id,
            'message': message,
            'created_at': timezone.now().isoformat(),
        }
        
        if invited_by:
            invitation_data['invited_by'] = {
                'id': str(invited_by.id),
                'email': invited_by.email,
                'name': invited_by.get_full_name()
            }
        
        # 1. Save in Django cache (7 days)
        cache.set(cache_key, invitation_data, timeout=604800)
        cache.set(f'invitation:{token}', invitation_data, timeout=604800)
        
        # Store in tenant's invitation list for lookup
        tenant_cache_key = f'invitations:tenant:{tenant_id}'
        invitation_ids = cache.get(tenant_cache_key, [])
        if token_hash not in invitation_ids:
            invitation_ids.append(token_hash)
            cache.set(tenant_cache_key, invitation_ids, timeout=604800)

        # 2. Save in disk persistent store (survives server restarts)
        store = _load_persistent_store()
        invitation_data['expires_at'] = (timezone.now() + timezone.timedelta(days=7)).isoformat()
        store[token_hash] = invitation_data
        store[token] = invitation_data
        _save_persistent_store(store)
        
        return token
    
    def _validate_invitation_token(self, token: str) -> Optional[Dict]:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # 1. Try cache lookup by hash or raw token
        inv = cache.get(f'invitation:{token_hash}') or cache.get(f'invitation:{token}')
        if inv:
            return inv
        
        # 2. Disk persistent fallback lookup
        store = _load_persistent_store()
        inv = store.get(token_hash) or store.get(token)
        if inv:
            # Check 7-day expiration
            expires_at_str = inv.get('expires_at')
            created_at_str = inv.get('created_at')
            now = timezone.now()

            if expires_at_str:
                expires_at = timezone.datetime.fromisoformat(expires_at_str)
                if now > expires_at:
                    self._delete_invitation_token(token)
                    return None
            elif created_at_str:
                created_at = timezone.datetime.fromisoformat(created_at_str)
                if (now - created_at).days >= 7:
                    self._delete_invitation_token(token)
                    return None

            # Re-populate cache for fast subsequent hits
            cache.set(f'invitation:{token_hash}', inv, timeout=604800)
            return inv

        return None
    
    def _get_invitation_data(self, invitation_id: str) -> Optional[Dict]:
        cache_key = f'invitation:{invitation_id}'
        inv = cache.get(cache_key)
        if inv:
            return inv
        store = _load_persistent_store()
        return store.get(invitation_id)
    
    def _delete_invitation_token(self, token: str) -> None:
        """Delete invitation token and clean up tenant reference."""
        token_hash = token if len(token) == 64 else hashlib.sha256(token.encode()).hexdigest()
        
        cache_key = f'invitation:{token_hash}'
        invitation_data = cache.get(cache_key) or self._get_invitation_data(token_hash)
        
        if invitation_data:
            tenant_id = invitation_data.get('tenant_id')
            if tenant_id:
                tenant_cache_key = f'invitations:tenant:{tenant_id}'
                invitation_ids = cache.get(tenant_cache_key, [])
                if token_hash in invitation_ids:
                    invitation_ids.remove(token_hash)
                    cache.set(tenant_cache_key, invitation_ids, timeout=604800)
        
        # Delete from cache
        cache.delete(cache_key)
        cache.delete(f'invitation:{token}')

        # Delete from disk store
        store = _load_persistent_store()
        store.pop(token_hash, None)
        store.pop(token, None)
        _save_persistent_store(store)
    
    def _send_invitation_email(self, email: str, token: str, invited_by: User, role: str, message: str):
        from apps.accounts.constants import UserRoles
        subject = f'Invitation to Join Falcon PMS'
        role_display = str(dict(UserRoles.CHOICES).get(role, role.replace('_', ' ').title()))
        org_name = getattr(getattr(invited_by, 'tenant', None), 'name', 'Falcon PMS')
        context = {
            'invited_by': invited_by,
            'role': role,
            'role_display': role_display,
            'organization_name': org_name,
            'message': message,
            'invitation_url': f"{settings.FRONTEND_URL}/accept-invitation?token={token}",
            'expiry_days': 7
        }
        html_content = render_to_string('accounts/email/invitation.html', context)
        text_content = f"You've been invited to join Falcon PMS. Click the link to accept: {context['invitation_url']}"
        
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_content,
            fail_silently=False
        )