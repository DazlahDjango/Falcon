"""
Session managers for tracking and blacklisting.
"""

from django.utils import timezone
from .base import SoftDeleteManager, TenantAwareQuerySet


class UserSessionQuerySet(TenantAwareQuerySet):
    def active(self):
        return self.filter(status='active', expires_at__gt=timezone.now())
    def expired(self):
        return self.filter(status='expired', expires_at__lte=timezone.now())
    def logged_out(self):
        return self.filter(status='logged_out')
    def revoked(self):
        return self.filter(status='revoked')
    def for_user(self, user_id):
        return self.filter(user_id=user_id)
    def for_ip(self, ip_address):
        return self.filter(ip_address=ip_address)
    def recent(self, hours=24):
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        return self.filter(login_time__gte=cutoff)
    def without_mfa(self):
        return self.filter(mfa_verified=False)
    def trusted_devices(self):
        return self.filter(is_trusted_device=True)
    def with_security_alerts(self):
        return self.exclude(security_alerts=[])

class UserSessionManager(SoftDeleteManager):
    def get_queryset(self):
        return UserSessionQuerySet(self.model, using=self._db)
    def create_session(self, user, session_key, jwt_token_id, ip_address, user_agent, **kwargs):
        expires_at = kwargs.pop('expires_at', timezone.now() + timezone.timedelta(hours=24))
        return self.create(
            user=user,
            session_key=session_key,
            jwt_token_id=jwt_token_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
            tenant_id=user.tenant_id,
            **kwargs
        )
    def get_active_sessions(self, user):
        return self.filter(user=user, status='active', expires_at__gt=timezone.now())
    def terminate_all_sessions(self, user, except_session_key=None):
        qs = self.filter(user=user, status='active')
        if except_session_key:
            qs = qs.exclude(session_key=except_session_key)
        qs.update(status='revoked', logout_time=timezone.now())
    def cleanup_expired(self):
        return self.filter(expires_at__lte=timezone.now(), status='active').update(status='expired')
    def get_or_create_by_key(self, session_key):
        return self.filter(session_key=session_key).first()


class SessionBlacklistQuerySet(TenantAwareQuerySet):
    def valid(self):
        return self.filter(expires_at__gt=timezone.now())
    def expired(self):
        return self.filter(expires_at__lte=timezone.now())
    def for_token(self, token_id):
        return self.filter(token_id=token_id)
    def for_user(self, user_id):
        return self.filter(user_id=user_id)

class SessionBlacklistManager(SoftDeleteManager):
    def get_queryset(self):
        return SessionBlacklistQuerySet(self.model, using=self._db)
    def blacklist_token(self, token_id, token_type, user=None, reason='', expires_at=None):
        if not expires_at:
            expires_at = timezone.now() + timezone.timedelta(days=7)
        return self.create(
            token_id=token_id,
            token_type=token_type,
            user=user,
            reason=reason,
            expires_at=expires_at,
            tenant_id=user.tenant_id if user else None
        )
    def is_blacklisted(self, token_id):
        return self.filter(token_id=token_id, expires_at__gt=timezone.now()).exists()
    def cleanup_expired(self):
        return self.filter(expires_at__lte=timezone.now()).delete()