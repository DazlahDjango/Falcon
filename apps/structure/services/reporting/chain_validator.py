from django.db import models
from apps.structure.models.employment import Employment
from apps.structure.models.reporting_line import ReportingLine
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.exceptions import ReportingChainError

class ChainValidator:
    def validate_chain(self, employee_id):
        visited = set()
        current = employee_id
        chain = []
        while current:
            if str(current) in visited:
                raise ReportingChainError(f"Circular reference detected in reporting chain for employee {current}")
            visited.add(str(current))
            reporting_line = ReportingLine.objects.filter(employee_id=current, is_active=True, is_deleted=False).first()
            if not reporting_line:
                break
            interim = InterimAssignment.objects.current_by_employee(current).first()
            if interim:
                chain.append({
                    'employee_id': str(current),
                    'manager_id': str(interim.interim_manager_id),
                    'is_interim': True,
                    'interim_id': str(interim.id)
                })
                current = interim.interim_manager_id
            else:
                chain.append({
                    'employee_id': str(current),
                    'manager_id': str(reporting_line.manager_id),
                    'is_interim': False,
                    'interim_id': None
                })
                current = reporting_line.manager_id
        return chain

    def validate_all_chains(self, tenant_id):
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        )
        errors = []
        for emp in employments:
            try:
                self.validate_chain(emp.id)
            except ReportingChainError as e:
                errors.append({
                    'employee_id': str(emp.user_id),
                    'error': str(e)
                })
        return errors

    def validate_chain_integrity(self, employee_id):
        chain = self.validate_chain(employee_id)
        for node in chain:
            if node['employee_id'] == node['manager_id']:
                raise ReportingChainError(f"Self-reporting detected for employee {node['employee_id']}")
        return True

    def get_chain_depth(self, employee_id):
        chain = self.validate_chain(employee_id)
        return len(chain)

    def validate_manager_employment(self, manager_id):
        employment = Employment.objects.get(id=manager_id, is_deleted=False)
        if not employment.is_current or not employment.is_active:
            raise ReportingChainError(f"Manager {manager_id} is not currently employed.")
        return True

    def validate_employee_employment(self, employee_id):
        employment = Employment.objects.get(id=employee_id, is_deleted=False)
        if not employment.is_current or not employment.is_active:
            raise ReportingChainError(f"Employee {employee_id} is not currently employed.")
        return True

    def validate_tenant_consistency(self, employee_id, manager_id):
        employee = Employment.objects.get(id=employee_id, is_deleted=False)
        manager = Employment.objects.get(id=manager_id, is_deleted=False)
        if employee.tenant_id != manager.tenant_id:
            raise ReportingChainError("Employee and manager must belong to same tenant.")
        return True

    def get_chain_issues(self, tenant_id):
        issues = []
        errors = self.validate_all_chains(tenant_id)
        if errors:
            issues.extend(errors)
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_active=True, is_deleted=False)
        for emp in employments:
            reporting_line = ReportingLine.objects.filter(employee=emp, is_active=True, is_deleted=False).first()
            if not reporting_line:
                issues.append({
                    'employee_id': str(emp.user_id),
                    'error': 'No reporting line assigned'
                })
        return issues