"""
Welcome Email Service - Sends onboarding emails to new organisations
"""

import logging
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


class WelcomeEmailService:
    """
    Service for sending welcome emails to new organisations
    """
    
    @classmethod
    def send_welcome_email(cls, organisation, user_email=None):
        """
        Send welcome email to the organisation contact
        
        Args:
            organisation: Organisation instance
            user_email: Optional specific email to send to
        """
        email = user_email or organisation.contact_email
        
        if not email:
            logger.warning(f"No email found for organisation: {organisation.name}")
            return False
        
        try:
            context = {
                'organisation_name': organisation.name,
                'organisation_slug': organisation.slug,
                'login_url': cls._get_login_url(organisation),
                'setup_url': cls._get_setup_url(organisation),
                'support_email': settings.DEFAULT_FROM_EMAIL,
            }
            
            subject = f"Welcome to Falcon PMS - {organisation.name}"
            html_message = render_to_string('organisations/email/welcome_organisation.html', context)
            plain_message = f"Welcome to Falcon PMS! Your organisation {organisation.name} has been created. Log in at {context['login_url']}"
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Welcome email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
            return False
    
    @classmethod
    def _get_login_url(cls, organisation):
        """Get the login URL for the organisation"""
        base_url = settings.SITE_URL if hasattr(settings, 'SITE_URL') else 'https://app.falconpms.com'
        if organisation.subdomain:
            return f"https://{organisation.subdomain}.falconpms.com/login"
        return f"{base_url}/login"
    
    @classmethod
    def _get_setup_url(cls, organisation):
        """Get the setup URL for the organisation"""
        base_url = settings.SITE_URL if hasattr(settings, 'SITE_URL') else 'https://app.falconpms.com'
        return f"{base_url}/onboarding/{organisation.slug}"