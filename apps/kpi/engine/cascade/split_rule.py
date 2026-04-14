from decimal import Decimal

class SplitRules:
    def calculate_target(self, parent_target: Decimal, rule, entity_id: str, entity_type: str) -> Decimal:
        rule_type = rule.rule_type
        if rule_type == 'EQUAL_SPLIT':
            return self._equal_split(parent_target, entity_type, entity_id)
        elif rule_type == 'WEIGHTED':
            return self._weighted_by_headcount(parent_target, entity_type, entity_id)
        elif rule_type == 'WEIGHTED_BY_BUDGET':
            return self._weighted_by_budget(parent_target, entity_type, entity_id)
        elif rule_type == 'CUSTOM':
            return self._custom_split(parent_target, rule, entity_id)
        return self._equal_split(parent_target, entity_type, entity_id)
    def _equal_split(self, parent_target: Decimal, entity_type: str, entity_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_count = self._get_department_count()
        else:
            total_count = self._get_user_count(entity_id)
        if total_count == 0:
            return Decimal('0')
        return parent_target / total_count
    def _weighted_by_headcount(self, parent_target: Decimal, entity_type: str, entity_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_headcount = self._get_total_employees()
            dept_headcount = self._get_department_headcount(entity_id)
            if total_headcount == 0:
                return Decimal('0')
            return parent_target * (dept_headcount / total_headcount)
        else:
            return self._equal_split(parent_target, entity_type, entity_id)
    def _weighted_by_budget(self, parent_target: Decimal, entity_type: str, entity_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_budget = self._get_total_budget()
            dept_budget = self._get_department_budget(entity_id)
            if total_budget == 0:
                return Decimal('0')
            return parent_target * (dept_budget / total_budget)
        else:
            return self._equal_split(parent_target, entity_type, entity_id)
    def _custom_split(self, parent_target: Decimal, rule, entity_id: str) -> Decimal:
        config = rule.configuration
        custom_weights = config.get('weights', {})
        if entity_id in custom_weights:
            weight = Decimal(str(custom_weights[entity_id]))
            return parent_target * (weight / 100)
        return self._equal_split(parent_target, 'INDIVIDUAL', entity_id)
    def _get_department_count(self) -> int:
        from apps.organisations.models import Department
        return Department.objects.filter(is_active=True).count()
    def _get_user_count(self, department_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(department_id=department_id, is_active=True).count()
    def _get_total_employees(self) -> int:
        from apps.accounts.models import User
        return User.objects.filter(is_active=True).count()
    def _get_department_headcount(self, department_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(department_id=department_id, is_active=True).count()
    def _get_total_budget(self) -> Decimal:
        return Decimal('1000000')
    def _get_department_budget(self, department_id: str) -> Decimal:
        return Decimal('100000')