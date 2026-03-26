import logging
from typing import Dict, Optional, Any, List, Tuple
from django.utils import timezone
from apps.accounts.models import User, Profile
from apps.accounts.managers import UserManager, ProfileManager
from ..audit.logger import AuditService
logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.audit_service = AuditService()
    
    def get_profile(self, user: User) -> Profile:
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}
        )
        return profile
    
    def update_profile(self, user: User, data: Dict[str, Any], request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            allowed_fields = [
                'bio', 'date_of_birth', 'alternative_email', 'work_phone',
                'mobile_phone', 'address', 'city', 'country', 'employee_type',
                'cost_center', 'title', 'department', 'reports_to'
            ]
            for field in allowed_fields:
                if field in data:
                    setattr(profile, field, data[field])
            profile.save()
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            user.save(update_fields=['first_name', 'last_name'])
            self.audit_service.log(
                user=user, action='profile.updated', action_type='update',
                request=request, severity='info',
                metadata={'fields_updated': list(data.keys())}
            )
            return True, 'Profile updated successfully'
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return False, 'Unable to update profile'
        
    def add_skill(self, user: User, skill_name: str, level: str = 'intermediate', years_experience: int = 0, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills or []
            for skill in skills:
                if skill.get('name') == 'skill_name':
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
            return True, 'Skill added successfully'
        except Exception as e:
            logger.error(f"Add skill error: {str(e)}")
            return False, 'Unable to add skill'
    
    def update_skill(self, user: User, skill_name: str, level: str = None, years_experience: int = None, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills or []
            for skill in skills:
                if skill.get('name') == 'skill_name':
                    if level:
                        skill['level'] = level
                    if years_experience is not None:
                        skill['years_experience'] = years_experience
                    skill['updated_at'] = timezone.now().isoformat()
                    break
            else:
                return False, 'Skill not found'
            profile.skills = skills
            profile.save(update_fields=['skills'])
            self.audit_service.log(
                user=user, action='profile.skill_updated', action_type='update',
                request=request, severity='info',
                metadata={'skill': skill_name}
            )
            return True, 'Skill updated successfully'    
        except Exception as e:
            logger.error(f"Update skills erros: {str(e)}")
            return False, 'Unable to update skills'
    
    def remove_skill(self, user: User, skill_name: str, request=None) -> Tuple[bool, str]:
        try:
            profile = self.get_profile(user)
            skills = profile.skills
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
            return True, 'Skill removed successfully'
        except Exception as e:
            logger.error(f"Remove skill error: {str(e)}")
            return False, 'Unable to remove skill'
        
    def add_certification(self, user: User, name: str, issuer: str, issued_date: str, expiry_date: str = None, credential_id: str = '', request=None) -> Tuple[bool, str]:
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
                metadata={'certification': name}
            )
            return True, 'Certification added successfully'
        except Exception as e:
            logger.error(f"Add certification error: {str(e)}")
            return False, 'Unable to add certification'
        
    def get_skills_summary(self, user: User) -> List[Dict]:
        profile = self.get_profile(user)
        return profile.skills or []
    
    def get_certifications_summary(self, user: User) -> List[Dict]:
        profile = self.get_profile(user)
        return profile.certifications or []
    
    def get_team_skills(self, manager: User) -> Dict[str, Any]:
        team_members = manager.get_team_members()
        team_skills = {}
        profiles = Profile.objects.filter(user__in=team_members, tenant_id=manager.tenant_id)
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
                    level = skill.get['level', 'unknown']
                    team_skills[name]['levels'][level] = team_skills[name]['levels'].get(level, 0) + 1
        return team_skills