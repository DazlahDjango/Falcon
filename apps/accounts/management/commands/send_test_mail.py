"""
Send test email to verify email configuration.
Usage: python manage.py send_test_email --to admin@example.com
"""

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Command(BaseCommand):
    """
    Send test email to verify email configuration.
    """
    help = 'Send test email to verify email configuration'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            required=True,
            help='Recipient email address'
        )
        parser.add_argument(
            '--subject',
            type=str,
            default='Falcon PMS - Test Email',
            help='Email subject'
        )
    
    def handle(self, *args, **options):
        recipient = options['to']
        subject = options['subject']
        
        try:
            send_mail(
                subject=subject,
                message='This is a test email from Falcon PMS. If you received this, your email configuration is working correctly.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False
            )
            self.stdout.write(self.style.SUCCESS(f'Test email sent successfully to {recipient}'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to send test email: {str(e)}'))