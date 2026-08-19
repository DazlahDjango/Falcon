import logging
from typing import Tuple, Optional
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from apps.accounts.models import User, MFADevice, MFABackupCode, MFAAuditLog
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)
class MFAAdminService:
    def __init__(self):
        self.audit_service = AuditService()
    @transaction.atomic
    def reset_user_mfa(self, admin_user: User, target_user: User, reason: str = '', request=None) -> Tuple[bool, str]:
        try:
            devices_count = MFADevice.objects.filter(user=target_user, is_deleted=False).count()
            backup_codes_count = MFABackupCode.objects.filter(user=target_user, is_deleted=False).count()
            devices_updated = MFADevice.objects.filter(user=target_user, is_deleted=False).update(
                is_deleted=True,
                deleted_at=timezone.now(),
                is_active=False
            )
            backup_updated = MFABackupCode.objects.filter(user=target_user, is_deleted=False).update(
                is_deleted=True,
                deleted_at=timezone.now()
            )
            target_user.mfa_enabled = False
            target_user.mfa_secret = ''
            target_user.mfa_backup_codes = []
            target_user.mfa_verified_at = None
            target_user.save(update_fields=['mfa_enabled', 'mfa_secret', 'mfa_backup_codes', 'mfa_verified_at'])
            self.audit_service.log(
                user=admin_user,
                action='accounts.user_mfa_reset',
                action_type='update',
                request=request,
                severity='warning',
                metadata={
                    'target_user_id': str(target_user.id),
                    'target_user_email': target_user.email,
                    'devices_removed': devices_updated,
                    'backup_codes_removed': backup_updated,
                    'reason': reason,
                }
            )
            MFAAuditLog.objects.create(
                user=target_user,
                device=None,
                event_type='disable',
                ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR', '') if request else '',
                user_agent=getattr(request, 'META', {}).get('HTTP_USER_AGENT', '') if request else '',
                success=True,
                message=f'MFA reset by administrator: {admin_user.email}',
                metadata={
                    'reset_by': str(admin_user.id),
                    'reset_by_email': admin_user.email,
                    'reason': reason,
                    'devices_count': devices_updated,
                    'backup_codes_count': backup_updated,
                },
                tenant_id=target_user.tenant_id
            )
            self._send_reset_notification(target_user, admin_user, reason)
            logger.info(f"MFA reset for user {target_user.email} by admin {admin_user.email}")
            return True, f"MFA reset successfully for {target_user.email}. {devices_updated} device(s) and {backup_updated} backup code(s) removed."
        except Exception as e:
            logger.error(f"MFA reset failed for {target_user.email}: {str(e)}", exc_info=True)
            return False, f"Failed to reset MFA: {str(e)}"

    @transaction.atomic
    def clear_user_devices(self, admin_user: User, target_user: User, device_id: str = None, request=None) -> Tuple[bool, str]:
        try:
            if device_id:
                device = MFADevice.objects.filter(id=device_id, user=target_user).first()
                if device:
                    device.is_deleted = True
                    device.deleted_at = timezone.now()
                    device.is_active = False
                    device.save(update_fields=['is_deleted', 'deleted_at', 'is_active'])
                    removed_count = 1
                else:
                    return False, "Device not found"
            else:
                removed_count = MFADevice.objects.filter(user=target_user, is_deleted=False).update(
                    is_deleted=True,
                    deleted_at=timezone.now(),
                    is_active=False
                )
            remaining_devices = MFADevice.objects.filter(user=target_user, is_deleted=False, is_active=True).count()
            if remaining_devices == 0:
                target_user.mfa_enabled = False
                target_user.mfa_verified_at = None
                target_user.save(update_fields=['mfa_enabled', 'mfa_verified_at'])
            self.audit_service.log(
                user=admin_user,
                action='accounts.user_mfa_devices_cleared',
                action_type='update',
                request=request,
                severity='warning',
                metadata={
                    'target_user_id': str(target_user.id),
                    'target_user_email': target_user.email,
                    'devices_removed': removed_count,
                }
            )
            return True, f"Removed {removed_count} device(s) for {target_user.email}"
        except Exception as e:
            logger.error(f"Failed to clear devices for {target_user.email}: {str(e)}", exc_info=True)
            return False, f"Failed to clear devices: {str(e)}"
    
    def _send_reset_notification(self, user: User, admin_user: User, reason: str = ''):
        try:
            subject = 'Your Multi-Factor Authentication (MFA) has been reset'
            context = {
                'user': user,
                'admin_email': admin_user.email,
                'admin_name': admin_user.get_full_name() or admin_user.email,
                'reason': reason or 'No specific reason provided',
                'reset_time': timezone.now(),
                'support_email': settings.DEFAULT_FROM_EMAIL,
                'frontend_url': settings.FRONTEND_URL,
            }
            html_content = render_to_string('accounts/email/mfa_reset_notification.html', context)
            text_content = f"""
Dear {user.get_full_name() or user.email},

Your Multi-Factor Authentication (MFA) settings have been reset by an administrator.

Administrator: {admin_user.email}
Reset Time: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
Reason: {reason or 'No specific reason provided'}

You will need to set up MFA again on your next login.

If you did not request this change, please contact your system administrator immediately.

Best regards,
Falcon PMS Team
            """
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=False,
            )
            logger.info(f"MFA reset notification sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send MFA reset notification to {user.email}: {str(e)}")