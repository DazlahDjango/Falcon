# apps/reportplt/management/commands/manage_distributions.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Distribution Lists & Member Assignments.

Usage Examples:
    # 1. List all distribution lists for tenant
    python manage.py manage_distributions --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. View summary
    python manage.py manage_distributions --action summary

    # 3. Create a Distribution List
    python manage.py manage_distributions --action create --name "Executive Board Recipients" \
        --members "board.exec@falcontech.com,ceo@falcontech.com"

    # 4. View list details
    python manage.py manage_distributions --action details --list-name "Executive Board Recipients"

    # 5. Add / Remove Members
    python manage.py manage_distributions --action add_member --list-name "Executive Board Recipients" --email "cfo@falcontech.com"
    python manage.py manage_distributions --action remove_member --list-name "Executive Board Recipients" --email "cfo@falcontech.com"

    # 6. Delete distribution list
    python manage.py manage_distributions --action delete --list-name "Executive Board Recipients"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import DistributionList


class Command(BaseCommand):
    help = 'Manage report distribution lists, recipient members, and department assignments.'

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
            choices=['list', 'summary', 'details', 'create', 'add_member', 'remove_member', 'delete'],
            default='list',
            help='Action to perform'
        )

        parser.add_argument('--list-id', type=str, default=None, help='Distribution List UUID')
        parser.add_argument('--list-name', '-l', type=str, default=None, help='Distribution List Name')
        parser.add_argument('--name', type=str, default=None, help='Name for creation')
        parser.add_argument('--description', type=str, default='', help='Description')
        parser.add_argument('--members', type=str, default='', help='Comma-separated member emails')
        parser.add_argument('--email', type=str, default=None, help='Email for add_member or remove_member')

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

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON DISTRIBUTION LIST MANAGEMENT COMMAND ==="))
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
        elif action == 'add_member':
            self.action_add_member(tenant_id, options)
        elif action == 'remove_member':
            self.action_remove_member(tenant_id, options)
        elif action == 'delete':
            self.action_delete(tenant_id, options)

    def _find_list(self, tenant_id, options):
        l_id = options.get('list_id')
        l_name = options.get('list_name')
        if l_id:
            return DistributionList.objects.filter(id=l_id, is_deleted=False).first()
        if l_name:
            return DistributionList.objects.filter(name__icontains=l_name, is_deleted=False).first()
        return DistributionList.objects.filter(is_deleted=False).first()

    def action_list(self, tenant_id, options):
        lists = DistributionList.objects.filter(is_deleted=False).order_by('-created_at')
        count = lists.count()
        self.stdout.write(f"Total Distribution Lists Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No distribution lists found in this tenant schema."))
            return

        self.stdout.write(f"{'ID':<38} {'Name':<32} {'Members':<8} {'Active':<8} {'Owner':<25}")
        self.stdout.write("-" * 115)
        for l in lists[:40]:
            name_disp = (l.name[:29] + '...') if len(l.name) > 32 else l.name
            m_count = len(l.members) if isinstance(l.members, list) else 0
            owner_disp = l.owner.email if l.owner else 'System'
            self.stdout.write(f"{str(l.id):<38} {name_disp:<32} {m_count:<8} {str(l.is_active):<8} {owner_disp:<25}")

    def action_summary(self, tenant_id):
        total = DistributionList.objects.filter(is_deleted=False).count()
        active = DistributionList.objects.filter(is_deleted=False, is_active=True).count()

        self.stdout.write("DISTRIBUTION LISTS SUMMARY:")
        self.stdout.write(f"  * Total Distribution Lists: {total}")
        self.stdout.write(f"  * Active Lists            : {active}")

    def action_details(self, tenant_id, options):
        dist_list = self._find_list(tenant_id, options)
        if not dist_list:
            raise CommandError("Distribution list not found.")

        self.stdout.write(f"ID          : {dist_list.id}")
        self.stdout.write(f"Name        : {dist_list.name}")
        self.stdout.write(f"Description : {dist_list.description}")
        self.stdout.write(f"Is Active   : {dist_list.is_active}")
        self.stdout.write(f"Owner       : {dist_list.owner.email if dist_list.owner else 'System'}")
        self.stdout.write(f"Members     : {dist_list.members}")
        self.stdout.write(f"Created At  : {dist_list.created_at}")

    def action_create(self, tenant_id, user, options):
        name = options.get('name') or options.get('list_name')
        if not name:
            raise CommandError("--name is required for create action.")

        raw_members = options.get('members', '')
        members = [m.strip() for m in raw_members.split(',') if m.strip()]

        dist_list = DistributionList.objects.create(
            tenant_id=tenant_id,
            name=name,
            description=options.get('description', ''),
            members=members,
            is_active=True,
            created_by=user,
            owner=user
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created distribution list '{dist_list.name}' (ID: {dist_list.id})"))

    def action_add_member(self, tenant_id, options):
        dist_list = self._find_list(tenant_id, options)
        if not dist_list:
            raise CommandError("Distribution list not found.")

        email = options.get('email')
        if not email:
            raise CommandError("--email is required for add_member action.")

        members = list(dist_list.members or [])
        if email not in members:
            members.append(email)
            dist_list.members = members
            dist_list.save(update_fields=['members'])
            self.stdout.write(self.style.SUCCESS(f"Added member '{email}' to '{dist_list.name}'."))
        else:
            self.stdout.write(self.style.WARNING(f"Member '{email}' is already in '{dist_list.name}'."))

    def action_remove_member(self, tenant_id, options):
        dist_list = self._find_list(tenant_id, options)
        if not dist_list:
            raise CommandError("Distribution list not found.")

        email = options.get('email')
        if not email:
            raise CommandError("--email is required for remove_member action.")

        members = list(dist_list.members or [])
        if email in members:
            members.remove(email)
            dist_list.members = members
            dist_list.save(update_fields=['members'])
            self.stdout.write(self.style.SUCCESS(f"Removed member '{email}' from '{dist_list.name}'."))
        else:
            self.stdout.write(self.style.WARNING(f"Member '{email}' was not in '{dist_list.name}'."))

    def action_delete(self, tenant_id, options):
        dist_list = self._find_list(tenant_id, options)
        if not dist_list:
            raise CommandError("Distribution list not found.")

        name = dist_list.name
        dist_list.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Distribution list '{name}' deleted."))
