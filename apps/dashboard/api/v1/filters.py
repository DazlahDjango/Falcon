# apps/dashboard/api/v1/filters.py

from django_filters import rest_framework as filters
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from apps.dashboard.constants import TrafficLight

# ===================== EXECUTIVE DASHBOARD FILTERS =====================

class ExecutiveDashboardFilter(filters.FilterSet):
    department_id = filters.UUIDFilter(field_name='department_id', lookup_expr='exact')
    department_name = filters.CharFilter(field_name='department', lookup_expr='icontains')
    kpi_status = filters.ChoiceFilter(
        choices=TrafficLight.CHOICES,
        method='filter_by_kpi_status'
    )
    
    period = filters.ChoiceFilter(
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    date_from = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    min_score = filters.NumberFilter(field_name='current_score', lookup_expr='gte')
    max_score = filters.NumberFilter(field_name='current_score', lookup_expr='lte')
    
    search = filters.CharFilter(method='filter_by_search')
    
    strategic_objective = filters.CharFilter(method='filter_by_strategic_objective')
    
    region = filters.CharFilter(method='filter_by_region')
    
    show_subdepartments = filters.BooleanFilter(method='filter_include_subdepartments')
    
    def filter_by_kpi_status(self, queryset, name, value):
        if value:
            return queryset.filter(current_status=value)
        return queryset
    
    def filter_by_period(self, queryset, name, value):
        now = timezone.now()
        
        if value == 'daily':
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(updated_at__gte=start)
        elif value == 'weekly':
            start = now - timedelta(days=7)
            return queryset.filter(updated_at__gte=start)
        elif value == 'monthly':
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(updated_at__gte=start)
        elif value == 'quarterly':
            quarter_start_month = ((now.month - 1) // 3) * 3 + 1
            start = now.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(updated_at__gte=start)
        elif value == 'yearly':
            start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(updated_at__gte=start)
        
        return queryset
    
    def filter_by_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(name__icontains=value) |
                Q(description__icontains=value) |
                Q(department__icontains=value)
            )
        return queryset
    
    def filter_by_strategic_objective(self, queryset, name, value):
        if value:
            return queryset.filter(strategic_objective__icontains=value)
        return queryset
    
    def filter_by_region(self, queryset, name, value):
        if value:
            return queryset.filter(region__icontains=value)
        return queryset
    
    def filter_include_subdepartments(self, queryset, name, value):
        return queryset
    
    class Meta:
        fields = ['department_id', 'kpi_status', 'period', 'min_score', 'max_score', 'search']


# ===================== CLIENT ADMIN DASHBOARD FILTERS =====================

class ClientAdminDashboardFilter(filters.FilterSet):
    """Filters for Client Admin Dashboard."""
    
    user_role = filters.ChoiceFilter(
        choices=[
            ('client_admin', 'Client Admin'),
            ('executive', 'Executive'),
            ('supervisor', 'Supervisor'),
            ('staff', 'Staff'),
            ('dashboard_champion', 'Dashboard Champion'),
            ('read_only', 'Read Only')
        ],
        method='filter_by_user_role'
    )
    
    user_status = filters.ChoiceFilter(
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('pending', 'Pending'),
            ('locked', 'Locked')
        ],
        method='filter_by_user_status'
    )
    
    department = filters.CharFilter(field_name='department', lookup_expr='icontains')
    
    kpi_category = filters.CharFilter(method='filter_by_kpi_category')
    
    submission_status = filters.ChoiceFilter(
        choices=[
            ('submitted', 'Submitted'),
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('missing', 'Missing')
        ],
        method='filter_by_submission_status'
    )
    
    review_status = filters.ChoiceFilter(
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('overdue', 'Overdue')
        ],
        method='filter_by_review_status'
    )
    
    date_from = filters.DateFilter(method='filter_by_date_range')
    date_to = filters.DateFilter(method='filter_by_date_range')
    
    compliance_threshold = filters.NumberFilter(method='filter_by_compliance')
    
    last_active_days = filters.NumberFilter(method='filter_by_last_active')
    
    search = filters.CharFilter(method='filter_by_search')
    
    def filter_by_user_role(self, queryset, name, value):
        from apps.accounts.models import User
        if value:
            return User.objects.filter(tenant_id=self.request.user.tenant_id, role=value)
        return queryset
    
    def filter_by_user_status(self, queryset, name, value):
        from apps.accounts.models import User
        if value == 'active':
            return User.objects.filter(tenant_id=self.request.user.tenant_id, is_active=True, is_locked=False)
        elif value == 'inactive':
            return User.objects.filter(tenant_id=self.request.user.tenant_id, is_active=False)
        elif value == 'pending':
            return User.objects.filter(tenant_id=self.request.user.tenant_id, is_verified=False)
        elif value == 'locked':
            return User.objects.filter(tenant_id=self.request.user.tenant_id, locked_until__gte=timezone.now())
        return queryset
    
    def filter_by_kpi_category(self, queryset, name, value):
        from apps.kpi.models import KPI
        if value:
            return KPI.objects.filter(tenant_id=self.request.user.tenant_id, category__icontains=value)
        return queryset
    
    def filter_by_submission_status(self, queryset, name, value):
        from apps.kpi.models import MonthlyActual
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        if value == 'missing':
            return queryset
        elif value == 'pending':
            return MonthlyActual.objects.filter(
                tenant_id=self.request.user.tenant_id,
                year=current_year,
                month=current_month,
                is_approved=False,
                is_rejected=False
            )
        elif value == 'approved':
            return MonthlyActual.objects.filter(
                tenant_id=self.request.user.tenant_id,
                year=current_year,
                month=current_month,
                is_approved=True
            )
        elif value == 'rejected':
            return MonthlyActual.objects.filter(
                tenant_id=self.request.user.tenant_id,
                year=current_year,
                month=current_month,
                is_rejected=True
            )
        return queryset
    
    def filter_by_review_status(self, queryset, name, value):
        from apps.reviews.models import ReviewCycle
        return queryset
    
    def filter_by_date_range(self, queryset, name, value):
        if value and hasattr(self, '_date_from') and hasattr(self, '_date_to'):
            return queryset.filter(created_at__date__gte=self._date_from, created_at__date__lte=self._date_to)
        return queryset
    
    def filter_by_compliance(self, queryset, name, value):
        return queryset
    
    def filter_by_last_active(self, queryset, name, value):
        from apps.accounts.models import User
        if value:
            cutoff = timezone.now() - timedelta(days=value)
            return User.objects.filter(
                tenant_id=self.request.user.tenant_id,
                last_login__gte=cutoff
            )
        return queryset
    
    def filter_by_search(self, queryset, name, value):
        from apps.accounts.models import User
        if value:
            return queryset.filter(
                tenant_id=self.request.user.tenant_id
            ).filter(
                Q(email__icontains=value) |
                Q(first_name__icontains=value) |
                Q(last_name__icontains=value) |
                Q(username__icontains=value)
            )
        return queryset


# ===================== SUPER ADMIN / TENANT OVERVIEW FILTERS =====================

class TenantOverviewFilter(filters.FilterSet):
    """Filters for Super Admin Tenant Overview."""
    
    subscription_status = filters.ChoiceFilter(
        choices=[
            ('active', 'Active'),
            ('trial', 'Trial'),
            ('expired', 'Expired'),
            ('cancelled', 'Cancelled'),
            ('suspended', 'Suspended')
        ],
        method='filter_by_subscription_status'
    )
    
    subscription_plan = filters.ChoiceFilter(
        choices=[
            ('basic', 'Basic'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise')
        ],
        method='filter_by_subscription_plan'
    )
    
    health_score_min = filters.NumberFilter(method='filter_by_health_score')
    health_score_max = filters.NumberFilter(method='filter_by_health_score')
    
    active_users_min = filters.NumberFilter(method='filter_by_active_users')
    active_users_max = filters.NumberFilter(method='filter_by_active_users')
    
    expires_in_days = filters.NumberFilter(method='filter_by_expiry')
    
    has_red_kpis = filters.BooleanFilter(method='filter_by_has_red_kpis')
    
    low_submission_rate = filters.BooleanFilter(method='filter_by_low_submission')
    
    search = filters.CharFilter(method='filter_by_search')
    
    created_after = filters.DateFilter(method='filter_by_created_date')
    created_before = filters.DateFilter(method='filter_by_created_date')
    
    def filter_by_subscription_status(self, queryset, name, value):
        if value:
            return queryset.filter(subscription_status=value)
        return queryset
    
    def filter_by_subscription_plan(self, queryset, name, value):
        if value:
            return queryset.filter(subscription_plan=value)
        return queryset
    
    def filter_by_health_score(self, queryset, name, value):
        if name == 'health_score_min' and value:
            return [t for t in queryset if t.health_score >= value]
        if name == 'health_score_max' and value:
            return [t for t in queryset if t.health_score <= value]
        return queryset
    
    def filter_by_active_users(self, queryset, name, value):
        if name == 'active_users_min' and value:
            return queryset.filter(active_users__gte=value)
        if name == 'active_users_max' and value:
            return queryset.filter(active_users__lte=value)
        return queryset
    
    def filter_by_expiry(self, queryset, name, value):
        if value:
            cutoff = timezone.now() + timedelta(days=value)
            return queryset.filter(subscription_expires_at__lte=cutoff)
        return queryset
    
    def filter_by_has_red_kpis(self, queryset, name, value):
        if value:
            return [t for t in queryset if t.kpi_red_count > 0]
        return queryset
    
    def filter_by_low_submission(self, queryset, name, value):
        if value:
            return [t for t in queryset if t.data_submission_rate and t.data_submission_rate < 50]
        return queryset
    
    def filter_by_search(self, queryset, name, value):
        if value:
            return queryset.filter(client_name__icontains=value)
        return queryset
    
    def filter_by_created_date(self, queryset, name, value):
        return queryset


class ExecutiveViewPresetFilter(filters.FilterSet):
    """Filters for Executive View Presets."""
    
    view_type = filters.ChoiceFilter(
        choices=[
            ('department', 'By Department'),
            ('strategic_objective', 'By Strategic Objective'),
            ('region', 'By Region'),
            ('cost_center', 'By Cost Center')
        ],
        field_name='view_type'
    )
    
    is_default = filters.BooleanFilter(field_name='is_default')
    
    class Meta:
        fields = ['view_type', 'is_default']


class DashboardAlertFilter(filters.FilterSet):
    """Filters for Dashboard Alerts."""
    
    alert_type = filters.ChoiceFilter(
        choices=[
            ('red_kpi', 'Red KPI'),
            ('missing_data', 'Missing Data'),
            ('pending_approval', 'Pending Approval'),
            ('submission_due', 'Submission Due'),
            ('tenant_expiry', 'Tenant Expiry')
        ],
        field_name='alert_type'
    )
    
    severity = filters.ChoiceFilter(
        choices=[
            ('critical', 'Critical'),
            ('warning', 'Warning'),
            ('info', 'Info')
        ],
        field_name='severity'
    )
    
    is_active = filters.BooleanFilter(field_name='is_active')
    
    class Meta:
        fields = ['alert_type', 'severity', 'is_active']


class ExportScheduleFilter(filters.FilterSet):
    dashboard_type = filters.ChoiceFilter(
        choices=[
            ('executive', 'Executive'),
            ('client_admin', 'Client Admin'),
            ('super_admin', 'Super Admin')
        ],
        field_name='dashboard_type'
    )
    
    format = filters.ChoiceFilter(
        choices=[
            ('pdf', 'PDF'),
            ('excel', 'Excel'),
            ('csv', 'CSV')
        ],
        field_name='format'
    )
    schedule_type = filters.ChoiceFilter(
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly')
        ],
        field_name='schedule_type'
    )
    is_active = filters.BooleanFilter(field_name='is_active')
    class Meta:
        fields = ['dashboard_type', 'format', 'schedule_type', 'is_active']


class PeriodComparisonFilter(filters.FilterSet):
    comparison_type = filters.ChoiceFilter(
        choices=[
            ('mom', 'Month over Month'),
            ('qoq', 'Quarter over Quarter'),
            ('yoy', 'Year over Year'),
            ('custom', 'Custom')
        ],
        field_name='comparison_type'
    )
    
    is_public = filters.BooleanFilter(field_name='is_public')
    class Meta:
        fields = ['comparison_type', 'is_public']


# ===================== MANAGER DASHBOARD FILTERS =====================

class ManagerDashboardFilter(filters.FilterSet):
    """Filters for Manager Dashboard."""
    
    period = filters.ChoiceFilter(
        choices=[
            ('current', 'Current Period'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    include_team = filters.BooleanFilter(method='filter_include_team')
    
    user_id = filters.UUIDFilter(method='filter_by_user_id')
    
    team_member_status = filters.ChoiceFilter(
        choices=[
            ('green', 'Green'),
            ('yellow', 'Yellow'),
            ('red', 'Red'),
            ('pending', 'Pending Approval')
        ],
        method='filter_by_team_member_status'
    )
    
    department = filters.CharFilter(method='filter_by_department')
    
    search = filters.CharFilter(method='filter_by_search')
    
    show_only_pending = filters.BooleanFilter(method='filter_show_pending')
    
    def filter_by_period(self, queryset, name, value):
        return queryset
    
    def filter_include_team(self, queryset, name, value):
        return queryset
    
    def filter_by_user_id(self, queryset, name, value):
        return queryset
    
    def filter_by_team_member_status(self, queryset, name, value):
        return queryset
    
    def filter_by_department(self, queryset, name, value):
        return queryset
    
    def filter_by_search(self, queryset, name, value):
        return queryset
    
    def filter_show_pending(self, queryset, name, value):
        return queryset


# ===================== STAFF DASHBOARD FILTERS =====================

class StaffDashboardFilter(filters.FilterSet):
    """Filters for Staff Dashboard."""
    
    period = filters.ChoiceFilter(
        choices=[
            ('current', 'Current Period'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    kpi_status = filters.ChoiceFilter(
        choices=TrafficLight.CHOICES,
        method='filter_by_kpi_status'
    )
    
    show_mission_status = filters.BooleanFilter(method='filter_show_mission')
    
    show_tasks = filters.BooleanFilter(method='filter_show_tasks')
    
    def filter_by_period(self, queryset, name, value):
        return queryset
    
    def filter_by_kpi_status(self, queryset, name, value):
        return queryset
    
    def filter_show_mission(self, queryset, name, value):
        return queryset
    
    def filter_show_tasks(self, queryset, name, value):
        return queryset


# ===================== CHAMPION DASHBOARD FILTERS =====================

class ChampionDashboardFilter(filters.FilterSet):
    """Filters for Champion Dashboard."""
    
    period = filters.ChoiceFilter(
        choices=[
            ('current', 'Current Period'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    user_id = filters.UUIDFilter(method='filter_by_target_user')
    
    show_only_unassigned = filters.BooleanFilter(method='filter_unassigned_kpis')
    
    kpi_category = filters.CharFilter(method='filter_by_kpi_category')
    
    template_id = filters.UUIDFilter(method='filter_by_template')
    
    def filter_by_period(self, queryset, name, value):
        return queryset
    
    def filter_by_target_user(self, queryset, name, value):
        return queryset
    
    def filter_unassigned_kpis(self, queryset, name, value):
        return queryset
    
    def filter_by_kpi_category(self, queryset, name, value):
        return queryset
    
    def filter_by_template(self, queryset, name, value):
        return queryset


# ===================== READ-ONLY DASHBOARD FILTERS =====================

class ReadOnlyDashboardFilter(filters.FilterSet):
    """Filters for Read-Only Dashboard."""
    
    period = filters.ChoiceFilter(
        choices=[
            ('current', 'Current Period'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    view_type = filters.ChoiceFilter(
        choices=[
            ('executive', 'Executive View'),
            ('manager', 'Manager View'),
            ('staff', 'Staff View')
        ],
        method='filter_by_view_type'
    )
    
    department = filters.CharFilter(method='filter_by_department')
    
    hide_sensitive = filters.BooleanFilter(method='filter_hide_sensitive')
    
    def filter_by_period(self, queryset, name, value):
        return queryset
    
    def filter_by_view_type(self, queryset, name, value):
        return queryset
    
    def filter_by_department(self, queryset, name, value):
        return queryset
    
    def filter_hide_sensitive(self, queryset, name, value):
        return queryset


# ===================== GENERIC DRILL-DOWN FILTER =====================

class DrillDownFilter(filters.FilterSet):
    """Filters for drill-down functionality."""
    
    period = filters.ChoiceFilter(
        choices=[
            ('current', 'Current Period'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly')
        ],
        method='filter_by_period'
    )
    
    include_subordinates = filters.BooleanFilter(method='filter_include_subordinates')
    
    depth = filters.NumberFilter(method='filter_by_depth')
    
    def filter_by_period(self, queryset, name, value):
        return queryset
    
    def filter_include_subordinates(self, queryset, name, value):
        return queryset
    
    def filter_by_depth(self, queryset, name, value):
        return queryset