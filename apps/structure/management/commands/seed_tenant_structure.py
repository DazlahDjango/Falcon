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
    help = 'Seeds complete Organization Structure (Divisions, Departments, Sections, Units, Positions, Employments) for all users in a tenant.'

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

        user_list = list(users_qs.order_by('date_joined', 'email'))
        user_map = {u.email.lower(): u for u in user_list}
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

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(depts_def)} Departments."))

            # 3. SECTIONS (2 per primary department)
            sections_def = [
                ('SEC_SOFTWARE', 'Software Engineering', 'DEP_ENG', 'david.miller@globalapex.com'),
                ('SEC_DEVOPS', 'DevOps & Quality Assurance', 'DEP_ENG', 'sophia.martinez@globalapex.com'),
                ('SEC_PROD_DEV', 'Core Product Development', 'DEP_PROD', 'ierickson@globalapex.com'),
                ('SEC_UX_DESIGN', 'UX & Design Research', 'DEP_PROD', 'zjarvis@globalapex.com'),
                ('SEC_ENT_SALES', 'Enterprise Sales', 'DEP_SALES', 'james.wilson@globalapex.com'),
                ('SEC_GOV_SALES', 'Government & Public Sales', 'DEP_SALES', 'agallagher@globalapex.com'),
                ('SEC_DIG_MKTG', 'Digital Marketing', 'DEP_MKTG', 'kkeller@globalapex.com'),
                ('SEC_BRAND', 'Brand & Communications', 'DEP_MKTG', 'mwalsh@globalapex.com'),
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

            # 4. UNITS (2 per section)
            units_def = [
                # Engineering
                ('UNT_BACKEND', 'Core Backend Team', 'SEC_SOFTWARE', 'thomas.wright@globalapex.com'),
                ('UNT_FRONTEND', 'Frontend & UI Team', 'SEC_SOFTWARE', 'fkemp@globalapex.com'),
                ('UNT_INFRA', 'Cloud Infrastructure Unit', 'SEC_DEVOPS', 'fnorris@globalapex.com'),
                ('UNT_QA_AUTO', 'QA Automation Unit', 'SEC_DEVOPS', 'gquinn@globalapex.com'),
                # Product
                ('UNT_PROD_CORE', 'Platform Product Unit', 'SEC_PROD_DEV', 'gtate@globalapex.com'),
                ('UNT_PROD_MOBILE', 'Mobile Apps Product Unit', 'SEC_PROD_DEV', 'hwallace@globalapex.com'),
                ('UNT_UI_DESIGN', 'UI Design Unit', 'SEC_UX_DESIGN', 'hbates@globalapex.com'),
                ('UNT_USER_RES', 'User Research Unit', 'SEC_UX_DESIGN', 'ibailey@globalapex.com'),
                # Sales
                ('UNT_DIRECT_SALES', 'Direct Accounts Team', 'SEC_ENT_SALES', 'emily.clark@globalapex.com'),
                ('UNT_INSIDE_SALES', 'Inside Sales Team', 'SEC_ENT_SALES', 'cvance@globalapex.com'),
                ('UNT_GOV_SOUTH', 'Southern Region Unit', 'SEC_GOV_SALES', 'dyates@globalapex.com'),
                ('UNT_GOV_NORTH', 'Northern Region Unit', 'SEC_GOV_SALES', 'dbarrett@globalapex.com'),
                # Marketing
                ('UNT_SEO_SEM', 'SEO & Growth Unit', 'SEC_DIG_MKTG', 'knixon@globalapex.com'),
                ('UNT_SOC_MEDIA', 'Social Media Unit', 'SEC_DIG_MKTG', 'lquitley@globalapex.com'),
                ('UNT_CREATIVE', 'Creative Media Unit', 'SEC_BRAND', 'lthornton@globalapex.com'),
                ('UNT_PR_COMMS', 'Public Relations Unit', 'SEC_BRAND', 'mzimmerman@globalapex.com'),
                # Support & Logistics
                ('UNT_CS_TIER1', 'Tier 1 Support Team', 'SEC_SUPP', 'jessica.lee@globalapex.com'),
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
                # Single-Incumbent Leadership Positions
                ('POS_CEO', 'Chief Executive Officer', 1, None, 'DEP_EXEC', None, None, True),
                ('POS_COO', 'Chief Operating Officer', 2, 'POS_CEO', 'DEP_EXEC', None, None, True),
                ('POS_PERF_DIR', 'Performance Director', 2, 'POS_CEO', 'DEP_STRAT', None, None, True),
                ('POS_ENG_MGR', 'Engineering Manager', 3, 'POS_COO', 'DEP_ENG', 'SEC_SOFTWARE', 'UNT_BACKEND', True),
                ('POS_SALES_MGR', 'Sales Manager', 3, 'POS_COO', 'DEP_SALES', 'SEC_ENT_SALES', 'UNT_DIRECT_SALES', True),
                ('POS_OPS_DIR', 'Operations Director', 3, 'POS_COO', 'DEP_OPS', 'SEC_LOG', 'UNT_PAYROLL', True),
                ('POS_MKTG_MGR', 'Marketing Manager', 3, 'POS_COO', 'DEP_MKTG', 'SEC_DIG_MKTG', 'UNT_SEO_SEM', True),
                ('POS_CS_LEAD', 'Customer Support Lead', 3, 'POS_COO', 'DEP_CS', 'SEC_SUPP', 'UNT_CS_TIER1', True),
                ('POS_FIN_MGR', 'Finance Manager', 3, 'POS_COO', 'DEP_FIN', None, None, True),
                ('POS_PROD_DIR', 'Product Director', 3, 'POS_COO', 'DEP_PROD', 'SEC_PROD_DEV', 'UNT_PROD_CORE', True),

                # Section & Unit Leads (Single Incumbent)
                ('POS_ENG_LEAD', 'Principal Systems Architect', 4, 'POS_ENG_MGR', 'DEP_ENG', 'SEC_SOFTWARE', 'UNT_BACKEND', True),
                ('POS_DEVOPS_LEAD', 'DevOps Lead', 4, 'POS_ENG_MGR', 'DEP_ENG', 'SEC_DEVOPS', 'UNT_INFRA', True),
                ('POS_QA_LEAD', 'QA Automation Lead', 5, 'POS_DEVOPS_LEAD', 'DEP_ENG', 'SEC_DEVOPS', 'UNT_QA_AUTO', True),
                ('POS_SALES_SR_EXEC', 'Senior Account Executive', 4, 'POS_SALES_MGR', 'DEP_SALES', 'SEC_ENT_SALES', 'UNT_DIRECT_SALES', True),
                ('POS_CLIENT_ADMIN', 'Client Administrator', 1, 'POS_CEO', 'DEP_EXEC', None, None, True),

                # Multi-Incumbent Staff Positions (Assigned to all employees across Units & Sections)
                ('POS_ENG_STAFF', 'Software Engineer', 5, 'POS_ENG_LEAD', 'DEP_ENG', 'SEC_SOFTWARE', 'UNT_BACKEND', False),
                ('POS_FRONTEND_DEV', 'Frontend Developer', 5, 'POS_ENG_LEAD', 'DEP_ENG', 'SEC_SOFTWARE', 'UNT_FRONTEND', False),
                ('POS_DEVOPS_ENG', 'DevOps Engineer', 5, 'POS_DEVOPS_LEAD', 'DEP_ENG', 'SEC_DEVOPS', 'UNT_INFRA', False),
                ('POS_QA_ENG', 'QA Test Engineer', 6, 'POS_QA_LEAD', 'DEP_ENG', 'SEC_DEVOPS', 'UNT_QA_AUTO', False),

                ('POS_PROD_MGR', 'Product Manager', 4, 'POS_PROD_DIR', 'DEP_PROD', 'SEC_PROD_DEV', 'UNT_PROD_CORE', False),
                ('POS_MOBILE_DEV', 'Mobile Specialist', 5, 'POS_PROD_DIR', 'DEP_PROD', 'SEC_PROD_DEV', 'UNT_PROD_MOBILE', False),
                ('POS_UI_DESIGNER', 'UI Specialist', 5, 'POS_PROD_DIR', 'DEP_PROD', 'SEC_UX_DESIGN', 'UNT_UI_DESIGN', False),
                ('POS_UX_RESEARCHER', 'UX Researcher', 5, 'POS_PROD_DIR', 'DEP_PROD', 'SEC_UX_DESIGN', 'UNT_USER_RES', False),

                ('POS_SALES_EXEC', 'Account Executive', 5, 'POS_SALES_SR_EXEC', 'DEP_SALES', 'SEC_ENT_SALES', 'UNT_DIRECT_SALES', False),
                ('POS_INSIDE_SALES', 'Inside Sales Rep', 5, 'POS_SALES_SR_EXEC', 'DEP_SALES', 'SEC_ENT_SALES', 'UNT_INSIDE_SALES', False),
                ('POS_GOV_SOUTH_REP', 'South Sales Rep', 5, 'POS_SALES_MGR', 'DEP_SALES', 'SEC_GOV_SALES', 'UNT_GOV_SOUTH', False),
                ('POS_GOV_NORTH_REP', 'North Sales Rep', 5, 'POS_SALES_MGR', 'DEP_SALES', 'SEC_GOV_SALES', 'UNT_GOV_NORTH', False),

                ('POS_SEO_SPEC', 'SEO & Growth Specialist', 5, 'POS_MKTG_MGR', 'DEP_MKTG', 'SEC_DIG_MKTG', 'UNT_SEO_SEM', False),
                ('POS_SOC_MEDIA_SPEC', 'Social Media Specialist', 5, 'POS_MKTG_MGR', 'DEP_MKTG', 'SEC_DIG_MKTG', 'UNT_SOC_MEDIA', False),
                ('POS_CREATIVE_SPEC', 'Creative Designer', 5, 'POS_MKTG_MGR', 'DEP_MKTG', 'SEC_BRAND', 'UNT_CREATIVE', False),
                ('POS_PR_COMMS_SPEC', 'PR Specialist', 5, 'POS_MKTG_MGR', 'DEP_MKTG', 'SEC_BRAND', 'UNT_PR_COMMS', False),

                ('POS_CS_SPEC', 'Support Specialist', 5, 'POS_CS_LEAD', 'DEP_CS', 'SEC_SUPP', 'UNT_CS_TIER1', False),
                ('POS_OPS_SPEC', 'Logistics Analyst', 5, 'POS_OPS_DIR', 'DEP_OPS', 'SEC_LOG', 'UNT_PAYROLL', False),
                ('POS_FIN_SPEC', 'Financial Accountant', 5, 'POS_FIN_MGR', 'DEP_FIN', None, None, False),
            ]

            positions = {}
            for job_code, title, level, rpt_code, dept_code, sec_code, unt_code, single_inc in positions_def:
                reports_to_pos = positions.get(rpt_code) if rpt_code else None
                dept_obj = departments.get(dept_code)
                div_obj = dept_obj.division if dept_obj else None
                sec_obj = sections.get(sec_code) if sec_code else None
                unt_obj = units.get(unt_code) if unt_code else None

                pos, _ = Position.objects.update_or_create(
                    tenant_id=tenant_id,
                    job_code=job_code,
                    defaults={
                        'title': title,
                        'level': level,
                        'reports_to': reports_to_pos,
                        'division': div_obj,
                        'department': dept_obj,
                        'section': sec_obj,
                        'unit': unt_obj,
                        'is_single_incumbent': single_inc,
                        'is_active': True,
                    }
                )
                positions[job_code] = pos

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {len(positions)} Positions."))

            # 6. MAP ALL USERS TO POSITIONS & EMPLOYMENTS
            # Known key leaders
            key_assignments = {
                'sarah.jenkins@globalapex.com': ('POS_CEO', True, True),
                'victoria.king@globalapex.com': ('POS_COO', True, True),
                'elena.rostova@globalapex.com': ('POS_PERF_DIR', True, False),
                'rachel.adams@globalapex.com': ('POS_ENG_MGR', True, False),
                'mark.vance@globalapex.com': ('POS_SALES_MGR', True, False),
                'daniel.taylor@globalapex.com': ('POS_OPS_DIR', True, False),
                'lisa.ray@globalapex.com': ('POS_MKTG_MGR', True, False),
                'robert.martin@globalapex.com': ('POS_CS_LEAD', True, False),
                'brian.garcia@globalapex.com': ('POS_FIN_MGR', True, False),
                'nathan.scott@globalapex.com': ('POS_PROD_DIR', True, False),
                'david.miller@globalapex.com': ('POS_ENG_LEAD', True, False),
                'sophia.martinez@globalapex.com': ('POS_DEVOPS_LEAD', True, False),
                'evelyn.perez@globalapex.com': ('POS_QA_LEAD', False, False),
                'james.wilson@globalapex.com': ('POS_SALES_SR_EXEC', True, False),
                'careen@falcontech.com': ('POS_CLIENT_ADMIN', True, False),
            }

            # Multi-incumbent staff pool for round-robin assignment of all general employees
            staff_position_pool = [
                'POS_ENG_STAFF', 'POS_FRONTEND_DEV', 'POS_DEVOPS_ENG', 'POS_QA_ENG',
                'POS_PROD_MGR', 'POS_MOBILE_DEV', 'POS_UI_DESIGNER', 'POS_UX_RESEARCHER',
                'POS_SALES_EXEC', 'POS_INSIDE_SALES', 'POS_GOV_SOUTH_REP', 'POS_GOV_NORTH_REP',
                'POS_SEO_SPEC', 'POS_SOC_MEDIA_SPEC', 'POS_CREATIVE_SPEC', 'POS_PR_COMMS_SPEC',
                'POS_CS_SPEC', 'POS_OPS_SPEC', 'POS_FIN_SPEC'
            ]

            today = timezone.now().date()
            employment_count = 0
            pool_idx = 0

            for u in user_list:
                email = u.email.lower()

                if email in key_assignments:
                    pos_code, is_mgr, is_exec = key_assignments[email]
                else:
                    # Match by department name if available, else pick from pool
                    pos_code = staff_position_pool[pool_idx % len(staff_position_pool)]
                    pool_idx += 1
                    is_mgr = (u.role == 'supervisor')
                    is_exec = (u.role == 'executive')

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

                # Sync user department string
                if pos.department:
                    u.department = pos.department.name
                    u.save(update_fields=['department'])

            self.stdout.write(self.style.SUCCESS(f"  + Created/Updated {employment_count} Employments across all tenant users."))

        self.stdout.write(self.style.SUCCESS(f"\n[SUCCESS] Completed complete Organization Structure seeding for tenant '{tenant_id}'!"))
