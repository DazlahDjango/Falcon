# apps/reportplt/services/filters/saved_filter.py
import uuid
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.reportplt.models import ReportFilter
from apps.reportplt.exceptions import FilterError, ReportPermissionError
from apps.accounts.models import User

class SavedFilterManager:
    def __init__(self, user: Optional[User] = None):
        self.user = user

    def save_filter(self, name: str, filter_type: str, config: Dict, values: Dict = None, is_global: bool = False) -> ReportFilter:
        if not name:
            raise ValidationError("Filter name is required")
        if not filter_type:
            raise ValidationError("Filter type is required")
        if self._filter_exists(name):
            raise ValidationError(f"Filter with name '{name}' already exists")
        saved_filter = ReportFilter(
            tenant_id=self.user.tenant_id if self.user else None,
            name=name,
            filter_type=filter_type,
            owner=self.user,
            is_global=is_global,
            is_system=False,
            is_default=False,
            config=config,
            values=values or {},
            display_label=config.get('label', name),
            placeholder=config.get('placeholder', ''),
            help_text=config.get('help_text', ''),
            required=config.get('required', False),
            multiple=config.get('multiple', False),
            options=config.get('options', []),
            default_values=config.get('default_values', []),
            validation=config.get('validation', {}),
            dependencies=config.get('dependencies', [])
        )
        saved_filter.full_clean()
        saved_filter.save()
        return saved_filter

    def get_saved_filter(self, filter_id: uuid.UUID) -> ReportFilter:
        try:
            return ReportFilter.objects.get(id=filter_id)
        except ReportFilter.DoesNotExist:
            raise FilterError(f"Filter with ID {filter_id} not found")

    def get_saved_filters(self, filter_type: Optional[str] = None, include_global: bool = True) -> List[ReportFilter]:
        qs = ReportFilter.objects.all()
        if self.user:
            qs = qs.filter(tenant_id=self.user.tenant_id)
        if filter_type:
            qs = qs.filter(filter_type=filter_type)
        if include_global:
            qs = qs.filter(Q(owner=self.user) | Q(is_global=True))
        else:
            qs = qs.filter(owner=self.user)
        return qs

    def get_global_filters(self, filter_type: Optional[str] = None) -> List[ReportFilter]:
        qs = ReportFilter.objects.filter(is_global=True)
        if self.user:
            qs = qs.filter(tenant_id=self.user.tenant_id)
        if filter_type:
            qs = qs.filter(filter_type=filter_type)
        return qs

    def get_user_filters(self, filter_type: Optional[str] = None) -> List[ReportFilter]:
        if not self.user:
            return []
        qs = ReportFilter.objects.filter(owner=self.user)
        if filter_type:
            qs = qs.filter(filter_type=filter_type)
        return qs

    def update_saved_filter(self, filter_id: uuid.UUID, data: Dict) -> ReportFilter:
        saved_filter = self.get_saved_filter(filter_id)
        if self.user and saved_filter.owner and saved_filter.owner.id != self.user.id and not saved_filter.is_global:
            raise ReportPermissionError("You do not have permission to update this filter")
        if saved_filter.is_system:
            raise ReportPermissionError("System filters cannot be modified")
        for key, value in data.items():
            if hasattr(saved_filter, key) and key not in ['id', 'created_at', 'updated_at']:
                setattr(saved_filter, key, value)
        saved_filter.full_clean()
        saved_filter.save()
        return saved_filter

    def delete_saved_filter(self, filter_id: uuid.UUID) -> bool:
        saved_filter = self.get_saved_filter(filter_id)
        if self.user and saved_filter.owner and saved_filter.owner.id != self.user.id and not saved_filter.is_global:
            raise ReportPermissionError("You do not have permission to delete this filter")
        if saved_filter.is_system:
            raise ReportPermissionError("System filters cannot be deleted")
        saved_filter.soft_delete()
        return True

    def set_default_filter(self, filter_id: uuid.UUID) -> ReportFilter:
        saved_filter = self.get_saved_filter(filter_id)
        if self.user and saved_filter.owner and saved_filter.owner.id != self.user.id:
            raise ReportPermissionError("You do not have permission to set this as default")
        with transaction.atomic():
            ReportFilter.objects.filter(
                tenant_id=saved_filter.tenant_id,
                owner=self.user,
                filter_type=saved_filter.filter_type,
                is_default=True
            ).update(is_default=False)
            saved_filter.is_default = True
            saved_filter.save(update_fields=['is_default'])
        return saved_filter

    def apply_saved_filter(self, filter_id: uuid.UUID, queryset, values: Optional[Dict] = None) -> Any:
        saved_filter = self.get_saved_filter(filter_id)
        if not saved_filter.is_accessible_by(self.user):
            raise ReportPermissionError("You do not have permission to use this filter")
        from .filter_engine import FilterEngine
        engine = FilterEngine()
        filter_def = {
            'name': saved_filter.name,
            'type': saved_filter.filter_type,
            'field': saved_filter.config.get('field'),
            'required': saved_filter.required,
            'validation': saved_filter.validation,
            'options': saved_filter.options
        }
        engine.add_filter(filter_def)
        filter_values = values or saved_filter.values
        return engine.apply(queryset, filter_values)

    def duplicate_filter(self, filter_id: uuid.UUID, new_name: Optional[str] = None) -> ReportFilter:
        saved_filter = self.get_saved_filter(filter_id)
        if not new_name:
            new_name = f"{saved_filter.name} (Copy)"
        if self._filter_exists(new_name):
            raise ValidationError(f"Filter with name '{new_name}' already exists")
        new_filter = ReportFilter(
            tenant_id=saved_filter.tenant_id,
            name=new_name,
            filter_type=saved_filter.filter_type,
            owner=self.user or saved_filter.owner,
            is_global=False,
            is_system=False,
            is_default=False,
            config=saved_filter.config,
            values=saved_filter.values,
            display_label=saved_filter.display_label,
            placeholder=saved_filter.placeholder,
            help_text=saved_filter.help_text,
            required=saved_filter.required,
            multiple=saved_filter.multiple,
            options=saved_filter.options,
            default_values=saved_filter.default_values,
            validation=saved_filter.validation,
            dependencies=saved_filter.dependencies
        )
        new_filter.full_clean()
        new_filter.save()
        return new_filter

    def _filter_exists(self, name: str) -> bool:
        qs = ReportFilter.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            name=name
        )
        if self.user:
            qs = qs.filter(Q(owner=self.user) | Q(is_global=True))
        return qs.exists()

    def get_filter_values(self, filter_id: uuid.UUID) -> Dict:
        saved_filter = self.get_saved_filter(filter_id)
        return saved_filter.values

    def update_filter_values(self, filter_id: uuid.UUID, values: Dict) -> ReportFilter:
        saved_filter = self.get_saved_filter(filter_id)
        if self.user and saved_filter.owner and saved_filter.owner.id != self.user.id and not saved_filter.is_global:
            raise ReportPermissionError("You do not have permission to update this filter")
        saved_filter.values = values
        saved_filter.save(update_fields=['values'])
        return saved_filter

    def get_filter_by_name(self, name: str) -> Optional[ReportFilter]:
        qs = ReportFilter.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            name=name
        )
        if self.user:
            qs = qs.filter(Q(owner=self.user) | Q(is_global=True))
        return qs.first()

    def get_filter_options(self, filter_id: uuid.UUID) -> List[Dict]:
        saved_filter = self.get_saved_filter(filter_id)
        return saved_filter.get_options()

    def validate_filter_values(self, filter_id: uuid.UUID, values: Dict) -> bool:
        saved_filter = self.get_saved_filter(filter_id)
        for key, value in values.items():
            if saved_filter.required and (value is None or value == '' or value == []):
                raise ValidationError(f"Filter {key} is required")
            if saved_filter.options and value not in saved_filter.options:
                if not saved_filter.multiple or (saved_filter.multiple and not all(v in saved_filter.options for v in value)):
                    raise ValidationError(f"Invalid option for filter {key}")
        return True

    def get_filters_by_type(self, filter_type: str) -> List[ReportFilter]:
        return self.get_saved_filters(filter_type=filter_type)

    def share_filter(self, filter_id: uuid.UUID, user_id: str) -> ReportFilter:
        saved_filter = self.get_saved_filter(filter_id)
        if self.user and saved_filter.owner and saved_filter.owner.id != self.user.id:
            raise ReportPermissionError("You do not have permission to share this filter")
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise FilterError(f"User with ID {user_id} not found")
        duplicate = self.duplicate_filter(filter_id, f"{saved_filter.name} (Shared)")
        duplicate.owner = target_user
        duplicate.is_global = False
        duplicate.save(update_fields=['owner', 'is_global'])
        return duplicate