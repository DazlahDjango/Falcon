from django.db import models
from .base import SoftDeleteManager, TenantAwareQuerySet

class ProfileQuerySet(TenantAwareQuerySet):
    def with_skill(self, skill_name):  # Fixed: was 'with_skills'
        return self.filter(skills__contains=[{'name': skill_name}])
    
    def with_skill_level(self, skill_name, min_level):
        return self.filter(skills__contains=[{'name': skill_name, 'level__gte': min_level}])
    
    def with_certification(self, cert_name):
        return self.filter(certifications__contains=[{'name': cert_name}])
    
    def with_education(self, degree_type):
        return self.filter(education__contains=[{'degree': degree_type}])
    
    def with_employee_type(self, emp_type):
        return self.filter(employee_type=emp_type)
    
    def with_cost_center(self, cost_center):
        return self.filter(cost_center=cost_center)
    
    def with_reports_to(self, manager_id):
        return self.filter(reports_to_id=manager_id)
    
    def without_avatar(self):
        return self.filter(avatar__isnull=True)
    
    def with_avatar(self):
        return self.filter(avatar__isnull=False)


class ProfileManager(SoftDeleteManager):
    """Manager for Profile model"""
    
    def get_queryset(self):
        return ProfileQuerySet(self.model, using=self._db)
    
    def get_by_user(self, user):
        """Get profile by user"""
        return self.filter(user=user).first()
    
    def get_or_create_profile(self, user):
        """Get or create profile for user"""
        profile, created = self.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}  # Fixed: was 'tenant_id', user.tenant_id
        )
        return profile
    
    def get_skills_distribution(self, tenant_id=None):
        """Get distribution of skills across users"""
        qs = self
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        
        skills = {}
        for profile in qs.all():
            for skill in profile.skills or []:
                name = skill.get('name')
                if name:
                    skills[name] = skills.get(name, 0) + 1
        return skills
    
    def get_team_skills(self, manager_id):
        """Get skills distribution for a team"""
        team_members = self.filter(reports_to_id=manager_id)
        skills = {}
        for profile in team_members:
            for skill in profile.skills or []:
                name = skill.get('name')
                if name:
                    skills[name] = skills.get(name, 0) + 1
        return skills
    
    def get_profiles_by_employee_type(self, employee_type, tenant_id=None):
        """Get profiles by employee type"""
        qs = self.filter(employee_type=employee_type)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs