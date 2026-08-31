from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.kpi.models import KPICategory, KPI, AnnualTarget, CascadeMap, CascadeRule
from apps.kpi.engine.cascade.engine import CascadeEngine
from apps.kpi.services.kpi import KPICreator

User = get_user_model()

class KPICascadeTests(TestCase):
    def setUp(self):
        self.tenant_id = "c732f915-34d1-489d-8551-3c71bf92a372"
        self.user = User.objects.create_user(
            username="executive_test",
            email="executive@example.com",
            password="testpassword",
            role="executive",
            tenant_id=self.tenant_id
        )
        self.div_user = User.objects.create_user(
            username="division_head",
            email="division@example.com",
            password="testpassword",
            role="executive",
            tenant_id=self.tenant_id
        )
        self.dept_user = User.objects.create_user(
            username="department_head",
            email="department@example.com",
            password="testpassword",
            role="executive",
            tenant_id=self.tenant_id
        )
        self.category = KPICategory.objects.create(
            tenant_id=self.tenant_id,
            name="Financials",
            category_type="FINANCIAL"
        )
        
    def test_create_kpi_and_cascade(self):
        # 1. Create KPI
        creator = KPICreator()
        kpi_data = {
            'name': 'Gross Revenue Target',
            'category_id': self.category.id,
            'kpi_type': 'FINANCIAL',
            'owner_id': self.user.id,
            'target_min': Decimal('1000.00'),
            'target_max': Decimal('50000.00')
        }
        kpi = creator.create(kpi_data, self.user)
        self.assertEqual(kpi.name, 'Gross Revenue Target')
        self.assertFalse(hasattr(kpi, 'framework'))
        self.assertFalse(hasattr(kpi, 'sector'))
        
        # 2. Setup AnnualTarget
        org_target = AnnualTarget.objects.create(
            tenant_id=self.tenant_id,
            kpi=kpi,
            user=self.user,
            year=2026,
            target_value=Decimal('10000.00')
        )
        
        # 3. Cascade Target using EQUAL_SPLIT
        rule = CascadeRule.objects.create(
            tenant_id=self.tenant_id,
            name="Equal Split Rule",
            rule_type="EQUAL_SPLIT",
            is_active=True
        )
        
        engine = CascadeEngine(tenant_id=self.tenant_id, user_id=self.user.id)
        targets_data = [
            {'entity_type': 'DIVISION', 'entity_id': 'div_1', 'user_id': self.div_user.id, 'contribution_percentage': Decimal('50.00')},
            {'entity_type': 'DEPARTMENT', 'entity_id': 'dept_1', 'user_id': self.dept_user.id, 'contribution_percentage': Decimal('50.00')}
        ]
        
        cascade_maps = engine.cascade_organization_target(
            org_target_id=str(org_target.id),
            rule_id=str(rule.id),
            targets=targets_data
        )
        
        self.assertEqual(len(cascade_maps), 2)
        self.assertEqual(cascade_maps[0].division_target.target_value, Decimal('5000.00'))
        self.assertEqual(cascade_maps[1].department_target.target_value, Decimal('5000.00'))
        
        # Check parent/child associations are set
        self.assertEqual(cascade_maps[0].parent_target, org_target)
        self.assertEqual(cascade_maps[0].child_target, cascade_maps[0].division_target)

    def test_calculation_orchestrator_pauses_during_full_maintenance(self):
        from apps.kpi.engine.orchestrator import CalculationOrchestrator
        from apps.configs.models import MaintenanceWindow
        from apps.configs.services.maintenance.full_maintenance import FullMaintenance

        window = MaintenanceWindow.objects.create(
            title='System Maintenance Test',
            maintenance_type='full',
            scheduled_start=self.category.created_at,
            scheduled_end=self.category.created_at,
            triggered_by=self.user.id,
            triggered_by_role='super_admin',
            reason='Upgrading DB',
            expected_downtime_minutes=15,
        )
        FullMaintenance().enable(window)

        orchestrator = CalculationOrchestrator()
        res = orchestrator.calculate_all_for_period(self.tenant_id, 2026, 8)
        self.assertEqual(res['status'], 'PAUSED')

        FullMaintenance().disable(window)
        res_after = orchestrator.calculate_all_for_period(self.tenant_id, 2026, 8)
        self.assertNotEqual(res_after['status'], 'PAUSED')


        self.assertNotEqual(res_after['status'], 'PAUSED')


