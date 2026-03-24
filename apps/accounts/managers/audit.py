from django.db import models
from django.utils import timezone
from .base import BaseManager, TenantAwareQuerySet

class AuditLogQuerySet(TenantAwareQuerySet):
    def for_user(self, user_id):
        return self.filter(user_id=user_id)
    def for_action(self, action):
        return self.filter(action=action)
    def for_action_type(self, action_type):
        return self.filter(action_type=action_type)
    def for_object(self, content_type, object_id):
        return self.filter(content_type=content_type, object_id=str(object_id))
    def for_model(self, content_type):
        return self.filter(content_type=content_type)
    def for_ip(self, ip_address):
        return self.filter(ip_address=ip_address)
    def info(self):
        return self.filter(severity='info')
    def warnings(self):
        return self.filter(severity='warning')
    def errors(self):
        return self.filter(severity='error')
    def critical(self):
        return self.filter(severity='critical')
    def today(self):
        today = timezone.now().date()
        return self.filter(timestamp__date=today)
    def this_week(self):
        now = timezone.now()
        start = now - timezone.timedelta(days=now.weekday())
        return self.filter(timestamp__date__gte=start.date())
    def this_month(self):
        now = timezone.now()
        return self.filter(timestamp__year=now.year, timestamp__month=now.month)
    def date_range(self, start_date, end_date):
        return self.filter(timestamp__date__gte=start_date, timestamp__date__lte=end_date)

class AuditLogManager(BaseManager):
    def get_queryset(self):
        return AuditLogQuerySet(self.model, using=self._db)
    def log(self, user, action, action_type, request=None, **kwargs):
        from apps.accounts.models import AuditLog
        return AuditLog.log(user, action, action_type, request, **kwargs)
    def get_user_activity(self, user_id, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(user_id=user_id, timestamp__gte=cutoff).order_by('-timestamp')
    def get_object_history(self, content_type, object_id):
        return self.filter(content_type=content_type, object_id=str(object_id)).order_by('timestamp')
    def get_recent_actions(self, limit=100):
        return self.order_by('-timestamp')[:limit]
    def get_actions_summary(self, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(timestamp__gte=cutoff).values('action', 'action_type').annotate(count=models.Count('id')).order_by('-count')
    def get_user_summary(self, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(timestamp__gte=cutoff).values('user__email', 'user__first_name', 'user__last_name').annotate(count=models.Count('id')).order_by('-count')
    def cleanup_old(self, days=365):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(timestamp__lt=cutoff).delete()
    def export_for_tenant(self, tenant_id, start_date, end_date):
        return self.filter(tenant_id=tenant_id, timestamp__date__gte=start_date, timestamp__date__lte=end_date).order_by('timestamp')