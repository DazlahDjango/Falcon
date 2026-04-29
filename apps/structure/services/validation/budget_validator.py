from typing import Optional, Tuple
from uuid import UUID
from ...models.department import Department

class BudgetValidatorService:
    @staticmethod
    def validate_cost_center_budget(cost_center_id: UUID, requested_amount: float, tenant_id: UUID) -> Tuple[bool, Optional[str]]:
        from ...models.cost_center import CostCenter
        cost_center = CostCenter.objects.filter(id=cost_center_id, tenant_id=tenant_id).first()
        if not cost_center:
            return False, "Cost center not found."
        if cost_center.budget_amount is None:
            return True, None
        current_usage = BudgetValidatorService._get_current_budget_usage(cost_center_id, tenant_id)
        if current_usage + requested_amount > cost_center.budget_amount:
            return False, f"Budget exceeded. Available: {cost_center.budget_amount - current_usage}, Requested: {requested_amount}"
        return True, None
    
    @staticmethod
    def validate_allocation_sum(department_id: UUID, tenant_id: UUID) -> Tuple[bool, float]:
        from ...models.cost_center import CostCenter
        cost_centers = CostCenter.objects.filter(
            parent__id=department_id,
            tenant_id=tenant_id,
            is_active=True,
            is_deleted=False
        )
        total_allocation = sum(cc.allocation_percentage or 0 for cc in cost_centers)
        is_valid = abs(total_allocation - 100.0) <= 0.01
        return is_valid, total_allocation
    
    @staticmethod
    def _get_current_budget_usage(cost_center_id: UUID, tenant_id: UUID) -> float:
        from ...models.employment import Employment
        # Aggregate budgets from linked departments/employments
        departments = Department.objects.filter(
            cost_center_id=cost_center_id,
            tenant_id=tenant_id,
            is_deleted=False
        )
        # This would integrate with actual budget tracking module
        # For now returning 0
        return 0.0
