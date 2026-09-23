# apps/reviews/management/commands/seed_reviews_demo_data.py
"""
Management command to seed realistic, simple demo data for Reviews subsystem.
Creates:
- Review Templates (2 templates: Standard Employee Review & Leadership Review)
- Final Ratings for completed evaluations
- Performance Improvement Plans (2 PIPs: Minor & Moderate)
- Promotion Recommendations (2 Promotions: High & Medium Priority)
"""

from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.tenant.models import Organization
from apps.accounts.models import User
from apps.reviews.models import (
    RatingScale,
    CompetencyCategory,
    Competency,
    ReviewTemplate,
    ReviewCycle,
    SelfAssessment,
    SupervisorReview,
    FinalRating,
    PIP,
    PIPAction,
    PromotionRecommendation,
)


class Command(BaseCommand):
    help = 'Seed simple demo data for Reviews subsystem (Templates, PIPs, Promotions, Final Ratings)'

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

        for tenant in tenants:
            self.stdout.write(self.style.NOTICE(f"\n--- Seeding Reviews Demo Data for: {tenant.name} ---"))
            
            # Find Admin and Staff/Supervisor users
            admin_user = User.objects.filter(tenant_id=tenant.id, role__in=['super_admin', 'client_admin', 'admin'], is_active=True).first()
            if not admin_user:
                admin_user = User.objects.filter(tenant_id=tenant.id, is_active=True).first()
                
            supervisors = list(User.objects.filter(tenant_id=tenant.id, role='supervisor', is_active=True)[:3])
            staff_users = list(User.objects.filter(tenant_id=tenant.id, role='staff', is_active=True)[:5])

            if not staff_users:
                self.stdout.write(self.style.WARNING(f"  No staff users found in {tenant.name}, skipping."))
                continue

            supervisor = supervisors[0] if supervisors else admin_user

            # 1. Seed Qualitative Factors (Section III Competencies & Categories)
            self._seed_qualitative_factors(tenant, admin_user)

            # 2. Seed Review Templates (2 templates)
            self._seed_templates(tenant, admin_user)

            # 3. Find active Review Cycle
            cycle = ReviewCycle.objects.filter(tenant_id=tenant.id).order_by('-created_at').first()
            rating_scale = RatingScale.objects.filter(tenant=tenant).first() or RatingScale.objects.first()

            if not cycle or not rating_scale:
                self.stdout.write(self.style.WARNING("  Missing cycle or rating scale, skipping dependent records."))
                continue

            # 3. Seed Final Ratings
            final_ratings = self._seed_final_ratings(tenant, cycle, rating_scale, staff_users, supervisor)

            # 4. Seed PIPs (2 sample PIPs)
            self._seed_pips(tenant, cycle, staff_users, supervisor, final_ratings)

            # 5. Seed Promotion Recommendations (2 sample Promotions)
            self._seed_promotions(tenant, cycle, staff_users, supervisor, final_ratings)

            self.stdout.write(self.style.SUCCESS(f"  Successfully seeded review demo data for {tenant.name}"))

    def _seed_qualitative_factors(self, tenant, admin_user):
        """Seed Section III Qualitative Performance Factors (Categories & Competencies)"""
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

        for cat_name, cat_desc, comp_type, order_idx, factors in categories_data:
            cat, _ = CompetencyCategory.objects.get_or_create(
                tenant=tenant,
                name=cat_name,
                defaults={"description": cat_desc, "order": order_idx, "is_active": True}
            )
            for disp_idx, (factor_name, factor_desc, weight) in enumerate(factors):
                comp, created = Competency.objects.get_or_create(
                    tenant=tenant,
                    name=factor_name,
                    defaults={
                        "description": factor_desc,
                        "category": cat,
                        "competency_type": comp_type,
                        "default_weight": Decimal(str(weight)),
                        "display_order": disp_idx,
                        "is_active": True,
                        "is_required": True,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"  + Created Factor [{cat_name}]: {factor_name[:50]}..."))

    def _seed_templates(self, tenant, admin_user):
        # Template 1: Standard Employee Review Template
        t1, created1 = ReviewTemplate.objects.get_or_create(
            tenant=tenant,
            name="Standard Staff Performance Template",
            defaults={
                "description": "Standard annual review template for individual contributors covering core competencies and achievements.",
                "included_sections": ["strengths", "weaknesses", "goals", "training", "achievements"],
                "required_sections": ["strengths", "weaknesses", "goals"],
                "section_order": ["achievements", "strengths", "weaknesses", "goals", "training"],
                "applies_to_self_assessment": True,
                "applies_to_supervisor_review": True,
                "applies_to_360_feedback": False,
                "is_active": True,
                "is_default": True,
                "created_by": admin_user,
            }
        )
        if created1:
            self.stdout.write(self.style.SUCCESS(f"  + Created Review Template: {t1.name}"))
        else:
            self.stdout.write(f"  = Review Template exists: {t1.name}")

        # Template 2: Leadership & Management Review Template
        t2, created2 = ReviewTemplate.objects.get_or_create(
            tenant=tenant,
            name="Leadership & Management Template",
            defaults={
                "description": "Comprehensive appraisal template for supervisors, team leads, and heads of department.",
                "included_sections": ["strengths", "weaknesses", "goals", "training", "career", "feedback", "achievements"],
                "required_sections": ["strengths", "goals", "feedback"],
                "section_order": ["achievements", "strengths", "weaknesses", "goals", "career", "feedback", "training"],
                "applies_to_self_assessment": True,
                "applies_to_supervisor_review": True,
                "applies_to_360_feedback": True,
                "is_active": True,
                "is_default": False,
                "created_by": admin_user,
            }
        )
        if created2:
            self.stdout.write(self.style.SUCCESS(f"  + Created Review Template: {t2.name}"))
        else:
            self.stdout.write(f"  = Review Template exists: {t2.name}")

        # Template 3: 360 Degree Peer Feedback Questionnaire Template
        t3, created3 = ReviewTemplate.objects.get_or_create(
            tenant=tenant,
            name="360 Degree Peer Feedback Template",
            defaults={
                "description": "Structured 360° behavioral evaluation focusing on collaboration, communication, reliability, and professionalism.",
                "included_sections": ["feedback", "strengths", "weaknesses"],
                "required_sections": ["feedback"],
                "section_order": ["feedback", "strengths", "weaknesses"],
                "applies_to_self_assessment": False,
                "applies_to_supervisor_review": False,
                "applies_to_360_feedback": True,
                "is_active": True,
                "is_default": False,
                "created_by": admin_user,
            }
        )
        if created3:
            self.stdout.write(self.style.SUCCESS(f"  + Created 360 Review Template: {t3.name}"))
        else:
            self.stdout.write(f"  = 360 Review Template exists: {t3.name}")

    def _seed_final_ratings(self, tenant, cycle, rating_scale, staff_users, supervisor):
        final_ratings = {}
        for idx, staff in enumerate(staff_users[:4]):
            scores = [
                (Decimal('4.80'), Decimal('96.00'), 'Exceeds Expectations', '#10B981', FinalRating.ActionOutcome.PROMOTE),
                (Decimal('4.20'), Decimal('84.00'), 'Meets Expectations', '#3B82F6', FinalRating.ActionOutcome.BONUS),
                (Decimal('3.50'), Decimal('70.00'), 'Meets Expectations', '#F59E0B', FinalRating.ActionOutcome.NO_ACTION),
                (Decimal('2.10'), Decimal('42.00'), 'Needs Improvement', '#EF4444', FinalRating.ActionOutcome.PIP),
            ]
            final_score, kpi_score, label, color, action = scores[idx % len(scores)]

            fr, created = FinalRating.objects.get_or_create(
                tenant_id=str(tenant.id),
                review_cycle=cycle,
                employee=staff,
                defaults={
                    "rating_scale": rating_scale,
                    "kpi_score": kpi_score,
                    "competency_score": final_score * Decimal('20.0'),
                    "raw_total_score": kpi_score,
                    "adjusted_score": kpi_score,
                    "final_score": final_score,
                    "final_rating_label": label,
                    "final_rating_color": color,
                    "status": FinalRating.FinalStatus.APPROVED,
                    "action_outcome": action,
                    "notes": f"Evaluation finalized for {staff.get_full_name() or staff.email}.",
                }
            )
            final_ratings[staff.id] = fr
            if created:
                self.stdout.write(self.style.SUCCESS(f"  + Created Final Rating for {staff.email}: {label} ({final_score})"))

        return final_ratings

    def _seed_pips(self, tenant, cycle, staff_users, supervisor, final_ratings):
        if len(staff_users) < 2:
            return

        pip_candidates = staff_users[-2:]
        severities = [
            (PIP.Severity.MODERATE, "Deliverable Accuracy & Code Review Standards", "Weekly code reviews with senior lead; 0 critical defects in staging."),
            (PIP.Severity.MINOR, "Customer Response Time & SLA Adherence", "Achieve 95% first-response SLA on assigned high-priority tickets."),
        ]

        today = date.today()
        for idx, emp in enumerate(pip_candidates):
            severity, title, success_crit = severities[idx % len(severities)]
            fr = final_ratings.get(emp.id)

            pip_obj, created = PIP.objects.get_or_create(
                tenant=tenant,
                employee=emp,
                title=title,
                defaults={
                    "owner": supervisor,
                    "review_cycle": cycle,
                    "final_rating": fr,
                    "description": f"Targeted coaching program for {emp.get_full_name() or emp.email} to improve core performance deliverables.",
                    "severity": severity,
                    "status": "submitted",
                    "start_date": today - timedelta(days=15),
                    "end_date": today + timedelta(days=45),
                    "improvement_areas": "Core output consistency, communication during blockers, and adherence to team delivery standards.",
                    "success_criteria": success_crit,
                    "success_metrics": {"target_pass_rate": 90, "milestone_checkins_required": 4},
                    "consequences_if_failed": "Formal disciplinary review and reassignment of critical responsibilities.",
                    "consequences_if_successful": "Return to regular standing with positive completion record.",
                    "employee_acknowledged_at": timezone.now() - timedelta(days=14),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  + Created PIP for {emp.email}: {title} ({severity})"))
                PIPAction.objects.create(
                    pip=pip_obj,
                    title="Bi-Weekly Check-in 1",
                    description="Review ticket backlog and SLA metrics with supervisor.",
                    due_date=today + timedelta(days=7),
                    status=PIPAction.ActionStatus.COMPLETED,
                    completed_at=timezone.now(),
                    progress_notes="Completed initial review. Metrics trending upward."
                )

    def _seed_promotions(self, tenant, cycle, staff_users, supervisor, final_ratings):
        top_candidates = staff_users[:2]
        promo_data = [
            ("Software Engineer", "Senior Software Engineer", PromotionRecommendation.Priority.HIGH, "Exceptional delivery on core platform microservices and outstanding peer leadership."),
            ("Analyst", "Team Lead / Senior Analyst", PromotionRecommendation.Priority.MEDIUM, "Consistently exceeded KPI targets for 2 consecutive quarters with high client satisfaction."),
        ]

        for idx, emp in enumerate(top_candidates):
            curr_role, target_role, priority, justification = promo_data[idx % len(promo_data)]
            fr = final_ratings.get(emp.id)

            if not fr:
                continue

            promo, created = PromotionRecommendation.objects.get_or_create(
                tenant=tenant,
                employee=emp,
                review_cycle=cycle,
                defaults={
                    "final_rating": fr,
                    "recommended_by": supervisor,
                    "current_role": curr_role,
                    "recommended_role": target_role,
                    "justification": justification,
                    "priority": priority,
                    "status": PromotionRecommendation.Status.PENDING,
                    "salary_increase_percentage": Decimal('12.50'),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  + Created Promotion Recommendation for {emp.email} -> {target_role}"))
