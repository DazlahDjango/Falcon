# apps/reportplt/management/commands/manage_dashboards.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Dashboards, Layouts, Widgets & Realtime Broadcasts.

Usage Examples:
    # 1. List all dashboards for tenant
    python manage.py manage_dashboards --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. View summary metrics
    python manage.py manage_dashboards --action summary

    # 3. Create a Dashboard
    python manage.py manage_dashboards --action create --name "Executive Overview Dashboard" \
        --dashboard-type executive

    # 4. View dashboard details & widgets
    python manage.py manage_dashboards --action details --dashboard-name "Executive Overview Dashboard"

    # 5. Add a Widget to Dashboard
    python manage.py manage_dashboards --action add_widget --dashboard-name "Executive Overview Dashboard" \
        --widget-name "KPI Velocity Health" --widget-type kpi

    # 6. Publish / Unpublish dashboard
    python manage.py manage_dashboards --action publish --dashboard-name "Executive Overview Dashboard"
    python manage.py manage_dashboards --action unpublish --dashboard-name "Executive Overview Dashboard"

    # 7. Delete dashboard
    python manage.py manage_dashboards --action delete --dashboard-name "Executive Overview Dashboard"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import ReportDashboard, ReportWidget
from apps.reportplt.constants import DashboardType, WidgetType
from apps.reportplt.services.dashboard.realtime_dashboard import RealtimeDashboard


class Command(BaseCommand):
    help = 'Manage reporting dashboards, widgets, layouts, and realtime refresh broadcasts.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id', '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant Organization ID (default: 275adb1f-8e12-46ee-b394-ea42d41b10c9)'
        )
        parser.add_argument(
            '--user-email', '-u',
            type=str,
            default='careen@falcontech.com',
            help='Email of actor user performing the action'
        )
        parser.add_argument(
            '--action', '-a',
            type=str,
            choices=['list', 'summary', 'details', 'create', 'add_widget', 'publish', 'unpublish', 'refresh', 'delete'],
            default='list',
            help='Action to perform'
        )

        parser.add_argument('--dashboard-id', type=str, default=None, help='Dashboard UUID')
        parser.add_argument('--dashboard-name', '-d', type=str, default=None, help='Dashboard Name')
        parser.add_argument('--name', type=str, default=None, help='Name for creation')
        parser.add_argument('--description', type=str, default='', help='Dashboard Description')
        parser.add_argument('--dashboard-type', type=str, default='executive', help='Dashboard Type')

        # Widget creation parameters
        parser.add_argument('--widget-name', '-w', type=str, default=None, help='Widget Name')
        parser.add_argument('--widget-type', type=str, default='kpi', help='Widget Type')

    def set_tenant_schema(self, tenant_id):
        schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
        if schema_obj:
            schema_name = schema_obj.schema_name
        else:
            try:
                org = Organization.objects.get(id=tenant_id)
                schema_name = f"org_{org.slug.replace('-', '_')}"
            except Exception:
                schema_name = 'public'

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')
        return schema_name

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        user_email = options['user_email']
        action = options['action']

        schema_name = self.set_tenant_schema(tenant_id)

        user = User.objects.filter(email__iexact=user_email, tenant_id=tenant_id).first()
        if not user:
            user = User.objects.filter(tenant_id=tenant_id).first()
        if not user:
            user = User.objects.filter(email__iexact=user_email).first()

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON DASHBOARD MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {user.email if user else 'System'} (Role: {getattr(user, 'role', 'N/A')})")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'summary':
            self.action_summary(tenant_id)
        elif action == 'details':
            self.action_details(tenant_id, options)
        elif action == 'create':
            self.action_create(tenant_id, user, options)
        elif action == 'add_widget':
            self.action_add_widget(tenant_id, user, options)
        elif action == 'publish':
            self.action_set_published(tenant_id, options, True)
        elif action == 'unpublish':
            self.action_set_published(tenant_id, options, False)
        elif action == 'refresh':
            self.action_refresh(tenant_id, options)
        elif action == 'delete':
            self.action_delete(tenant_id, options)

    def _find_dashboard(self, tenant_id, options):
        dash_id = options.get('dashboard_id')
        dash_name = options.get('dashboard_name')
        if dash_id:
            return ReportDashboard.objects.filter(id=dash_id, is_deleted=False).first()
        if dash_name:
            return ReportDashboard.objects.filter(name__icontains=dash_name, is_deleted=False).first()
        return ReportDashboard.objects.filter(is_deleted=False).first()

    def action_list(self, tenant_id, options):
        dashboards = ReportDashboard.objects.filter(is_deleted=False).order_by('-created_at')
        count = dashboards.count()
        self.stdout.write(f"Total Dashboards Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No dashboards found in this tenant schema."))
            return

        self.stdout.write(f"{'ID':<38} {'Name':<32} {'Type':<16} {'Widgets':<8} {'Published':<10}")
        self.stdout.write("-" * 115)
        for d in dashboards[:40]:
            name_disp = (d.name[:29] + '...') if len(d.name) > 32 else d.name
            w_count = d.widgets.filter(is_deleted=False).count()
            self.stdout.write(f"{str(d.id):<38} {name_disp:<32} {d.dashboard_type:<16} {w_count:<8} {str(d.is_published):<10}")

    def action_summary(self, tenant_id):
        total = ReportDashboard.objects.filter(is_deleted=False).count()
        published = ReportDashboard.objects.filter(is_deleted=False, is_published=True).count()
        widgets_total = ReportWidget.objects.filter(is_deleted=False).count()

        self.stdout.write("REPORT DASHBOARDS SUMMARY:")
        self.stdout.write(f"  * Total Dashboards      : {total}")
        self.stdout.write(f"  * Published Dashboards  : {published}")
        self.stdout.write(f"  * Total Active Widgets  : {widgets_total}")

    def action_details(self, tenant_id, options):
        dashboard = self._find_dashboard(tenant_id, options)
        if not dashboard:
            raise CommandError("Dashboard not found.")

        self.stdout.write(f"ID            : {dashboard.id}")
        self.stdout.write(f"Name          : {dashboard.name}")
        self.stdout.write(f"Type          : {dashboard.dashboard_type} ({dashboard.get_dashboard_type_display()})")
        self.stdout.write(f"Is Published  : {dashboard.is_published}")
        self.stdout.write(f"Is Shared     : {dashboard.is_shared}")
        self.stdout.write(f"View Count    : {dashboard.view_count}")
        self.stdout.write(f"Owner         : {dashboard.owner.email if dashboard.owner else 'System'}")
        self.stdout.write(f"Layout        : {dashboard.layout}")
        self.stdout.write(f"Widgets Count : {dashboard.widgets.filter(is_deleted=False).count()}")

        widgets = dashboard.widgets.filter(is_deleted=False)
        if widgets.exists():
            self.stdout.write("\nAttached Widgets:")
            for w in widgets:
                self.stdout.write(f"  - [{w.widget_type}] {w.name} (Active: {w.is_active})")

    def action_create(self, tenant_id, user, options):
        name = options.get('name') or options.get('dashboard_name')
        if not name:
            raise CommandError("--name is required for create action.")

        dashboard = ReportDashboard.objects.create(
            tenant_id=tenant_id,
            name=name,
            description=options.get('description', ''),
            dashboard_type=options.get('dashboard_type', 'executive'),
            layout={"grid_columns": 12, "row_height": 150, "spacing": 10},
            created_by=user,
            owner=user,
            is_published=True
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created dashboard '{dashboard.name}' (ID: {dashboard.id})"))

    def action_add_widget(self, tenant_id, user, options):
        dashboard = self._find_dashboard(tenant_id, options)
        if not dashboard:
            raise CommandError("Dashboard not found. Pass --dashboard-name.")

        widget_name = options.get('widget_name') or f"Widget for {dashboard.name}"
        widget_type = options.get('widget_type', 'kpi')

        widget = ReportWidget.objects.create(
            tenant_id=tenant_id,
            dashboard=dashboard,
            name=widget_name,
            title=widget_name,
            widget_type=widget_type,
            size={"width": 4, "height": 3},
            position={"x": 0, "y": 0, "col": 1, "row": 1},
            config={"metric": "progress", "format": "percentage"},
            created_by=user,
            is_active=True,
            is_visible=True
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully added widget '{widget.name}' ({widget.widget_type}) to '{dashboard.name}'."))

    def action_set_published(self, tenant_id, options, state):
        dashboard = self._find_dashboard(tenant_id, options)
        if not dashboard:
            raise CommandError("Dashboard not found.")

        dashboard.is_published = state
        dashboard.save(update_fields=['is_published'])
        self.stdout.write(self.style.SUCCESS(f"Dashboard '{dashboard.name}' published status set to {state}."))

    def action_refresh(self, tenant_id, options):
        dashboard = self._find_dashboard(tenant_id, options)
        if not dashboard:
            raise CommandError("Dashboard not found.")

        realtime = RealtimeDashboard()
        realtime.broadcast_dashboard_update(str(dashboard.id))
        self.stdout.write(self.style.SUCCESS(f"Realtime refresh broadcast sent for dashboard '{dashboard.name}'."))

    def action_delete(self, tenant_id, options):
        dashboard = self._find_dashboard(tenant_id, options)
        if not dashboard:
            raise CommandError("Dashboard not found.")

        name = dashboard.name
        dashboard.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Dashboard '{name}' deleted."))
