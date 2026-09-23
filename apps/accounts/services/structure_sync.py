import logging
from django.db import transaction

logger = logging.getLogger(__name__)

def sync_user_profile_from_employment(user_id):
    """
    Synchronizes User and Profile fields from active Employment & Position assignments in Structure App.
    Populates:
      - user.title, profile.title (Position Title)
      - user.department (Structure Level: Unit/Section/Department/Division name)
      - user.manager, profile.reports_to (Reporting Manager)
      - profile.employee_type (Employment Type e.g. Full-time, Contractor)
      - profile.cost_center (Cost Center code/name)
      - user.employee_id (Position Job Code if blank)
    """
    if not user_id:
        return None

    from apps.accounts.models import User, Profile
    from apps.structure.models import Employment

    try:
        user = User.objects.filter(id=user_id, is_deleted=False).first()
        if not user:
            return None

        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}
        )

        try:
            employment = Employment.objects.filter(
                user_id=user_id,
                is_current=True,
                is_active=True,
                is_deleted=False
            ).select_related('position').first()
        except Exception as query_err:
            logger.warning(f"Employment DB query warning for user_id '{user_id}': {str(query_err)}")
            employment = None

        if not employment:
            return user

        position = getattr(employment, 'position', None)

        user_updates = []
        profile_updates = []

        # 1. Title / Position Title
        pos_title = position.title if position else ''
        if pos_title and user.title != pos_title:
            user.title = pos_title
            user_updates.append('title')
        if pos_title and profile.title != pos_title:
            profile.title = pos_title
            profile_updates.append('title')

        # 2. Structure Level / Department (Lowest populated hierarchy unit)
        structure_level_name = ''
        if position:
            if position.unit:
                structure_level_name = position.unit.name
            elif position.section:
                structure_level_name = position.section.name
            elif position.department:
                structure_level_name = position.department.name
            elif position.division:
                structure_level_name = position.division.name

        if structure_level_name and user.department != structure_level_name:
            user.department = structure_level_name
            user_updates.append('department')

        # 3. Manager / Reports To
        manager_id = employment.effective_manager_user_id or employment.manager_user_id
        if manager_id and str(manager_id) != str(user.id):
            if user.manager_id != manager_id:
                user.manager_id = manager_id
                user_updates.append('manager')
            if profile.reports_to_id != manager_id:
                profile.reports_to_id = manager_id
                profile_updates.append('reports_to')

        # 4. Employee Type
        emp_type = employment.employment_type or ''
        if emp_type and profile.employee_type != emp_type:
            profile.employee_type = emp_type
            profile_updates.append('employee_type')

        # 5. Cost Center
        cost_center_val = ''
        if position and position.cost_center:
            cost_center_val = position.cost_center.code or position.cost_center.name or ''
        if cost_center_val and profile.cost_center != cost_center_val:
            profile.cost_center = cost_center_val
            profile_updates.append('cost_center')

        # 6. Employee ID (Position Job Code fallback if blank)
        if position and position.job_code and not user.employee_id:
            user.employee_id = position.job_code
            user_updates.append('employee_id')

        # Save model updates
        if user_updates:
            user.save(update_fields=list(set(user_updates)))
        if profile_updates:
            profile.save(update_fields=list(set(profile_updates)))

        logger.info(f"Synchronized Structure metadata for user {user.email} (User updates: {user_updates}, Profile updates: {profile_updates})")
        return user
    except Exception as e:
        logger.error(f"Error synchronizing structure data for user_id '{user_id}': {str(e)}", exc_info=True)
        return None

def backfill_all_structure_user_profiles(tenant_id=None):
    """
    Backfill helper to trigger structure sync for all users with active employments.
    """
    from apps.structure.models import Employment
    qs = Employment.objects.filter(is_current=True, is_active=True, is_deleted=False)
    if tenant_id:
        qs = qs.filter(tenant_id=tenant_id)

    user_ids = list(qs.values_list('user_id', flat=True).distinct())
    count = 0
    for uid in user_ids:
        if uid:
            sync_user_profile_from_employment(uid)
            count += 1
    return count
