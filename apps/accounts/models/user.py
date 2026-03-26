# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator, EmailValidator
from .base import BaseModel
import uuid

class User(BaseModel, AbstractUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True, editable=False, default=uuid.uuid4)
    email = models.EmailField(_('email address'), unique=True, db_index=True, validators=[EmailValidator()])
    username = models.CharField(_('username'), max_length=50, unique=True, db_index=True, validators=[RegexValidator(r'^[\w.@+-]+\Z', 'Enter a valid username.')])
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True, validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Enter valid phone number')])
    first_name = models.CharField(_('first name'), max_length=50, blank=True)
    last_name = models.CharField(_('last name'), max_length=50, blank=True)
    
    # Roles and permissions
    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_CLIENT_ADMIN = 'client_admin'
    ROLE_DASHBOARD_CHAMPION = 'dashboard_champion'
    ROLE_EXECUTIVE = 'executive'
    ROLE_SUPERVISOR = 'supervisor'
    ROLE_STAFF = 'staff'
    ROLE_READ_ONLY = 'read_only'
    
    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, 'Super Admin'),
        (ROLE_CLIENT_ADMIN, 'Client Admin'),
        (ROLE_DASHBOARD_CHAMPION, 'Dashboard Champion'),
        (ROLE_EXECUTIVE, 'Executive'),
        (ROLE_SUPERVISOR, 'Supervisor'),
        (ROLE_STAFF, 'Staff'),
        (ROLE_READ_ONLY, 'Read Only'),
    ]
    role = models.CharField(_('role'), max_length=50, choices=ROLE_CHOICES, default=ROLE_STAFF, db_index=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports', verbose_name=_('manager'))
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff'), default=False)
    is_superuser = models.BooleanField(_('superuser status'), default=False)
    is_verified = models.BooleanField(_('verified'), default=False)
    is_onboarded = models.BooleanField(_('onboarded'), default=False)
    
    # Auth Fields
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'tenant_id']
    
    # Security
    last_login_ip = models.GenericIPAddressField(_('last login IP'), null=True, blank=True)
    last_login_agent = models.CharField(_('last login user agent'), max_length=500, blank=True)
    login_attempts = models.PositiveSmallIntegerField(_('login attempts'), default=0)
    locked_until = models.DateTimeField(_('locked until'), null=True, blank=True)
    
    # MFA fields
    mfa_devices = models.ManyToManyField('accounts.MFADevice', related_name='users', blank=True)
    mfa_enabled = models.BooleanField(_('MFA enabled'), default=False)
    mfa_secret = models.CharField(_('MFA secret'), max_length=32, blank=True)
    mfa_backup_codes = models.JSONField(_('backup codes'), default=list, blank=True)
    mfa_verified_at = models.DateTimeField(_('MFA verified at'), null=True, blank=True)
    current_session_key = models.CharField(_('current session key'), max_length=300, blank=True, null=True)
    session_expires_at = models.DateTimeField(_('session expires at'), null=True, blank=True)
    
    # preferences
    language = models.CharField(_('language'), max_length=10, default='en')
    timezone = models.CharField(_('timezone'), max_length=20, default='Africa/Nairobi')
    notification_preferences = models.JSONField(_('notification preferences'), default=dict, blank=True)
    
    # Meta data
    title = models.CharField(_('job title'), max_length=100, blank=True)
    employee_id = models.CharField(_('employee ID'), max_length=50, blank=True, db_index=True)
    joined_at = models.DateTimeField(_('joined date'), null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = _('user')
        verbose_name_plural = _('users')
        indexes = [
            models.Index(fields=['email', 'tenant_id']),
            models.Index(fields=['role', 'tenant_id']),
            models.Index(fields=['manager', 'tenant_id']),
            models.Index(fields=['is_active', 'tenant_id']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    def get_full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def get_short_name(self):
        return self.first_name or self.username
    
    @property
    def is_manager(self):
        return self.direct_reports.exists()
    
    @property
    def is_supervisor(self):
        return self.role in [self.ROLE_SUPER_ADMIN, self.ROLE_CLIENT_ADMIN, self.ROLE_EXECUTIVE, self.ROLE_SUPERVISOR]
    
    @property
    def can_validate_entries(self):
        return self.role in [self.ROLE_SUPER_ADMIN, self.ROLE_CLIENT_ADMIN, self.ROLE_EXECUTIVE, self.ROLE_SUPERVISOR]
    
    @property
    def can_manage_tenant(self):
        return self.role in [self.ROLE_SUPER_ADMIN, self.ROLE_CLIENT_ADMIN]
    
    @property
    def is_dashboard_champion(self):
        return self.role == self.ROLE_DASHBOARD_CHAMPION
    
    def get_team_members(self):
        team = list(self.direct_reports.all())
        for member in self.direct_reports.all():
            team.extend(member.get_team_members())
        return team
    
    def get_team_ids(self):
        return [user.id for user in self.get_team_members()]
    
    def increment_login_attempts(self):
        self.login_attempts += 1
        if self.login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=15)
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def reset_login_attempts(self):
        self.login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        return False
    
    def enable_mfa(self, secret, backup_codes=None):
        self.mfa_enabled = True
        self.mfa_secret = secret
        if backup_codes:
            self.mfa_backup_codes = backup_codes
        self.save(update_fields=['mfa_enabled', 'mfa_secret', 'mfa_backup_codes'])

    def disable_mfa(self):
        self.mfa_enabled = False
        self.mfa_secret = ''
        self.mfa_backup_codes = []
        self.mfa_verified_at = None
        self.save(update_fields=['mfa_enabled', 'mfa_secret', 'mfa_backup_codes', 'mfa_verified_at'])

    def verify_mfa(self):
        self.mfa_verified_at = timezone.now()
        self.save(update_fields=['mfa_verified_at'])
    
    def has_permission(self, permission_codename, obj=None):
        if self.is_superuser or self.role == self.ROLE_SUPER_ADMIN:
            return True
        if obj and hasattr(obj, 'tenant_id') and obj.tenant_id != self.tenant_id:
            return False
        return self.has_perm(permission_codename, obj)
