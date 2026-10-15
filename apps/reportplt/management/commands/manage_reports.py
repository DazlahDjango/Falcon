# apps/reportplt/management/commands/manage_reports.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Definitions, Direct Execution & Lifecycle Workflows.

Usage Examples:
    # 1. List all reports for tenant
    python manage.py manage_reports --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. Show summary metrics
    python manage.py manage_reports --action summary

    # 3. Create a Report
    python manage.py manage_reports --action create --name "Executive Performance Review" \
        --report-type kpi_executive_summary --data-source kpi --format pdf

    # 4. Generate report data
    python manage.py manage_reports --action generate --report-name "Executive Performance Review"

    # 5. View report details
    python manage.py manage_reports --action details --report-name "Executive Performance Review"

    # 6. Publish / Unpublish report
    python manage.py manage_reports --action publish --report-name "Executive Performance Review"
    python manage.py manage_reports --action unpublish --report-name "Executive Performance Review"

    # 7. Archive / Restore report
    python manage.py manage_reports --action archive --report-name "Executive Performance Review"
    python manage.py manage_reports --action restore --report-name "Executive Performance Review"

    # 8. Delete report
    python manage.py manage_reports --action delete --report-name "Executive Performance Review"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import Report, ReportExecution
from apps.reportplt.constants import ReportType, ReportStatus, ExportFormat
from apps.reportplt.services.generation.report_generator import ReportGenerator


class Command(BaseCommand):
    help = 'Manage report definitions, lifecycle actions, manual generation, and catalog summaries.'

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
            choices=['list', 'summary', 'details', 'create', 'generate', 'publish', 'unpublish', 'archive', 'restore', 'delete'],
            default='list',
            help='Action to perform'
        )

        # Action parameters
        parser.add_argument('--report-id', type=str, default=None, help='Report UUID')
        parser.add_argument('--report-name', '-r', type=str, default=None, help='Report Name')
        parser.add_argument('--name', type=str, default=None, help='Name for report creation')
        parser.add_argument('--description', type=str, default='', help='Report Description')
        parser.add_argument('--report-type', type=str, default='kpi_executive_summary', help='Report Type key')
        parser.add_argument('--data-source', type=str, default='kpi', choices=['kpi', 'reviews', 'structure', 'hybrid', 'composite', 'custom'], help='Data source')
        parser.add_argument('--category', type=str, default='executive', help='Category')
        parser.add_argument('--format', type=str, default='pdf', choices=['pdf', 'excel', 'csv', 'json', 'html'], help='Default export format')

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

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON REPORTING MANAGEMENT COMMAND ==="))
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
        elif action == 'generate':
            self.action_generate(tenant_id, user, options)
        elif action == 'publish':
            self.action_set_state(tenant_id, options, 'publish')
        elif action == 'unpublish':
            self.action_set_state(tenant_id, options, 'unpublish')
        elif action == 'archive':
            self.action_set_state(tenant_id, options, 'archive')
        elif action == 'restore':
            self.action_set_state(tenant_id, options, 'restore')
        elif action == 'delete':
            self.action_delete(tenant_id, options)

    def _find_report(self, tenant_id, options):
        report_id = options.get('report_id')
        report_name = options.get('report_name')
        if report_id:
            return Report.objects.filter(id=report_id, is_deleted=False).first()
        if report_name:
            return Report.objects.filter(name__icontains=report_name, is_deleted=False).first()
        return Report.objects.filter(is_deleted=False).first()

    def action_list(self, tenant_id, options):
        reports = Report.objects.filter(is_deleted=False).order_by('-created_at')
        count = reports.count()
        self.stdout.write(f"Total Reports Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No reports found in this tenant schema."))
            return

        self.stdout.write(f"{'ID':<38} {'Name':<32} {'Type':<22} {'Status':<12} {'Published':<10}")
        self.stdout.write("-" * 115)
        for r in reports[:30]:
            name_disp = (r.name[:29] + '...') if len(r.name) > 32 else r.name
            self.stdout.write(f"{str(r.id):<38} {name_disp:<32} {r.report_type:<22} {r.status:<12} {str(r.is_published):<10}")

    def action_summary(self, tenant_id):
        total = Report.objects.filter(is_deleted=False).count()
        published = Report.objects.filter(is_deleted=False, is_published=True).count()
        draft = Report.objects.filter(is_deleted=False, status='draft').count()
        completed = Report.objects.filter(is_deleted=False, status='completed').count()
        archived = Report.objects.filter(is_deleted=False, status='archived').count()

        self.stdout.write("REPORT PLATFORM SUMMARY METRICS:")
        self.stdout.write(f"  * Total Active Reports   : {total}")
        self.stdout.write(f"  * Published Reports      : {published}")
        self.stdout.write(f"  * Draft Reports          : {draft}")
        self.stdout.write(f"  * Completed Reports      : {completed}")
        self.stdout.write(f"  * Archived Reports       : {archived}")

    def action_details(self, tenant_id, options):
        report = self._find_report(tenant_id, options)
        if not report:
            raise CommandError("Report not found.")

        self.stdout.write(f"ID            : {report.id}")
        self.stdout.write(f"Name          : {report.name}")
        self.stdout.write(f"Type          : {report.report_type} ({report.get_report_type_display()})")
        self.stdout.write(f"Status        : {report.status}")
        self.stdout.write(f"Category      : {report.category}")
        self.stdout.write(f"Data Source   : {report.data_source}")
        self.stdout.write(f"Default Format: {report.default_format}")
        self.stdout.write(f"Published     : {report.is_published}")
        self.stdout.write(f"Owner         : {report.owner.email if report.owner else 'None'}")
        self.stdout.write(f"Executions    : {report.executions.count()}")
        self.stdout.write(f"Schedules     : {report.schedules.count()}")
        self.stdout.write(f"Shares        : {report.shares.count()}")
        self.stdout.write(f"Created At    : {report.created_at}")

    def action_create(self, tenant_id, user, options):
        name = options.get('name') or options.get('report_name')
        if not name:
            raise CommandError("--name is required for create action.")

        report = Report.objects.create(
            tenant_id=tenant_id,
            name=name,
            description=options.get('description', ''),
            report_type=options.get('report_type', 'kpi_executive_summary'),
            data_source=options.get('data_source', 'kpi'),
            category=options.get('category', 'executive'),
            default_format=options.get('format', 'pdf'),
            created_by=user,
            owner=user,
            is_published=False,
            status='draft'
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created report '{report.name}' (ID: {report.id})"))

    def action_generate(self, tenant_id, user, options):
        report = self._find_report(tenant_id, options)
        if not report:
            raise CommandError("Report not found.")

        self.stdout.write(f"Triggering report generator for: {report.name} ({report.report_type})...")
        generator = ReportGenerator()
        result = generator.generate_report(str(report.id), async_mode=False)
        if result.get('status') == 'success':
            self.stdout.write(self.style.SUCCESS(f"Report generated successfully! Status: {result.get('status')}"))
            self.stdout.write(f"Execution ID: {result.get('execution_id')}")
        else:
            self.stdout.write(self.style.ERROR(f"Report generation error: {result.get('error')}"))

    def action_set_state(self, tenant_id, options, action_type):
        report = self._find_report(tenant_id, options)
        if not report:
            raise CommandError("Report not found.")

        if action_type == 'publish':
            report.is_published = True
            report.save(update_fields=['is_published'])
            self.stdout.write(self.style.SUCCESS(f"Report '{report.name}' published."))
        elif action_type == 'unpublish':
            report.is_published = False
            report.save(update_fields=['is_published'])
            self.stdout.write(self.style.SUCCESS(f"Report '{report.name}' unpublished."))
        elif action_type == 'archive':
            report.status = 'archived'
            report.save(update_fields=['status'])
            self.stdout.write(self.style.SUCCESS(f"Report '{report.name}' archived."))
        elif action_type == 'restore':
            report.status = 'completed'
            report.save(update_fields=['status'])
            self.stdout.write(self.style.SUCCESS(f"Report '{report.name}' restored."))

    def action_delete(self, tenant_id, options):
        report = self._find_report(tenant_id, options)
        if not report:
            raise CommandError("Report not found.")

        name = report.name
        report.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Report '{name}' deleted."))
