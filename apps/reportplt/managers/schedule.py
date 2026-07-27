# apps/reportplt/managers/schedule.py
from django.db import models
from django.utils import timezone
from .base import TenantAwareQuerySet, SoftDeleteManager

class ScheduleQuerySet(TenantAwareQuerySet):
    def by_frequency(self, frequency):
        return self.filter(frequency=frequency)
    def by_status(self, status):
        return self.filter(status=status)
    def by_report(self, report_id):
        return self.filter(report_id=report_id)
    def by_owner(self, owner_id):
        return self.filter(owner_id=owner_id)
    def by_creator(self, creator_id):
        return self.filter(created_by_id=creator_id)
    def active(self):
        return self.filter(is_active=True)
    def inactive(self):
        return self.filter(is_active=False)
    def paused(self):
        return self.filter(is_paused=True)
    def not_paused(self):
        return self.filter(is_paused=False)
    def due_now(self):
        now = timezone.now()
        return self.filter(next_run_at__lte=now, is_active=True, is_paused=False)
    def due_soon(self, minutes=60):
        soon = timezone.now() + timezone.timedelta(minutes=minutes)
        return self.filter(next_run_at__lte=soon, is_active=True, is_paused=False)
    def overdue(self):
        now = timezone.now()
        return self.filter(next_run_at__lt=now, is_active=True, is_paused=False)
    def running(self):
        return self.filter(status='running')
    def completed(self):
        return self.filter(status='completed')
    def failed(self):
        return self.filter(status='failed')
    def pending(self):
        return self.filter(status='pending')
    def with_email_delivery(self):
        return self.filter(delivery_method__contains='email')
    def with_webhook_delivery(self):
        return self.filter(delivery_method__contains='webhook')
    def with_s3_delivery(self):
        return self.filter(delivery_method__contains='s3')
    def by_recipient(self, recipient_email):
        return self.filter(recipients__contains=[recipient_email])
    def by_timezone(self, timezone):
        return self.filter(timezone=timezone)
    def last_run_successful(self):
        return self.filter(last_run_status='success')
    def last_run_failed(self):
        return self.filter(last_run_status='failed')
    def needs_retry(self):
        return self.filter(retry_count__lt=models.F('max_retries'), last_run_status='failed')
    def max_retries_exceeded(self):
        return self.filter(retry_count__gte=models.F('max_retries'), last_run_status='failed')
    def expires_soon(self, days=7):
        expiry = timezone.now() + timezone.timedelta(days=days)
        return self.filter(expires_at__lte=expiry, expires_at__gt=timezone.now())
    def expired(self):
        return self.filter(expires_at__lte=timezone.now())
    def has_started(self):
        return self.filter(started_at__isnull=False)
    def has_not_started(self):
        return self.filter(started_at__isnull=True)

class ScheduleManager(SoftDeleteManager):
    def get_queryset(self):
        return ScheduleQuerySet(self.model, using=self._db)
    def by_frequency(self, frequency):
        return self.get_queryset().by_frequency(frequency)
    def by_status(self, status):
        return self.get_queryset().by_status(status)
    def by_report(self, report_id):
        return self.get_queryset().by_report(report_id)
    def active(self):
        return self.get_queryset().active()
    def due_now(self):
        return self.get_queryset().due_now()
    def due_soon(self, minutes=60):
        return self.get_queryset().due_soon(minutes)
    def overdue(self):
        return self.get_queryset().overdue()
    def running(self):
        return self.get_queryset().running()
    def failed(self):
        return self.get_queryset().failed()
    def pending(self):
        return self.get_queryset().pending()
    def needs_retry(self):
        return self.get_queryset().needs_retry()
    def expired(self):
        return self.get_queryset().expired()
    def expires_soon(self, days=7):
        return self.get_queryset().expires_soon(days)