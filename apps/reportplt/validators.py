# apps/reportplt/validators.py
import re
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .constants import ReportType, ReportFormat, ReportCategory, ScheduleFrequency

class ReportValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Report name is required')
        if 'report_type' in self.data:
            report_type = self.data.get('report_type')
            valid_types = [t[0] for t in ReportType.CHOICES]
            if report_type and report_type not in valid_types:
                errors['report_type'] = _('Invalid report type')
        if 'default_format' in self.data:
            format_val = self.data.get('default_format')
            valid_formats = [f[0] for f in ReportFormat.CHOICES]
            if format_val and format_val not in valid_formats:
                errors['default_format'] = _('Invalid report format')
        if 'category' in self.data:
            category = self.data.get('category')
            valid_categories = [c[0] for c in ReportCategory.CHOICES]
            if category and category not in valid_categories:
                errors['category'] = _('Invalid report category')
        if 'config' in self.data:
            config = self.data.get('config')
            if config and not isinstance(config, dict):
                errors['config'] = _('Config must be a JSON object')
        return errors
    
    def validate_name(self, name):
        if not name or len(name.strip()) == 0:
            raise ValidationError(_('Report name cannot be empty'))
        if len(name) > 255:
            raise ValidationError(_('Report name cannot exceed 255 characters'))
        return name.strip()
    
    def validate_description(self, description):
        if description and len(description) > 10000:
            raise ValidationError(_('Description cannot exceed 10000 characters'))
        return description

class TemplateValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Template name is required')
        if 'template_type' in self.data:
            template_type = self.data.get('template_type')
            valid_types = [t[0] for t in ReportType.CHOICES]
            if template_type and template_type not in valid_types:
                errors['template_type'] = _('Invalid template type')
        if 'sector' in self.data:
            sector = self.data.get('sector')
            valid_sectors = ['commercial', 'ngo', 'public', 'consulting', 'all']
            if sector and sector not in valid_sectors:
                errors['sector'] = _('Invalid sector type')
        return errors

class ScheduleValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Schedule name is required')
        if 'frequency' in self.data:
            frequency = self.data.get('frequency')
            valid_frequencies = [f[0] for f in ScheduleFrequency.CHOICES]
            if frequency and frequency not in valid_frequencies:
                errors['frequency'] = _('Invalid frequency')
        if 'frequency' in self.data and self.data.get('frequency') == 'custom':
            if not self.data.get('cron_expression'):
                errors['cron_expression'] = _('Cron expression is required for custom frequency')
        if 'recipients' in self.data:
            recipients = self.data.get('recipients', [])
            if not isinstance(recipients, list):
                errors['recipients'] = _('Recipients must be a list')
            else:
                for email in recipients:
                    if not self.validate_email(email):
                        errors['recipients'] = _('Invalid email address in recipients')
        if 'expiry_days' in self.data:
            expiry_days = self.data.get('expiry_days')
            if expiry_days and expiry_days < 0:
                errors['expiry_days'] = _('Expiry days cannot be negative')
        return errors
    
    def validate_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def validate_cron(self, cron_expression):
        try:
            from croniter import croniter
            croniter(cron_expression)
            return True
        except:
            return False

class ExportValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'format' in self.data:
            format_val = self.data.get('format')
            valid_formats = [f[0] for f in ReportFormat.CHOICES]
            if format_val and format_val not in valid_formats:
                errors['format'] = _('Invalid export format')
        if 'password' in self.data:
            password = self.data.get('password')
            if password and len(password) < 6:
                errors['password'] = _('Password must be at least 6 characters')
        if 'expires_at' in self.data:
            expires_at = self.data.get('expires_at')
            if expires_at:
                try:
                    if isinstance(expires_at, str):
                        datetime.fromisoformat(expires_at)
                except:
                    errors['expires_at'] = _('Invalid date format')
        return errors

class FilterValidator:
    def __init__(self, filter_obj=None, data=None):
        self.filter_obj = filter_obj
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Filter name is required')
        if 'filter_type' in self.data:
            filter_type = self.data.get('filter_type')
            valid_types = ['date_range', 'dropdown', 'multi_select', 'text', 'number', 'boolean', 'hierarchy', 'custom']
            if filter_type and filter_type not in valid_types:
                errors['filter_type'] = _('Invalid filter type')
        return errors
    
    def validate_value(self, value):
        if not self.filter_obj:
            return True
        if self.filter_obj.required and (value is None or value == ''):
            raise ValidationError(_('This field is required'))
        if self.filter_obj.filter_type == 'date_range':
            if not isinstance(value, dict):
                raise ValidationError(_('Date range must be an object'))
            if 'start' not in value or 'end' not in value:
                raise ValidationError(_('Date range must have start and end'))
            return True
        if self.filter_obj.filter_type in ['dropdown', 'multi_select']:
            if self.filter_obj.multiple and not isinstance(value, list):
                raise ValidationError(_('Must be a list for multi-select'))
            if not self.filter_obj.multiple and isinstance(value, list):
                raise ValidationError(_('Must be a single value for dropdown'))
            return True
        if self.filter_obj.filter_type == 'number':
            if not isinstance(value, (int, float)):
                raise ValidationError(_('Must be a number'))
            return True
        if self.filter_obj.filter_type == 'boolean':
            if not isinstance(value, bool):
                raise ValidationError(_('Must be a boolean'))
            return True
        return True

class DashboardValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Dashboard name is required')
        if 'layout' in self.data:
            layout = self.data.get('layout')
            if layout and not isinstance(layout, dict):
                errors['layout'] = _('Layout must be a JSON object')
        if 'allowed_roles' in self.data:
            allowed_roles = self.data.get('allowed_roles', [])
            if not isinstance(allowed_roles, list):
                errors['allowed_roles'] = _('Allowed roles must be a list')
        return errors

class WidgetValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'name' in self.data and not self.data.get('name'):
            errors['name'] = _('Widget name is required')
        if 'widget_type' in self.data:
            widget_type = self.data.get('widget_type')
            valid_types = ['kpi', 'chart', 'table', 'heatmap', 'trend', 'gauge', 'pie', 'bar', 'line', 'area', 'scatter', 'map', 'list', 'summary', 'mission', 'pip', 'compliance', 'custom']
            if widget_type and widget_type not in valid_types:
                errors['widget_type'] = _('Invalid widget type')
        if 'config' in self.data:
            config = self.data.get('config')
            if config and not isinstance(config, dict):
                errors['config'] = _('Config must be a JSON object')
        return errors

class ShareValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'permission' in self.data:
            permission = self.data.get('permission')
            valid_permissions = ['view', 'comment', 'edit', 'export']
            if permission and permission not in valid_permissions:
                errors['permission'] = _('Invalid permission type')
        if 'share_type' in self.data:
            share_type = self.data.get('share_type')
            valid_types = ['internal', 'external', 'public']
            if share_type and share_type not in valid_types:
                errors['share_type'] = _('Invalid share type')
        if 'expires_at' in self.data:
            expires_at = self.data.get('expires_at')
            if expires_at:
                try:
                    if isinstance(expires_at, str):
                        datetime.fromisoformat(expires_at)
                except:
                    errors['expires_at'] = _('Invalid date format')
        return errors

class AuditValidator:
    def __init__(self, data=None):
        self.data = data or {}
    
    def validate(self):
        errors = {}
        if 'action' in self.data:
            action = self.data.get('action')
            valid_actions = ['view', 'create', 'edit', 'delete', 'export', 'share', 'schedule', 'generate', 'refresh', 'archive', 'restore', 'permission_change', 'config_change', 'login', 'logout']
            if action and action not in valid_actions:
                errors['action'] = _('Invalid audit action')
        return errors

class ReportConfigValidator:
    @staticmethod
    def validate_config(config):
        if not isinstance(config, dict):
            raise ValidationError(_('Config must be a dictionary'))
        valid_keys = ['page_size', 'orientation', 'margins', 'font_family', 'font_size', 'show_page_numbers', 'show_timestamp', 'date_format', 'datetime_format']
        for key in config:
            if key not in valid_keys:
                raise ValidationError(_('Invalid config key: {}').format(key))
        return True
    
    @staticmethod
    def validate_chart_config(config):
        if not isinstance(config, dict):
            raise ValidationError(_('Chart config must be a dictionary'))
        valid_keys = ['width', 'height', 'responsive', 'show_legend', 'show_tooltip', 'animation', 'theme']
        for key in config:
            if key not in valid_keys:
                raise ValidationError(_('Invalid chart config key: {}').format(key))
        return True

class DataSourceValidator:
    @staticmethod
    def validate_source(source):
        valid_sources = ['kpi', 'reviews', 'tasks', 'pip', 'combined', 'configs', 'tenant']
        if source not in valid_sources:
            raise ValidationError(_('Invalid data source: {}').format(source))
        return True

class TagValidator:
    @staticmethod
    def validate_tags(tags):
        if not isinstance(tags, list):
            raise ValidationError(_('Tags must be a list'))
        for tag in tags:
            if not isinstance(tag, str):
                raise ValidationError(_('Tags must be strings'))
            if len(tag) > 50:
                raise ValidationError(_('Tag cannot exceed 50 characters'))
            if not tag.strip():
                raise ValidationError(_('Tag cannot be empty'))
        return True

class ParameterValidator:
    @staticmethod
    def validate_parameters(params, param_definitions):
        if not isinstance(params, dict):
            raise ValidationError(_('Parameters must be a dictionary'))
        for key, definition in param_definitions.items():
            if definition.get('required', False) and key not in params:
                raise ValidationError(_('Missing required parameter: {}').format(key))
            if key in params:
                value = params[key]
                param_type = definition.get('type', 'string')
                if param_type == 'string':
                    if not isinstance(value, str):
                        raise ValidationError(_('Parameter {} must be a string').format(key))
                elif param_type == 'number':
                    if not isinstance(value, (int, float)):
                        raise ValidationError(_('Parameter {} must be a number').format(key))
                elif param_type == 'boolean':
                    if not isinstance(value, bool):
                        raise ValidationError(_('Parameter {} must be a boolean').format(key))
                elif param_type == 'array':
                    if not isinstance(value, list):
                        raise ValidationError(_('Parameter {} must be an array').format(key))
                elif param_type == 'object':
                    if not isinstance(value, dict):
                        raise ValidationError(_('Parameter {} must be an object').format(key))
        return True