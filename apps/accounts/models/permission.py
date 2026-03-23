from django.db import models
from django.utils.translation import gettext_lazy as _ 
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission as DjangoPermission
from .base import BaseModel

class Permission(BaseModel):
    django_permission = models.OneToOneField(DjangoPermission, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_permission', verbose_name=_('Django permission'))
    name = models.CharField(_('name'), max_length=255)
    codename = models.CharField(_('code name'), max_length=100, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='custom_permissios', verbose_name=_('content type'))
    CATEGORY_KPI = 'kpi'
    CATEGORY_REVIEW = 'review'
    CATEGORY_USER = 'user'
    CATEGORY_TENANT = 'tenant'
    CATEGORY_REPORT = 'report'
    CATEGORY_WORKFLOW = 'workflow'
    CATEGORY_ADMIN = 'admin'

    CATEGORY_CHOICES = [
        (CATEGORY_KPI, 'KPI Management'),
        (CATEGORY_REVIEW, 'Performance Review'),
        (CATEGORY_USER, 'User Management'),
        (CATEGORY_TENANT, 'Tenant Management'),
        (CATEGORY_REPORT, 'Reports'),
        (CATEGORY_WORKFLOW, 'Workflow'),
        (CATEGORY_ADMIN, 'Administration'),
    ]
    category = models.CharField(_('category'), max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    # Permission level
    LEVEL_GLOBAL = 'global'
    LEVEL_TENANT = 'tenant'
    LEVEL_DEPARTMENT = 'department'
    LEVEL_TEAM = 'team'
    LEVEL_SELF = 'self'

    LEVEL_CHOICES = [
        (LEVEL_GLOBAL, 'Global'),
        (LEVEL_TENANT, 'Tenant'),
        (LEVEL_DEPARTMENT, 'Department'),
        (LEVEL_TEAM, 'Team'),
        (LEVEL_SELF, 'Self'),
    ]
    level = models.CharField(_('permission level'), max_length=10, choices=LEVEL_CHOICES, default=LEVEL_TENANT)
    is_active = models.BooleanField(_('active'), default=True)

    class Meta:
        db_table = 'accounts_permission'
        verbose_name = _('permission')
        verbose_name_plural = _('permissions')
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['codename']),
            models.Index(fields=['category', 'level']),
            models.Index(fields=['content_type', 'tenant_id']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_django_permission(self):
        if not self.django_permission:
            self.django_permission = DjangoPermission.objects.create(
                name = self.name,
                codename = self.codename,
                content_type = self.content_type
            )
            self.save(update_fields=['django_permission'])
        return self.django_permission
    
# Falcon PMS Predefined Permissions
PREDEFINED_PERMISSIONS = [
    # KPI permissions
    {'codename': 'view_kpi', 'name': 'View KPI', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'create_kpi', 'name': 'Create KPI', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'edit_kpi', 'name': 'Edit KPI', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'delete_kpi', 'name': 'Delete KPI', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'validate_kpi_entry', 'name': 'Validate KPI Entry', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TEAM},
    {'codename': 'approve_kpi_change', 'name': 'Approve KPI Change', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'cascade_targets', 'name': 'Cascade Targets', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    {'codename': 'phase_targets', 'name': 'Phase Targets', 'category': Permission.CATEGORY_KPI, 'level': Permission.LEVEL_TENANT},
    
    # Review permissions
    {'codename': 'view_review', 'name': 'View Review', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_TENANT},
    {'codename': 'create_review', 'name': 'Create Review', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_TEAM},
    {'codename': 'submit_self_assessment', 'name': 'Submit Self Assessment', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_SELF},
    {'codename': 'approve_review', 'name': 'Approve Review', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_TEAM},
    {'codename': 'initiate_pip', 'name': 'Initiate PIP', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_TEAM},
    {'codename': 'view_pip', 'name': 'View PIP', 'category': Permission.CATEGORY_REVIEW, 'level': Permission.LEVEL_TENANT},
    
    # User permissions
    {'codename': 'view_user', 'name': 'View User', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TENANT},
    {'codename': 'create_user', 'name': 'Create User', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TENANT},
    {'codename': 'edit_user', 'name': 'Edit User', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TENANT},
    {'codename': 'delete_user', 'name': 'Delete User', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TENANT},
    {'codename': 'assign_role', 'name': 'Assign Role', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TENANT},
    {'codename': 'manage_team', 'name': 'Manage Team', 'category': Permission.CATEGORY_USER, 'level': Permission.LEVEL_TEAM},
    
    # Dashboard permissions
    {'codename': 'view_executive_dashboard', 'name': 'View Executive Dashboard', 'category': Permission.CATEGORY_REPORT, 'level': Permission.LEVEL_TENANT},
    {'codename': 'view_team_dashboard', 'name': 'View Team Dashboard', 'category': Permission.CATEGORY_REPORT, 'level': Permission.LEVEL_TEAM},
    {'codename': 'view_individual_dashboard', 'name': 'View Individual Dashboard', 'category': Permission.CATEGORY_REPORT, 'level': Permission.LEVEL_SELF},
    {'codename': 'export_report', 'name': 'Export Report', 'category': Permission.CATEGORY_REPORT, 'level': Permission.LEVEL_TENANT},
    
    # Tenant permissions
    {'codename': 'manage_tenant', 'name': 'Manage Tenant', 'category': Permission.CATEGORY_TENANT, 'level': Permission.LEVEL_GLOBAL},
    {'codename': 'view_billing', 'name': 'View Billing', 'category': Permission.CATEGORY_TENANT, 'level': Permission.LEVEL_TENANT},
    {'codename': 'configure_branding', 'name': 'Configure Branding', 'category': Permission.CATEGORY_TENANT, 'level': Permission.LEVEL_TENANT},
    {'codename': 'manage_subscription', 'name': 'Manage Subscription', 'category': Permission.CATEGORY_TENANT, 'level': Permission.LEVEL_TENANT},
    
    # Workflow permissions
    {'codename': 'approve_workflow', 'name': 'Approve Workflow', 'category': Permission.CATEGORY_WORKFLOW, 'level': Permission.LEVEL_TEAM},
    {'codename': 'escalate_workflow', 'name': 'Escalate Workflow', 'category': Permission.CATEGORY_WORKFLOW, 'level': Permission.LEVEL_TENANT},
]