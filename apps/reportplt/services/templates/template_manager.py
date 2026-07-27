# apps/reportplt/services/templates/template_manager.py
import json
import uuid
from copy import deepcopy
from typing import Optional, Dict, Any, List
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.reportplt.models import ReportTemplate, Report
from apps.reportplt.constants import TemplateType, SectorType
from apps.reportplt.exceptions import TemplateNotFoundError, TemplateRenderError, ReportPermissionError
from apps.reportplt.validators import TemplateValidator
from apps.reportplt.services.security.report_rbac import ReportRBAC
from apps.accounts.models import User

class TemplateManager:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.rbac = ReportRBAC(user) if user else None
        self.validator = TemplateValidator()

    def create_template(self, data: Dict[str, Any]) -> ReportTemplate:
        if self.rbac and not self.rbac.can_create_template():
            raise ReportPermissionError("You do not have permission to create templates")
        errors = self.validator.validate()
        if errors:
            raise ValidationError(errors)
        template = ReportTemplate(
            tenant_id=self.user.tenant_id if self.user else None,
            name=data.get('name'),
            description=data.get('description', ''),
            template_type=data.get('template_type'),
            category=data.get('category', ''),
            sector=data.get('sector', 'all'),
            department=data.get('department', ''),
            owner=self.user,
            is_system=False,
            is_published=data.get('is_published', False),
            is_default=data.get('is_default', False),
            is_popular=data.get('is_popular', False),
            has_prebuilt_charts=data.get('has_prebuilt_charts', False),
            has_dynamic_filters=data.get('has_dynamic_filters', False),
            has_parameters=data.get('has_parameters', False),
            layout_config=data.get('layout_config', {}),
            widget_config=data.get('widget_config', {}),
            filter_config=data.get('filter_config', {}),
            parameter_config=data.get('parameter_config', {}),
            chart_config=data.get('chart_config', {}),
            table_config=data.get('table_config', {}),
            style_config=data.get('style_config', {}),
            export_config=data.get('export_config', {}),
            applicable_industries=data.get('applicable_industries', []),
            org_size=data.get('org_size', 0)
        )
        template.full_clean()
        template.save()
        return template

    def get_template(self, template_id: uuid.UUID) -> ReportTemplate:
        try:
            template = ReportTemplate.objects.get(id=template_id)
            if self.rbac and not self.rbac.can_view_template(template):
                raise ReportPermissionError("You do not have permission to view this template")
            return template
        except ReportTemplate.DoesNotExist:
            raise TemplateNotFoundError(f"Template with ID {template_id} not found")

    def get_templates(self, filters: Optional[Dict] = None) -> List[ReportTemplate]:
        qs = ReportTemplate.objects.all()
        if self.user:
            qs = qs.filter(tenant_id=self.user.tenant_id)
        if filters:
            if filters.get('template_type'):
                qs = qs.filter(template_type=filters['template_type'])
            if filters.get('category'):
                qs = qs.filter(category=filters['category'])
            if filters.get('sector'):
                qs = qs.filter(sector__in=[filters['sector'], 'all'])
            if filters.get('is_system') is not None:
                qs = qs.filter(is_system=filters['is_system'])
            if filters.get('is_published') is not None:
                qs = qs.filter(is_published=filters['is_published'])
            if filters.get('is_popular'):
                qs = qs.filter(is_popular=True)
            if filters.get('search'):
                qs = qs.filter(name__icontains=filters['search'])
        if self.user and self.rbac and self.user.role != 'client_admin':
            qs = qs.filter(
                models.Q(is_published=True) |
                models.Q(owner=self.user)
            )
        return qs

    def update_template(self, template_id: uuid.UUID, data: Dict[str, Any]) -> ReportTemplate:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_edit_template(template):
            raise ReportPermissionError("You do not have permission to edit this template")
        if template.is_system:
            raise ReportPermissionError("System templates cannot be modified")
        for key, value in data.items():
            if hasattr(template, key) and key not in ['id', 'created_at', 'updated_at', 'version']:
                setattr(template, key, value)
        template.version += 1
        template.full_clean()
        template.save()
        return template

    def delete_template(self, template_id: uuid.UUID) -> bool:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_delete_template(template):
            raise ReportPermissionError("You do not have permission to delete this template")
        if template.is_system:
            raise ReportPermissionError("System templates cannot be deleted")
        template.soft_delete()
        return True

    def duplicate_template(self, template_id: uuid.UUID, new_name: Optional[str] = None) -> ReportTemplate:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_create_template():
            raise ReportPermissionError("You do not have permission to duplicate templates")
        return template.duplicate(new_name, self.user)

    def publish_template(self, template_id: uuid.UUID) -> ReportTemplate:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_edit_template(template):
            raise ReportPermissionError("You do not have permission to publish this template")
        template.is_published = True
        template.save(update_fields=['is_published'])
        return template

    def unpublish_template(self, template_id: uuid.UUID) -> ReportTemplate:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_edit_template(template):
            raise ReportPermissionError("You do not have permission to unpublish this template")
        if template.is_default:
            raise ReportPermissionError("Cannot unpublish a default template")
        template.is_published = False
        template.save(update_fields=['is_published'])
        return template

    def set_default_template(self, template_id: uuid.UUID, sector: Optional[str] = None) -> ReportTemplate:
        template = self.get_template(template_id)
        if self.rbac and not self.rbac.can_edit_template(template):
            raise ReportPermissionError("You do not have permission to set default template")
        with transaction.atomic():
            if sector:
                ReportTemplate.objects.filter(
                    tenant_id=template.tenant_id,
                    sector=sector,
                    is_default=True
                ).update(is_default=False)
            else:
                ReportTemplate.objects.filter(
                    tenant_id=template.tenant_id,
                    template_type=template.template_type,
                    is_default=True
                ).update(is_default=False)
            template.is_default = True
            template.is_published = True
            template.save(update_fields=['is_default', 'is_published'])
        return template

    def apply_template_to_report(self, template_id: uuid.UUID, report_id: uuid.UUID) -> Report:
        template = self.get_template(template_id)
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            raise TemplateNotFoundError(f"Report with ID {report_id} not found")
        if self.rbac and not self.rbac.can_edit_report(report):
            raise ReportPermissionError("You do not have permission to edit this report")
        return template.apply_to_report(report)

    def get_template_by_sector(self, sector: str, template_type: Optional[str] = None) -> Optional[ReportTemplate]:
        qs = ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            sector__in=[sector, 'all'],
            is_published=True
        )
        if template_type:
            qs = qs.filter(template_type=template_type)
        return qs.order_by('-is_default', '-is_popular', '-created_at').first()

    def get_default_templates(self) -> List[ReportTemplate]:
        return ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_default=True,
            is_published=True
        )

    def get_popular_templates(self, limit: int = 10) -> List[ReportTemplate]:
        return ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_popular=True,
            is_published=True
        )[:limit]

    def search_templates(self, query: str) -> List[ReportTemplate]:
        return ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_published=True
        ).filter(
            models.Q(name__icontains=query) |
            models.Q(description__icontains=query) |
            models.Q(category__icontains=query)
        )

    def validate_template_config(self, config: Dict) -> bool:
        required_keys = ['layout_config', 'widget_config']
        for key in required_keys:
            if key not in config:
                raise ValidationError(f"Missing required config key: {key}")
        if not isinstance(config.get('layout_config'), dict):
            raise ValidationError("layout_config must be a dictionary")
        if not isinstance(config.get('widget_config'), dict):
            raise ValidationError("widget_config must be a dictionary")
        return True

    def merge_template_config(self, base_config: Dict, override_config: Dict) -> Dict:
        result = deepcopy(base_config)
        for key, value in override_config.items():
            if isinstance(value, dict) and key in result and isinstance(result[key], dict):
                result[key] = self.merge_template_config(result[key], value)
            else:
                result[key] = value
        return result

    def get_sector_specific_templates(self, sector: str) -> List[ReportTemplate]:
        return ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            sector__in=[sector, 'all'],
            is_published=True
        )

    def get_templates_by_type(self, template_type: str) -> List[ReportTemplate]:
        return ReportTemplate.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            template_type=template_type,
            is_published=True
        )

    def bulk_create_templates(self, templates_data: List[Dict]) -> List[ReportTemplate]:
        if self.rbac and not self.rbac.can_create_template():
            raise ReportPermissionError("You do not have permission to create templates")
        templates = []
        for data in templates_data:
            template = ReportTemplate(
                tenant_id=self.user.tenant_id if self.user else None,
                name=data.get('name'),
                description=data.get('description', ''),
                template_type=data.get('template_type'),
                category=data.get('category', ''),
                sector=data.get('sector', 'all'),
                owner=self.user,
                is_system=False,
                is_published=data.get('is_published', False),
                layout_config=data.get('layout_config', {}),
                widget_config=data.get('widget_config', {}),
                filter_config=data.get('filter_config', {}),
                parameter_config=data.get('parameter_config', {}),
                chart_config=data.get('chart_config', {}),
                table_config=data.get('table_config', {}),
                style_config=data.get('style_config', {}),
                export_config=data.get('export_config', {}),
            )
            template.full_clean()
            templates.append(template)
        return ReportTemplate.objects.bulk_create(templates)