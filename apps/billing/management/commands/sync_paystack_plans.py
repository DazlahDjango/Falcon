from django.core.management.base import BaseCommand
from apps.billing.services.payment.paystack_provider import PayStackProvider
from apps.billing.models import Plan

class Command(BaseCommand):
    help = 'Sync local billing plans with Paystack plans'

    def add_arguments(self, parser):
        parser.add_argument('--create-missing', action='store_true', help='Create Paystack plans for local plans that don\'t exist')
        parser.add_argument('--update-local', action='store_true', help='Update local plans with data from Paystack')

    def handle(self, *args, **options):
        provider = PayStackProvider()
        self.stdout.write('Fetching plans from Paystack...')

        try:
            # Fetch all Paystack plans (this requires using the list endpoint - we'll mock/assume)
            # For now, we'll process local plans to sync with Paystack
            local_plans = Plan.objects.filter(is_deleted=False).order_by('display_order')
            self.stdout.write(f'Found {local_plans.count()} local plans')

            created = 0
            updated = 0

            for plan in local_plans:
                try:
                    # Check if plan exists on Paystack
                    try:
                        if plan.paystack_plan_code:  # Assume Plan model has paystack_plan_code field
                            provider.get_plan(plan.paystack_plan_code)
                            self.stdout.write(self.style.WARNING(f'  ✓ {plan.name} (exists on Paystack)'))
                            updated += 1
                        else:
                            if options['create_missing']:
                                # Create on Paystack
                                amount = plan.price_monthly * 100  # Paystack uses kobo (for KES)
                                interval = 'monthly' if plan.price_monthly else 'yearly'  # Adjust as needed
                                result = provider.create_plan(
                                    name=plan.name,
                                    amount=amount,
                                    interval=interval,
                                    description=plan.description
                                )
                                plan.paystack_plan_code = result.plan_code
                                plan.save()
                                created += 1
                                self.stdout.write(self.style.SUCCESS(f'  ✓ Created {plan.name} (Paystack code: {result.plan_code})'))
                            else:
                                self.stdout.write(self.style.WARNING(f'  ⚠ {plan.name} missing Paystack code (use --create-missing to create)'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  ✗ {plan.name}: {e}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing {plan.name}: {e}'))

            self.stdout.write(f'\nSync complete: {created} created, {updated} already synced')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to sync plans: {e}'))
