"""
Seed complete Organization Structure for a specified tenant ID.
Usage:
    python manage.py seed_tenant_structure --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.position import Position
from apps.structure.models.employment import Employment


class Command(BaseCommand):
    help = 'Seeds complete Organization Structure (Divisions, Departments, Sections, Units, Positions, Employments) for a tenant.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to seed structure for'
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

        users_qs = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not users_qs.exists():
            raise CommandError(f"No active users found for tenant_id '{tenant_id}'.")

        user_map = {u.email.lower(): u for u in users_qs}
        self.stdout.write(f"[START] Seeding structure for tenant '{tenant_id}' (schema: {schema_name}) with {len(user_map)} users...")

        with transaction.atomic():
            # 1. DIVISIONS
            divisions_def = [
                ('DIV_EXEC', 'Executive Division', 'C-Suite and Strategic Planning', 'sarah.jenkins@globalapex.com'),
                ('DIV_TECH', 'Technology & Product Division', 'Engineering, Product, and Quality Assurance', 'rachel.adams@globalapex.com'),
                ('DIV_COMM', 'Commercial & Growth Division', 'Sales, Marketing, and Business Development', 'mark.vance@globalapex.com'),
                ('DIV_OPS', 'Operations & Finance Division', 'Operations, Supply Chain, CS, and Finance', 'daniel.taylor@globalapex.com'),
            ]

            divisions = {}
            for code, name, desc, lead_email in divisions_def:
                director = user_map.get(lead_email.lower())
                div, _ = Division.objects.update_or_create(
                    tenant_id=tenant_id,
                    code=code,
                    defaults={
                        'name': name,
                        'description': desc,
                        'director_id': director.id if director else None,
                        'is_active': True,
                    }
                )
                divisions[code] = div

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(divisions)} Divisions."))

            # 2. DEPARTMENTS
            depts_def = [
                ('DEP_EXEC', 'Executive Office', 'DIV_EXEC', 'sarah.jenkins@globalapex.com', 'Executive Office'),
                ('DEP_STRAT', 'Strategy & Planning', 'DIV_EXEC', 'elena.rostova@globalapex.com', 'Strategy & Planning'),
                ('DEP_ENG', 'Engineering & IT', 'DIV_TECH', 'rachel.adams@globalapex.com', 'Engineering & IT'),
                ('DEP_PROD', 'Product Management', 'DIV_TECH', 'nathan.scott@globalapex.com', 'Product Management'),
                ('DEP_SALES', 'Sales & Revenue', 'DIV_COMM', 'mark.vance@globalapex.com', 'Sales & Revenue'),
                ('DEP_MKTG', 'Marketing', 'DIV_COMM', 'lisa.ray@globalapex.com', 'Marketing'),
                ('DEP_OPS', 'Operations & Logistics', 'DIV_OPS', 'daniel.taylor@globalapex.com', 'Operations & Logistics'),
                ('DEP_CS', 'Customer Success', 'DIV_OPS', 'robert.martin@globalapex.com', 'Customer Success'),
                ('DEP_FIN', 'Finance & Admin', 'DIV_OPS', 'brian.garcia@globalapex.com', 'Finance & Admin'),
            ]

            departments = {}
            for code, name, div_code, mgr_email, match_dept in depts_def:
                mgr = user_map.get(mgr_email.lower())
                dept, _ = Department.objects.update_or_create(
                    tenant_id=tenant_id,
                    code=code,
                    defaults={
                        'name': name,
                        'division': divisions[div_code],
                        'manager_id': mgr.id if mgr else None,
                        'is_active': True,
                    }
                )
                departments[code] = dept
                departments[match_dept] = dept

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated Departments."))

            # 3. SECTIONS
            sections_def = [
                ('SEC_SOFTWARE', 'Software Engineering', 'DEP_ENG', 'david.miller@globalapex.com'),
                ('SEC_DEVOPS', 'DevOps & Quality Assurance', 'DEP_ENG', 'sophia.martinez@globalapex.com'),
                ('SEC_ENT_SALES', 'Enterprise Sales', 'DEP_SALES', 'james.wilson@globalapex.com'),
                ('SEC_SUPP', 'Customer Support & Services', 'DEP_CS', 'jessica.lee@globalapex.com'),
                ('SEC_LOG', 'Supply Chain & Logistics', 'DEP_OPS', 'brandon.nelson@globalapex.com'),
            ]

            sections = {}
            for code, name, dept_code, lead_email in sections_def:
                lead = user_map.get(lead_email.lower())
                sec, _ = Section.objects.update_or_create(
                    tenant_id=tenant_id,
                    code=code,
                    defaults={
                        'name': name,
                        'department': departments[dept_code],
                        'section_lead_id': lead.id if lead else None,
                        'is_active': True,
                    }
                )
                sections[code] = sec

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(sections)} Sections."))

            # 4. UNITS (Teams)
            units_def = [
                ('UNT_BACKEND', 'Core Backend Team', 'SEC_SOFTWARE', 'thomas.wright@globalapex.com'),
                ('UNT_FRONTEND', 'Frontend & UI Team', 'SEC_SOFTWARE', 'andrew.baker@globalapex.com'),
                ('UNT_DIRECT_SALES', 'Direct Accounts Team', 'SEC_ENT_SALES', 'emily.clark@globalapex.com'),
                ('UNT_PAYROLL', 'Accounting & Payroll Team', 'SEC_LOG', 'olivia.davis@globalapex.com'),
            ]

            units = {}
            for code, name, sec_code, lead_email in units_def:
                lead = user_map.get(lead_email.lower())
                unit, _ = Unit.objects.update_or_create(
                    tenant_id=tenant_id,
                    code=code,
                    defaults={
                        'name': name,
                        'section': sections[sec_code],
                        'unit_lead_id': lead.id if lead else None,
                        'is_active': True,
                    }
                )
                units[code] = unit

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(units)} Units."))

            # 5. POSITIONS HIERARCHY
            positions_def = [
                ('POS_CEO', 'Chief Executive Officer', 1, None, 'DEP_EXEC'),
                ('POS_COO', 'Chief Operating Officer', 2, 'POS_CEO', 'DEP_EXEC'),
                ('POS_PERF_DIR', 'Performance Director', 2, 'POS_CEO', 'DEP_STRAT'),
                ('POS_ENG_MGR', 'Engineering Manager', 3, 'POS_COO', 'DEP_ENG'),
                ('POS_SALES_MGR', 'Sales Manager', 3, 'POS_COO', 'DEP_SALES'),
                ('POS_OPS_DIR', 'Operations Director', 3, 'POS_COO', 'DEP_OPS'),
                ('POS_MKTG_MGR', 'Marketing Manager', 3, 'POS_COO', 'DEP_MKTG'),
                ('POS_CS_LEAD', 'Customer Support Lead', 3, 'POS_COO', 'DEP_CS'),
                ('POS_FIN_MGR', 'Finance Manager', 3, 'POS_COO', 'DEP_FIN'),
                ('POS_PROD_DIR', 'Product Director', 3, 'POS_COO', 'DEP_PROD'),
                # Staff Positions
                ('POS_ENG_LEAD', 'Principal Systems Architect', 4, 'POS_ENG_MGR', 'DEP_ENG'),
                ('POS_ENG_STAFF', 'Senior Software Engineer', 5, 'POS_ENG_LEAD', 'DEP_ENG'),
                ('POS_DEVOPS_LEAD', 'DevOps Lead', 4, 'POS_ENG_MGR', 'DEP_ENG'),
                ('POS_QA_LEAD', 'QA Automation Lead', 5, 'POS_DEVOPS_LEAD', 'DEP_ENG'),
                ('POS_SALES_SR_EXEC', 'Senior Account Executive', 4, 'POS_SALES_MGR', 'DEP_SALES'),
                ('POS_SALES_EXEC', 'Account Executive', 5, 'POS_SALES_SR_EXEC', 'DEP_SALES'),
                ('POS_SALES_SDR', 'Sales Development Rep', 6, 'POS_SALES_EXEC', 'DEP_SALES'),
                ('POS_SALES_ENT', 'Enterprise Account Executive', 4, 'POS_SALES_MGR', 'DEP_SALES'),
                ('POS_MKTG_SPEC', 'Digital Marketing Specialist', 4, 'POS_MKTG_MGR', 'DEP_MKTG'),
                ('POS_MKTG_STRAT', 'Content Strategist', 5, 'POS_MKTG_SPEC', 'DEP_MKTG'),
                ('POS_CS_MGR', 'Customer Success Manager', 4, 'POS_CS_LEAD', 'DEP_CS'),
                ('POS_CS_SPEC', 'Support Specialist', 5, 'POS_CS_MGR', 'DEP_CS'),
                ('POS_CS_REL', 'Client Relationship Lead', 4, 'POS_CS_LEAD', 'DEP_CS'),
                ('POS_FIN_ACCT', 'Senior Accountant', 4, 'POS_FIN_MGR', 'DEP_FIN'),
                ('POS_FIN_ANAL', 'Financial Analyst', 5, 'POS_FIN_ACCT', 'DEP_FIN'),
                ('POS_PROD_SR', 'Senior Product Manager', 4, 'POS_PROD_DIR', 'DEP_PROD'),
                ('POS_PROD_UX', 'UI/UX Designer', 5, 'POS_PROD_SR', 'DEP_PROD'),
                ('POS_OPS_LOG', 'Logistics Coordinator', 4, 'POS_OPS_DIR', 'DEP_OPS'),
                ('POS_OPS_PROC', 'Procurement Specialist', 5, 'POS_OPS_LOG', 'DEP_OPS'),
                ('POS_OPS_CHAIN', 'Supply Chain Analyst', 5, 'POS_OPS_LOG', 'DEP_OPS'),
                ('POS_CLIENT_ADMIN', 'Client Administrator', 1, 'POS_CEO', 'DEP_EXEC'),
            ]

            positions = {}
            for job_code, title, level, rpt_code, dept_code in positions_def:
                reports_to_pos = positions.get(rpt_code) if rpt_code else None
                dept_obj = departments.get(dept_code)
                pos, _ = Position.objects.update_or_create(
                    tenant_id=tenant_id,
                    job_code=job_code,
                    defaults={
                        'title': title,
                        'level': level,
                        'reports_to': reports_to_pos,
                        'department': dept_obj,
                        'is_active': True,
                    }
                )
                positions[job_code] = pos

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(positions)} Positions."))

            # 6. MAP ALL USERS TO POSITIONS VIA EMPLOYMENT
            user_position_assignment = [
                ('sarah.jenkins@globalapex.com', 'POS_CEO', True, True),
                ('victoria.king@globalapex.com', 'POS_COO', True, True),
                ('elena.rostova@globalapex.com', 'POS_PERF_DIR', True, False),
                ('rachel.adams@globalapex.com', 'POS_ENG_MGR', True, False),
                ('mark.vance@globalapex.com', 'POS_SALES_MGR', True, False),
                ('daniel.taylor@globalapex.com', 'POS_OPS_DIR', True, False),
                ('lisa.ray@globalapex.com', 'POS_MKTG_MGR', True, False),
                ('robert.martin@globalapex.com', 'POS_CS_LEAD', True, False),
                ('brian.garcia@globalapex.com', 'POS_FIN_MGR', True, False),
                ('nathan.scott@globalapex.com', 'POS_PROD_DIR', True, False),
                ('david.miller@globalapex.com', 'POS_ENG_LEAD', False, False),
                ('thomas.wright@globalapex.com', 'POS_ENG_STAFF', False, False),
                ('sophia.martinez@globalapex.com', 'POS_DEVOPS_LEAD', False, False),
                ('evelyn.perez@globalapex.com', 'POS_QA_LEAD', False, False),
                ('james.wilson@globalapex.com', 'POS_SALES_SR_EXEC', False, False),
                ('emily.clark@globalapex.com', 'POS_SALES_EXEC', False, False),
                ('michael.brown@globalapex.com', 'POS_SALES_SDR', False, False),
                ('justin.roberts@globalapex.com', 'POS_SALES_ENT', False, False),
                ('kevin.white@globalapex.com', 'POS_MKTG_SPEC', False, False),
                ('amanda.harris@globalapex.com', 'POS_MKTG_STRAT', False, False),
                ('jessica.lee@globalapex.com', 'POS_CS_MGR', False, False),
                ('william.thompson@globalapex.com', 'POS_CS_SPEC', False, False),
                ('megan.turner@globalapex.com', 'POS_CS_REL', False, False),
                ('olivia.davis@globalapex.com', 'POS_FIN_ACCT', False, False),
                ('christopher.lopez@globalapex.com', 'POS_FIN_ANAL', False, False),
                ('lauren.green@globalapex.com', 'POS_PROD_SR', False, False),
                ('andrew.baker@globalapex.com', 'POS_PROD_UX', False, False),
                ('brandon.nelson@globalapex.com', 'POS_OPS_LOG', False, False),
                ('hannah.carter@globalapex.com', 'POS_OPS_PROC', False, False),
                ('dylan.phillips@globalapex.com', 'POS_OPS_CHAIN', False, False),
                ('careen@falcontech.com', 'POS_CLIENT_ADMIN', True, False),
            ]

            today = timezone.now().date()
            employment_count = 0

            for email, pos_code, is_mgr, is_exec in user_position_assignment:
                u = user_map.get(email.lower())
                if not u:
                    self.stdout.write(self.style.WARNING(f"  [!] User email '{email}' not found in user_map!"))
                    continue

                pos = positions.get(pos_code)
                if not pos:
                    continue

                emp, _ = Employment.objects.update_or_create(
                    tenant_id=tenant_id,
                    user_id=u.id,
                    defaults={
                        'position': pos,
                        'is_current': True,
                        'is_primary': True,
                        'is_manager': is_mgr,
                        'is_executive': is_exec,
                        'effective_from': today,
                        'is_active': True,
                    }
                )
                employment_count += 1

                # Update User department string
                if pos.department:
                    u.department = pos.department.name
                    u.save(update_fields=['department'])

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {employment_count} Employments."))

        self.stdout.write(self.style.SUCCESS(f"\n[SUCCESS] Completed Organization Structure seeding for tenant '{tenant_id}'!"))
