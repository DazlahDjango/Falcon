from typing import Optional, Tuple
from uuid import UUID
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.constants import MAX_ORG_DEPTH

class MaxDepthValidatorService:
    MAX_ORG_DEPTH = 4
    MAX_REPORTING_DEPTH = 15
    
    @staticmethod
    def validate_org_depth(parent_depth: int) -> bool:
        new_depth = parent_depth + 1 if parent_depth is not None else 0
        return new_depth <= MaxDepthValidatorService.MAX_ORG_DEPTH
    
    @staticmethod
    def validate_org_unit_depth(parent_id: Optional[UUID], tenant_id: UUID) -> bool:
        if not parent_id:
            return True
        def get_unit_depth(unit_id: UUID, current_depth: int = 0) -> int:
            unit = OrganizationalUnit.objects.filter(id=unit_id, tenant_id=tenant_id, is_deleted=False).first()
            if not unit or not unit.parent_id:
                return current_depth
            return get_unit_depth(unit.parent_id, current_depth + 1)
        parent_depth = get_unit_depth(parent_id)
        new_depth = parent_depth + 1
        return new_depth <= MaxDepthValidatorService.MAX_ORG_DEPTH
    
    @staticmethod
    def validate_reporting_depth(employee_user_id: UUID, tenant_id: UUID) -> Tuple[bool, int]:
        from apps.structure.services.reporting.chain_service import ChainService
        chain_service = ChainService()
        current_depth = chain_service.get_reporting_depth(employee_user_id, tenant_id)
        return current_depth + 1 <= MaxDepthValidatorService.MAX_REPORTING_DEPTH, current_depth
    
    @staticmethod
    def get_remaining_depth_capacity(parent_depth: int, max_depth: int = None) -> int:
        if max_depth is None:
            max_depth = MaxDepthValidatorService.MAX_ORG_DEPTH
        return max_depth - (parent_depth + 1) if parent_depth is not None else max_depth
    
    @staticmethod
    def get_depth_level(depth: int) -> Optional[str]:
        from apps.structure.enums.org_level import OrgLevel
        level_map = {
            0: OrgLevel.DIVISION,
            1: OrgLevel.DEPARTMENT,
            2: OrgLevel.SECTION,
            3: OrgLevel.UNIT
        }
        return level_map.get(depth)