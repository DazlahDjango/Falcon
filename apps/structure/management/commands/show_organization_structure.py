"""
Show complete Organization Structure hierarchy and user counts for a tenant.
Usage:
    python manage.py show_organization_structure --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from apps.accounts.models import User
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.employment import Employment


class Command(BaseCommand):
    help = 'List complete organization structure (Divisions, Departments, Sections, Units) with assigned user counts for a tenant.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to inspect structure for'
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']

        from apps.tenant.models import Organization, OrganizationSchema
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

        all_users = list(User.objects.filter(tenant_id=tenant_id, is_deleted=False))
        if not all_users:
            raise CommandError(f"No active users found for tenant_id '{tenant_id}'.")

        user_map = {u.id: u for u in all_users}

        # Fetch active employments
        employments = list(Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_active=True
        ).select_related('position', 'position__division', 'position__department', 'position__section', 'position__unit'))

        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" ORGANIZATIONAL STRUCTURE REPORT FOR TENANT: {tenant_id}"))
        self.stdout.write(f" Schema: {schema_name} | Total Users: {len(all_users)} | Total Active Employments: {len(employments)}")
        self.stdout.write("=" * 85 + "\n")

        # Divisions
        divisions = Division.objects.filter(tenant_id=tenant_id, is_deleted=False).order_by('code')

        for div in divisions:
            div_user_ids = {
                e.user_id for e in employments
                if e.position and e.position.division_id == div.id
            }
            director = user_map.get(div.director_id)
            director_str = f"{director.first_name} {director.last_name} ({director.email})" if director else "Not Assigned"

            self.stdout.write(self.style.WARNING(f"[DIVISION] [{div.code}] {div.name}"))
            self.stdout.write(f"   • Director: {director_str}")
            self.stdout.write(f"   • Total Division Users: {len(div_user_ids)}\n")

            # Departments under Division
            depts = Department.objects.filter(tenant_id=tenant_id, division=div, is_deleted=False).order_by('code')
            for dept in depts:
                dept_user_ids = {
                    e.user_id for e in employments
                    if e.position and e.position.department_id == dept.id
                }
                mgr = user_map.get(dept.manager_id)
                mgr_str = f"{mgr.first_name} {mgr.last_name} ({mgr.email})" if mgr else "Not Assigned"

                self.stdout.write(f"   [DEPARTMENT] [{dept.code}] {dept.name}")
                self.stdout.write(f"      • Manager: {mgr_str}")
                self.stdout.write(f"      • Department Users: {len(dept_user_ids)}")

                # Sections under Department
                sections = Section.objects.filter(tenant_id=tenant_id, department=dept, is_deleted=False).order_by('code')
                if sections.exists():
                    for sec in sections:
                        sec_user_ids = {
                            e.user_id for e in employments
                            if e.position and e.position.section_id == sec.id
                        }
                        sec_lead = user_map.get(sec.section_lead_id)
                        sec_lead_str = f"{sec_lead.first_name} {sec_lead.last_name} ({sec_lead.email})" if sec_lead else "Not Assigned"

                        self.stdout.write(f"      [SECTION] [{sec.code}] {sec.name}")
                        self.stdout.write(f"         • Section Lead: {sec_lead_str}")
                        self.stdout.write(f"         • Section Users: {len(sec_user_ids)}")

                        # Units under Section
                        units = Unit.objects.filter(tenant_id=tenant_id, section=sec, is_deleted=False).order_by('code')
                        if units.exists():
                            for unit in units:
                                unit_user_ids = {
                                    e.user_id for e in employments
                                    if e.position and e.position.unit_id == unit.id
                                }
                                unit_lead = user_map.get(unit.unit_lead_id)
                                unit_lead_str = f"{unit_lead.first_name} {unit_lead.last_name} ({unit_lead.email})" if unit_lead else "Not Assigned"

                                self.stdout.write(f"         [UNIT] [{unit.code}] {unit.name}")
                                self.stdout.write(f"            • Unit Lead: {unit_lead_str}")
                                self.stdout.write(f"            • Unit Users: {len(unit_user_ids)}")
                        else:
                            self.stdout.write("         (No Units in this Section)")
                        self.stdout.write("")
                else:
                    self.stdout.write("      (No Sections in this Department)")
                self.stdout.write("")

            self.stdout.write("-" * 85 + "\n")

        # Summary of unassigned users
        assigned_user_ids = {e.user_id for e in employments if e.position_id}
        unassigned = [u for u in all_users if u.id not in assigned_user_ids]
        self.stdout.write(self.style.SUCCESS(f"SUMMARY: {len(assigned_user_ids)} users assigned to structure | {len(unassigned)} unassigned users."))
