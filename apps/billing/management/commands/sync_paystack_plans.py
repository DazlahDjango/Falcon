from django.core.management.base import BaseCommand
from apps.billing.services.payment.paystack_provider import PayStackProvider
from apps.billing.models import SubscriptionPlan
from django.db import connection

class Command(BaseCommand):
    help = 'Sync local subscription plans with Paystack plans API'

    def add_arguments(self, parser):
        parser.add_argument('--create-missing', action='store_true', help='Create Paystack plans for local plans that lack paystack_plan_code')
        parser.add_argument('--list', action='store_true', help='List all local plans and Paystack integration status')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        self.stdout.write(self.style.MIGRATE_HEADING('=== Paystack Plan Synchronization ==='))
        
        provider = None
        try:
            provider = PayStackProvider()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Paystack Provider initialization note: {e}'))

        local_plans = SubscriptionPlan.objects.filter(is_active=True).order_by('display_order')
        self.stdout.write(f'Found {local_plans.count()} active local plans.\n')

        created_count = 0
        synced_count = 0

        for plan in local_plans:
            self.stdout.write(f"Plan: {plan.name:<15} ({plan.plan_type:<12}) Code: {plan.paystack_plan_code or 'NONE'}")
            
            if plan.paystack_plan_code:
                if provider:
                    try:
                        provider.get_plan(plan.paystack_plan_code)
                        self.stdout.write(self.style.SUCCESS(f'  [OK] Paystack Code Verified: {plan.paystack_plan_code}'))
                        synced_count += 1
                    except Exception as err:
                        self.stdout.write(self.style.WARNING(f'  [WARN] Paystack Code Check Error: {err}'))
                else:
                    synced_count += 1
            else:
                if options['create_missing'] and provider:
                    try:
                        amount_in_kobo = plan.price  # plan.price is in KES cents
                        interval = plan.billing_interval or 'monthly'
                        
                        result = provider.create_plan(
                            name=f"Falcon PMS - {plan.name}",
                            amount=amount_in_kobo,
                            interval=interval,
                            description=plan.description or f"{plan.name} Plan for Falcon PMS"
                        )
                        plan.paystack_plan_code = result.plan_code
                        if hasattr(result, 'plan_id') and result.plan_id:
                            plan.paystack_plan_id = str(result.plan_id)
                        plan.save()
                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(f'  [OK] Created Paystack Plan: Code={result.plan_code}'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  [FAIL] Failed to create Paystack plan: {e}'))
                else:
                    self.stdout.write(self.style.WARNING('  [WARN] Missing Paystack code (Use --create-missing to sync with Paystack API)'))

        self.stdout.write(self.style.SUCCESS(f'\nSync Complete: {created_count} created, {synced_count} already synced.'))
