"""
Constants for Accounts app.
All system constants, choices, and predefined data.
"""

from django.utils.translation import gettext_lazy as _


# ============================================================================
# User Roles
# ============================================================================

class UserRoles:
    """User role constants."""
    SUPER_ADMIN = 'super_admin'
    CLIENT_ADMIN = 'client_admin'
    HR_ADMIN = 'hr_admin'
    EXECUTIVE = 'executive'
    SUPERVISOR = 'supervisor'
    STAFF = 'staff'
    READ_ONLY = 'read_only'
    
    ALL = [
        SUPER_ADMIN,
        CLIENT_ADMIN,
        HR_ADMIN,
        EXECUTIVE,
        SUPERVISOR,
        STAFF,
        READ_ONLY,
    ]
    
    CHOICES = [
        (SUPER_ADMIN, _('Super Admin')),
        (CLIENT_ADMIN, _('Client Admin')),
        (HR_ADMIN, _('HR Admin')),
        (EXECUTIVE, _('Executive')),
        (SUPERVISOR, _('Supervisor')),
        (STAFF, _('Staff')),
        (READ_ONLY, _('Read Only')),
    ]
    
    HIERARCHY = {
        SUPER_ADMIN: 0,
        CLIENT_ADMIN: 1,
        HR_ADMIN: 2,
        EXECUTIVE: 2,
        SUPERVISOR: 3,
        STAFF: 4,
        READ_ONLY: 5,
    }


# ============================================================================
# Permission Categories
# ============================================================================

class PermissionCategories:
    """Permission category constants."""
    KPI = 'kpi'
    REVIEW = 'review'
    USER = 'user'
    TENANT = 'tenant'
    REPORT = 'report'
    WORKFLOW = 'workflow'
    ADMIN = 'admin'
    
    CHOICES = [
        (KPI, _('KPI Management')),
        (REVIEW, _('Performance Review')),
        (USER, _('User Management')),
        (TENANT, _('Tenant Management')),
        (REPORT, _('Reports')),
        (WORKFLOW, _('Workflow')),
        (ADMIN, _('Administration')),
    ]


# ============================================================================
# Permission Levels
# ============================================================================

class PermissionLevels:
    """Permission level constants."""
    GLOBAL = 'global'
    TENANT = 'tenant'
    DEPARTMENT = 'department'
    TEAM = 'team'
    SELF = 'self'
    
    CHOICES = [
        (GLOBAL, _('Global')),
        (TENANT, _('Tenant')),
        (DEPARTMENT, _('Department')),
        (TEAM, _('Team')),
        (SELF, _('Self')),
    ]


# ============================================================================
# MFA Types
# ============================================================================

class MFATypes:
    """MFA device type constants."""
    TOTP = 'totp'
    SMS = 'sms'
    EMAIL = 'email'
    HARDWARE = 'hardware'
    BACKUP = 'backup'
    
    CHOICES = [
        (TOTP, _('TOTP Authenticator')),
        (SMS, _('SMS')),
        (EMAIL, _('Email')),
        (HARDWARE, _('Hardware Token')),
        (BACKUP, _('Backup Code')),
    ]


# ============================================================================
# Session Status
# ============================================================================

class SessionStatus:
    """Session status constants."""
    ACTIVE = 'active'
    EXPIRED = 'expired'
    LOGGED_OUT = 'logged_out'
    REVOKED = 'revoked'
    
    CHOICES = [
        (ACTIVE, _('Active')),
        (EXPIRED, _('Expired')),
        (LOGGED_OUT, _('Logged Out')),
        (REVOKED, _('Revoked')),
    ]


# ============================================================================
# Audit Severity
# ============================================================================

class AuditSeverity:
    """Audit log severity constants."""
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'
    
    CHOICES = [
        (INFO, _('Info')),
        (WARNING, _('Warning')),
        (ERROR, _('Error')),
        (CRITICAL, _('Critical')),
    ]


# ============================================================================
# Audit Action Types
# ============================================================================

class AuditActionTypes:
    """Audit action type constants."""
    CREATE = 'create'
    READ = 'read'
    UPDATE = 'update'
    DELETE = 'delete'
    LOGIN = 'login'
    LOGOUT = 'logout'
    APPROVE = 'approve'
    REJECT = 'reject'
    EXPORT = 'export'
    VIEW = 'view'
    SECURITY = 'security'
    
    CHOICES = [
        (CREATE, _('Create')),
        (READ, _('Read')),
        (UPDATE, _('Update')),
        (DELETE, _('Delete')),
        (LOGIN, _('Login')),
        (LOGOUT, _('Logout')),
        (APPROVE, _('Approve')),
        (REJECT, _('Reject')),
        (EXPORT, _('Export')),
        (VIEW, _('View')),
        (SECURITY, _('Security')),
    ]


# ============================================================================
# Login Attempt Results
# ============================================================================

class LoginResult:
    """Login attempt result constants."""
    SUCCESS = 'success'
    FAILURE = 'failure'
    LOCKED = 'locked'
    
    CHOICES = [
        (SUCCESS, _('Success')),
        (FAILURE, _('Failure')),
        (LOCKED, _('Locked')),
    ]


class LoginFailureReason:
    """Login failure reason constants."""
    WRONG_PASSWORD = 'wrong_password'
    USER_NOT_FOUND = 'user_not_found'
    ACCOUNT_LOCKED = 'account_locked'
    MFA_FAILED = 'mfa_failed'
    MFA_REQUIRED = 'mfa_required'
    INACTIVE = 'inactive'
    RATE_LIMIT = 'rate_limit'
    
    CHOICES = [
        (WRONG_PASSWORD, _('Wrong Password')),
        (USER_NOT_FOUND, _('User Not Found')),
        (ACCOUNT_LOCKED, _('Account Locked')),
        (MFA_FAILED, _('MFA Failed')),
        (MFA_REQUIRED, _('MFA Required')),
        (INACTIVE, _('Inactive Account')),
        (RATE_LIMIT, _('Rate Limit Exceeded')),
    ]


# ============================================================================
# Notification Channels
# ============================================================================

class NotificationChannels:
    """Notification channel constants."""
    EMAIL = 'email'
    IN_APP = 'in_app'
    PUSH = 'push'
    SMS = 'sms'
    WEBHOOK = 'webhook'
    
    CHOICES = [
        (EMAIL, _('Email')),
        (IN_APP, _('In-App')),
        (PUSH, _('Push')),
        (SMS, _('SMS')),
        (WEBHOOK, _('Webhook')),
    ]


class NotificationEvents:
    """Notification event types."""
    KPI_PENDING_VALIDATION = 'kpi_pending_validation'
    KPI_APPROVED = 'kpi_approved'
    KPI_REJECTED = 'kpi_rejected'
    KPI_RED_ALERT = 'kpi_red_alert'
    REVIEW_DUE = 'review_due'
    PIP_STARTED = 'pip_started'
    PIP_DUE = 'pip_due'
    USER_INVITED = 'user_invited'
    PASSWORD_RESET = 'password_reset'
    MFA_ENABLED = 'mfa_enabled'
    LOGIN_ALERT = 'login_alert'
    
    CHOICES = [
        (KPI_PENDING_VALIDATION, _('KPI Pending Validation')),
        (KPI_APPROVED, _('KPI Approved')),
        (KPI_REJECTED, _('KPI Rejected')),
        (KPI_RED_ALERT, _('KPI Red Alert')),
        (REVIEW_DUE, _('Review Due')),
        (PIP_STARTED, _('PIP Started')),
        (PIP_DUE, _('PIP Due')),
        (USER_INVITED, _('User Invited')),
        (PASSWORD_RESET, _('Password Reset')),
        (MFA_ENABLED, _('MFA Enabled')),
        (LOGIN_ALERT, _('Login Alert')),
    ]


# ============================================================================
# Predefined System Roles Data
# ============================================================================

SYSTEM_ROLES_DATA = [
    {
        'code': UserRoles.SUPER_ADMIN,
        'name': _('Super Admin'),
        'description': _('Full system access across all tenants.'),
        'is_assignable': False,
        'order': 0,
    },
    {
        'code': UserRoles.CLIENT_ADMIN,
        'name': _('Client Admin'),
        'description': _('Full access to a specific tenant.'),
        'is_assignable': False,
        'order': 1,
    },
    {
        'code': UserRoles.EXECUTIVE,
        'name': _('Executive'),
        'description': _('View all dashboards, strategic reports.'),
        'is_assignable': True,
        'order': 2,
    },
    {
        'code': UserRoles.HR_ADMIN,
        'name': _('HR Admin'),
        'description': _('Manage performance review cycles, rating scales, competencies, calibration, and PIPs.'),
        'is_assignable': True,
        'order': 3,
    },
    {
        'code': UserRoles.SUPERVISOR,
        'name': _('Supervisor'),
        'description': _('View team dashboards, approve entries.'),
        'is_assignable': True,
        'order': 3,
    },
    {
        'code': UserRoles.STAFF,
        'name': _('Staff'),
        'description': _('Own dashboard only, enter data.'),
        'is_assignable': True,
        'order': 4,
    },
    {
        'code': UserRoles.READ_ONLY,
        'name': _('Read Only'),
        'description': _('View only, no entry or approval rights.'),
        'is_assignable': True,
        'order': 5,
    },
]


# ============================================================================
# Permission Categories
# ============================================================================

class PermissionCategories:
    """Permission category constants."""
    KPI = 'kpi'
    REVIEW = 'review'
    USER = 'user'
    TENANT = 'tenant'
    STRUCTURE = 'structure'
    CONFIG = 'config'
    BILLING = 'billing'
    REPORT = 'report'
    WORKFLOW = 'workflow'
    ADMIN = 'admin'
    
    CHOICES = [
        (KPI, _('KPI Management')),
        (REVIEW, _('Performance Review')),
        (USER, _('User Management')),
        (TENANT, _('Tenant Management')),
        (STRUCTURE, _('Organizational Structure')),
        (CONFIG, _('System Configuration')),
        (BILLING, _('Billing & Subscriptions')),
        (REPORT, _('Reports & Analytics')),
        (WORKFLOW, _('Workflow')),
        (ADMIN, _('Administration')),
    ]


# ============================================================================
# Permission Levels
# ============================================================================

class PermissionLevels:
    """Permission level constants."""
    GLOBAL = 'global'
    TENANT = 'tenant'
    DEPARTMENT = 'department'
    TEAM = 'team'
    SELF = 'self'
    
    CHOICES = [
        (GLOBAL, _('Global')),
        (TENANT, _('Tenant')),
        (DEPARTMENT, _('Department')),
        (TEAM, _('Team')),
        (SELF, _('Self')),
    ]


# ============================================================================
# Predefined Permissions Data
# ============================================================================

PREDEFINED_PERMISSIONS_DATA = [
    # KPI Permissions
    {'codename': 'view_kpi', 'name': _('View KPI'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'create_kpi', 'name': _('Create KPI'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'edit_kpi', 'name': _('Edit KPI'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'delete_kpi', 'name': _('Delete KPI'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'create_target', 'name': _('Create Target'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TEAM},
    {'codename': 'update_target', 'name': _('Update Target'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TEAM},
    {'codename': 'create_actual', 'name': _('Create Actual Entry'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.SELF},
    {'codename': 'update_actual', 'name': _('Update Actual Entry'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.SELF},
    {'codename': 'validate_kpi_entry', 'name': _('Validate KPI Entry'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TEAM},
    {'codename': 'approve_kpi_change', 'name': _('Approve KPI Change'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'cascade_targets', 'name': _('Cascade Targets'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'phase_targets', 'name': _('Phase Targets'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'trigger_calculations', 'name': _('Trigger Calculations'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    {'codename': 'export_kpi_data', 'name': _('Export KPI Data'), 'category': PermissionCategories.KPI, 'level': PermissionLevels.TENANT},
    
    # Review & Appraisal Permissions
    {'codename': 'view_review', 'name': _('View Reviews'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TENANT},
    {'codename': 'create_review_cycle', 'name': _('Create Review Cycle'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TENANT},
    {'codename': 'conduct_review', 'name': _('Conduct Appraisal Review'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TEAM},
    {'codename': 'submit_self_assessment', 'name': _('Submit Self Assessment'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.SELF},
    {'codename': 'approve_review', 'name': _('Approve Review'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TEAM},
    {'codename': 'manage_calibration', 'name': _('Manage Calibration'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TENANT},
    {'codename': 'submit_feedback', 'name': _('Submit 360 Feedback'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.SELF},
    {'codename': 'initiate_pip', 'name': _('Initiate PIP'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TEAM},
    {'codename': 'view_pip', 'name': _('View PIP'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_pip', 'name': _('Manage PIP Progression'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TEAM},
    {'codename': 'view_review_analytics', 'name': _('View Review Analytics'), 'category': PermissionCategories.REVIEW, 'level': PermissionLevels.TENANT},
    
    # User & Access Permissions
    {'codename': 'view_user', 'name': _('View User Profiles'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'create_user', 'name': _('Create User'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'edit_user', 'name': _('Edit User'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'delete_user', 'name': _('Delete User'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'assign_role', 'name': _('Assign Role'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_team', 'name': _('Manage Team'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TEAM},
    {'codename': 'impersonate_user', 'name': _('Impersonate User'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'force_password_reset', 'name': _('Force Password Reset'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_mfa', 'name': _('Manage MFA Policies'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    {'codename': 'view_audit_logs', 'name': _('View Audit Logs'), 'category': PermissionCategories.USER, 'level': PermissionLevels.TENANT},
    
    # Organizational Structure Permissions
    {'codename': 'view_organization', 'name': _('View Organization Details'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_organization', 'name': _('Manage Organization Settings'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'view_org_chart', 'name': _('View Org Chart'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_department', 'name': _('Manage Departments'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_unit', 'name': _('Manage Units'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_positions', 'name': _('Manage Positions & Grades'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'manage_reporting_lines', 'name': _('Manage Reporting Lines'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    {'codename': 'export_org_chart', 'name': _('Export Org Chart'), 'category': PermissionCategories.STRUCTURE, 'level': PermissionLevels.TENANT},
    
    # Dashboards & Reports Permissions
    {'codename': 'view_executive_dashboard', 'name': _('View Executive Strategic Dashboard'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'view_team_dashboard', 'name': _('View Team Operations Dashboard'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TEAM},
    {'codename': 'view_individual_dashboard', 'name': _('View Individual Dashboard'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.SELF},
    {'codename': 'view_champion_dashboard', 'name': _('View Champion Performance Dashboard'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'view_admin_overview', 'name': _('View Admin Overview Dashboard'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'create_report', 'name': _('Create Report Template'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'view_reports', 'name': _('View Analytics Reports'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'export_report', 'name': _('Export Report Documents'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    {'codename': 'share_reports', 'name': _('Share Reports'), 'category': PermissionCategories.REPORT, 'level': PermissionLevels.TENANT},
    
    # Tenant Management Permissions (System / Super Admin Only)
    {'codename': 'view_tenant', 'name': _('View Tenants'), 'category': PermissionCategories.TENANT, 'level': PermissionLevels.GLOBAL},
    {'codename': 'create_tenant', 'name': _('Create Tenant'), 'category': PermissionCategories.TENANT, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_tenant', 'name': _('Manage Tenant Settings'), 'category': PermissionCategories.TENANT, 'level': PermissionLevels.GLOBAL},
    {'codename': 'delete_tenant', 'name': _('Delete Tenant'), 'category': PermissionCategories.TENANT, 'level': PermissionLevels.GLOBAL},

    # Configuration & System Management Permissions (System / Super Admin Only)
    {'codename': 'view_configs', 'name': _('View System Configurations'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_configs', 'name': _('Manage System Configurations'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_backups', 'name': _('Manage Database Backups'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_maintenance', 'name': _('Manage Maintenance Mode'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_quotas', 'name': _('Manage Resource Quotas'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_dr', 'name': _('Manage Disaster Recovery'), 'category': PermissionCategories.CONFIG, 'level': PermissionLevels.GLOBAL},
    
    # Billing & Subscription Permissions (System / Super Admin Only)
    {'codename': 'view_billing', 'name': _('View Billing & Invoices'), 'category': PermissionCategories.BILLING, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_subscription', 'name': _('Manage Plan Subscription'), 'category': PermissionCategories.BILLING, 'level': PermissionLevels.GLOBAL},
    {'codename': 'manage_payment_methods', 'name': _('Manage Payment Methods'), 'category': PermissionCategories.BILLING, 'level': PermissionLevels.GLOBAL},
    {'codename': 'process_payments', 'name': _('Process Billing Payments'), 'category': PermissionCategories.BILLING, 'level': PermissionLevels.GLOBAL},
    
    # Workflow Permissions
    {'codename': 'approve_workflow', 'name': _('Approve Workflow Requests'), 'category': PermissionCategories.WORKFLOW, 'level': PermissionLevels.TEAM},
    {'codename': 'escalate_workflow', 'name': _('Escalate Workflow Requests'), 'category': PermissionCategories.WORKFLOW, 'level': PermissionLevels.TENANT},
]

# Categories restricted exclusively to Super Admin
SYSTEM_RESTRICTED_CATEGORIES = [
    PermissionCategories.CONFIG,
    PermissionCategories.BILLING,
    PermissionCategories.TENANT,
]

# Categories assignable by Tenant / Client Admins to tenant users
TENANT_ASSIGNABLE_CATEGORIES = [
    PermissionCategories.KPI,
    PermissionCategories.REVIEW,
    PermissionCategories.USER,
    PermissionCategories.STRUCTURE,
    PermissionCategories.REPORT,
    PermissionCategories.WORKFLOW,
]


# ============================================================================
# Role Default Permissions (Tenant Level)
# ============================================================================

ROLE_DEFAULT_PERMISSIONS = {
    # 1. Client Admin (Full Tenant Business Apps Access)
    UserRoles.CLIENT_ADMIN: [
        'view_kpi', 'create_kpi', 'edit_kpi', 'delete_kpi', 'create_target', 'update_target',
        'create_actual', 'update_actual', 'validate_kpi_entry', 'approve_kpi_change', 'cascade_targets',
        'phase_targets', 'trigger_calculations', 'export_kpi_data',
        'view_review', 'create_review_cycle', 'conduct_review', 'submit_self_assessment', 'approve_review',
        'manage_calibration', 'submit_feedback', 'initiate_pip', 'view_pip', 'manage_pip', 'view_review_analytics',
        'view_user', 'create_user', 'edit_user', 'delete_user', 'assign_role', 'manage_team',
        'impersonate_user', 'force_password_reset', 'manage_mfa', 'view_audit_logs',
        'view_organization', 'manage_organization', 'view_org_chart', 'manage_department', 'manage_unit',
        'manage_positions', 'manage_reporting_lines', 'export_org_chart',
        'view_executive_dashboard', 'view_team_dashboard', 'view_individual_dashboard',
        'view_champion_dashboard', 'view_admin_overview', 'create_report', 'view_reports', 'export_report', 'share_reports',
        'approve_workflow', 'escalate_workflow',
    ],

    # 2. HR Admin (Reviews, Calibrations, PIPs, Structure & People Management)
    UserRoles.HR_ADMIN: [
        'view_kpi', 'export_kpi_data',
        'view_review', 'create_review_cycle', 'conduct_review', 'submit_self_assessment', 'approve_review',
        'manage_calibration', 'submit_feedback', 'initiate_pip', 'view_pip', 'manage_pip', 'view_review_analytics',
        'view_user', 'create_user', 'edit_user', 'assign_role', 'manage_team', 'force_password_reset',
        'view_organization', 'view_org_chart', 'manage_department', 'manage_unit', 'manage_positions',
        'manage_reporting_lines', 'export_org_chart',
        'view_executive_dashboard', 'view_team_dashboard', 'view_individual_dashboard', 'view_reports', 'export_report',
        'approve_workflow',
    ],

    # 3. Executive (Strategic Dashboards, Approvals, Company View)
    UserRoles.EXECUTIVE: [
        'view_kpi', 'approve_kpi_change', 'cascade_targets', 'export_kpi_data',
        'view_review', 'approve_review', 'view_pip', 'view_review_analytics',
        'view_user', 'manage_team',
        'view_organization', 'view_org_chart', 'export_org_chart',
        'view_executive_dashboard', 'view_team_dashboard', 'view_individual_dashboard',
        'view_reports', 'export_report', 'share_reports',
        'approve_workflow', 'escalate_workflow',
    ],

    # 4. Supervisor (Team Operations, Appraisals, Validations)
    UserRoles.SUPERVISOR: [
        'view_kpi', 'create_target', 'update_target', 'create_actual', 'update_actual',
        'validate_kpi_entry', 'cascade_targets', 'export_kpi_data',
        'view_review', 'conduct_review', 'submit_self_assessment', 'approve_review',
        'submit_feedback', 'initiate_pip', 'manage_pip',
        'view_user', 'manage_team',
        'view_org_chart',
        'view_team_dashboard', 'view_individual_dashboard', 'view_reports', 'export_report',
        'approve_workflow',
    ],

    # 5. Staff (Individual Data Entry, Self-Appraisal)
    UserRoles.STAFF: [
        'view_kpi', 'create_actual', 'update_actual',
        'submit_self_assessment', 'submit_feedback',
        'view_org_chart',
        'view_individual_dashboard',
    ],

    # 6. Read Only (Viewing Only)
    UserRoles.READ_ONLY: [
        'view_kpi', 'view_review', 'view_org_chart',
        'view_individual_dashboard', 'view_reports',
    ],
}


# ============================================================================
# Default Settings
# ============================================================================

DEFAULT_PASSWORD_MIN_LENGTH = 8
DEFAULT_PASSWORD_REQUIRE_UPPERCASE = True
DEFAULT_PASSWORD_REQUIRE_SPECIAL = True
DEFAULT_PASSWORD_REQUIRE_NUMBERS = True
DEFAULT_PASSWORD_EXPIRY_DAYS = 90
DEFAULT_SESSION_TIMEOUT_MINUTES = 480
DEFAULT_MAX_LOGIN_ATTEMPTS = 5
DEFAULT_LOGIN_LOCKOUT_MINUTES = 15
DEFAULT_MFA_TOTP_DIGITS = 6
DEFAULT_MFA_TOTP_INTERVAL = 30
DEFAULT_AUDIT_LOG_RETENTION_DAYS = 365
DEFAULT_SESSION_RETENTION_DAYS = 90


# ============================================================================
# Cache Keys
# ============================================================================

class CacheKeys:
    """Redis cache key constants."""
    CURRENT_TENANT = 'tenant:current'
    USER_SESSION = 'user:session:{session_id}'
    USER_PERMISSIONS = 'user:permissions:{user_id}'
    MFA_TOKEN = 'mfa:token:{token_hash}'
    PASSWORD_RESET = 'password:reset:{token_hash}'
    EMAIL_VERIFICATION = 'email:verify:{token_hash}'
    INVITATION = 'invitation:{token_hash}'
    LOGIN_ATTEMPTS = 'login:attempts:{identifier}'
    RATE_LIMIT = 'rate:limit:{key}'
    
    @classmethod
    def format(cls, key, **kwargs):
        return key.format(**kwargs)


# ============================================================================
# Error Messages
# ============================================================================

class ErrorMessages:
    """Common error messages."""
    AUTH_INVALID_CREDENTIALS = _('Invalid email or password.')
    AUTH_ACCOUNT_LOCKED = _('Account is locked due to too many failed attempts.')
    AUTH_ACCOUNT_INACTIVE = _('Account is inactive. Please contact administrator.')
    AUTH_MFA_REQUIRED = _('MFA verification required.')
    AUTH_MFA_INVALID = _('Invalid MFA code.')
    AUTH_TOKEN_INVALID = _('Invalid or expired token.')
    AUTH_TOKEN_REVOKED = _('Token has been revoked.')
    
    USER_NOT_FOUND = _('User not found.')
    USER_ALREADY_EXISTS = _('A user with this email already exists.')
    USER_INVITE_EXPIRED = _('Invitation has expired.')
    USER_INVITE_INVALID = _('Invalid invitation.')
    
    PASSWORD_WEAK = _('Password does not meet security requirements.')
    PASSWORD_MISMATCH = _('Passwords do not match.')
    PASSWORD_REUSED = _('You cannot reuse a previous password.')
    
    PERMISSION_DENIED = _('You do not have permission to perform this action.')
    TENANT_ACCESS_DENIED = _('You do not have access to this tenant.')
    
    VALIDATION_ERROR = _('Validation error.')
    RATE_LIMIT_EXCEEDED = _('Too many requests. Please try again later.')