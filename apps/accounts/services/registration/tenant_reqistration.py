import logging
import uuid
from django.utils import timezone
from typing import Dict, Tuple, Optional
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from apps.accounts.models import User, TenantPreference, Profile, UserPreference
from apps.accounts.managers import TenantPreferencesManager
from apps.accounts.services.registration.user_registration import UserRegistrationService
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class TenantRegistrationService:
    def __init__(self):
        self.user_registration = UserRegistrationService()
        self.audit_service = AuditService()

    def register_tenant(self, company_name: str, admin_email: str, admin_username: str, admin_password: str, admin_first_name: str = '', admin_last_name: str = '', subscription_plan: str = 'trial', request=None) -> Tuple[Optional[Dict], Optional[str]]:
        if not company_name or not admin_email or not admin_username or not admin_password:
            return None, 'Company name, admin email, username, and password are required'
        tenant_id = uuid.uuid4()
        try:
            TenantPreference.objects.create(
                client_id=tenant_id,
                tenant_id=tenant_id,
                features=self._get_default_features(subscription_plan),
                default_langauage='en',
                default_timezone='Africa/Nairobi'
            )
            admin_user = User.objects.create_user(
                email=admin_email.lower().strip(),
                username=admin_username.strip(),
                tenant_id=tenant_id,
                password=admin_password,
                first_name=admin_first_name.strip(),
                last_name=admin_last_name.strip(),
                role='client_admin',
                is_verified=True,
                is_onboarded=True,
                is_staff=True
            )
            Profile.objects.create(
                user=admin_user,
                tenant_id=tenant_id
            )
            UserPreference.objects.create(
                user=admin_user,
                tenant_id=tenant_id
            )
            self._send_welcome_email(admin_user, company_name)
            self.audit_service.log(
                user=admin_user, action='tenant.registered', action_type='create',
                request=request, severity='info',
                metadata={'company_name': company_name, 'plan': subscription_plan}
            )
            return {
                'tenant_id': str(tenant_id),
                'admin_user_id': str(admin_user.id),
                'company_name': company_name,
                'subscription_plan': subscription_plan
            }, None
        except Exception as e:
            logger.error(f"Tenant registration error")
            return None, 'Unable to create organization. Please try again'
        
    def _get_default_features(self, plan: str) -> Dict:
        base_features = {
            'kpi_tracking': True,
            'performance_reviews': True,
            'mission_reports': True,
            'tasks': True,
            'reports': True,
            'api_access': False,
            'sso': False,
            'advanced_analytics': False,
        }
        if plan == 'basic':
            base_features.update({
                'max_users': 50,
                'kpi_limit': 100,
            })
        elif plan == 'professional':
            base_features.update({
                'max_users': 500,
                'kpi_limit': 1000,
                'api_access': True,
                'advanced_reports': True,
            })
        elif plan == 'enterprise':
            base_features.update({
                'max_users': 10000,
                'kpi_limit': 10000,
                'api_access': True,
                'sso': True,
                'advanced_analytics': True,
                'custom_branding': True,
            })
        else:  # trial
            base_features.update({
                'max_users': 10,
                'kpi_limit': 50,
                'trial_days': 14,
            })
        return base_features
    
    def _send_welcome_email(self, admin_user: User, company_name: str):
        subject = f'Welcome to Falcon PMS - {company_name}'
        context = {
            'user': admin_user,
            'company_name': company_name,
            'login_url': f"{settings.FRONTEND_URL}/login",
            'setup_guide_url': f"{settings.FRONTEND_URL}/docs/setup"
        }
        html_content = render_to_string('accounts/email/tenant_welcome.html', context)
        text_content = f"Welcome to Falcon PMS! Login at {context['login_url']}"
        
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_user.email],
            html_message=html_content,
            fail_silently=False
        )