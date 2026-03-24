from django.utils import timezone
from .base import BaseManager, TenantAwareQuerySet

class LoginAttemptQuerySet(TenantAwareQuerySet):
    def successes(self):
        return self.filter(result='success')
    def failures(self):
        return self.filter(result='failure')
    def locked(self):
        return self.filter(result='locked')
    def for_identifier(self, identifier):
        return self.filter(identifier=identifier)
    def for_ip(self, ip_address):
        return self.filter(ip_address=ip_address)
    def recent(self, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(attempted_at__gte=cutoff)

class LoginAttemptManager(BaseManager):
    def get_queryset(self):
        return LoginAttemptQuerySet(self.model, using=self._db)
    def record_success(self, identifier, user, ip_address, user_agent, request=None, **metadata):
        """Record successful login attempt."""
        return self.create(
            identifier=identifier,
            user=user,
            result='success',
            ip_address=ip_address,
            user_agent=user_agent[:500],
            referer=request.META.get('HTTP_REFERER', '')[:500] if request else '',
            session_key=request.session.session_key if request and hasattr(request, 'session') else '',
            metadata=metadata,
            tenant_id=user.tenant_id if user else None
        )
    
    def record_failure(self, identifier, ip_address, user_agent, failure_reason, user=None, request=None, **metadata):
        return self.create(
            identifier=identifier,
            user=user,
            result='failure',
            failure_reason=failure_reason,
            ip_address=ip_address,
            user_agent=user_agent[:500],
            referer=request.META.get('HTTP_REFERER', '')[:500] if request else '',
            session_key=request.session.session_key if request and hasattr(request, 'session') else '',
            metadata=metadata,
            tenant_id=user.tenant_id if user else None
        )
    
    def record_locked(self, identifier, ip_address, user_agent, user=None, request=None, **metadata):
        return self.create(
            identifier=identifier,
            user=user,
            result='locked',
            ip_address=ip_address,
            user_agent=user_agent[:500],
            referer=request.META.get('HTTP_REFERER', '')[:500] if request else '',
            metadata=metadata,
            tenant_id=user.tenant_id if user else None
        )
    
    def get_failure_count(self, identifier, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(identifier=identifier, result='failure', attempted_at__gte=cutoff).count()
    def get_ip_failure_count(self, ip_address, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(ip_address=ip_address, result='failure', attempted_at__gte=cutoff).count()
    def get_recent_attempts(self, identifier, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(identifier=identifier, attempted_at__gte=cutoff).order_by('-attempted_at')
    def cleanup_old(self, days=90):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(attempted_at__lt=cutoff).delete()