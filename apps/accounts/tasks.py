import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from celery import shared_task
from .models import User, UserSession, AuditLog, LoginAttempt, SessionBlacklist
from .services import PasswordService
logger = logging.getLogger(__name__)
password_service = PasswordService()

# Email tasks
# ===========
@shared_task(name='accounts.send_welcome_email')
def send_welcome_email(user_id, tenant_name=None):
    try:
        user = User.objects.get(id=user_id, is_deleted=None)
        subject = f"Welcome to Falcon PMS"
        context = {
            'user': user,
            'tenant_name': tenant_name or 'your organization',
            'login_url': f"{settings.FRONTEND_URL}/login",
            'support_email': settings.DEFAULT_FROM_EMAIL
        }
        html_content = render_to_string('accounts/email/welcome.html', context)
        text_content = f"Welcome to Falcon PMS! Login at {context['login_url']}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content, 
            fail_silently=False
        )
        logger.info(f'Welcome email sent to {user.email}')
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for welcome email")
        return False
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user_id}: {str(e)}")
        return False

@shared_task(name='accounts.send_password_reset_email')
def send_password_reset_email(user_id, token):
    try:
        user = User.objects.get(id=user_id, is_deleted=False)
        subject = 'Password Reset Request'
        context = {
            'user': user,
            'token': token,
            'reset_url': f"{settings.FRONTEND_URL}/reset-password?token={token}",
            'expiry_hours': 24
        }
        html_content = render_to_string('accounts/email/password_reset.html', context)
        text_content = f"Click the link to reset your password: {context['reset_url']}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
        logger.info(f"Password reset email sent to {user.email}")
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for password reset")
        return False
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_id}: {str(e)}")
        return False
    
@shared_task(name='accounts.send_invitation_email')
def send_invitation_email(email, token, invited_by_name, role, message):
    try:
        subject = f"Invitation to join Falcon"
        context = {
            'email': email,
            'token': token,
            'invited_by': invited_by_name,
            'role': role,
            'message': message,
            'invitation_url': f"{settings.FRONTEND_URL}/accept-invitation?token={token}",
            'expiry_days': 7
        }
        html_content = render_to_string('accounts/email/invitation.html', context)
        text_content = f"You've been invited to join Falcon. Click the link to accept: {context['invitation_url']}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_content,
            fail_silently=False
        )
        logger.info(f"Invitation email send to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send invitation email to {email}: {str(e)}")
        return False
    
@shared_task(name='accounts.send_mfa_setup_email')
def send_mfa_setup_email(user_id, device_name, provisioning_uri):
    try:
        user = User.objects.get(id=user_id, is_deleted=False)
        subject = 'MFA Setup Instruction'
        context = {
            'user': user,
            'device_name': device_name,
            'provissioning_uri': provisioning_uri,
            'setup_guide_url': f"{settings.FRONTEND_URL}/docs/mfa-setup"
        }
        html_content = render_to_string('accounts/email/mfa_setup.html', context)
        text_content = f"MFA setup instruction for {user.email}"
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
        logger.info(f"MFA setup send to {user.email}")
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for MFA setup email")
        return False
    except Exception as e:
        logger.error(f"Failed to send to MFA setup email to {user_id}: {str(e)}")
        return False

# Cleanup Tasks
# =============
@shared_task(name='accounts.cleanup_expired_sessions')
def cleanup_expired_sessions():
    try:
        cutoff = timezone.now() - timedelta(days=90)
        expired_sessions = UserSession.objects.filter(
            expires_at__lt=timezone.now()
        ).exclude(status='expired')
        count = expired_sessions.count()
        expired_sessions.update(status='expired')
        old_sessions = UserSession.objects.filter(
            login_time__lt=cutoff
        ).delete()
        logger.info(f"Cleaned up {count} expired sessions, deleted {old_sessions[0]} old sessions")
        return {'expired': count, 'deleted': old_sessions[0] if old_sessions else 0}
    except Exception as e:
        logger.error(f"Failed to cleanup expired sessions: {str(e)}")
        return {'error': str(e)}


@shared_task(name='accounts.cleanup_expired_blacklist')
def cleanup_expired_blacklist():
    try:
        deleted = SessionBlacklist.objects.cleanup_expired()
        logger.info(f"Cleaned up {deleted} expired blacklist entries")
        return {'deleted': deleted}
    except Exception as e:
        logger.error(f"Failed to cleanup expired blacklist: {str(e)}")
        return {'error': str(e)}


@shared_task(name='accounts.cleanup_old_audit_logs')
def cleanup_old_audit_logs(retention_days=365):
    try:
        cutoff = timezone.now() - timedelta(days=retention_days)
        deleted = AuditLog.objects.filter(timestamp__lt=cutoff).delete()
        logger.info(f"Cleaned up {deleted[0]} old audit logs")
        return {'deleted': deleted[0]}
    except Exception as e:
        logger.error(f"Failed to cleanup old audit logs: {str(e)}")
        return {'error': str(e)}


@shared_task(name='accounts.cleanup_old_login_attempts')
def cleanup_old_login_attempts(retention_days=90):
    try:
        cutoff = timezone.now() - timedelta(days=retention_days)
        deleted = LoginAttempt.objects.filter(attempted_at__lt=cutoff).delete()
        logger.info(f"Cleaned up {deleted[0]} old login attempts")
        return {'deleted': deleted[0]}
    except Exception as e:
        logger.error(f"Failed to cleanup old login attempts: {str(e)}")
        return {'error': str(e)}

# User Management Tasks
# ======================
from django.db import transaction

@shared_task(name='accounts.unlock_locked_accounts')
@transaction.atomic
def unlock_locked_accounts():
    try:
        now = timezone.now()
        locked_users = User.objects.filter(locked_until__lt=now, locked_until__isnull=False)
        count = 0
        for user in locked_users:
            user.reset_login_attempts()
            count += 1
        logger.info(f"Unlocked {count} accounts")
        return {'unlocked': count}
    except Exception as e:
        logger.error(f"Failed to unlock locked accounts: {str(e)}")
        return {'error': str(e)}

@shared_task(name='accounts.remind_inactive_users')
def remind_inactive_users(days_inactive=30):
    try:
        cutoff = timezone.now() - timedelta(days=days_inactive)
        inactive_users = User.objects.filter(
            last_login__lt=cutoff,
            is_active=True,
            is_deleted=False
        ).exclude(role='super_admin')
        count = 0
        for user in inactive_users:
            # Send reminder email
            subject = 'We Miss You!'
            context = {
                'user': user,
                'days_inactive': days_inactive,
                'login_url': f"{settings.FRONTEND_URL}/login"
            }
            html_content = render_to_string('accounts/email/inactive_reminder.html', context)
            send_mail(
                subject=subject,
                message=f"Login at {context['login_url']}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=True
            )
            count += 1
        logger.info(f"Sent reminders to {count} inactive users")
        return {'reminded': count}
    except Exception as e:
        logger.error(f"Failed to send inactive reminders: {str(e)}")
        return {'error': str(e)}

@shared_task(name='accounts.check_password_expiry')
def check_password_expiry(expiry_days=90):
    try:
        cutoff = timezone.now() - timedelta(days=expiry_days)
        expired_users = User.objects.filter(
            password_last_changed__lt=cutoff,
            is_active=True,
            is_deleted=False
        ).exclude(role='super_admin')
        
        notified = 0
        for user in expired_users:
            # Send password expiry notification
            send_password_expiry_notification.delay(str(user.id))
            notified += 1
        
        logger.info(f"Notified {notified} users about password expiry")
        return {'notified': notified}
    except Exception as e:
        logger.error(f"Failed to check password expiry: {str(e)}")
        return {'error': str(e)}
    
@shared_task(name='accounts.send_password_expiry_notification')
def send_password_expiry_notification(user_id):
    try:
        user = User.objects.get(id=user_id, is_deleted=False)
        
        context = {
            'user': user,
            'expiry_days': 90,  # Or configurable
            'change_password_url': f"{settings.FRONTEND_URL}/change-password"
        }
        
        html_content = render_to_string('accounts/email/password_expiry.html', context)
        
        send_mail(
            subject='Your Password Will Expire Soon',
            message=f"Please change your password at {context['change_password_url']}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
        
        logger.info(f"Password expiry notification sent to {user.email}")
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send password expiry notification: {str(e)}")
        return False
    
# MFA Tasks
# ==========
@shared_task(name='accounts.send_mfa_verification_sms')
def send_mfa_verification_sms(phone, code):
    try:
        # Integrate with SMS provider (Twilio, Africa's Talking, etc.)
        logger.info(f"SMS verification code sent to {phone}")
        return True
    except Exception as e:
        logger.error(f"Failed to send MFA SMS: {str(e)}")
        return False

@shared_task(name='accounts.send_login_alert_email')
def send_login_alert_email(user_id, ip_address, user_agent, location=None):
    try:
        user = User.objects.get(id=user_id, is_deleted=False)
        subject = 'New Login to Your Account'
        context = {
            'user': user,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'location': location or 'Unknown location',
            'time': timezone.now(),
            'security_url': f"{settings.FRONTEND_URL}/security"
        }
        html_content = render_to_string('accounts/email/login_alert.html', context)
        text_content = f"New login to your account from {ip_address}"
        
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
        logger.info(f"Login alert email sent to {user.email}")
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for login alert")
        return False
    except Exception as e:
        logger.error(f"Failed to send login alert to {user_id}: {str(e)}")
        return False

