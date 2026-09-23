# apps/reviews/management/commands/seed_qualitative_factors.py
"""
Management command to seed standard Section III Qualitative Performance Factors
(Categories: Leadership, Strategic thinking, Problem Solving, Team building and Collaboration).
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.tenant.models import Organization
from apps.reviews.models import CompetencyCategory, Competency, RatingScale


class Command(BaseCommand):
    help = 'Seed Section III Qualitative Performance Factors across all active organizations/tenants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Specific tenant ID to seed'
        )

    def handle(self, *args, **options):
        tenant_id = options.get('tenant_id')
        if tenant_id:
            tenants = Organization.objects.filter(id=tenant_id, is_deleted=False)
        else:
            tenants = Organization.objects.filter(is_deleted=False)

        if not tenants.exists():
            self.stdout.write(self.style.WARNING("No active organizations found to seed."))
            return

        categories_data = [
            (
                "Leadership",
                "Assesses inspiring vision, strategic decision making under pressure, effective delegation, and goal orientation.",
                Competency.CompetencyType.LEADERSHIP,
                0,
                [
                    ("Inspire and motivate team members.", "Inspires enthusiasm, shared vision, and commitment across the team.", 10.0),
                    ("Make strategic decisions under pressure.", "Maintains composure and sound judgment in high-stakes or time-sensitive situations.", 10.0),
                    ("Delegation skills to effectively distribute tasks and responsibilities among team members.", "Empowers team members by assigning tasks according to strengths and development needs.", 10.0),
                    ("Set goals and objectives for the department and inspire the team to achieve them.", "Establishes clear departmental milestones and drives collective alignment towards achievement.", 10.0),
                ]
            ),
            (
                "Strategic thinking",
                "Evaluates alignment with organizational goals, future trend anticipation, and departmental foresight.",
                Competency.CompetencyType.STRATEGIC,
                1,
                [
                    ("Develop and implement strategic plans aligned with organizational goals.", "Translates high-level organizational vision into actionable operational blueprints.", 10.0),
                    ("Anticipate future trends and proactively plan for departmental needs.", "Identifies emerging opportunities, market shifts, and risks before they impact operations.", 10.0),
                ]
            ),
            (
                "Problem Solving",
                "Assesses root-cause analysis, innovative challenge approaches, and data-driven analytical problem resolution.",
                Competency.CompetencyType.OPERATIONAL,
                2,
                [
                    ("Identify root causes of issues and develop effective solutions.", "Applies critical inquiry to uncover underlying problems rather than treating symptoms.", 10.0),
                    ("Find new approaches to challenges.", "Demonstrates creative and innovative problem resolution when standard methods fall short.", 10.0),
                    ("Make data-driven decisions and use analytical tools to solve complex problems.", "Leverages objective metrics, performance indicators, and analytical logic in decision-making.", 10.0),
                ]
            ),
            (
                "Team building and Collaboration",
                "Evaluates fostering an inclusive environment, constructive conflict resolution, and high emotional intelligence.",
                Competency.CompetencyType.TEAMWORK,
                3,
                [
                    ("Build and foster a collaborative and inclusive team environment.", "Cultivates trust, psychological safety, and positive cooperation across all team members.", 10.0),
                    ("Address conflicts and promote harmonious working relationships.", "Resolves interpersonal friction promptly and constructive mediation to maintain cohesion.", 10.0),
                    ("Empathise and use emotional intelligence to understand and support team members.", "Demonstrates active listening, empathy, and emotional awareness in interpersonal dynamics.", 10.0),
                ]
            ),
        ]

        for tenant in tenants:
            self.stdout.write(self.style.NOTICE(f"\nSeeding Qualitative Factors for Tenant: {tenant.name} ({tenant.id})"))
            
            # Find or get default rating scale
            rating_scale = RatingScale.objects.filter(tenant=tenant).first()

            for cat_name, cat_desc, comp_type, order_idx, factors in categories_data:
                cat, cat_created = CompetencyCategory.objects.get_or_create(
                    tenant=tenant,
                    name=cat_name,
                    defaults={
                        "description": cat_desc,
                        "order": order_idx,
                        "is_active": True,
                    }
                )
                if cat_created:
                    self.stdout.write(self.style.SUCCESS(f"  + Created Category: {cat_name}"))
                else:
                    self.stdout.write(f"  = Category exists: {cat_name}")

                for disp_idx, (factor_name, factor_desc, weight) in enumerate(factors):
                    comp, comp_created = Competency.objects.get_or_create(
                        tenant=tenant,
                        name=factor_name,
                        defaults={
                            "description": factor_desc,
                            "category": cat,
                            "competency_type": comp_type,
                            "default_weight": Decimal(str(weight)),
                            "rating_scale": rating_scale,
                            "display_order": disp_idx,
                            "is_active": True,
                            "is_required": True,
                        }
                    )
                    if comp_created:
                        self.stdout.write(self.style.SUCCESS(f"    + Factor: {factor_name}"))
                    else:
                        self.stdout.write(f"    = Factor exists: {factor_name}")

        self.stdout.write(self.style.SUCCESS("\nAll Section III Qualitative Performance Factors seeded successfully!"))
