from django.core.management.base import BaseCommand
from apps.configs.services.disaster_recovery.dr_orchestrator import DisasterRecoveryOrchestrator

class Command(BaseCommand):
    help = 'Run a disaster recovery drill'

    def add_arguments(self, parser):
        parser.add_argument('--plan', type=str, required=True, help='DR plan ID or app name')
        parser.add_argument('--email', action='store_true', help='Send email report')

    def handle(self, *args, **options):
        orchestrator = DisasterRecoveryOrchestrator()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        
        self.stdout.write(f'Running DR drill for plan: {options["plan"]}')
        self.stdout.write(self.style.WARNING('⚠️ This is a TEST - No production impact'))
        
        try:
            execution = orchestrator.run_dr_drill(options['plan'], system_user_id, 'system')
            
            if execution.status == 'success':
                self.stdout.write(self.style.SUCCESS(f'  ✓ Drill completed successfully!'))
                self.stdout.write(f'     RTO achieved: {execution.rto_achieved_minutes} minutes')
                self.stdout.write(f'     RPO achieved: {execution.rpo_achieved_minutes} minutes')
            else:
                self.stdout.write(self.style.ERROR(f'  ✗ Drill failed: {execution.status}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Drill failed: {e}'))