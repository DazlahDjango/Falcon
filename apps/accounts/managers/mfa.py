"""
MFA managers for devices, backup codes, and audit logs.
"""

from django.utils import timezone
from .base import SoftDeleteManager, TenantAwareQuerySet


class MFADeviceQuerySet(TenantAwareQuerySet):
    def active(self):
        return self.filter(is_active=True)
    def inactive(self):
        return self.filter(is_active=False)
    def primary(self):
        return self.filter(is_primary=True)
    def totp_devices(self):
        return self.filter(device_type='totp')
    def sms_devices(self):
        return self.filter(device_type='sms')
    def email_devices(self):
        return self.filter(device_type='email')
    def hardware_devices(self):
        return self.filter(device_type='hardware')
    def backup_devices(self):
        return self.filter(device_type='backup')
    def verified(self):
        return self.filter(is_verified=True)
    def unverified(self):
        return self.filter(is_verified=False)
    def locked(self):
        return self.filter(locked_until__gt=timezone.now())
    def for_user(self, user_id):
        return self.filter(user_id=user_id)


class MFADeviceManager(SoftDeleteManager):
    def get_queryset(self):
        return MFADeviceQuerySet(self.model, using=self._db)
    def create_totp_device(self, user, name, secret, **kwargs):
        return self.create(
            user=user,
            device_type='totp',
            name=name,
            secret=secret,
            tenant_id=user.tenant_id,
            **kwargs
        )
    def get_primary_device(self, user):
        return self.filter(user=user, is_primary=True, is_active=True).first()
    def get_verified_devices(self, user):
        return self.filter(user=user, is_verified=True, is_active=True)
    def set_primary_device(self, user, device_id):
        self.filter(user=user, is_primary=True).update(is_primary=False)
        self.filter(id=device_id, user=user).update(is_primary=True)
    def remove_all_devices(self, user):
        return self.filter(user=user).update(is_active=False)


class MFABackupCodeQuerySet(TenantAwareQuerySet):
    def unused(self):
        return self.filter(is_used=False, expires_at__gt=timezone.now())
    def used(self):
        return self.filter(is_used=True)
    def expired(self):
        return self.filter(expires_at__lte=timezone.now())
    def valid(self):
        return self.filter(is_used=False, expires_at__gt=timezone.now())
    def for_user(self, user_id):
        return self.filter(user_id=user_id)


class MFABackupCodeManager(SoftDeleteManager):
    def get_queryset(self):
        return MFABackupCodeQuerySet(self.model, using=self._db)
    def get_valid_codes(self, user):
        return self.filter(user=user, is_used=False, expires_at__gt=timezone.now())
    def use_code(self, user, code):
        from apps.accounts.models import MFABackupCode
        try:
            backup_code = self.get(user=user, code=code, is_used=False, expires_at__gt=timezone.now())
            backup_code.use()
            return True
        except MFABackupCode.DoesNotExist:
            return False
    def generate_codes(self, user, count=10):
        from apps.accounts.models import MFABackupCode
        return MFABackupCode.generate_codes(user, count)
    def cleanup_expired(self):
        return self.filter(expires_at__lte=timezone.now()).delete()

class MFAAuditLogQuerySet(TenantAwareQuerySet):
    def attempts(self):
        return self.filter(event_type='attempt')
    def successes(self):
        return self.filter(event_type='success', success=True)
    def failures(self):
        return self.filter(event_type='failure', success=False)
    def enrollments(self):
        return self.filter(event_type='enroll')
    def for_user(self, user_id):
        return self.filter(user_id=user_id)
    def for_device(self, device_id):
        return self.filter(device_id=device_id)
    def for_ip(self, ip_address):
        return self.filter(ip_address=ip_address)

class MFAAuditLogManager(SoftDeleteManager):
    def get_queryset(self):
        return MFAAuditLogQuerySet(self.model, using=self._db)
    def log_attempt(self, user, device, ip_address, user_agent, success=False, message='', **metadata):
        return self.create(
            user=user,
            device=device,
            event_type='success' if success else 'failure',
            ip_address=ip_address,
            user_agent=user_agent[:500],
            success=success,
            message=message,
            metadata=metadata,
            tenant_id=user.tenant_id if user else None
        )
    def log_enroll(self, user, device, ip_address, user_agent, **metadata):
        return self.create(
            user=user,
            device=device,
            event_type='enroll',
            ip_address=ip_address,
            user_agent=user_agent[:500],
            success=True,
            metadata=metadata,
            tenant_id=user.tenant_id
        )
    def get_failure_rate(self, user_id, hours=24):
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        total = self.filter(user_id=user_id, created_at__gte=cutoff).count()
        failures = self.filter(user_id=user_id, created_at__gte=cutoff, success=False).count()
        return failures / total if total > 0 else 0