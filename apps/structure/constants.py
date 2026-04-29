from django.db import models
from django.utils.translation import gettext_lazy as _

class DepartmentSensitivity(models.TextChoices):
    PUBLIC = 'public', _('Public')
    INTERNAL = 'internal', _('Internal')
    CONFIDENTIAL = 'confidential', _('Confidential')
    RESTRICTED = 'restricted', _('Restricted')

class EmploymentType(models.TextChoices):
    PERMANENT = 'permanent', _('Permanent')
    CONTRACT = 'contract', _('Contract')
    PROBATION = 'probation', _('Probation')
    INTERN = 'intern', _('Intern')
    CONSULTANT = 'consultant', _('Consultant')
    TEMPORARY = 'temporary', _('Temporary')

class ReportingRelationType(models.TextChoices):
    SOLID = 'solid', _('Solid Line (Direct Manager)')
    DOTTED = 'dotted', _('Dotted Line (Functional Lead)')
    INTERIM = 'interim', _('Interim/Temporary')
    PROJECT = 'project', _('Project-Based')
    MATRIX = 'matrix', _('Matrix Manager')

class CostCenterCategory(models.TextChoices):
    OPERATIONAL = 'operational', _('Operational')
    CAPITAL = 'capital', _('Capital')
    PROJECT = 'project', _('Project')
    DEPARTMENTAL = 'departmental', _('Departmental')
    SHARED = 'shared', _('Shared Service')

class LocationType(models.TextChoices):
    HEADQUARTERS = 'headquarters', _('Headquarters')
    REGIONAL = 'regional', _('Regional Office')
    BRANCH = 'branch', _('Branch Office')
    REMOTE = 'remote', _('Remote Hub')
    SATELLITE = 'satellite', _('Satellite Office')

class HierarchyVersionType(models.TextChoices):
    AUTO = 'auto', _('Auto-saved')
    MANUAL = 'manual', _('Manual Snapshot')
    RESTRUCTURE = 'restructure', _('Reorganization')
    YEARLY = 'yearly', _('Yearly Archive')
    ACQUISITION = 'acquisition', _('Merger/Acquisition')

class EmploymentStatus(models.TextChoices):
    ACTIVE = 'active', _('Active')
    INACTIVE = 'inactive', _('Inactive')
    SUSPENDED = 'suspended', _('Suspended')
    TERMINATED = 'terminated', _('Terminated')
    RESIGNED = 'resigned', _('Resigned')
    ON_LEAVE = 'on_leave', _('On Leave')

# Default values
DEFAULT_MAX_HIERARCHY_DEPTH = 20
DEFAULT_MAX_DIRECT_REPORTS = 50
DEFAULT_HEADCOUNT_LIMIT = 1000
DEFAULT_BUDGET_AMOUNT = 0.00
DEFAULT_ALLOCATION_PERCENTAGE = 100.00
DEFAULT_REPORTING_WEIGHT = 1.00
DEFAULT_MAX_CACHE_TTL_SECONDS = 3600
DEFAULT_HIERARCHY_VERSION_KEEP_COUNT = 10
DEFAULT_MANAGEMENT_CHAIN_MAX_DEPTH = 10
DEFAULT_TEAM_MAX_MEMBERS = 100

# Error messages
ERROR_CIRCULAR_REFERENCE = _("Cannot create circular reference in hierarchy.")
ERROR_SELF_PARENT = _("Cannot set an object as its own parent.")
ERROR_TENANT_MISMATCH = _("Related object must belong to the same tenant.")
ERROR_SELF_MANAGER = _("A user cannot be their own manager.")
ERROR_INVALID_DATE_RANGE = _("Effective from date cannot be after effective to date.")
ERROR_POSITION_OCCUPIED = _("Position is already occupied and is single-incumbent.")
ERROR_MAX_INCUMBENTS_EXCEEDED = _("Maximum incumbents for this position has been exceeded.")
ERROR_EMPLOYMENT_ACTIVE = _("User already has an active employment.")
ERROR_REPORTING_CYCLE = _("Reporting cycle already exists for this relationship.")
ERROR_DELETE_WITH_CHILDREN = _("Cannot delete object with existing children.")
ERROR_INVALID_WEIGHT = _("Reporting weight must be between 0 and 1.")
ERROR_BUDGET_EXCEEDED = _("Budget allocation exceeds available budget.")

# Cache keys
CACHE_KEY_DEPARTMENT_TREE = "structure:dept_tree:{tenant_id}"
CACHE_KEY_TEAM_TREE = "structure:team_tree:{tenant_id}:{department_id}"
CACHE_KEY_REPORTING_CHAIN_UP = "structure:reporting_up:{tenant_id}:{user_id}"
CACHE_KEY_REPORTING_CHAIN_DOWN = "structure:reporting_down:{tenant_id}:{user_id}"
CACHE_KEY_EMPLOYMENT_CURRENT = "structure:employment:{tenant_id}:{user_id}"
CACHE_KEY_MANAGER_OF = "structure:manager_of:{tenant_id}:{manager_id}:{employee_id}"
CACHE_KEY_ORG_TREE = "structure:org_tree:{tenant_id}"