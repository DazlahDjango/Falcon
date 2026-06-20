import uuid
import logging
from django.db import models
from django.utils import timezone
logger = logging.getLogger(__name__)

class MFADeviceQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)
    
    def verified(self):
        return self.filter(is_verified=True)
    
    def primary(self):
        return self.filter(is_primary=True)
    
    def totp(self):
        return self.filter(device_type='totp')
    
    def for_user(self, user):
        return self.filter(user=user)

class MFADeviceManager(models.Manager):
    def get_queryset(self):
        return MFADeviceQuerySet(self.model, using=self._db).filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def create_totp_device(self, user, name, secret, **kwargs):
        device = self.model(
            user=user,
            device_type='totp',
            name=name,
            tenant_id=user.tenant_id,
            is_primary=kwargs.get('is_primary', False),
            **{k: v for k, v in kwargs.items() if k != 'is_primary'}
        )
        device.secret = secret
        device.save()
        logger.info(f"MFA device created for user {user.email}: {name}")
        return device
    
    def get_primary_device(self, user):
        return self.filter(user=user, is_primary=True, is_active=True).first()
    
    def get_verified_devices(self, user):
        return self.filter(user=user, is_verified=True, is_active=True)
    
    def set_primary_device(self, user, device_id):
        with models.transaction.atomic():
            self.filter(user=user, is_primary=True).update(is_primary=False)
            self.filter(id=device_id, user=user).update(is_primary=True)
        logger.info(f"Primary MFA device set to {device_id} for user {user.email}")
    
    def remove_all_devices(self, user):
        count = self.filter(user=user).update(is_active=False, is_deleted=True, deleted_at=timezone.now())
        logger.info(f"Removed {count} MFA devices for user {user.email}")
        return count

class MFABackupCodeManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def get_valid_codes(self, user):
        return self.filter(user=user, is_used=False, expires_at__gt=timezone.now()).count()
    
    def generate_codes(self, user, count=10):
        from ..models.mfa import MFABackupCode
        return MFABackupCode.generate_codes(user, count)
    
    def verify_code(self, user, raw_code):
        from ..models.mfa import MFABackupCode
        return MFABackupCode.verify_code(user, raw_code)
    
    def cleanup_expired(self):
        return self.filter(expires_at__lte=timezone.now()).delete()
    
    def refresh_codes(self, user, count=10):
        with models.transaction.atomic():
            self.filter(user=user).delete()
            return self.generate_codes(user, count)


class MFAAuditLogManager(models.Manager):
    def log_attempt(self, user, device, ip_address, user_agent, success=False, message='', request_id=None, **metadata):
        return self.create(
            user=user,
            device=device,
            event_type='success' if success else 'failure',
            ip_address=ip_address or '0.0.0.0',
            user_agent=(user_agent or 'unknown')[:2000],
            success=success,
            message=message[:500] if message else '',
            metadata=metadata,
            request_id=request_id or str(uuid.uuid4()),
            tenant_id=user.tenant_id if user else None
        )
    
    def log_enroll(self, user, device, ip_address, user_agent, request_id=None, **metadata):
        return self.create(
            user=user,
            device=device,
            event_type='enroll',
            ip_address=ip_address or '0.0.0.0',
            user_agent=(user_agent or 'unknown')[:2000],
            success=True,
            message='MFA device enrolled',
            metadata=metadata,
            request_id=request_id or str(uuid.uuid4()),
            tenant_id=user.tenant_id
        )
    
    def log_disable(self, user, device, ip_address, user_agent, **metadata):
        return self.create(
            user=user,
            device=device,
            event_type='disable',
            ip_address=ip_address or '0.0.0.0',
            user_agent=(user_agent or 'unknown')[:2000],
            success=True,
            message='MFA disabled',
            metadata=metadata,
            request_id=str(uuid.uuid4()),
            tenant_id=user.tenant_id if user else None
        )
    
    def get_failure_rate(self, user_id, hours=24):
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        total = self.filter(user_id=user_id, created_at__gte=cutoff).count()
        failures = self.filter(user_id=user_id, created_at__gte=cutoff, success=False).count()
        return failures / total if total > 0 else 0