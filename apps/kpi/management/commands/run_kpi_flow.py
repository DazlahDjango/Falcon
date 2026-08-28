"""
Execute full end-to-end role-based KPI lifecycle demonstration for Tenant 275adb1f-8e12-46ee-b394-ea42d41b10c9.
Usage:
    python manage.py run_kpi_flow --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from decimal import Decimal
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

from apps.kpi.models import (
    KPICategory, KPI, KPIHistory, AnnualTarget, MonthlyPhasing,
    PhasingLock, CascadeRule, CascadeMap, CascadeHistory, MonthlyActual
)
from apps.kpi.services.kpi import KPICreator
from apps.kpi.services.target import TargetSetter, TargetPhaser, TargetLocker
from apps.kpi.services.cascade import TargetCascader
from apps.kpi.services.actual import ActualEntry


class Command(BaseCommand):
    help = 'Runs complete end-to-end KPI lifecycle demonstration (Categories, Master KPI, Targets, Phasing, Locking, Cascading, Actuals).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to run KPI flow for'
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']

        from apps.tenant.models import OrganizationSchema
        schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
        schema_name = schema_obj.schema_name if schema_obj else 'public'

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n========================================================================\n"
            f"[START] EXECUTING ROLE-BASED KPI SYSTEM LIFECYCLE FOR TENANT '{tenant_id}'\n"
            f"========================================================================"
        ))

        # -------------------------------------------------------------------------
        # 0. RESOLVE USERS & ROLES
        # -------------------------------------------------------------------------
        user_map = {u.email.lower(): u for u in User.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        ceo = user_map.get('sarah.jenkins@globalapex.com')
        champion = user_map.get('elena.rostova@globalapex.com')
        sales_mgr = user_map.get('mark.vance@globalapex.com')
        ops_dir = user_map.get('daniel.taylor@globalapex.com')
        eng_mgr = user_map.get('rachel.adams@globalapex.com')
        mktg_mgr = user_map.get('lisa.ray@globalapex.com')
        
        staff_jwilson = user_map.get('james.wilson@globalapex.com')
        staff_eclark = user_map.get('emily.clark@globalapex.com')
        staff_mbrown = user_map.get('michael.brown@globalapex.com')

        if not ceo or not champion:
            raise CommandError("Required role users (CEO / Champion) not found.")

        self.stdout.write(self.style.SUCCESS(
            f"[OK] Role Context Loaded:\n"
            f"  * Executive (CEO): {ceo.first_name} {ceo.last_name} ({ceo.email})\n"
            f"  * Dashboard Champion: {champion.first_name} {champion.last_name} ({champion.email})\n"
            f"  * Supervisor (Sales Mgr): {sales_mgr.first_name} {sales_mgr.last_name}\n"
            f"  * Staff (Account Exec): {staff_eclark.first_name} {staff_eclark.last_name}"
        ))

        # -------------------------------------------------------------------------
        # STEP 1: CREATE KPI CATEGORIES (Role: Dashboard Champion)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 1] Creating Balanced Scorecard KPI Categories (Champion Role)..."))
        categories_def = [
            ('CAT_FIN', 'Financial Performance', 'FINANCIAL', 'Revenue, Profitability, and Cost Efficiency KPIs', '#10B981', 'dollar-sign', 1),
            ('CAT_OPS', 'Operational Excellence', 'OPERATIONAL', 'Process Speed, Quality, and Productivity', '#3B82F6', 'activity', 2),
            ('CAT_CUST', 'Customer Experience & Success', 'CUSTOMER', 'CSAT, Retention, and NPS Scores', '#8B5CF6', 'users', 3),
            ('CAT_GROWTH', 'Innovation & Talent Growth', 'GROWTH', 'Skill Development and Platform Innovation', '#F59E0B', 'trending-up', 4),
            ('CAT_RISK', 'Governance & Risk Compliance', 'COMPLIANCE', 'Regulatory and Security Audits', '#EF4444', 'shield', 5),
        ]

        categories = {}
        for ref_code, name, ctype, desc, color, icon, order in categories_def:
            cat, created = KPICategory.objects.update_or_create(
                tenant_id=tenant_id,
                name=name,
                defaults={
                    'category_type': ctype,
                    'description': desc,
                    'color': color,
                    'icon': icon,
                    'display_order': order,
                    'is_active': True,
                    'created_by': champion,
                    'updated_by': champion
                }
            )
            categories[ref_code] = cat
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  + Category [{status_str}]: {cat.name}")

        # -------------------------------------------------------------------------
        # STEP 2: CREATE MASTER CORPORATE KPI DEFINITION (Role: CEO & Champion)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 2] Defining Master Corporate Annual Net Sales KPI..."))
        dept_exec = Department.objects.filter(tenant_id=tenant_id, code='DEP_EXEC').first()
        
        kpi_data = {
            'name': 'Master Corporate Annual Net Sales Revenue',
            'description': 'Master strategic corporate revenue goal of KES 100,000,000.00 for FY2026.',
            'category_id': categories['CAT_FIN'].id,
            'kpi_type': 'FINANCIAL',
            'calculation_logic': 'HIGHER_IS_BETTER',
            'measure_type': 'CUMULATIVE',
            'unit': 'KES',
            'decimal_places': 2,
            'target_min': Decimal('50000000.00'),
            'target_max': Decimal('150000000.00'),
            'owner_id': ceo.id,
            'department_id': dept_exec.id if dept_exec else None,
            'strategic_objective': 'Achieve KES 100,000,000.00 Net Sales Revenue in FY 2026',
            'is_active': True,
        }

        master_kpi = KPI.objects.filter(tenant_id=tenant_id, name=kpi_data['name']).first()
        if not master_kpi:
            creator = KPICreator()
            master_kpi = creator.create(kpi_data, user=champion)
            self.stdout.write(self.style.SUCCESS(f"  [OK] Created Master KPI: {master_kpi.name}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"  [OK] Master KPI Exists: {master_kpi.name}"))

        # -------------------------------------------------------------------------
        # STEP 3: SET MASTER CORPORATE ANNUAL TARGET OF 100,000,000.00 (Role: CEO)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 3] Authorizing Top-Down Master Corporate Target (KES 100,000,000.00)..."))
        target_setter = TargetSetter()
        corp_target_val = Decimal('100000000.00')

        org_annual_target = target_setter.set_annual_target(
            kpi_id=str(master_kpi.id),
            user_id=str(ceo.id),
            year=2026,
            target_value=corp_target_val,
            user=ceo
        )

        org_annual_target.approved_at = timezone.now()
        org_annual_target.approved_by = ceo
        org_annual_target.notes = "Official FY2026 Strategic Master Corporate Target signed off by CEO."
        org_annual_target.save()

        self.stdout.write(self.style.SUCCESS(
            f"  [OK] Master Corporate Annual Target Set & Approved!\n"
            f"    Target: KES {org_annual_target.target_value:,.2f} | Year: {org_annual_target.year} | Approved By: {ceo.email}"
        ))

        # -------------------------------------------------------------------------
        # STEP 4: MONTHLY PHASING & LOCKING (Role: Dashboard Champion)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 4] Phasing Annual Target into Monthly Milestones & Locking Phasing..."))
        phaser = TargetPhaser()
        locker = TargetLocker()

        existing_phasings = MonthlyPhasing.objects.filter(annual_target=org_annual_target)
        if not existing_phasings.exists():
            phasings = phaser.phase_target(
                annual_target_id=str(org_annual_target.id),
                strategy='equal_split',
                user=champion
            )
            self.stdout.write(f"  [OK] Created {len(phasings)} Monthly Targets (Equal Split ~KES 8,333,333.33/mo).")
        else:
            phasings = list(existing_phasings)
            self.stdout.write(f"  [OK] Monthly Targets already phased ({len(phasings)} months).")

        cycle_code = "FY2026"
        is_locked = PhasingLock.objects.filter(tenant_id=tenant_id, performance_cycle=cycle_code).exists()
        if not is_locked:
            locked_count = locker.lock_phasing_for_cycle(tenant_id, cycle_code, user=champion)
            self.stdout.write(self.style.SUCCESS(f"  [OK] Phasing locked for cycle '{cycle_code}' ({locked_count} months protected)."))
        else:
            self.stdout.write(self.style.SUCCESS(f"  [OK] Phasing is already locked for cycle '{cycle_code}'."))

        # -------------------------------------------------------------------------
        # STEP 5: CASCADING TARGETS TOP-DOWN (Org -> Division -> Dept -> Individual)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 5] Top-Down Target Cascading Across Organizational Hierarchy..."))

        rule, _ = CascadeRule.objects.update_or_create(
            tenant_id=tenant_id,
            name='Custom Executive Strategy Breakdown',
            defaults={
                'rule_type': 'CUSTOM',
                'description': 'Weighted top-down corporate target distribution by strategic focus area.',
                'is_default': True,
                'is_active': True,
                'created_by': champion,
                'updated_by': champion
            }
        )

        div_comm = Division.objects.filter(tenant_id=tenant_id, code='DIV_COMM').first()
        div_ops = Division.objects.filter(tenant_id=tenant_id, code='DIV_OPS').first()
        div_tech = Division.objects.filter(tenant_id=tenant_id, code='DIV_TECH').first()

        cascader = TargetCascader()

        # 5a. Cascade Org -> Divisions (Must sum to 100%)
        div_targets_def = [
            {'entity_type': 'DIVISION', 'entity_id': str(div_comm.id), 'user_id': str(sales_mgr.id), 'contribution_percentage': Decimal('60.00')}, # KES 60M
            {'entity_type': 'DIVISION', 'entity_id': str(div_ops.id), 'user_id': str(ops_dir.id), 'contribution_percentage': Decimal('25.00')},   # KES 25M
            {'entity_type': 'DIVISION', 'entity_id': str(div_tech.id), 'user_id': str(eng_mgr.id), 'contribution_percentage': Decimal('15.00')},   # KES 15M
        ]

        existing_org_maps = CascadeMap.objects.filter(tenant_id=tenant_id, organization_target=org_annual_target)
        if not existing_org_maps.exists():
            div_maps = cascader.cascade_from_organization(
                org_target_id=str(org_annual_target.id),
                rule_id=str(rule.id),
                targets=div_targets_def,
                user=champion
            )
            self.stdout.write(self.style.SUCCESS(f"  [OK] Cascaded Master Target (KES 100M) to 3 Divisions:"))
            for cmap in div_maps:
                child = cmap.child_target
                self.stdout.write(f"    * Division Target: KES {child.target_value:,.2f} ({cmap.contribution_percentage}%) -> User: {child.user.email}")
        else:
            self.stdout.write(self.style.SUCCESS(f"  [OK] Division Cascades already mapped ({existing_org_maps.count()} maps)."))

        # 5b. Cascade Sales Division Target (KES 60M) to Sales & Marketing Departments (75% Sales KES 45M, 25% Marketing KES 15M = 100%)
        dept_sales = Department.objects.filter(tenant_id=tenant_id, code='DEP_SALES').first()
        dept_mktg = Department.objects.filter(tenant_id=tenant_id, code='DEP_MKTG').first()
        sales_div_target = AnnualTarget.objects.filter(tenant_id=tenant_id, user=sales_mgr, kpi=master_kpi).first()

        if sales_div_target and dept_sales and dept_mktg and mktg_mgr and staff_jwilson:
            dept_targets_def = [
                {'entity_type': 'DEPARTMENT', 'entity_id': str(dept_sales.id), 'user_id': str(staff_jwilson.id), 'contribution_percentage': Decimal('75.00')}, # KES 45M (James Wilson Lead)
                {'entity_type': 'DEPARTMENT', 'entity_id': str(dept_mktg.id), 'user_id': str(mktg_mgr.id), 'contribution_percentage': Decimal('25.00')},      # KES 15M (Lisa Ray Mgr)
            ]
            existing_dept_maps = CascadeMap.objects.filter(tenant_id=tenant_id, parent_target=sales_div_target)
            if not existing_dept_maps.exists():
                dept_maps = cascader.cascade_from_organization(
                    org_target_id=str(sales_div_target.id),
                    rule_id=str(rule.id),
                    targets=dept_targets_def,
                    user=sales_mgr
                )
                self.stdout.write(self.style.SUCCESS(f"\n  [OK] Cascaded Sales Division Target (KES 60M) to Departments (75% Sales KES 45M, 25% Marketing KES 15M):"))
                for cmap in dept_maps:
                    child = cmap.child_target
                    self.stdout.write(f"    * Department Target: KES {child.target_value:,.2f} ({cmap.contribution_percentage}%) -> User: {child.user.email}")

        # 5c. Cascade Sales Department Target (KES 45M) to Sales Account Executives (55.55% Emily, 44.45% Michael = 100%)
        sales_dept_map = CascadeMap.objects.filter(tenant_id=tenant_id, parent_target=sales_div_target, child_target__user=staff_jwilson).first()
        sales_dept_target = sales_dept_map.child_target if sales_dept_map else sales_div_target

        if sales_dept_target and staff_eclark and staff_mbrown:
            staff_targets_def = [
                {'entity_type': 'INDIVIDUAL', 'entity_id': str(staff_eclark.id), 'user_id': str(staff_eclark.id), 'contribution_percentage': Decimal('55.55')}, # ~KES 25M
                {'entity_type': 'INDIVIDUAL', 'entity_id': str(staff_mbrown.id), 'user_id': str(staff_mbrown.id), 'contribution_percentage': Decimal('44.45')}, # ~KES 20M
            ]
            existing_staff_maps = CascadeMap.objects.filter(tenant_id=tenant_id, parent_target=sales_dept_target)
            if not existing_staff_maps.exists():
                staff_maps = cascader.cascade_from_organization(
                    org_target_id=str(sales_dept_target.id),
                    rule_id=str(rule.id),
                    targets=staff_targets_def,
                    user=sales_mgr
                )
                self.stdout.write(self.style.SUCCESS(f"\n  [OK] Cascaded Sales Dept Target (KES 45M) to Sales Account Executives:"))
                for cmap in staff_maps:
                    child = cmap.child_target
                    self.stdout.write(f"    * Staff Target: KES {child.target_value:,.2f} ({cmap.contribution_percentage}%) -> {child.user.first_name} {child.user.last_name} ({child.user.email})")

        # -------------------------------------------------------------------------
        # STEP 6: ACTUAL PERFORMANCE ENTRY & APPROVAL (Role: Staff & Supervisor)
        # -------------------------------------------------------------------------
        self.stdout.write(self.style.WARNING("\n[STEP 6] Submitting Monthly Performance Actuals & Supervisor Sign-off..."))
        actual_entry = ActualEntry()
        jan_actual_val = Decimal('2250000.00')

        actual_rec = actual_entry.enter_actual(
            kpi_id=str(master_kpi.id),
            user_id=str(staff_eclark.id),
            year=2026,
            month=1,
            actual_value=jan_actual_val,
            notes="January Q1 Enterprise deal closed with Safaricom Tech Labs.",
            user=staff_eclark
        )

        actual_rec.status = 'APPROVED'
        actual_rec.approved_at = timezone.now()
        actual_rec.approved_by = sales_mgr
        actual_rec.save()

        # Monthly target for Emily (KES 25M annual / 12 months = KES 2,083,333.33)
        monthly_target_val = Decimal('2083333.33')
        achievement_pct = (jan_actual_val / monthly_target_val) * Decimal('100.00')

        self.stdout.write(self.style.SUCCESS(
            f"  [OK] Monthly Actual Entry Recorded & Approved!\n"
            f"    * Employee: Emily Clark ({staff_eclark.email})\n"
            f"    * Period: January 2026\n"
            f"    * Monthly Target: KES {monthly_target_val:,.2f}\n"
            f"    * Actual Revenue: KES {jan_actual_val:,.2f}\n"
            f"    * Performance Achievement: {achievement_pct:.2f}% [EXCEEDING TARGET]\n"
            f"    * Status: {actual_rec.status} by Supervisor {sales_mgr.email}"
        ))

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n========================================================================\n"
            f"[SUCCESS] FULL END-TO-END KPI BACKEND FLOW COMPLETED SUCCESSFULLY FOR TENANT!\n"
            f"========================================================================"
        ))
