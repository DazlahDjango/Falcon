# apps/reportplt/management/commands/manage_templates.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Templates, Prebuilt Seeders & Custom Layouts.

Usage Examples:
    # 1. List all templates for tenant
    python manage.py manage_templates --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. Seed canonical prebuilt templates for tenant
    python manage.py manage_templates --action seed_prebuilt

    # 3. Create a Custom Template
    python manage.py manage_templates --action create --name "Executive Rollup Template" \
        --template-type executive --category management

    # 4. View template details
    python manage.py manage_templates --action details --template-name "Executive Rollup Template"

    # 5. Set default template
    python manage.py manage_templates --action set_default --template-name "Executive Rollup Template"

    # 6. Duplicate a template
    python manage.py manage_templates --action duplicate --template-name "Executive Rollup Template" --new-name "Executive Rollup Copy"

    # 7. Delete template
    python manage.py manage_templates --action delete --template-name "Executive Rollup Copy"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import ReportTemplate
from apps.reportplt.constants import TemplateType
from apps.reportplt.services.templates.prebuilt_templates import PrebuiltTemplates
from apps.reportplt.services.templates.template_manager import TemplateManager


class Command(BaseCommand):
    help = 'Manage report templates, seed prebuilt libraries, configure defaults, and manage layouts.'

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
            choices=['list', 'details', 'create', 'seed_prebuilt', 'publish', 'unpublish', 'set_default', 'duplicate', 'delete'],
            default='list',
            help='Action to perform'
        )

        parser.add_argument('--template-id', type=str, default=None, help='Template UUID')
        parser.add_argument('--template-name', '-n', type=str, default=None, help='Template Name')
        parser.add_argument('--name', type=str, default=None, help='Name for creation')
        parser.add_argument('--new-name', type=str, default=None, help='Name for duplication')
        parser.add_argument('--description', type=str, default='', help='Template Description')
        parser.add_argument('--template-type', type=str, default='executive', help='Template Type key')
        parser.add_argument('--category', type=str, default='management', help='Category')

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

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON TEMPLATE MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {user.email if user else 'System'} (Role: {getattr(user, 'role', 'N/A')})")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'details':
            self.action_details(tenant_id, options)
        elif action == 'create':
            self.action_create(tenant_id, user, options)
        elif action == 'seed_prebuilt':
            self.action_seed_prebuilt(tenant_id, user)
        elif action == 'publish':
            self.action_publish(tenant_id, user, options, True)
        elif action == 'unpublish':
            self.action_publish(tenant_id, user, options, False)
        elif action == 'set_default':
            self.action_set_default(tenant_id, user, options)
        elif action == 'duplicate':
            self.action_duplicate(tenant_id, user, options)
        elif action == 'delete':
            self.action_delete(tenant_id, options)

    def _find_template(self, tenant_id, options):
        template_id = options.get('template_id')
        template_name = options.get('template_name')
        if template_id:
            return ReportTemplate.objects.filter(id=template_id, is_deleted=False).first()
        if template_name:
            return ReportTemplate.objects.filter(name__icontains=template_name, is_deleted=False).first()
        return ReportTemplate.objects.filter(is_deleted=False).first()

    def action_list(self, tenant_id, options):
        templates = ReportTemplate.objects.filter(is_deleted=False).order_by('-created_at')
        count = templates.count()
        self.stdout.write(f"Total Templates Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No templates found in this tenant schema. Use '--action seed_prebuilt' to seed."))
            return

        self.stdout.write(f"{'ID':<38} {'Name':<32} {'Type':<18} {'Default':<8} {'System':<8} {'Published':<10}")
        self.stdout.write("-" * 115)
        for t in templates[:40]:
            name_disp = (t.name[:29] + '...') if len(t.name) > 32 else t.name
            self.stdout.write(f"{str(t.id):<38} {name_disp:<32} {t.template_type:<18} {str(t.is_default):<8} {str(t.is_system):<8} {str(t.is_published):<10}")

    def action_details(self, tenant_id, options):
        template = self._find_template(tenant_id, options)
        if not template:
            raise CommandError("Template not found.")

        self.stdout.write(f"ID          : {template.id}")
        self.stdout.write(f"Name        : {template.name}")
        self.stdout.write(f"Type        : {template.template_type} ({template.get_template_type_display()})")
        self.stdout.write(f"Category    : {template.category}")
        self.stdout.write(f"Sector      : {template.get_sector_display()}")
        self.stdout.write(f"Is System   : {template.is_system}")
        self.stdout.write(f"Is Published: {template.is_published}")
        self.stdout.write(f"Is Default  : {template.is_default}")
        self.stdout.write(f"Is Popular  : {template.is_popular}")
        self.stdout.write(f"Version     : v{template.version}")
        self.stdout.write(f"Owner       : {template.owner.email if template.owner else 'System'}")
        self.stdout.write(f"Created At  : {template.created_at}")

    def action_create(self, tenant_id, user, options):
        name = options.get('name') or options.get('template_name')
        if not name:
            raise CommandError("--name is required for create action.")

        template = ReportTemplate.objects.create(
            tenant_id=tenant_id,
            name=name,
            description=options.get('description', ''),
            template_type=options.get('template_type', 'executive'),
            category=options.get('category', 'management'),
            created_by=user,
            owner=user,
            is_published=True
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created template '{template.name}' (ID: {template.id})"))

    def action_seed_prebuilt(self, tenant_id, user):
        self.stdout.write(f"Seeding canonical prebuilt report templates for tenant {tenant_id}...")
        prebuilt = PrebuiltTemplates()
        seeded = prebuilt.seed_prebuilt_templates(tenant_id=tenant_id)
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(seeded)} prebuilt templates."))

    def action_publish(self, tenant_id, user, options, state):
        template = self._find_template(tenant_id, options)
        if not template:
            raise CommandError("Template not found.")

        manager = TemplateManager(user)
        if state:
            manager.publish_template(str(template.id))
            self.stdout.write(self.style.SUCCESS(f"Template '{template.name}' published."))
        else:
            manager.unpublish_template(str(template.id))
            self.stdout.write(self.style.SUCCESS(f"Template '{template.name}' unpublished."))

    def action_set_default(self, tenant_id, user, options):
        template = self._find_template(tenant_id, options)
        if not template:
            raise CommandError("Template not found.")

        manager = TemplateManager(user)
        manager.set_default_template(str(template.id))
        self.stdout.write(self.style.SUCCESS(f"Template '{template.name}' set as default for {template.template_type}."))

    def action_duplicate(self, tenant_id, user, options):
        template = self._find_template(tenant_id, options)
        if not template:
            raise CommandError("Template not found.")

        new_name = options.get('new_name') or f"{template.name} (Copy)"
        manager = TemplateManager(user)
        copy_tmpl = manager.duplicate_template(str(template.id), new_name=new_name)
        self.stdout.write(self.style.SUCCESS(f"Template duplicated as '{copy_tmpl.name}' (ID: {copy_tmpl.id})"))

    def action_delete(self, tenant_id, options):
        template = self._find_template(tenant_id, options)
        if not template:
            raise CommandError("Template not found.")

        name = template.name
        template.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Template '{name}' deleted."))
