import logging
import secrets
import hashlib
from typing import Optional, Tuple, Dict, List
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from apps.accounts.models import User, AuditLog
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService

logger = logging.getLogger(__name__)


class InvitationService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()
    
    def send_invitation(self, email: str, role: str, tenant_id: str, invited_by: User, department_id: str = None, message: str = '', request=None) -> Tuple[bool, str]:
        existing_user = User.objects.filter(email__iexact=email, tenant_id=tenant_id).first()
        if existing_user:
            return False, 'A user with this email already exists in your organization.'
        token = self._generate_invitation_token(email, tenant_id, role, department_id)
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
        from django.core.cache import cache
        cache_key = f'invitation:{invitation_id}'
        invitation_data = cache.get(cache_key)
        if not invitation_data:
            return False, 'Invitation not found.'
        cache.delete(cache_key)
        if 'invited_by' in invitation_data:
            self.audit_service.log(
                user=invitation_data['invited_by'],
                action='user.invitation_cancelled',
                action_type='delete',
                request=request,
                severity='info',
                metadata={'email': invitation_data['email']}
            )
        return True, 'Invitation cancelled.'
    
    def get_pending_invitations(self, tenant_id: str) -> List[Dict]:
        from django.core.cache import cache
        from django.core.cache.backends.base import DEFAULT_TIMEOUT
        pending = []
        return pending
    
    def _generate_invitation_token(self, email: str, tenant_id: str, role: str, department_id: str = None) -> str:
        import json
        from django.core.cache import cache
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'invitation:{token_hash}'
        invitation_data = {
            'email': email,
            'tenant_id': str(tenant_id),
            'role': role,
            'department_id': department_id,
            'created_at': timezone.now().isoformat(),
        }
        cache.set(cache_key, invitation_data, timeout=604800)  # 7 days expiry
        return token
    
    def _validate_invitation_token(self, token: str) -> Optional[Dict]:
        from django.core.cache import cache
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f'invitation:{token_hash}'
        return cache.get(cache_key)
    
    def _get_invitation_data(self, invitation_id: str) -> Optional[Dict]:
        from django.core.cache import cache
        cache_key = f'invitation:{invitation_id}'
        return cache.get(cache_key)
    
    def _send_invitation_email(self, email: str, token: str, invited_by: User, role: str, message: str):
        subject = f'Invitation to Join Falcon PMS'
        context = {
            'invited_by': invited_by,
            'role': role,
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