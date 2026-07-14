from django.db import transaction
from django.utils import timezone
from apps.structure.models.employment import Employment
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.models.employment import Employment
from apps.structure.exceptions import ReportingChainError, EmploymentNotFoundError

class DelegationService:
    def delegate_authority(self, delegator_id, delegatee_id, effective_from, effective_to, reason=''):
        with transaction.atomic():
            delegator = Employment.objects.get(id=delegator_id, is_deleted=False)
            delegatee = Employment.objects.get(id=delegatee_id, is_deleted=False)
            if delegator.user_id == delegatee.user_id:
                raise ReportingChainError("Cannot delegate to self.")
            if not delegator.is_manager:
                raise ReportingChainError("Delegator must be a manager.")
            employment = Employment.objects.filter(manager=delegator, is_active=True, is_deleted=False)
            for rl in employment:
                InterimAssignment.objects.create(
                    tenant_id=delegator.tenant_id,
                    employee=rl.employee,
                    interim_manager=delegatee,
                    effective_from=effective_from,
                    effective_to=effective_to,
                    reason=f"Delegation: {reason}",
                    is_active=True,
                    approved_at=timezone.now()
                )
            return True

    def revoke_delegation(self, delegator_id):
        with transaction.atomic():
            delegator = Employment.objects.get(id=delegator_id, is_deleted=False)
            assignments = InterimAssignment.objects.filter(
                interim_manager=delegator,
                is_active=True,
                is_deleted=False
            )
            for assignment in assignments:
                assignment.is_active = False
                assignment.effective_to = timezone.now().date()
                assignment.save()
            return True

    def get_active_delegations(self, delegator_id):
        delegator = Employment.objects.get(id=delegator_id, is_deleted=False)
        return InterimAssignment.objects.filter(
            interim_manager=delegator,
            is_active=True,
            is_deleted=False
        )

    def get_delegated_employees(self, delegator_id):
        assignments = self.get_active_delegations(delegator_id)
        return [a.employee for a in assignments]

    def get_delegation_chain(self, employee_id):
        chain = []
        current = employee_id
        while current:
            assignment = InterimAssignment.objects.current_by_employee(current).first()
            if not assignment:
                break
            chain.append({
                'employee_id': str(assignment.employee.id),
                'interim_manager_id': str(assignment.interim_manager.id),
                'effective_from': assignment.effective_from.isoformat(),
                'effective_to': assignment.effective_to.isoformat()
            })
            current = assignment.interim_manager.id
        return chain

    def extend_delegation(self, delegator_id, new_end_date):
        with transaction.atomic():
            assignments = InterimAssignment.objects.filter(
                interim_manager_id=delegator_id,
                is_active=True,
                is_deleted=False
            )
            count = 0
            for assignment in assignments:
                assignment.effective_to = new_end_date
                assignment.save()
                count += 1
            return count

    def get_delegation_stats(self, delegator_id):
        active = self.get_active_delegations(delegator_id)
        total_employees = active.count()
        return {
            'active_delegations': total_employees,
            'employee_ids': [str(a.employee.user_id) for a in active],
            'earliest_start': active.order_by('effective_from').first().effective_from if active.exists() else None,
            'latest_end': active.order_by('-effective_to').first().effective_to if active.exists() else None
        }