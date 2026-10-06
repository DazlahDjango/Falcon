# apps/reviews/services/feedback/assignment_engine.py
"""
Feedback Assignment Engine
Handles flexible, automated bulk 360° feedback request creation based on organizational strategies:
1. Intra-Department (All members of a department review each other)
2. All Departments (Intra-department peer review across all departments in the organization)
3. Cross-Department (Department A members review Department B members)
4. Organization-Wide (All-to-All or Random N-Peer sampling)
5. Reporting Line / Hierarchical (Upward, Downward, and Peer reviews based on manager reporting lines)
"""

import random
import logging
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.reviews.models import FeedbackRequest, ReviewCycle
from apps.reviews.services.base_service import BaseReviewService

logger = logging.getLogger(__name__)


class FeedbackAssignmentEngine(BaseReviewService):
    """
    Automated generation of 360 feedback requests based on organizational rules.
    """

    @classmethod
    def get_users_for_department(cls, tenant_id, department_identifier):
        """
        Retrieve active users belonging to a specific department (by name, code, or UUID).
        """
        # 1. Check direct charfield on User
        users = User.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        ).filter(
            models.Q(department__iexact=str(department_identifier))
        )
        if users.exists():
            return list(users)

        # 2. Check structure.Department + Employment
        try:
            from apps.structure.models import Department, Employment
            dept_filter = models.Q(name__iexact=str(department_identifier)) | models.Q(code__iexact=str(department_identifier))
            try:
                dept_filter |= models.Q(id=department_identifier)
            except Exception:
                pass

            dept = Department.objects.filter(tenant_id=tenant_id, is_deleted=False).filter(dept_filter).first()
            if dept:
                user_ids = Employment.objects.filter(
                    department=dept,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).values_list('employee_id', flat=True)
                return list(User.objects.filter(id__in=user_ids, is_active=True))
        except Exception as e:
            logger.warning(f"Error querying department employment: {e}")

        return list(users)

    @classmethod
    def get_all_department_groups(cls, tenant_id):
        """
        Group all active users in a tenant by their department.
        Returns a dict of { 'Department Name': [User, User, ...] }
        """
        groups = {}
        # From User.department charfield
        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        for u in users:
            dept_name = u.department.strip() if u.department else None
            if not dept_name:
                # Try employment
                try:
                    from apps.structure.models import Employment
                    emp = Employment.objects.filter(employee=u, is_deleted=False).select_related('department').first()
                    if emp and emp.department:
                        dept_name = emp.department.name
                except Exception:
                    pass
            
            if not dept_name:
                dept_name = "General"
            
            if dept_name not in groups:
                groups[dept_name] = []
            groups[dept_name].append(u)

        return groups

    @classmethod
    def _create_pair_request(cls, cycle, subject, reviewer, reviewer_type, due_date, is_anonymous, is_required, requested_by, dry_run=False):
        """
        Helper to create a single FeedbackRequest if it doesn't already exist.
        """
        if subject.id == reviewer.id:
            return None, False

        pair_data = {
            'review_cycle_id': cycle.id,
            'review_cycle_name': cycle.name,
            'subject_id': str(subject.id),
            'subject_name': subject.get_full_name() or subject.email,
            'subject_email': subject.email,
            'reviewer_id': str(reviewer.id),
            'reviewer_name': reviewer.get_full_name() or reviewer.email,
            'reviewer_email': reviewer.email,
            'reviewer_type': reviewer_type,
            'due_date': str(due_date) if due_date else str(cycle.end_date),
            'is_anonymous': is_anonymous,
            'is_required': is_required,
        }

        if dry_run:
            return pair_data, True

        req, created = FeedbackRequest.objects.get_or_create(
            review_cycle=cycle,
            subject=subject,
            reviewer=reviewer,
            defaults={
                'requested_by': requested_by,
                'reviewer_type': reviewer_type,
                'due_date': due_date or cycle.end_date,
                'is_anonymous': is_anonymous,
                'is_required': is_required,
                'status': 'draft',
                'tenant_id': cycle.tenant_id
            }
        )
        return pair_data, created

    @classmethod
    def generate_assignments(
        cls,
        cycle_id,
        strategy,
        tenant_id,
        requested_by=None,
        department=None,
        source_department=None,
        target_department=None,
        bidirectional=True,
        manager_id=None,
        sample_size=None,
        due_date=None,
        is_anonymous=True,
        is_required=False,
        dry_run=False
    ):
        """
        Main entry point for generating feedback assignments based on selected strategy.
        """
        cycle = ReviewCycle.objects.get(id=cycle_id, tenant_id=tenant_id)
        if not due_date:
            due_date = cycle.end_date

        created_pairs = []
        skipped_count = 0

        if strategy == 'intra_department':
            # Everyone in this department reviews everyone else in the department
            users = cls.get_users_for_department(tenant_id, department)
            for subject in users:
                for reviewer in users:
                    pair, created = cls._create_pair_request(
                        cycle, subject, reviewer, 'peer', due_date, is_anonymous, is_required, requested_by, dry_run
                    )
                    if created:
                        created_pairs.append(pair)
                    elif pair:
                        skipped_count += 1

        elif strategy == 'all_departments':
            # Run intra-department peer review across all departments in the organization
            dept_groups = cls.get_all_department_groups(tenant_id)
            for dept_name, members in dept_groups.items():
                if len(members) < 2:
                    continue
                for subject in members:
                    for reviewer in members:
                        pair, created = cls._create_pair_request(
                            cycle, subject, reviewer, 'peer', due_date, is_anonymous, is_required, requested_by, dry_run
                        )
                        if created:
                            created_pairs.append(pair)
                        elif pair:
                            skipped_count += 1

        elif strategy == 'cross_department':
            # Department A members review Department B members
            source_users = cls.get_users_for_department(tenant_id, source_department)
            target_users = cls.get_users_for_department(tenant_id, target_department)

            for subject in target_users:
                for reviewer in source_users:
                    pair, created = cls._create_pair_request(
                        cycle, subject, reviewer, 'cross_dept', due_date, is_anonymous, is_required, requested_by, dry_run
                    )
                    if created:
                        created_pairs.append(pair)
                    elif pair:
                        skipped_count += 1

            if bidirectional:
                for subject in source_users:
                    for reviewer in target_users:
                        pair, created = cls._create_pair_request(
                            cycle, subject, reviewer, 'cross_dept', due_date, is_anonymous, is_required, requested_by, dry_run
                        )
                        if created:
                            created_pairs.append(pair)
                        elif pair:
                            skipped_count += 1

        elif strategy == 'organization_wide':
            # Company-wide all-to-all or sampled peer reviews
            all_users = list(User.objects.filter(tenant_id=tenant_id, is_active=True))
            for subject in all_users:
                candidates = [u for u in all_users if u.id != subject.id]
                if sample_size and sample_size < len(candidates):
                    chosen_reviewers = random.sample(candidates, sample_size)
                else:
                    chosen_reviewers = candidates

                for reviewer in chosen_reviewers:
                    r_type = 'peer' if (subject.department and subject.department == reviewer.department) else 'cross_dept'
                    pair, created = cls._create_pair_request(
                        cycle, subject, reviewer, r_type, due_date, is_anonymous, is_required, requested_by, dry_run
                    )
                    if created:
                        created_pairs.append(pair)
                    elif pair:
                        skipped_count += 1

        elif strategy == 'reporting_line':
            # Upward, Downward, and Peer reviews based on manager relationships
            if manager_id:
                managers = User.objects.filter(id=manager_id, tenant_id=tenant_id, is_active=True)
            else:
                managers = User.objects.filter(
                    tenant_id=tenant_id,
                    is_active=True,
                    direct_reports__isnull=False
                ).distinct()

            for mgr in managers:
                reports = list(mgr.direct_reports.filter(is_active=True))
                if not reports:
                    continue

                # 1. Downward (Manager reviews report)
                for report in reports:
                    pair, created = cls._create_pair_request(
                        cycle, report, mgr, 'manager', due_date, is_anonymous, is_required, requested_by, dry_run
                    )
                    if created:
                        created_pairs.append(pair)
                    elif pair:
                        skipped_count += 1

                # 2. Upward (Direct reports review manager)
                for report in reports:
                    pair, created = cls._create_pair_request(
                        cycle, mgr, report, 'subordinate', due_date, is_anonymous, is_required, requested_by, dry_run
                    )
                    if created:
                        created_pairs.append(pair)
                    elif pair:
                        skipped_count += 1

                # 3. Peer within team (Colleagues sharing the same manager review each other)
                for s in reports:
                    for r in reports:
                        pair, created = cls._create_pair_request(
                            cycle, s, r, 'peer', due_date, is_anonymous, is_required, requested_by, dry_run
                        )
                        if created:
                            created_pairs.append(pair)
                        elif pair:
                            skipped_count += 1

        return {
            'strategy': strategy,
            'cycle_id': cycle.id,
            'cycle_name': cycle.name,
            'created_count': len(created_pairs),
            'skipped_count': skipped_count,
            'pairs': created_pairs[:50],  # sample preview
            'dry_run': dry_run,
            'message': f"Successfully {'simulated' if dry_run else 'created'} {len(created_pairs)} feedback requests ({skipped_count} existing skipped)."
        }
