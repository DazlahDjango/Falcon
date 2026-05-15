"""
Management command to seed initial billing plans and features.
Run with: python manage.py seed_billing_plans
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.billing.models import Plan, PlanFeature
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Seed initial billing plans and features for the Falcon PMS'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting billing plans seeding...'))

        plans_data = [
            {
                'name': 'Trial',
                'slug': 'trial',
                'plan_type': 'trial',
                'price_monthly': 0,
                'price_yearly': 0,
                'currency': 'KES',
                'trial_days': 14,
                'display_order': 1,
                'is_active': True,
                'description': 'Free 14-day trial to explore Falcon PMS',
                'features': [
                    {'name': 'Team Members', 'value': '1', 'display_order': 1},
                    {'name': 'Properties', 'value': '1', 'display_order': 2},
                    {'name': 'Basic Reports', 'value': 'Yes', 'display_order': 3},
                    {'name': 'Email Support', 'value': 'Yes', 'display_order': 4},
                    {'name': 'API Access', 'value': 'No', 'display_order': 5},
                ]
            },
            {
                'name': 'Starter',
                'slug': 'starter',
                'plan_type': 'basic',
                'price_monthly': 2999,  # KES 29.99
                'price_yearly': 29990,  # KES 299.90 (Save 2%)
                'currency': 'KES',
                'trial_days': 14,
                'display_order': 2,
                'is_active': True,
                'is_recommended': False,
                'description': 'Perfect for small property management teams',
                'features': [
                    {'name': 'Team Members', 'value': '5', 'display_order': 1, 'is_highlight': True},
                    {'name': 'Properties', 'value': '5', 'display_order': 2, 'is_highlight': True},
                    {'name': 'Advanced Reports', 'value': 'Yes', 'display_order': 3},
                    {'name': 'Priority Email Support', 'value': 'Yes', 'display_order': 4},
                    {'name': 'Tenant Portal', 'value': 'Yes', 'display_order': 5},
                    {'name': 'API Access', 'value': 'Limited', 'display_order': 6},
                    {'name': 'Payment Processing', 'value': 'Yes (2.5% fee)', 'display_order': 7},
                ]
            },
            {
                'name': 'Professional',
                'slug': 'professional',
                'plan_type': 'professional',
                'price_monthly': 9999,  # KES 99.99
                'price_yearly': 99990,  # KES 999.90 (Save 2%)
                'currency': 'KES',
                'trial_days': 14,
                'display_order': 3,
                'is_active': True,
                'is_recommended': True,
                'description': 'For growing property management businesses',
                'features': [
                    {'name': 'Team Members', 'value': '20', 'display_order': 1, 'is_highlight': True},
                    {'name': 'Properties', 'value': '50', 'display_order': 2, 'is_highlight': True},
                    {'name': 'Custom Reports', 'value': 'Yes', 'display_order': 3},
                    {'name': 'Phone & Email Support', 'value': '24/5', 'display_order': 4},
                    {'name': 'Tenant Portal', 'value': 'Yes', 'display_order': 5},
                    {'name': 'Owner Portal', 'value': 'Yes', 'display_order': 6, 'is_highlight': True},
                    {'name': 'API Access', 'value': 'Full', 'display_order': 7},
                    {'name': 'Payment Processing', 'value': 'Yes (1.5% fee)', 'display_order': 8},
                    {'name': 'Expense Tracking', 'value': 'Yes', 'display_order': 9},
                    {'name': 'Maintenance Requests', 'value': 'Yes', 'display_order': 10},
                ]
            },
            {
                'name': 'Enterprise',
                'slug': 'enterprise',
                'plan_type': 'enterprise',
                'price_monthly': 29999,  # KES 299.99
                'price_yearly': 299990,  # KES 2999.90 (Save 2%)
                'currency': 'KES',
                'trial_days': 30,
                'display_order': 4,
                'is_active': True,
                'is_recommended': False,
                'description': 'For large-scale property management operations',
                'features': [
                    {'name': 'Team Members', 'value': 'Unlimited', 'display_order': 1, 'is_highlight': True},
                    {'name': 'Properties', 'value': 'Unlimited', 'display_order': 2, 'is_highlight': True},
                    {'name': 'Advanced Reports & Analytics', 'value': 'Yes', 'display_order': 3, 'is_highlight': True},
                    {'name': 'Phone & Email Support', 'value': '24/7', 'display_order': 4},
                    {'name': 'Dedicated Account Manager', 'value': 'Yes', 'display_order': 5, 'is_highlight': True},
                    {'name': 'Tenant Portal', 'value': 'Yes', 'display_order': 6},
                    {'name': 'Owner Portal', 'value': 'Yes', 'display_order': 7},
                    {'name': 'Investor Portal', 'value': 'Yes', 'display_order': 8},
                    {'name': 'Full API Access', 'value': 'Yes', 'display_order': 9},
                    {'name': 'Custom Integrations', 'value': 'Yes', 'display_order': 10},
                    {'name': 'Payment Processing', 'value': 'Yes (1% fee)', 'display_order': 11},
                    {'name': 'Advanced Compliance', 'value': 'Yes', 'display_order': 12},
                    {'name': 'White-label Options', 'value': 'Yes', 'display_order': 13, 'is_highlight': True},
                    {'name': 'SLA Guarantee', 'value': '99.9% Uptime', 'display_order': 14},
                ]
            },
        ]

        created_plans = 0
        updated_plans = 0
        created_features = 0

        for plan_data in plans_data:
            features = plan_data.pop('features', [])
            
            try:
                plan, created = Plan.objects.get_or_create(
                    slug=plan_data['slug'],
                    defaults=plan_data
                )

                if created:
                    created_plans += 1
                    status = self.style.SUCCESS(f'✓ Created')
                else:
                    updated_plans += 1
                    status = self.style.WARNING(f'✓ Exists')

                self.stdout.write(f'{status}: {plan.name} ({plan.plan_type})')

                # Create/update features
                for feature_data in features:
                    feature, feature_created = PlanFeature.objects.get_or_create(
                        plan=plan,
                        name=feature_data['name'],
                        defaults={
                            'value': feature_data.get('value', ''),
                            'display_order': feature_data.get('display_order', 0),
                            'is_highlight': feature_data.get('is_highlight', False),
                            'description': '',
                        }
                    )
                    if feature_created:
                        created_features += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating plan {plan_data["name"]}: {str(e)}')
                )
                logger.error(f'Error creating plan {plan_data["name"]}: {str(e)}')
                continue

        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(
            f'Seeding Complete!\n'
            f'  • {created_plans} plans created\n'
            f'  • {updated_plans} plans already exist\n'
            f'  • {created_features} features created\n'
        ))
        self.stdout.write('='*50)

        # Display summary
        all_plans = Plan.objects.filter(is_deleted=False).order_by('display_order')
        self.stdout.write('\nAvailable Plans:')
        for plan in all_plans:
            self.stdout.write(
                f'  • {plan.name:20} - KES {plan.price_monthly}/{plan.price_yearly} '
                f'({plan.get_plan_type_display()}) - {plan.features.count()} features'
            )
