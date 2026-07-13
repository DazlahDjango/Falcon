# pyrefly: ignore [missing-import]
from django.core.exceptions import ValidationError
from apps.structure.constants import MAX_ORG_DEPTH, PARENT_LEVEL_MAP, LEVEL_ORDER
from apps.structure.exceptions import MaxDepthExceededError, InvalidLevelError, TenantMismatchError

class OrgValidator:
    def validate_hierarchy(self, node, parent, tenant_id):
        if parent and parent.tenant_id != tenant_id:
            raise TenantMismatchError()
        if parent and parent.id == node.id:
            raise ValidationError("Cannot set self as parent.")
        if parent and parent.depth >= MAX_ORG_DEPTH - 1:
            raise MaxDepthExceededError(parent.depth + 1, MAX_ORG_DEPTH)
        if parent and PARENT_LEVEL_MAP.get(node.level) != parent.level:
            raise InvalidLevelError(node.level)
        if node.level not in LEVEL_ORDER:
            raise InvalidLevelError(node.level)
        return True

    def validate_path(self, node, path):
        if not path:
            return True
        parts = path.split('/')
        if len(parts) > MAX_ORG_DEPTH:
            raise MaxDepthExceededError(len(parts), MAX_ORG_DEPTH)
        return True

    def validate_unique_code(self, model_class, tenant_id, code, exclude_id=None):
        queryset = model_class.objects.filter(tenant_id=tenant_id, code=code, is_deleted=False)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        if queryset.exists():
            raise ValidationError(f"Code '{code}' already exists in this tenant.")
        return True

    def validate_unique_path(self, model_class, tenant_id, path, exclude_id=None):
        queryset = model_class.objects.filter(tenant_id=tenant_id, path=path, is_deleted=False)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        if queryset.exists():
            raise ValidationError(f"Path '{path}' already exists in this tenant.")
        return True

    def validate_level_consistency(self, node):
        if node.parent and node.parent.level != PARENT_LEVEL_MAP.get(node.level):
            raise InvalidLevelError(f"Parent must be at {PARENT_LEVEL_MAP.get(node.level)} level.")
        return True

    def validate_depth_consistency(self, node):
        expected_depth = node.parent.depth + 1 if node.parent else 0
        if node.depth != expected_depth:
            raise ValidationError(f"Depth mismatch. Expected: {expected_depth}, Got: {node.depth}")
        return True

    def validate_org_integrity(self, tenant_id):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        errors = []
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        for unit in units:
            try:
                self.validate_level_consistency(unit)
                self.validate_depth_consistency(unit)
                self.validate_unique_path(OrganizationalUnit, tenant_id, unit.path, unit.id)
            except ValidationError as e:
                errors.append({
                    'id': str(unit.id),
                    'code': unit.code,
                    'level': unit.level,
                    'error': str(e)
                })
        return errors

    def validate_all_levels_present(self, tenant_id):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        from apps.structure.enums.org_level import OrgLevel
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        levels_present = set(units.values_list('level', flat=True))
        for level in [OrgLevel.DIVISION, OrgLevel.DEPARTMENT, OrgLevel.SECTION, OrgLevel.UNIT]:
            if level not in levels_present:
                return False
        return True