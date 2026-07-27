# apps/reportplt/managers/template.py
from django.db import models
from .base import TenantAwareQuerySet, SoftDeleteManager

class TemplateQuerySet(TenantAwareQuerySet):
    def by_type(self, template_type):
        return self.filter(template_type=template_type)
    def by_category(self, category):
        return self.filter(category=category)
    def by_sector(self, sector):
        return self.filter(sector=sector)
    def by_department(self, department):
        return self.filter(department=department)
    def by_owner(self, owner_id):
        return self.filter(owner_id=owner_id)
    def system_templates(self):
        return self.filter(is_system=True)
    def custom_templates(self):
        return self.filter(is_system=False)
    def published(self):
        return self.filter(is_published=True)
    def draft(self):
        return self.filter(is_published=False)
    def default_for_sector(self, sector):
        return self.filter(sector=sector, is_default=True)
    def default_for_type(self, template_type):
        return self.filter(template_type=template_type, is_default=True)
    def with_prebuilt_charts(self):
        return self.filter(has_prebuilt_charts=True)
    def with_dynamic_filters(self):
        return self.filter(has_dynamic_filters=True)
    def with_parameters(self):
        return self.filter(has_parameters=True)
    def popular(self):
        return self.filter(is_popular=True)
    def search_by_name(self, search_term):
        return self.filter(name__icontains=search_term)
    def search_by_description(self, search_term):
        return self.filter(description__icontains=search_term)
    def for_industry(self, industry):
        return self.filter(applicable_industries__contains=[industry])
    def for_org_size(self, size):
        return self.filter(org_size__lte=size)

class TemplateManager(SoftDeleteManager):
    def get_queryset(self):
        return TemplateQuerySet(self.model, using=self._db)
    def by_type(self, template_type):
        return self.get_queryset().by_type(template_type)
    def by_category(self, category):
        return self.get_queryset().by_category(category)
    def by_sector(self, sector):
        return self.get_queryset().by_sector(sector)
    def system_templates(self):
        return self.get_queryset().system_templates()
    def custom_templates(self):
        return self.get_queryset().custom_templates()
    def published(self):
        return self.get_queryset().published()
    def default_for_sector(self, sector):
        return self.get_queryset().default_for_sector(sector)
    def default_for_type(self, template_type):
        return self.get_queryset().default_for_type(template_type)
    def popular(self):
        return self.get_queryset().popular()
    def search(self, search_term):
        return self.get_queryset().search_by_name(search_term)