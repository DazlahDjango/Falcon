"""
Print reporting chain for all users in a tenant.
Usage:
    python manage.py show_reporting_chain --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from django.core.management.base import BaseCommand
from django.db import connection
from apps.accounts.models import User
from apps.structure.models.employment import Employment
from apps.structure.services.reporting.chain_service import ChainService


class Command(BaseCommand):
    help = 'Inspect reporting chain of command for tenant employments.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to inspect reporting chain for'
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']

        from apps.tenant.models import OrganizationSchema
        schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
        schema_name = schema_obj.schema_name if schema_obj else 'public'

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')

        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_active=True).select_related('position')
        self.stdout.write(f"\n[REPORTING CHAIN INSPECTOR] Tenant '{tenant_id}' ({len(employments)} employments):\n")

        chain_service = ChainService()

        for emp in employments:
            user = User.objects.filter(id=emp.user_id).first()
            user_name = f"{user.first_name} {user.last_name}" if user else str(emp.user_id)
            pos_title = emp.position.title if emp.position else "No Position"
            dept_name = emp.position.department.name if (emp.position and emp.position.department) else "No Dept"

            chain = chain_service.get_chain_of_command(emp.user_id, tenant_id, use_cache=False)
            
            chain_str = " -> ".join([
                f"{c['position']} ({c['user_id'][:8]}...)" for c in chain
            ]) if chain else "[ROOT / CEO]"

            self.stdout.write(f"• {user_name} ({pos_title} | {dept_name})")
            self.stdout.write(f"  Reports Chain: {chain_str}\n")
