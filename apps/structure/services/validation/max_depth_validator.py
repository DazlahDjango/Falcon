from typing import Optional, Tuple
from uuid import UUID
from ...models.team import Team
class MaxDepthValidatorService:
    MAX_DEPARTMENT_DEPTH = 20
    MAX_TEAM_DEPTH = 10
    MAX_REPORTING_DEPTH = 15
    
    @staticmethod
    def validate_department_depth(parent_depth: int) -> bool:
        new_depth = parent_depth + 1 if parent_depth is not None else 0
        return new_depth <= MaxDepthValidatorService.MAX_DEPARTMENT_DEPTH
    
    @staticmethod
    def validate_team_depth(parent_team_id: Optional[UUID], tenant_id: UUID) -> bool:
        if not parent_team_id:
            return True
        def get_team_depth(team_id: UUID, current_depth: int = 0) -> int:
            team = Team.objects.filter(id=team_id, tenant_id=tenant_id).first()
            if not team or not team.parent_team_id:
                return current_depth
            return get_team_depth(team.parent_team_id, current_depth + 1)
        parent_depth = get_team_depth(parent_team_id)
        new_depth = parent_depth + 1
        return new_depth <= MaxDepthValidatorService.MAX_TEAM_DEPTH
    
    @staticmethod
    def validate_reporting_depth(employee_user_id: UUID, tenant_id: UUID) -> Tuple[bool, int]:
        from ...services.reporting.chain_service import ReportingChainService
        chain_service = ReportingChainService()
        current_depth = chain_service.get_management_level(employee_user_id, tenant_id)
        return current_depth + 1 <= MaxDepthValidatorService.MAX_REPORTING_DEPTH, current_depth
    
    @staticmethod
    def get_remaining_depth_capacity(parent_depth: int, max_depth: int = None) -> int:
        if max_depth is None:
            max_depth = MaxDepthValidatorService.MAX_DEPARTMENT_DEPTH
        return max_depth - (parent_depth + 1) if parent_depth is not None else max_depth