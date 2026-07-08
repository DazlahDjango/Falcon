from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class StructureException(Exception):
    pass

class ReportingChainError(StructureException):
    """Base exception for reporting chain errors."""
    def __init__(self, message=None):
        super().__init__(message or _("Reporting chain error occurred."))

class HierarchyCycleError(StructureException, ValidationError):
    def __init__(self, message=None, cycle_path=None):
        self.cycle_path = cycle_path or []
        super().__init__(message or _("Circular reference detected in hierarchy."))

class TenantMismatchError(StructureException, ValidationError):
    def __init__(self, message=None):
        super().__init__(message or _("Objects must belong to the same tenant."))

class SelfParentError(StructureException, ValidationError):
    def __init__(self, message=None):
        super().__init__(message or _("An object cannot be its own parent."))

class MaxDepthExceededError(StructureException):
    def __init__(self, depth, max_depth):
        super().__init__(_("Hierarchy depth {depth} exceeds maximum allowed {max_depth}.").format(depth=depth, max_depth=max_depth))

class PositionOccupiedError(StructureException, ValidationError):
    def __init__(self, position_code, incumbent_user_id):
        self.position_code = position_code
        self.incumbent_user_id = incumbent_user_id
        super().__init__(_("Position {code} is already occupied by user {user}.").format(code=position_code, user=incumbent_user_id))

class MaxIncumbentsExceededError(StructureException, ValidationError):
    def __init__(self, position_code, max_incumbents, current_count):
        self.position_code = position_code
        self.max_incumbents = max_incumbents
        self.current_count = current_count
        super().__init__(_("Position {code} maximum incumbents ({max}) exceeded. Current: {current}.").format(code=position_code, max=max_incumbents, current=current_count))

class EmploymentActiveError(StructureException, ValidationError):
    def __init__(self, user_id):
        self.user_id = user_id
        super().__init__(_("User {user} already has an active employment.").format(user=user_id))

class ReportingCycleExistsError(StructureException, ValidationError):
    def __init__(self, employee_id, manager_id):
        self.employee_id = employee_id
        self.manager_id = manager_id
        super().__init__(_("Reporting relationship {employee} -> {manager} already exists.").format(employee=employee_id, manager=manager_id))

class SelfReportingError(StructureException, ValidationError):
    def __init__(self):
        super().__init__(_("An employee cannot report to themselves."))

class DeleteWithChildrenError(StructureException, ValidationError):
    def __init__(self, object_name, object_id, child_count):
        self.object_name = object_name
        self.object_id = object_id
        self.child_count = child_count
        super().__init__(_("Cannot delete {name} {id} because it has {count} children.").format(name=object_name, id=object_id, count=child_count))

class InvalidDateRangeError(StructureException, ValidationError):
    def __init__(self, from_date, to_date):
        self.from_date = from_date
        self.to_date = to_date
        super().__init__(_("Start date {from_date} cannot be after end date {to_date}.").format(from_date=from_date, to_date=to_date))

class BudgetExceededError(StructureException, ValidationError):
    def __init__(self, cost_center_code, requested, available):
        self.cost_center_code = cost_center_code
        self.requested = requested
        self.available = available
        super().__init__(_("Budget exceeded for cost center {code}. Requested: {req}, Available: {avail}.").format(code=cost_center_code, req=requested, avail=available))

class HeadcountLimitExceededError(StructureException):
    def __init__(self, unit_code, limit, current):
        self.unit_code = unit_code
        self.limit = limit
        self.current = current
        super().__init__(_("Headcount limit {limit} exceeded for unit {unit}. Current: {current}.").format(limit=limit, unit=unit_code, current=current))

class InvalidHierarchyOperationError(StructureException):
    def __init__(self, operation, reason):
        self.operation = operation
        self.reason = reason
        super().__init__(_("Invalid hierarchy operation '{op}': {reason}.").format(op=operation, reason=reason))

class VersionNotFoundError(StructureException):
    def __init__(self, version_id):
        self.version_id = version_id
        super().__init__(_("Hierarchy version {id} not found.").format(id=version_id))

class SnapshotHashCollisionError(StructureException):
    def __init__(self, snapshot_hash):
        self.snapshot_hash = snapshot_hash
        super().__init__(_("Snapshot hash collision detected: {hash}.").format(hash=snapshot_hash))

class InvalidLevelError(StructureException):
    def __init__(self, level):
        self.level = level
        super().__init__(_("Invalid organization level: {level}.").format(level=level))

class InterimAssignmentError(StructureException):
    def __init__(self, message):
        super().__init__(message)

class EmploymentNotFoundError(StructureException):
    def __init__(self, user_id):
        self.user_id = user_id
        super().__init__(_("Employment not found for user: {user}.").format(user=user_id))