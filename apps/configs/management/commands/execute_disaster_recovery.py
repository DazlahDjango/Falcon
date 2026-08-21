from django.core.management.base import BaseCommand, CommandError
from django.core.cache import cache
from django.utils import timezone
from apps.accounts.models import User
from apps.configs.models import RegisteredApp, DisasterRecoveryPlan, DisasterRecoveryExecution, ConfigAuditLog
from apps.configs.services.disaster_recovery.dr_orchestrator import DisasterRecoveryOrchestrator
from apps.configs.services.disaster_recovery.failover import FailoverService
from apps.configs.services.disaster_recovery.failback import FailbackService
from apps.configs.services.disaster_recovery.dr_metrics import DisasterRecoveryMetrics

class Command(BaseCommand):
    help = 'Comprehensive management command to execute Disaster Recovery (DR) actions: drill, failover, failback, plan execution, and metrics.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-email',
            type=str,
            required=True,
            help='Super Admin email authorizing disaster recovery execution (Required).'
        )
        parser.add_argument(
            '--app',
            type=str,
            default='configs',
            help='Name of the registered application for DR execution (Default: configs).'
        )
        parser.add_argument(
            '--action',
            type=str,
            choices=['all', 'drill', 'failover', 'failback', 'execute_plan', 'metrics'],
            default='all',
            help='Specific DR action to execute (Choices: all, drill, failover, failback, execute_plan, metrics. Default: all).'
        )
        parser.add_argument(
            '--plan-id',
            type=str,
            help='Specific Disaster Recovery Plan UUID (optional).'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bypass confirmation prompt.'
        )

    def handle(self, *args, **options):
        admin_email = options['admin_email']
        app_name = options['app']
        action = options['action']
        plan_id = options.get('plan_id')
        force = options['force']

        # ---------------------------------------------------------
        # 1. VERIFY SUPER ADMIN USER
        # ---------------------------------------------------------
        user = User.objects.filter(email=admin_email).first()
        if not user:
            raise CommandError(f"User with email '{admin_email}' not found.")
        
        user_role = getattr(user, 'role', None)
        if not (user.is_superuser or user_role == 'super_admin'):
            raise CommandError(f"Permission Denied: User '{admin_email}' must have 'super_admin' role (Current role: '{user_role}').")

        self.stdout.write(self.style.SUCCESS(f"  [OK] Authenticated Super Admin: {user.email} (ID: {user.id})"))

        # ---------------------------------------------------------
        # 2. VERIFY TARGET APP & DR PLAN
        # ---------------------------------------------------------
        app, _ = RegisteredApp.objects.get_or_create(
            name=app_name,
            defaults={
                'display_name': app_name.title(),
                'is_registered': True,
                'is_critical': True,
                'recovery_priority': 1,
            }
        )

        if plan_id:
            dr_plan = DisasterRecoveryPlan.objects.filter(id=plan_id).first()
            if not dr_plan:
                raise CommandError(f"Disaster Recovery Plan with ID '{plan_id}' not found.")
        else:
            dr_plan = DisasterRecoveryPlan.objects.filter(app=app).first()
            if not dr_plan:
                dr_plan = DisasterRecoveryPlan.objects.create(
                    app=app,
                    name=f"{app_name}-dr-plan",
                    version='1.0',
                    rto_target_minutes=15,
                    rpo_target_minutes=60,
                    standby_endpoint=f"https://standby-dr.falcontech.com/api/v1/{app_name}",
                    status='active',
                    test_frequency_days=30,
                    owned_by=user.id,
                )
            else:
                dr_plan.status = 'active'
                dr_plan.save()

        self.stdout.write(self.style.SUCCESS(f"  [OK] DR Plan active: '{dr_plan.name}' (ID: {dr_plan.id}) | Target App: {app.name}"))

        # Confirmation prompt if force flag is not set for destructive/failover actions
        if action in ['all', 'failover', 'execute_plan'] and not force:
            self.stdout.write(self.style.WARNING(f"\n  [WARNING] You are about to execute DR action '{action}' for app '{app.name}'."))
            confirm = input("Type 'YES' to proceed: ")
            if confirm.strip() != 'YES':
                self.stdout.write(self.style.NOTICE("Disaster Recovery command cancelled."))
                return

        orchestrator = DisasterRecoveryOrchestrator()

        # ---------------------------------------------------------
        # ACTION DISPATCHER
        # ---------------------------------------------------------
        if action == 'metrics':
            self._display_metrics(app)

        elif action == 'failover':
            self._execute_failover(app_name, user)

        elif action == 'failback':
            self._execute_failback(app_name, user)

        elif action == 'drill':
            self._execute_drill(orchestrator, dr_plan, user)

        elif action == 'execute_plan':
            self._execute_plan(orchestrator, dr_plan, user)

        elif action == 'all':
            self.stdout.write(self.style.MIGRATE_HEADING("\n" + "=" * 80))
            self.stdout.write(self.style.MIGRATE_HEADING("  EXECUTING ALL DISASTER RECOVERY SUITE ACTIONS"))
            self.stdout.write(self.style.MIGRATE_HEADING("=" * 80))

            # Step 1: Emergency Failover
            self._execute_failover(app_name, user)

            # Step 2: Emergency Failback
            self._execute_failback(app_name, user)

            # Step 3: Disaster Recovery Simulation Drill
            self._execute_drill(orchestrator, dr_plan, user)

            # Step 4: Compliance & RTO/RPO Metrics
            self._display_metrics(app)

            # Step 5: Audit Log Summary
            self._display_audit_summary()

            self.stdout.write(self.style.SUCCESS("\n========================================================================="))
            self.stdout.write(self.style.SUCCESS("  [OK] ALL DISASTER RECOVERY ACTIONS COMPLETED SUCCESSFULLY!"))
            self.stdout.write(self.style.SUCCESS("=========================================================================\n"))

    def _execute_failover(self, app_name, user):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Executing Emergency Failover for app '{app_name}'..."))
        try:
            failover_service = FailoverService()
            res = failover_service.execute(app_name, user.id, getattr(user, 'role', 'super_admin'))
            is_active = cache.get(f'failover_active_{app_name}')
            standby_ep = cache.get(f'failover_endpoint_{app_name}')
            self.stdout.write(self.style.SUCCESS(f"  [OK] Failover Result: {res}"))
            self.stdout.write(f"  [OK] Routing Check -> Active: {is_active} | Standby Endpoint: {standby_ep}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] Failover Failed: {e}"))
            raise CommandError(f"Failover execution failed: {e}")

    def _execute_failback(self, app_name, user):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Executing Emergency Failback for app '{app_name}'..."))
        try:
            failback_service = FailbackService()
            res = failback_service.execute(app_name, user.id, getattr(user, 'role', 'super_admin'))
            is_active = cache.get(f'failover_active_{app_name}')
            self.stdout.write(self.style.SUCCESS(f"  [OK] Failback Result: {res}"))
            self.stdout.write(f"  [OK] Routing Reset Check -> Active: {is_active} (Expected: None)")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] Failback Failed: {e}"))
            raise CommandError(f"Failback execution failed: {e}")

    def _execute_drill(self, orchestrator, dr_plan, user):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Executing Disaster Recovery Drill for Plan '{dr_plan.name}'..."))
        try:
            execution = orchestrator.run_dr_drill(
                plan_id=str(dr_plan.id),
                triggered_by=user.id,
                triggered_by_role=getattr(user, 'role', 'super_admin')
            )
            self.stdout.write(self.style.SUCCESS(f"  [OK] DR Drill Execution ID: {execution.id}"))
            self.stdout.write(f"     Execution Type: {execution.execution_type}")
            self.stdout.write(f"     Status: {execution.status}")
            self.stdout.write(f"     Completed At: {execution.completed_at}")
            
            dr_plan.refresh_from_db()
            self.stdout.write(f"     Plan Last Tested At: {dr_plan.last_tested_at}")
            self.stdout.write(f"     Plan Test Successful: {dr_plan.test_successful}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] DR Drill Failed: {e}"))
            raise CommandError(f"DR Drill execution failed: {e}")

    def _execute_plan(self, orchestrator, dr_plan, user):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Executing Full DR Plan for '{dr_plan.name}'..."))
        try:
            execution = orchestrator.execute_dr_plan(
                plan_id=str(dr_plan.id),
                triggered_by=user.id,
                triggered_by_role=getattr(user, 'role', 'super_admin')
            )
            self.stdout.write(self.style.SUCCESS(f"  [OK] DR Plan Execution ID: {execution.id}"))
            self.stdout.write(f"     Status: {execution.status}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] DR Plan Execution Failed: {e}"))
            raise CommandError(f"DR Plan execution failed: {e}")

    def _display_metrics(self, app):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Disaster Recovery Compliance & RTO/RPO Metrics for '{app.name}':"))
        metrics_service = DisasterRecoveryMetrics()
        rto_rate = metrics_service.get_rto_achievement_rate(app_id=app.id)
        rpo_rate = metrics_service.get_rpo_achievement_rate(app_id=app.id)
        drill_success = metrics_service.get_drill_success_rate(app_id=app.id)
        next_drill = metrics_service.get_recommended_drill_frequency(app_id=app.id)

        self.stdout.write(f"  - RTO Achievement Rate:  {rto_rate}%")
        self.stdout.write(f"  - RPO Achievement Rate:  {rpo_rate}%")
        self.stdout.write(f"  - Drill Success Rate:    {drill_success}%")
        self.stdout.write(f"  - Recommended Drill In: {next_drill} days")

    def _display_audit_summary(self):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Recent Disaster Recovery Audit Logs:"))
        recent_logs = ConfigAuditLog.objects.filter(
            action__in=['execute_dr', 'run_dr_drill', 'failover', 'failback']
        ).order_by('-performed_at')[:5]

        for log in recent_logs:
            time_str = log.performed_at.strftime('%Y-%m-%d %H:%M:%S')
            self.stdout.write(f"  - [{time_str}] Action: {log.action:<12} | Role: {log.performed_by_role:<11} | Result: {log.result}")
