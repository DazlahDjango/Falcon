# apps/reportplt/management/commands/manage_exports.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Exports, Formats (PDF, Excel, CSV, JSON, HTML) & Storage Cleanup.

Usage Examples:
    # 1. List all exports for tenant
    python manage.py manage_exports --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. View summary metrics
    python manage.py manage_exports --action summary

    # 3. Export a Report to PDF / Excel / CSV / JSON / HTML
    python manage.py manage_exports --action export --report-name "Executive Performance Review" --format pdf
    python manage.py manage_exports --action export --report-name "Executive Performance Review" --format excel

    # 4. View export details
    python manage.py manage_exports --action details --report-name "Executive Performance Review"

    # 5. Cleanup expired exports
    python manage.py manage_exports --action cleanup_expired
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import Report, ReportExport
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.services.generation.report_generator import ReportGenerator


class Command(BaseCommand):
    help = 'Manage report export files, formats, direct generation, and storage cleanup.'

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
            choices=['list', 'summary', 'details', 'export', 'cleanup_expired'],
            default='list',
            help='Action to perform'
        )

        parser.add_argument('--export-id', type=str, default=None, help='Export UUID')
        parser.add_argument('--report-id', type=str, default=None, help='Target Report UUID')
        parser.add_argument('--report-name', '-r', type=str, default=None, help='Target Report Name')
        parser.add_argument('--format', '-f', type=str, default='pdf', choices=['pdf', 'excel', 'csv', 'json', 'html'], help='Export format')

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

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON REPORT EXPORTS MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {user.email if user else 'System'} (Role: {getattr(user, 'role', 'N/A')})")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'summary':
            self.action_summary(tenant_id)
        elif action == 'details':
            self.action_details(tenant_id, options)
        elif action == 'export':
            self.action_export(tenant_id, user, options)
        elif action == 'cleanup_expired':
            self.action_cleanup_expired(tenant_id)

    def _find_export(self, tenant_id, options):
        exp_id = options.get('export_id')
        if exp_id:
            return ReportExport.objects.filter(id=exp_id, is_deleted=False).first()
        rep_name = options.get('report_name')
        if rep_name:
            report = Report.objects.filter(name__icontains=rep_name, is_deleted=False).first()
            if report:
                return ReportExport.objects.filter(report=report, is_deleted=False).order_by('-created_at').first()
        return ReportExport.objects.filter(is_deleted=False).order_by('-created_at').first()

    def action_list(self, tenant_id, options):
        exports = ReportExport.objects.filter(is_deleted=False).order_by('-created_at')
        count = exports.count()
        self.stdout.write(f"Total Export Records Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No exports found in this tenant schema."))
            return

        self.stdout.write(f"{'ID':<38} {'Report':<28} {'Format':<8} {'Status':<10} {'Size':<10} {'Created':<20}")
        self.stdout.write("-" * 115)
        for e in exports[:40]:
            rep_name = e.report.name[:25] + '...' if e.report and len(e.report.name) > 28 else (e.report.name if e.report else 'N/A')
            size_disp = f"{e.file_size} B" if e.file_size else '0 B'
            created = str(e.created_at)[:19]
            self.stdout.write(f"{str(e.id):<38} {rep_name:<28} {e.export_format:<8} {e.status:<10} {size_disp:<10} {created:<20}")

    def action_summary(self, tenant_id):
        total = ReportExport.objects.filter(is_deleted=False).count()
        completed = ReportExport.objects.filter(is_deleted=False, status='completed').count()
        failed = ReportExport.objects.filter(is_deleted=False, status='failed').count()
        total_bytes = ReportExport.objects.filter(is_deleted=False).aggregate(models.Sum('file_size'))['file_size__sum'] or 0

        self.stdout.write("REPORT EXPORTS SUMMARY:")
        self.stdout.write(f"  * Total Exports         : {total}")
        self.stdout.write(f"  * Completed Exports     : {completed}")
        self.stdout.write(f"  * Failed Exports        : {failed}")
        self.stdout.write(f"  * Total Storage Used    : {total_bytes / (1024*1024):.2f} MB ({total_bytes} bytes)")

    def action_details(self, tenant_id, options):
        export_obj = self._find_export(tenant_id, options)
        if not export_obj:
            raise CommandError("Export record not found.")

        self.stdout.write(f"ID            : {export_obj.id}")
        self.stdout.write(f"Report        : {export_obj.report.name if export_obj.report else 'N/A'}")
        self.stdout.write(f"Format        : {export_obj.export_format}")
        self.stdout.write(f"Status        : {export_obj.status}")
        self.stdout.write(f"File Path     : {export_obj.file_path}")
        self.stdout.write(f"File URL      : {export_obj.file_url}")
        self.stdout.write(f"File Size     : {export_obj.file_size} bytes")
        self.stdout.write(f"Download Count: {export_obj.download_count}")
        self.stdout.write(f"Expires At    : {export_obj.expires_at}")
        self.stdout.write(f"Created At    : {export_obj.created_at}")

    def action_export(self, tenant_id, user, options):
        report_id = options.get('report_id')
        report_name = options.get('report_name')
        report = None
        if report_id:
            report = Report.objects.filter(id=report_id, is_deleted=False).first()
        elif report_name:
            report = Report.objects.filter(name__icontains=report_name, is_deleted=False).first()
        else:
            report = Report.objects.filter(is_deleted=False).first()

        if not report:
            raise CommandError("Target report not found. Pass --report-name or create a report first.")

        fmt = options.get('format', 'pdf')
        self.stdout.write(f"Generating data for report '{report.name}'...")
        generator = ReportGenerator()
        gen_result = generator.generate_report(str(report.id), async_mode=False)

        if gen_result.get('status') != 'success':
            raise CommandError(f"Report generation failed: {gen_result.get('error')}")

        report_data = gen_result.get('data', {})
        self.stdout.write(f"Exporting to format '{fmt.upper()}'...")
        export_path = ExportFactory.export(
            format=fmt,
            data=report_data,
            report_name=report.name
        )

        export_obj = ReportExport.objects.create(
            tenant_id=tenant_id,
            report=report,
            export_format=fmt,
            status='completed',
            file_path=export_path,
            file_url=f"/media/{export_path}",
            created_by=user,
            owner=user,
            completed_at=timezone.now()
        )
        self.stdout.write(self.style.SUCCESS(f"Export created successfully! (ID: {export_obj.id})"))
        self.stdout.write(f"File Path: {export_path}")

    def action_cleanup_expired(self, tenant_id):
        expired = ReportExport.objects.filter(is_deleted=False, expires_at__lte=timezone.now())
        count = expired.count()
        for e in expired:
            e.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Cleaned up {count} expired exports."))
