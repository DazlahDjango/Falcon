from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.utils import timezone
from .base import SoftDeleteManager, TenantAwareQuerySet

class UserQuerySet(TenantAwareQuerySet):
    def super_admins(self):
        return self.filter(role='super_admin')
    
    def client_admins(self):  # Fixed: was 'client_admin' (singular)
        return self.filter(role='client_admin')
    
    def dashboard_champions(self):  # Fixed typo: 'dashboard_cahmpion' -> 'dashboard_champion'
        return self.filter(role='dashboard_champion')
    
    def executives(self):
        return self.filter(role='executive')
    
    def supervisors(self):
        return self.filter(role='supervisor')
    
    def staff(self):
        return self.filter(role='staff')
    
    def read_only(self):
        return self.filter(role='read_only')
    
    # General role filters
    def with_role(self, role):
        return self.filter(role=role)
    
    def with_roles(self, *roles):
        return self.filter(role__in=roles)
    
    # Manager/Reporting filters
    def managers(self):
        """Users who have direct reports"""
        return self.filter(direct_reports__isnull=False).distinct()
    
    def with_manager(self, manager):
        return self.filter(manager=manager)
    
    def get_team_hierarchy(self, user_id):
        """Get complete team hierarchy using recursive CTE"""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH RECURSIVE team_tree AS (
                    SELECT id, email, first_name, last_name, manager_id, role, tenant_id, is_active
                    FROM accounts_user
                    WHERE id = %s AND is_deleted = false
                    UNION ALL
                    SELECT u.id, u.email, u.first_name, u.last_name, u.manager_id, u.role, u.tenant_id, u.is_active
                    FROM accounts_user u
                    INNER JOIN team_tree tt ON u.manager_id = tt.id
                    WHERE u.is_deleted = false
                )
                SELECT * FROM team_tree
            """, [user_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_reporting_chain(self, user_id):
        """Get reporting chain upward from user"""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH RECURSIVE reporting_chain AS (
                    SELECT id, email, first_name, last_name, manager_id, role, tenant_id
                    FROM accounts_user
                    WHERE id = %s AND is_deleted = false
                    UNION ALL
                    SELECT u.id, u.email, u.first_name, u.last_name, u.manager_id, u.role, u.tenant_id
                    FROM accounts_user u
                    INNER JOIN reporting_chain rc ON u.id = rc.manager_id
                    WHERE u.is_deleted = false
                )
                SELECT * FROM reporting_chain
            """, [user_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    # Department filters
    def in_department(self, department_id):
        return self.filter(department_id=department_id)
    
    # Status filters
    def active(self):
        return self.filter(is_active=True)
    
    def inactive(self):
        return self.filter(is_active=False)
    
    def verified(self):
        return self.filter(is_verified=True)
    
    def unverified(self):
        return self.filter(is_verified=False)
    
    def onboarded(self):  # Fixed: was 'onboard'
        return self.filter(is_onboarded=True)
    
    # MFA filters
    def mfa_enabled(self):
        return self.filter(mfa_enabled=True)
    
    def mfa_disabled(self):
        return self.filter(mfa_enabled=False)
    
    def mfa_required_by_role(self, roles):
        return self.filter(role__in=roles)
    
    # Lock status filters
    def locked(self):
        return self.filter(locked_until__gt=timezone.now())
    
    def not_locked(self):
        return self.exclude(locked_until__gt=timezone.now())
    
    # Search filters
    def with_email(self, email):
        return self.filter(email__iexact=email)
    
    def with_username(self, username):
        return self.filter(username__iexact=username)
    
    def search(self, query):
        return self.filter(
            models.Q(email__icontains=query) |
            models.Q(username__icontains=query) |
            models.Q(first_name__icontains=query) |
            models.Q(last_name__icontains=query) |
            models.Q(employee_id__icontains=query)
        )
    
    # Tenant filters
    def for_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)


class UserManager(SoftDeleteManager, BaseUserManager):
    """Custom manager for User model"""
    
    def get_queryset(self):
        return UserQuerySet(self.model, using=self._db)
    
    def create_user(self, email, username, tenant_id=None, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        
        role = extra_fields.get('role', 'staff')
        if role != 'super_admin' and not tenant_id:
            raise ValueError("Tenant ID is required for non-superadmin users")
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            tenant_id=tenant_id,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, tenant_id=None, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'super_admin')
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_onboarded', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True")
        
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_client_admin(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a client admin user"""
        extra_fields.setdefault('role', 'client_admin')
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_onboarded', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_dashboard_champion(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a dashboard champion user"""
        extra_fields.setdefault('role', 'dashboard_champion')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_executive(self, email, username, tenant_id, password=None, **extra_fields):
        """Create an executive user"""
        extra_fields.setdefault('role', 'executive')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_supervisor(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a supervisor user"""
        extra_fields.setdefault('role', 'supervisor')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_staff(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a staff user"""
        extra_fields.setdefault('role', 'staff')
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_read_only(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a read-only user"""
        extra_fields.setdefault('role', 'read_only')
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def authenticate_by_email(self, email, password):
        """Authenticate a user by email and password"""
        try:
            user = self.get(email__iexact=email)
            if user.check_password(password) and user.is_active and not user.is_locked():
                return user
        except self.model.DoesNotExist:
            return None
        return None
    
    def get_active_users(self):
        """Get all active users"""
        return self.filter(is_active=True, is_deleted=False)
    
    def get_by_tenant(self, tenant_id):
        """Get all users for a tenant"""
        return self.filter(tenant_id=tenant_id)
    
    def get_managers(self, tenant_id=None):
        """Get all users who are managers"""
        qs = self.filter(direct_reports__isnull=False).distinct()
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def get_team_members(self, manager_id):
        """Get all team members under a manager"""
        return self.get_queryset().get_team_hierarchy(manager_id)
    
    def get_reporting_chain(self, user_id):
        """Get reporting chain for a user"""
        return self.get_queryset().get_reporting_chain(user_id)
    
    def get_by_role(self, role, tenant_id=None):
        """Get users by role"""
        qs = self.filter(role=role)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def get_verified_users(self):
        """Get all verified users"""
        return self.filter(is_verified=True)
    
    def get_unverified_users(self):
        """Get all unverified users"""
        return self.filter(is_verified=False)
    
    def get_locked_accounts(self):
        """Get all locked accounts"""
        return self.filter(locked_until__gt=timezone.now())
    
    def get_mfa_enabled_users(self):
        """Get all users with MFA enabled"""
        return self.filter(mfa_enabled=True)
    
    def get_online_users(self, minutes=15):
        """Get users active in last X minutes"""
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(sessions__last_activity__gte=cutoff, sessions__status='active').distinct()
    
    def bulk_create_with_tenant(self, users_data, tenant_id):
        """Bulk create users with tenant assignment"""
        for data in users_data:
            data['tenant_id'] = tenant_id
            if 'password' in data:  # Fixed typo: 'passowrd' -> 'password'
                user = self.model(**data)
                user.set_password(data['password'])
                user.save()
            else:
                self.create(**data)


class ActiveUserManager(UserManager):
    """Manager that only returns active users"""
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True, is_deleted=False)


class StaffUserManager(UserManager):
    """Manager that only returns staff users"""
    def get_queryset(self):
        return super().get_queryset().filter(is_staff=True, is_deleted=False)