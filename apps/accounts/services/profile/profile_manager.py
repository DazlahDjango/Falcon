import logging
from typing import Dict, Optional, Any, List, Tuple
from django.utils import timezone
from django.db import transaction
from apps.accounts.models import User, Profile
from apps.accounts.services.audit.logger import audit_service
logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.audit_service = audit_service

    def get_profile(self, user: User) -> Profile:
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}
        )
        if created:
            logger.info(f"Created new profile for user {user.email}")
        return profile

    @transaction.atomic
    def update_profile(self, user: User, data: Dict[str, Any], request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            profile_fields = [
                'bio', 'date_of_birth', 'alternative_email', 'work_phone',
                'mobile_phone', 'address', 'city', 'country', 'employee_type',
                'cost_center', 'theme', 'dashboard_layout', 'email_frequency',
                'timezone', 'date_format', 'number_format'
            ]
            user_fields = ['first_name', 'last_name', 'phone_number', 'title', 'department']
            updated_fields = []
            for field in profile_fields:
                if field in data:
                    setattr(profile, field, data[field])
                    updated_fields.append(field)
            for field in user_fields:
                if field in data:
                    setattr(user, field, data[field])
                    updated_fields.append(field)
            if 'reports_to' in data:
                reports_to_id = data['reports_to']
                if reports_to_id:
                    try:
                        reports_to = User.objects.get(id=reports_to_id, tenant_id=user.tenant_id)
                        profile.reports_to = reports_to
                        updated_fields.append('reports_to')
                    except User.DoesNotExist:
                        pass
                else:
                    profile.reports_to = None
                    updated_fields.append('reports_to')
            if updated_fields:
                profile.save(update_fields=profile_fields + ['reports_to'])
                user.save(update_fields=user_fields)
            self.audit_service.log(
                user=user, action='profile.updated', action_type='update',
                request=request, severity='info',
                metadata={'fields_updated': updated_fields}
            )
            logger.info(f"Profile updated for user {user.email}: {updated_fields}")
            return True, 'Profile updated successfully'
        except Exception as e:
            logger.error(f"Profile update error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to update profile: {str(e)}'

    @transaction.atomic
    def add_skill(self, user: User, skill_name: str, level: str = 'intermediate', years_experience: int = 0, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills or []
            for skill in skills:
                if skill.get('name') == skill_name:
                    return False, 'Skill already exists'
            skills.append({
                'name': skill_name,
                'level': level,
                'years_experience': years_experience,
                'added_at': timezone.now().isoformat()
            })
            profile.skills = skills
            profile.save(update_fields=['skills'])
            self.audit_service.log(
                user=user, action='profile.skill_added', action_type='update',
                request=request, severity='info',
                metadata={'skill': skill_name, 'level': level}
            )
            logger.info(f"Skill '{skill_name}' added to user {user.email}")
            return True, 'Skill added successfully'
        except Exception as e:
            logger.error(f"Add skill error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to add skill: {str(e)}'

    @transaction.atomic
    def update_skill(self, user: User, skill_name: str, level: str = None, years_experience: int = None, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills or []
            skill_found = False
            for skill in skills:
                if skill.get('name') == skill_name:
                    if level:
                        skill['level'] = level
                    if years_experience is not None:
                        skill['years_experience'] = years_experience
                    skill['updated_at'] = timezone.now().isoformat()
                    skill_found = True
                    break
            if not skill_found:
                return False, 'Skill not found'
            profile.skills = skills
            profile.save(update_fields=['skills'])
            self.audit_service.log(
                user=user, action='profile.skill_updated', action_type='update',
                request=request, severity='info',
                metadata={'skill': skill_name, 'level': level}
            )
            logger.info(f"Skill '{skill_name}' updated for user {user.email}")
            return True, 'Skill updated successfully'
        except Exception as e:
            logger.error(f"Update skill error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to update skill: {str(e)}'

    @transaction.atomic
    def remove_skill(self, user: User, skill_name: str, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills or []
            new_skills = [s for s in skills if s.get('name') != skill_name]
            if len(new_skills) == len(skills):
                return False, 'Skill not found'
            profile.skills = new_skills
            profile.save(update_fields=['skills'])
            self.audit_service.log(
                user=user, action='profile.skill_removed', action_type='update',
                request=request, severity='info',
                metadata={'skill': skill_name}
            )
            logger.info(f"Skill '{skill_name}' removed from user {user.email}")
            return True, 'Skill removed successfully'
        except Exception as e:
            logger.error(f"Remove skill error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to remove skill: {str(e)}'

    @transaction.atomic
    def add_certification(self, user: User, name: str, issuer: str,issued_date: str, expiry_date: str = None, credential_id: str = '', request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            certifications = profile.certifications or []
            certifications.append({
                'name': name,
                'issuer': issuer,
                'issued_date': issued_date,
                'expiry_date': expiry_date,
                'credential_id': credential_id,
                'added_at': timezone.now().isoformat()
            })
            profile.certifications = certifications
            profile.save(update_fields=['certifications'])
            self.audit_service.log(
                user=user, action='profile.certification_added', action_type='update',
                request=request, severity='info',
                metadata={'certification': name, 'issuer': issuer}
            )
            logger.info(f"Certification '{name}' added to user {user.email}")
            return True, 'Certification added successfully'
        except Exception as e:
            logger.error(f"Add certification error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to add certification: {str(e)}'

    @transaction.atomic
    def remove_certification(self, user: User, cert_name: str, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            certifications = profile.certifications or []
            new_certs = [c for c in certifications if c.get('name') != cert_name]
            if len(new_certs) == len(certifications):
                return False, 'Certification not found'
            profile.certifications = new_certs
            profile.save(update_fields=['certifications'])
            self.audit_service.log(
                user=user, action='profile.certification_removed', action_type='update',
                request=request, severity='info',
                metadata={'certification': cert_name}
            )
            logger.info(f"Certification '{cert_name}' removed from user {user.email}")
            return True, 'Certification removed successfully'
        except Exception as e:
            logger.error(f"Remove certification error for {user.email}: {str(e)}", exc_info=True)
            return False, f'Unable to remove certification: {str(e)}'

    def get_skills_summary(self, user: User) -> List[Dict]:
        profile = self.get_profile(user)
        return profile.skills or []

    def get_certifications_summary(self, user: User) -> List[Dict]:
        profile = self.get_profile(user)
        return profile.certifications or []

    def get_team_skills(self, manager: User) -> Dict[str, Any]:
        try:
            team_members = manager.get_team_members()
            team_skills = {}
            profiles = Profile.objects.filter(
                user__in=team_members,
                tenant_id=manager.tenant_id
            )
            for profile in profiles:
                for skill in profile.skills or []:
                    name = skill.get('name')
                    if name:
                        if name not in team_skills:
                            team_skills[name] = {
                                'count': 0,
                                'users': [],
                                'levels': {}
                            }
                        team_skills[name]['count'] += 1
                        team_skills[name]['users'].append(profile.user.email)
                        level = skill.get('level', 'unknown')
                        team_skills[name]['levels'][level] = team_skills[name]['levels'].get(level, 0) + 1
            return team_skills
        except Exception as e:
            logger.error(f"Get team skills error for manager {manager.email}: {str(e)}", exc_info=True)
            return {}

    def get_profile_completion_percentage(self, user: User) -> int:
        profile = self.get_profile(user)
        fields_to_check = [
            ('avatar', profile.avatar is not None),
            ('bio', bool(profile.bio)),
            ('date_of_birth', profile.date_of_birth is not None),
            ('work_phone', bool(profile.work_phone)),
            ('mobile_phone', bool(profile.mobile_phone)),
            ('address', bool(profile.address)),
            ('city', bool(profile.city)),
            ('country', bool(profile.country)),
            ('employee_type', bool(profile.employee_type)),
            ('skills', len(profile.skills or []) > 0),
            ('certifications', len(profile.certifications or []) > 0),
            ('first_name', bool(user.first_name)),
            ('last_name', bool(user.last_name)),
            ('phone_number', bool(user.phone_number)),
            ('title', bool(user.title)),
        ]
        completed = sum(1 for _, completed in fields_to_check if completed)
        total = len(fields_to_check)
        return int((completed / total) * 100) if total > 0 else 0
profile_service = ProfileService()