
"""
Management command to seed default subscription plans
"""

from django.core.management.base import BaseCommand
from apps.organisations.models import Plan
from apps.organisations.constants import PlanCode


class Command(BaseCommand):
    help = 'Seed default subscription plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic',
                'code': PlanCode.BASIC,
                'description': 'Perfect for small teams getting started',
                'price_monthly': 49.00,
                'price_yearly': 490.00,
                'max_users': 10,
                'max_storage_gb': 5,
                'max_api_calls_monthly': 10000,
                'max_departments': 5,
                'max_custom_domains': 0,
                'features': {
                    'kpi_tracking': True,
                    'basic_reports': True,
                    'email_support': True,
                    'pip': False,
                    '360_reviews': False,
                    'tasks': False,
                    'api_access': False,
                },
                'display_order': 1,
                'is_popular': False,
            },
            {
                'name': 'Professional',
                'code': PlanCode.PROFESSIONAL,
                'description': 'Ideal for growing organizations',
                'price_monthly': 99.00,
                'price_yearly': 990.00,
                'max_users': 50,
                'max_storage_gb': 20,
                'max_api_calls_monthly': 50000,
                'max_departments': 15,
                'max_custom_domains': 1,
                'features': {
                    'kpi_tracking': True,
                    'basic_reports': True,
                    'advanced_reports': True,
                    'email_support': True,
                    'priority_support': True,
                    'pip': True,
                    '360_reviews': True,
                    'tasks': True,
                    'api_access': True,
                },
                'display_order': 2,
                'is_popular': True,
            },
            {
                'name': 'Enterprise',
                'code': PlanCode.ENTERPRISE,
                'description': 'For large organizations with advanced needs',
                'price_monthly': 249.00,
                'price_yearly': 2490.00,
                'max_users': 500,
                'max_storage_gb': 100,
                'max_api_calls_monthly': 500000,
                'max_departments': 50,
                'max_custom_domains': 5,
                'features': {
                    'kpi_tracking': True,
                    'basic_reports': True,
                    'advanced_reports': True,
                    'custom_reports': True,
                    'email_support': True,
                    'priority_support': True,
                    'dedicated_support': True,
                    'pip': True,
                    '360_reviews': True,
                    'tasks': True,
                    'api_access': True,
                    'sso': True,
                    'audit_logs': True,
                },
                'display_order': 3,
                'is_popular': False,
            }
        ]

        for plan_data in plans:
            plan, created = Plan.objects.get_or_create(
                code=plan_data['code'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created plan: {plan.name}'))
            else:
                self.stdout.write(f'Plan already exists: {plan.name}')

        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded all plans!'))