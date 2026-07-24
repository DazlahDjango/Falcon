# apps/reportplt/services/security/data_masking.py
import re
import hashlib
from typing import Any, Dict, List, Optional, Callable
from enum import Enum
from django.utils.translation import gettext_lazy as _

class MaskingLevel(Enum):
    NONE = 'none'
    PARTIAL = 'partial'
    FULL = 'full'
    CUSTOM = 'custom'

class MaskingType(Enum):
    EMAIL = 'email'
    PHONE = 'phone'
    NAME = 'name'
    ID_NUMBER = 'id_number'
    FINANCIAL = 'financial'
    SENSITIVE = 'sensitive'
    CUSTOM = 'custom'

class MaskingRule:
    def __init__(self, field_name: str, masking_type: MaskingType, level: MaskingLevel = MaskingLevel.PARTIAL, custom_function: Optional[Callable] = None):
        self.field_name = field_name
        self.masking_type = masking_type
        self.level = level
        self.custom_function = custom_function

    def apply(self, value: Any) -> Any:
        if value is None:
            return None
        if self.custom_function:
            return self.custom_function(value)
        if self.masking_type == MaskingType.EMAIL:
            return self._mask_email(value)
        if self.masking_type == MaskingType.PHONE:
            return self._mask_phone(value)
        if self.masking_type == MaskingType.NAME:
            return self._mask_name(value)
        if self.masking_type == MaskingType.ID_NUMBER:
            return self._mask_id_number(value)
        if self.masking_type == MaskingType.FINANCIAL:
            return self._mask_financial(value)
        if self.masking_type == MaskingType.SENSITIVE:
            return self._mask_sensitive(value)
        return value

    def _mask_email(self, email: str) -> str:
        if self.level == MaskingLevel.NONE:
            return email
        if self.level == MaskingLevel.FULL:
            return '***@***.***'
        parts = email.split('@')
        if len(parts) != 2:
            return email
        username, domain = parts
        if len(username) <= 2:
            masked_username = username[0] + '*' * len(username[1:])
        else:
            masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
        domain_parts = domain.split('.')
        if len(domain_parts) >= 2:
            masked_domain = domain_parts[0][0] + '*' * (len(domain_parts[0]) - 1) + '.' + '.'.join(domain_parts[1:])
        else:
            masked_domain = domain
        return f"{masked_username}@{masked_domain}"

    def _mask_phone(self, phone: str) -> str:
        if self.level == MaskingLevel.NONE:
            return phone
        if self.level == MaskingLevel.FULL:
            return '***-***-****'
        digits = re.sub(r'\D', '', phone)
        if len(digits) <= 4:
            return '*' * len(digits)
        visible = digits[-4:]
        masked = '*' * (len(digits) - 4) + visible
        for i, char in enumerate(phone):
            if char.isdigit():
                phone = phone[:i] + masked[0] + phone[i+1:]
                masked = masked[1:]
        return phone

    def _mask_name(self, name: str) -> str:
        if self.level == MaskingLevel.NONE:
            return name
        if self.level == MaskingLevel.FULL:
            return '*' * len(name)
        parts = name.split()
        if len(parts) <= 1:
            if len(name) <= 2:
                return name[0] + '*' * (len(name) - 1)
            return name[0] + '*' * (len(name) - 2) + name[-1]
        return ' '.join([p[0] + '*' * (len(p) - 1) if len(p) > 1 else p for p in parts])

    def _mask_id_number(self, value: str) -> str:
        if self.level == MaskingLevel.NONE:
            return value
        if self.level == MaskingLevel.FULL:
            return '*' * len(value)
        if len(value) <= 4:
            return '*' * len(value)
        return '*' * (len(value) - 4) + value[-4:]

    def _mask_financial(self, value: Any) -> str:
        if self.level == MaskingLevel.NONE:
            return value
        if isinstance(value, (int, float)):
            if self.level == MaskingLevel.FULL:
                return '****'
            str_val = str(value)
            if len(str_val) <= 4:
                return '*' * len(str_val)
            return '*' * (len(str_val) - 2) + str_val[-2:]
        return value

    def _mask_sensitive(self, value: str) -> str:
        if self.level == MaskingLevel.NONE:
            return value
        return '*' * len(value) if isinstance(value, str) else '***'

class DataMasking:
    def __init__(self, rules: Optional[List[MaskingRule]] = None):
        self.rules = rules or []
        self._compiled_rules = {}

    def add_rule(self, rule: MaskingRule):
        self.rules.append(rule)
        self._compiled_rules.clear()

    def add_rules(self, rules: List[MaskingRule]):
        self.rules.extend(rules)
        self._compiled_rules.clear()

    def mask_data(self, data: Any) -> Any:
        if data is None:
            return None
        if isinstance(data, dict):
            return self._mask_dict(data)
        if isinstance(data, list):
            return [self.mask_data(item) for item in data]
        if isinstance(data, (str, int, float, bool)):
            return data
        if hasattr(data, '_meta'):
            return self._mask_model(data)
        return data

    def _mask_dict(self, data: Dict) -> Dict:
        result = {}
        for key, value in data.items():
            rule = self._get_rule_for_field(key)
            if rule:
                result[key] = rule.apply(value)
            elif isinstance(value, dict):
                result[key] = self._mask_dict(value)
            elif isinstance(value, list):
                result[key] = [self.mask_data(item) for item in value]
            else:
                result[key] = value
        return result

    def _mask_model(self, model):
        data = {}
        for field in model._meta.fields:
            value = getattr(model, field.name, None)
            rule = self._get_rule_for_field(field.name)
            if rule:
                data[field.name] = rule.apply(value)
            else:
                data[field.name] = value
        return data

    def _get_rule_for_field(self, field_name: str) -> Optional[MaskingRule]:
        if not self._compiled_rules:
            self._compiled_rules = {rule.field_name: rule for rule in self.rules}
        return self._compiled_rules.get(field_name)

    def mask_report_data(self, data: Dict, user_role: str, sensitive_fields: List[str] = None) -> Dict:
        if not sensitive_fields:
            sensitive_fields = ['email', 'phone', 'phone_number', 'id_number', 'employee_id', 'salary', 'financial']
        result = {}
        for key, value in data.items():
            if key in sensitive_fields and user_role not in ['super_admin', 'client_admin', 'executive']:
                result[key] = self._mask_sensitive_value(value)
            elif isinstance(value, dict):
                result[key] = self.mask_report_data(value, user_role, sensitive_fields)
            elif isinstance(value, list):
                result[key] = [self.mask_report_data(item, user_role, sensitive_fields) if isinstance(item, dict) else self._mask_sensitive_value(item) if key in sensitive_fields and user_role not in ['super_admin', 'client_admin', 'executive'] else item for item in value]
            else:
                result[key] = value
        return result

    def _mask_sensitive_value(self, value: Any) -> str:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return '****'
        if isinstance(value, str):
            if len(value) <= 4:
                return '*' * len(value)
            return '*' * (len(value) - 4) + value[-4:]
        return '***'

    def get_masked_fields(self, data: Dict, mask_all: bool = False) -> Dict:
        result = {}
        for key, value in data.items():
            if mask_all:
                result[key] = '***'
            elif isinstance(value, dict):
                result[key] = self.get_masked_fields(value, mask_all)
            elif isinstance(value, list):
                result[key] = ['***' for _ in value]
            else:
                result[key] = value
        return result

class DataMaskingService:
    def __init__(self):
        self.default_rules = [
            MaskingRule('email', MaskingType.EMAIL, MaskingLevel.PARTIAL),
            MaskingRule('phone', MaskingType.PHONE, MaskingLevel.PARTIAL),
            MaskingRule('phone_number', MaskingType.PHONE, MaskingLevel.PARTIAL),
            MaskingRule('id_number', MaskingType.ID_NUMBER, MaskingLevel.PARTIAL),
            MaskingRule('employee_id', MaskingType.ID_NUMBER, MaskingLevel.PARTIAL),
            MaskingRule('salary', MaskingType.FINANCIAL, MaskingLevel.FULL),
            MaskingRule('financial', MaskingType.FINANCIAL, MaskingLevel.FULL),
            MaskingRule('sensitive', MaskingType.SENSITIVE, MaskingLevel.FULL),
        ]

    def create_masker(self, custom_rules: Optional[List[MaskingRule]] = None) -> DataMasking:
        masker = DataMasking()
        masker.add_rules(self.default_rules)
        if custom_rules:
            masker.add_rules(custom_rules)
        return masker

    def mask_for_role(self, data: Dict, role: str) -> Dict:
        if role in ['super_admin', 'client_admin']:
            return data
        masker = self.create_masker()
        return masker.mask_data(data)

    def mask_for_executive(self, data: Dict) -> Dict:
        masker = DataMasking([
            MaskingRule('email', MaskingType.EMAIL, MaskingLevel.PARTIAL),
            MaskingRule('phone', MaskingType.PHONE, MaskingLevel.PARTIAL),
            MaskingRule('employee_id', MaskingType.ID_NUMBER, MaskingLevel.PARTIAL),
        ])
        return masker.mask_data(data)

    def mask_for_manager(self, data: Dict) -> Dict:
        masker = DataMasking([
            MaskingRule('email', MaskingType.EMAIL, MaskingLevel.PARTIAL),
            MaskingRule('phone', MaskingType.PHONE, MaskingLevel.PARTIAL),
            MaskingRule('id_number', MaskingType.ID_NUMBER, MaskingLevel.FULL),
            MaskingRule('salary', MaskingType.FINANCIAL, MaskingLevel.FULL),
        ])
        return masker.mask_data(data)

    def mask_for_staff(self, data: Dict) -> Dict:
        masker = DataMasking([
            MaskingRule('email', MaskingType.EMAIL, MaskingLevel.FULL),
            MaskingRule('phone', MaskingType.PHONE, MaskingLevel.FULL),
            MaskingRule('id_number', MaskingType.ID_NUMBER, MaskingLevel.FULL),
            MaskingRule('salary', MaskingType.FINANCIAL, MaskingLevel.FULL),
            MaskingRule('sensitive', MaskingType.SENSITIVE, MaskingLevel.FULL),
        ])
        return masker.mask_data(data)