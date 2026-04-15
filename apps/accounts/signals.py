# apps/accounts/signals.py

import logging
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.utils import timezone

from .models import User, Profile, UserPreference, AuditLog, LoginAttempt, UserSession
from .services import AuditService
from .constants import AuditActionTypes, LoginResult, LoginFailureReason

logger = logging.getLogger(__name__)
audit_service = AuditService()

# User Model Signals
# ===================
@receiver(pre_save, sender=User, dispatch_uid='user_pre_save_unique')
def user_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_data = {
                'email': old.email,
                'role': old.role,
                'is_active': old.is_active,
                'is_verified': old.is_verified,
                'is_staff': old.is_staff,
                'is_superuser': old.is_superuser,
                'password': old.password,  # For password change detection
            }
        except sender.DoesNotExist:
            instance._old_data = {}
    else:
        instance._old_data = {}

@receiver(post_save, sender=User, dispatch_uid='user_post_save_unique')
def user_post_save(sender, instance, created, **kwargs):
    try:
        if created:
            # Create related records
            Profile.objects.get_or_create(
                user=instance,
                defaults={'tenant_id': instance.tenant_id}
            )
            UserPreference.objects.get_or_create(
                user=instance,
                defaults={'tenant_id': instance.tenant_id}
            )
            
            audit_service.log(
                user=instance,
                action='user.created',
                action_type=AuditActionTypes.CREATE,
                severity='info',
                metadata={
                    'email': instance.email,
                    'role': instance.role,
                    'tenant_id': str(instance.tenant_id)
                }
            )
            logger.info(f"User created: {instance.email} (ID: {instance.id})")
        else:
            # Detect changes
            changes = {}
            old_data = getattr(instance, '_old_data', {})
            
            if old_data.get('email') != instance.email:
                changes['email'] = {'old': old_data.get('email'), 'new': instance.email}
            if old_data.get('role') != instance.role:
                changes['role'] = {'old': old_data.get('role'), 'new': instance.role}
            if old_data.get('is_active') != instance.is_active:
                changes['is_active'] = {'old': old_data.get('is_active'), 'new': instance.is_active}
            if old_data.get('is_verified') != instance.is_verified:
                changes['is_verified'] = {'old': old_data.get('is_verified'), 'new': instance.is_verified}
            if old_data.get('password') != instance.password:
                changes['password_changed'] = True
            
            if changes:
                audit_service.log(
                    user=instance,
                    action='user.updated',
                    action_type=AuditActionTypes.UPDATE,
                    severity='info',
                    changes=changes,
                    metadata={'email': instance.email}
                )
                logger.info(f"User updated: {instance.email} - Changes: {list(changes.keys())}")
    except Exception as e:
        logger.error(f"Error in user_post_save signal: {e}", exc_info=True)

@receiver(pre_delete, sender=User, dispatch_uid='user_pre_delete_unique')
def user_pre_delete(sender, instance, **kwargs):
    try:
        audit_service.log(
            user=instance,
            action='user.deleted',
            action_type=AuditActionTypes.DELETE,
            severity='warning',
            metadata={'email': instance.email, 'role': instance.role}
        )
        logger.warning(f"User deleted: {instance.email} (ID: {instance.id})")
    except Exception as e:
        logger.error(f"Error in user_pre_delete signal: {e}", exc_info=True)

# Profile Model Signals
# ======================
@receiver(post_save, sender=Profile, dispatch_uid='profile_post_save_unique')
def profile_post_save(sender, instance, created, **kwargs):
    try:
        if created:
            logger.info(f"Profile created for user: {instance.user.email}")
        else:
            if hasattr(instance, '_old_avatar') and instance._old_avatar != instance.avatar:
                audit_service.log(
                    user=instance.user,
                    action='profile.avatar_updated',
                    action_type=AuditActionTypes.UPDATE,
                    severity='info',
                    metadata={'has_avatar': bool(instance.avatar)}
                )
    except Exception as e:
        logger.error(f"Error in profile_post_save signal: {e}", exc_info=True)

# UserPreference Signals
# =======================

@receiver(post_save, sender=UserPreference, dispatch_uid='user_preference_post_save_unique')
def user_preference_post_save(sender, instance, created, **kwargs):
    try:
        if created:
            logger.info(f"Preferences created for user: {instance.user.email}")
        else:
            if hasattr(instance, '_old_notification_settings'):
                if instance._old_notification_settings != instance.notification_settings:
                    audit_service.log(
                        user=instance.user,
                        action='preferences.notifications_updated',
                        action_type=AuditActionTypes.UPDATE,
                        severity='info',
                        metadata={'event_types': list(instance.notification_settings.keys())}
                    )
    except Exception as e:
        logger.error(f"Error in user_preference_post_save signal: {e}", exc_info=True)

# UserSession Signals
# ====================
@receiver(pre_save, sender=UserSession, dispatch_uid='user_session_pre_save_unique')
def user_session_pre_save(sender, instance, **kwargs):
    """Store old status before update"""
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except sender.DoesNotExist:
            instance._old_status = None

@receiver(post_save, sender=UserSession, dispatch_uid='user_session_post_save_unique')
def user_session_post_save(sender, instance, created, **kwargs):
    try:
        if created:
            logger.info(f"Session created for user: {instance.user.email} from {instance.ip_address}")
        else:
            old_status = getattr(instance, '_old_status', None)
            if old_status != instance.status and instance.status == 'revoked':
                logger.info(f"Session revoked for user: {instance.user.email}")
                audit_service.log(
                    user=instance.user,
                    action='session.revoked',
                    action_type=AuditActionTypes.UPDATE,
                    severity='warning',
                    metadata={
                        'session_id': str(instance.id),
                        'ip_address': instance.ip_address,
                        'reason': 'admin_revoked'
                    },
                    ip_address=instance.ip_address
                )
    except Exception as e:
        logger.error(f"Error in user_session_post_save signal: {e}", exc_info=True)

# MFA Device Signals
# ==================
@receiver(post_save, sender='accounts.MFADevice', dispatch_uid='mfa_device_post_save_unique')
def mfa_device_post_save(sender, instance, created, **kwargs):
    try:
        if created:
            audit_service.log(
                user=instance.user,
                action='mfa.device_enrolled',
                action_type=AuditActionTypes.CREATE,
                severity='info',
                metadata={'device_type': instance.device_type, 'device_name': instance.name}
            )
            logger.info(f"MFA device enrolled for user: {instance.user.email} - Type: {instance.device_type}")
        elif hasattr(instance, '_old_is_active') and instance._old_is_active != instance.is_active:
            if not instance.is_active:
                audit_service.log(
                    user=instance.user,
                    action='mfa.device_removed',
                    action_type=AuditActionTypes.DELETE,
                    severity='warning',
                    metadata={'device_type': instance.device_type}
                )
    except Exception as e:
        logger.error(f"Error in mfa_device_post_save signal: {e}", exc_info=True)

# Login/Logout Signals (Django Auth)
# ==================================
@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    try:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]   
        # Update user last login info
        user.last_login_ip = ip_address
        user.last_login_agent = user_agent
        user.save(update_fields=['last_login_ip', 'last_login_agent'])  
        # Record login attempt
        LoginAttempt.record_attempt(
            identifier=user.email,
            user=user,
            result=LoginResult.SUCCESS,
            ip_address=ip_address,
            user_agent=user_agent,
            request=request
        )    
        # Reset failed login attempts
        user.reset_login_attempts()    
        # Audit log
        audit_service.log(
            user=user,
            action='user.login',
            action_type=AuditActionTypes.LOGIN,
            request=request,
            severity='info',
            metadata={'ip_address': ip_address}
        )       
        logger.info(f"User logged in: {user.email} from {ip_address}")
    except Exception as e:
        logger.error(f"Error in user_logged_in_handler: {e}", exc_info=True)

@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """Handle user logout"""
    try:
        if user:
            session_key = request.session.session_key
            if session_key:
                UserSession.objects.filter(
                    user=user, session_key=session_key, status='active'
                ).update(status='logged_out', logout_time=timezone.now())
            
            audit_service.log(
                user=user,
                action='user.logout',
                action_type=AuditActionTypes.LOGOUT,
                request=request,
                severity='info'
            )
            logger.info(f"User logged out: {user.email}")
    except Exception as e:
        logger.error(f"Error in user_logged_out_handler: {e}", exc_info=True)

@receiver(user_login_failed)
def user_login_failed_handler(sender, credentials, request, **kwargs):
    try:
        email = credentials.get('email', credentials.get('username', 'unknown'))
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        # Find user if exists
        user = User.objects.filter(email__iexact=email).first()
        # Record failed attempt
        LoginAttempt.record_attempt(
            identifier=email,
            user=user,
            result=LoginResult.FAILURE,
            failure_reason=LoginFailureReason.WRONG_PASSWORD,
            ip_address=ip_address,
            user_agent=user_agent,
            request=request
        )
        # Increment user login attempts
        if user:
            user.increment_login_attempts()
        # Audit log
        audit_service.log(
            user=user,
            action='user.login_failed',
            action_type=AuditActionTypes.LOGIN,
            request=request,
            severity='warning',
            metadata={'email': email, 'ip_address': ip_address}
        )
        logger.warning(f"Failed login attempt for {email} from {ip_address}")
    except Exception as e:
        logger.error(f"Error in user_login_failed_handler: {e}", exc_info=True)

def get_client_ip(request):
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR', '')