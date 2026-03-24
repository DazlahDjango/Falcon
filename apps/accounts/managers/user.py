from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.utils import timezone
from .base import SoftDeleteManager, TenantAwareQuerySet

class UserQuerySet(TenantAwareQuerySet):
    def super_admins(self):
        return self.filter(role='super_admin')
    def client_admin(self):
        return self.filter(role='client_admin')
    def dashboard_champion(self):
        return self.filter(role='dashboard_cahmpion')
    def executive(self):
        return self.filter(role='executive')
    def supervisor(self):
        return self.filter(role='supervisor')
    def staff(self):
        return self.filter(role='staff')
    def read_only(self):
        return self.filter(role='read_only')
    def with_role(self, role):
        return self.filter(role=role)
    def with_roles(self, *roles):
        return self.filter(role__in=roles)
    def manager(self):
        return self.filter(direct_reports__isnull=False).distinct()
    def with_manager(self, manager):
        return self.filter(manager=manager)
    def in_department(self, department_id):
        return self.filter(department_id=department_id)
    def active(self):
        return self.filter(is_active=True)
    def inactive(self):
        return self.filter(is_active=False)
    def verified(self):
        return self.filter(is_verified=True)
    def unverified(self):
        return self.filter(is_verified=False)
    def onboard(self):
        return self.filter(is_onboarded=True)
    def mfa_enabled(self):
        return self.filter(mfa_enabled=True)
    def mfa_disabled(self):
        return self.filter(mfa_enabled=False)
    def locked(self):
        return self.filter(locked_until__gt=timezone.now())
    def not_locked(self):
        return self.exclude(locked_until__gt=timezone.now())
    def with_email(self, email):
        return self.filter(email__iexact=email)
    def with_username(self, username):
        return self.filter(username__iexact=username)
    def search(self, query):
        return self.filter(
            models.Q(email__icontains=query) |
            models.Q(username__icontains=query) |
            models.Q(first_name__icontains=query) |
            models.Q(last_name__icontains=query)
        )
    def get_team_hierarchy(self, user_id):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH RECURSIVE team_tree AS (
                    SELECT id, email, first_name, last_name, manager_id, role, tenant_id
                    FROM accounts_user
                    WHERE id = %s AND is_deleted = false
                    UNION ALL
                    SELECT u.id, u.email, u.first_name, u.last_name, u.manager_id, u.role, u.tenant_id
                    FROM accounts_user u
                    INNER JOIN team_tree tt ON u.manager_id = tt.id
                    WHERE u.is_deleted = false
                )
                SELECT * FROM team_tree
            """, [user_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        
    def get_reporting_chain(self, user_id):
        """Get reporting chain upward from user."""
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
        
class UserManager(SoftDeleteManager, BaseUserManager):
    def get_queryset(self):
        return UserQuerySet(self.model, using=self._db)
    
    def create_user(self, email, username, tenant_id, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        if not tenant_id:
            raise ValueError("Tenant ID is required")
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
    
    def create_supersuser(self, email, username, tenant_id, password=None, **extra_fields):
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
        extra_fields.setdefault('role', 'client_admin')
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_onboarded', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_dashboard_champion(self, email, username, tenant_id, password=None, **extra_fields):
        extra_fields.setdefault('role', 'dashboard_champion')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_executive(self, email, username, tenant_id, password=None, **extra_fields):
        """Create an executive user."""
        extra_fields.setdefault('role', 'executive')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_supervisor(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a supervisor user."""
        extra_fields.setdefault('role', 'supervisor')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_staff(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a staff user."""
        extra_fields.setdefault('role', 'staff')
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def create_read_only(self, email, username, tenant_id, password=None, **extra_fields):
        """Create a read-only user."""
        extra_fields.setdefault('role', 'read_only')
        return self.create_user(email, username, tenant_id, password, **extra_fields)
    
    def authenticate_by_email(self, email, password):
        try:
            user = self.get(email__iexact=email)
            if user.check_password(password) and user.is_active and not user.is_locked():
                return user
        except self.model.DoesNotExist:
            return None
        return None
    
    def get_active_users(self):
        return self.filter(is_active=True, is_deleted=False)
    def get_by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)
    def get_manager(self, tenant_id=None):
        qs = self.filter(direct_reports__isnull=False).distinct()
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs
    def get_team_members(self, manager_id):
        return self.get_queryset().get_team_hierarchy(manager_id)
    def get_reporting_chain(self, user_id):
        return self.get_queryset().get_reporting_chain(user_id)
    def get_by_role(self, role, tenant_id=None):
        qs = self.filter(role=role)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs
    def get_verified_users(self):
        return self.filter(is_verified=True)
    def get_unverified_users(self):
        return self.filter(is_verified=False)
    def get_locked_accounts(self):
        return self.filter(locked_until__gt=timezone.now())
    def get_mfa_enabled_users(self):
        return self.filter(mfa_enabled=True)
    def get_online_users(self, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return self.filter(sessions__last_activity__gte=cutoff, sessions__status='active').distinct()
    
    def bulk_create_with_tenant(self, users_data, tenant_id):
        for data in users_data:
            data['tenant_id'] = tenant_id
            if 'passowrd' in data:
                user = self.model(**data)
                user.set_password(data['password'])
                user.save()
            else:
                self.create(**data)
                
class ActiveUserManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True, is_deleted=False)
    
class StaffUserManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_staff=True, is_deleted=False)