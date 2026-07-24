# apps/reportplt/managers/report.py
from django.db import models
from django.utils import timezone
from .base import TenantAwareQuerySet, SoftDeleteManager

class ReportQuerySet(TenantAwareQuerySet):
    def by_type(self, report_type):
        return self.filter(report_type=report_type)
    def by_status(self, status):
        return self.filter(status=status)
    def by_format(self, format):
        return self.filter(default_format=format)
    def by_category(self, category):
        return self.filter(category=category)
    def by_owner(self, owner_id):
        return self.filter(owner_id=owner_id)
    def by_creator(self, creator_id):
        return self.filter(created_by_id=creator_id)
    def scheduled(self):
        return self.filter(is_scheduled=True)
    def not_scheduled(self):
        return self.filter(is_scheduled=False)
    def system_generated(self):
        return self.filter(is_system=True)
    def user_generated(self):
        return self.filter(is_system=False)
    def published(self):
        return self.filter(is_published=True)
    def draft(self):
        return self.filter(is_published=False)
    def archived(self):
        return self.filter(is_archived=True)
    def not_archived(self):
        return self.filter(is_archived=False)
    def with_executive_summary(self):
        return self.filter(include_executive_summary=True)
    def with_charts(self):
        return self.filter(include_charts=True)
    def with_tables(self):
        return self.filter(include_tables=True)
    def created_after(self, date):
        return self.filter(created_at__gte=date)
    def created_before(self, date):
        return self.filter(created_at__lte=date)
    def generated_after(self, date):
        return self.filter(last_generated_at__gte=date)
    def generated_before(self, date):
        return self.filter(last_generated_at__lte=date)
    def ready_for_export(self):
        return self.filter(status__in=['completed', 'ready'])
    def generating(self):
        return self.filter(status='generating')
    def failed(self):
        return self.filter(status='failed')
    def queued(self):
        return self.filter(status='queued')
    def stale(self, days=7):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(last_generated_at__lt=cutoff, status='completed')
    def needs_refresh(self):
        return self.filter(needs_refresh=True)
    def with_data_from(self, source):
        return self.filter(data_source=source)
    def accessible_by_role(self, role):
        return self.filter(allowed_roles__contains=[role])
    def accessible_by_department(self, department_id):
        return self.filter(allowed_departments__contains=[department_id])
    def public_reports(self):
        return self.filter(is_public=True)
    def private_reports(self):
        return self.filter(is_public=False)
    def with_tags(self, tags):
        return self.filter(tags__overlap=tags)
    def with_tag(self, tag):
        return self.filter(tags__contains=[tag])

class ReportManager(SoftDeleteManager):
    def get_queryset(self):
        return ReportQuerySet(self.model, using=self._db)
    def by_type(self, report_type):
        return self.get_queryset().by_type(report_type)
    def by_status(self, status):
        return self.get_queryset().by_status(status)
    def by_format(self, format):
        return self.get_queryset().by_format(format)
    def by_category(self, category):
        return self.get_queryset().by_category(category)
    def by_owner(self, owner_id):
        return self.get_queryset().by_owner(owner_id)
    def scheduled(self):
        return self.get_queryset().scheduled()
    def system_generated(self):
        return self.get_queryset().system_generated()
    def user_generated(self):
        return self.get_queryset().user_generated()
    def published(self):
        return self.get_queryset().published()
    def draft(self):
        return self.get_queryset().draft()
    def archived(self):
        return self.get_queryset().archived()
    def ready_for_export(self):
        return self.get_queryset().ready_for_export()
    def stale(self, days=7):
        return self.get_queryset().stale(days)
    def needs_refresh(self):
        return self.get_queryset().needs_refresh()
    def public_reports(self):
        return self.get_queryset().public_reports()