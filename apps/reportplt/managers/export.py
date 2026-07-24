# apps/reportplt/managers/export.py
from django.db import models
from django.utils import timezone
from .base import TenantAwareQuerySet, SoftDeleteManager

class ExportQuerySet(TenantAwareQuerySet):
    def by_format(self, format):
        return self.filter(format=format)
    def by_status(self, status):
        return self.filter(status=status)
    def by_report(self, report_id):
        return self.filter(report_id=report_id)
    def by_user(self, user_id):
        return self.filter(exported_by_id=user_id)
    def completed(self):
        return self.filter(status='completed')
    def processing(self):
        return self.filter(status='processing')
    def queued(self):
        return self.filter(status='queued')
    def failed(self):
        return self.filter(status='failed')
    def cancelled(self):
        return self.filter(status='cancelled')
    def ready_for_download(self):
        return self.filter(status='completed', file_path__isnull=False)
    def with_file(self):
        return self.filter(file_path__isnull=False)
    def without_file(self):
        return self.filter(file_path__isnull=True)
    def compressed(self):
        return self.filter(is_compressed=True)
    def not_compressed(self):
        return self.filter(is_compressed=False)
    def encrypted(self):
        return self.filter(is_encrypted=True)
    def not_encrypted(self):
        return self.filter(is_encrypted=False)
    def with_password(self):
        return self.filter(password_protected=True)
    def without_password(self):
        return self.filter(password_protected=False)
    def with_watermark(self):
        return self.filter(has_watermark=True)
    def with_email_delivery(self):
        return self.filter(delivered_via='email')
    def with_download_delivery(self):
        return self.filter(delivered_via='download')
    def with_s3_delivery(self):
        return self.filter(delivered_via='s3')
    def with_webhook_delivery(self):
        return self.filter(delivered_via='webhook')
    def delivered(self):
        return self.filter(delivered_at__isnull=False)
    def not_delivered(self):
        return self.filter(delivered_at__isnull=True)
    def created_after(self, date):
        return self.filter(created_at__gte=date)
    def created_before(self, date):
        return self.filter(created_at__lte=date)
    def completed_after(self, date):
        return self.filter(completed_at__gte=date)
    def completed_before(self, date):
        return self.filter(completed_at__lte=date)
    def large_export(self, mb=10):
        return self.filter(file_size__gte=mb * 1024 * 1024)
    def small_export(self, mb=1):
        return self.filter(file_size__lt=mb * 1024 * 1024)
    def stale(self, days=7):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(created_at__lt=cutoff, status='completed')
    def by_department(self, department_id):
        return self.filter(department_id=department_id)
    def by_team(self, team_id):
        return self.filter(team_id=team_id)
    def with_page_count(self, min_pages=None, max_pages=None):
        qs = self
        if min_pages is not None:
            qs = qs.filter(page_count__gte=min_pages)
        if max_pages is not None:
            qs = qs.filter(page_count__lte=max_pages)
        return qs

class ExportManager(SoftDeleteManager):
    def get_queryset(self):
        return ExportQuerySet(self.model, using=self._db)
    def by_format(self, format):
        return self.get_queryset().by_format(format)
    def by_status(self, status):
        return self.get_queryset().by_status(status)
    def by_report(self, report_id):
        return self.get_queryset().by_report(report_id)
    def by_user(self, user_id):
        return self.get_queryset().by_user(user_id)
    def completed(self):
        return self.get_queryset().completed()
    def processing(self):
        return self.get_queryset().processing()
    def queued(self):
        return self.get_queryset().queued()
    def failed(self):
        return self.get_queryset().failed()
    def ready_for_download(self):
        return self.get_queryset().ready_for_download()
    def delivered(self):
        return self.get_queryset().delivered()
    def stale(self, days=7):
        return self.get_queryset().stale(days)
    def large_export(self, mb=10):
        return self.get_queryset().large_export(mb)