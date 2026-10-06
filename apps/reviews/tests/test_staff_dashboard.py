import pytest
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.tenant.models import Organization
from apps.structure.models import Department
from apps.reviews.models import (
    ReviewCycle, RatingScale, SelfAssessment, SupervisorReview,
    FinalRating, FeedbackRequest, PIP, PIPAction
)
from apps.reviews.services.dashboard.staff_dashboard import StaffDashboardService

User = get_user_model()


@pytest.mark.django_db
class TestStaffDashboard:
    @pytest.fixture
    def setup_data(self):
        org = Organization.objects.create(
            name="Test Org Dashboard",
            schema_name="test_org_dash",
            is_active=True
        )
        dept = Department.objects.create(
            name="Engineering",
            tenant_id=org.id
        )
        manager = User.objects.create_user(
            email="manager_dash@example.com",
            password="Password123!",
            tenant_id=org.id,
            first_name="Manager",
            last_name="Boss",
            role="supervisor"
        )
        employee = User.objects.create_user(
            email="employee_dash@example.com",
            password="Password123!",
            tenant_id=org.id,
            first_name="John",
            last_name="Doe",
            manager=manager,
            department=dept,
            role="staff"
        )
        peer = User.objects.create_user(
            email="peer_dash@example.com",
            password="Password123!",
            tenant_id=org.id,
            first_name="Peer",
            last_name="Colleague",
            role="staff"
        )
        rating_scale = RatingScale.objects.create(
            name="Standard Scale",
            tenant_id=org.id,
            scale_type="numeric",
            min_score=1.0,
            max_score=100.0
        )
        today = timezone.now().date()
        cycle = ReviewCycle.objects.create(
            name="H2 2026 Performance Review",
            tenant_id=org.id,
            rating_scale=rating_scale,
            start_date=today - timedelta(days=10),
            self_assessment_deadline=today + timedelta(days=5),
            supervisor_review_deadline=today + timedelta(days=15),
            final_approval_deadline=today + timedelta(days=25),
            end_date=today + timedelta(days=30),
            status="submitted",
            kpi_weight=Decimal("70.00"),
            competency_weight=Decimal("30.00")
        )
        return {
            'org': org,
            'dept': dept,
            'manager': manager,
            'employee': employee,
            'peer': peer,
            'rating_scale': rating_scale,
            'cycle': cycle
        }

    def test_staff_dashboard_no_cycle(self, setup_data):
        employee = setup_data['employee']
        ReviewCycle.objects.all().delete()
        dashboard = StaffDashboardService.get_dashboard(employee)

        assert dashboard['employee']['email'] == employee.email
        assert dashboard['employee']['department'] == "Engineering"
        assert dashboard['review_cycle'] is None
        assert dashboard['self_assessment']['status'] == 'no_active_cycle'
        assert dashboard['self_assessment']['submitted'] is False
        assert dashboard['supervisor_review']['status'] == 'no_active_cycle'
        assert dashboard['final_rating'] is None

    def test_staff_dashboard_with_cycle_and_actions(self, setup_data):
        employee = setup_data['employee']
        manager = setup_data['manager']
        peer = setup_data['peer']
        cycle = setup_data['cycle']
        rating_scale = setup_data['rating_scale']

        # Create SelfAssessment
        sa = SelfAssessment.objects.create(
            tenant_id=setup_data['org'].id,
            employee=employee,
            review_cycle=cycle,
            status='submitted',
            submitted_at=timezone.now()
        )

        # Create SupervisorReview
        sr = SupervisorReview.objects.create(
            tenant_id=setup_data['org'].id,
            employee=employee,
            supervisor=manager,
            review_cycle=cycle,
            self_assessment=sa,
            status='approved',
            submitted_at=timezone.now(),
            recommendation='exceeds_expectations'
        )

        # Create FinalRating
        FinalRating.objects.create(
            tenant_id=setup_data['org'].id,
            employee=employee,
            review_cycle=cycle,
            supervisor_review=sr,
            rating_scale=rating_scale,
            final_score=Decimal("88.50"),
            final_rating_label="Exceeds Expectations",
            final_rating_color="#10B981",
            status='locked'
        )

        # Create FeedbackRequest to write
        FeedbackRequest.objects.create(
            tenant_id=setup_data['org'].id,
            subject=peer,
            reviewer=employee,
            review_cycle=cycle,
            reviewer_type='peer',
            due_date=timezone.now().date() + timedelta(days=3),
            status='draft'
        )

        # Create PIP
        pip = PIP.objects.create(
            tenant=setup_data['org'],
            employee=employee,
            owner=manager,
            title="Skill Improvement",
            description="Improve Python skills",
            start_date=timezone.now().date() - timedelta(days=5),
            end_date=timezone.now().date() + timedelta(days=25),
            improvement_areas="Testing",
            success_criteria="Pass all tests",
            consequences_if_failed="Escalation",
            status='submitted'
        )
        PIPAction.objects.create(
            pip=pip,
            title="Action 1",
            description="Complete unit tests",
            due_date=timezone.now().date() + timedelta(days=5),
            status='completed'
        )
        PIPAction.objects.create(
            pip=pip,
            title="Action 2",
            description="Complete integration tests",
            due_date=timezone.now().date() + timedelta(days=10),
            status='pending'
        )

        dashboard = StaffDashboardService.get_dashboard(employee)

        assert dashboard['review_cycle']['name'] == cycle.name
        assert dashboard['self_assessment']['submitted'] is True
        assert dashboard['self_assessment']['id'] == str(sa.id)
        assert dashboard['supervisor_review']['status'] == 'approved'
        assert dashboard['supervisor_review']['supervisor'] == "Manager Boss"
        assert dashboard['final_rating']['score'] == 88.5
        assert dashboard['final_rating']['is_published'] is True
        assert len(dashboard['feedback_tasks_to_write']) == 1
        assert dashboard['feedback_tasks_to_write'][0]['subject_name'] == "Peer Colleague"
        assert dashboard['active_pip'] is not None
        assert dashboard['active_pip']['progress'] == 50.0
        assert dashboard['active_pip']['total_actions'] == 2
        assert dashboard['active_pip']['completed_actions'] == 1
        assert len(dashboard['upcoming_deadlines']) > 0

    def test_staff_dashboard_api_view(self, setup_data):
        employee = setup_data['employee']
        client = APIClient()
        client.force_authenticate(user=employee)

        response = client.get('/api/v1/reviews/dashboard/staff/')
        assert response.status_code == 200
        data = response.json()
        assert data['employee']['email'] == employee.email
        assert data['review_cycle']['name'] == setup_data['cycle'].name
