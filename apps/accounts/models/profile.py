from django.db import models
from django.utils.translation import gettext_lazy as _ 
from .base import BaseModel
from .user import User

class Profile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name=_('user'))
    # Personal infor
    avatar = models.ImageField(_('avatar'), upload_to='avatars/%Y/%m/', blank=True, null=True)
    bio = models.TextField(_('bio'), blank=True, max_length=500)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    # Contact info
    alternative_email = models.EmailField(_('alternative email'), blank=True)
    work_phone = models.CharField(_('work phone'), max_length=20, blank=True)
    mobile_phone = models.CharField(_('mobile phone'), max_length=20, blank=True)
    address = models.TextField(_('address'), blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)
    # Prof info
    employee_type = models.CharField(_('employee type'), max_length=50, blank=True, help_text='Full-time, Part-time, Contractor, etc')
    cost_center = models.CharField(_('cost center'), max_length=50, blank=True)
    reports_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports_profile', verbose_name=_('reports_to'))
    # Skills
    skills = models.JSONField(_('skills'), default=list, blank=True)
    certifications = models.JSONField(_('certifications'), default=list, blank=True)
    education = models.JSONField(_('education'), default=list, blank=True)
    # Emergency contact
    emergency_contact_name = models.CharField(_('emergency contact name'), max_length=200, blank=True)
    emergency_contact_phone = models.CharField(_('emergency contact phone'), max_length=20, blank=True)
    emergency_contact_relation = models.CharField(_('emergency contact relation'), max_length=50, blank=True)
    # Preferences
    theme = models.CharField(_('theme'), max_length=10, default='light', choices=[('light', 'Light'), ('dark', 'Dark')])
    dashboard_layout = models.JSONField(_('dashboard layout'), default=dict, blank=True)
    email_frequency = models.CharField(_('email frequency'), max_length=20, default='daily', choices=[('instant', 'Instant'), ('daily', 'Daily'), ('weekly', 'Weekly')])
    # Metadata
    timezone = models.CharField(_('timezone'), max_length=50, default='Africa/Nairobi')
    date_format = models.CharField(_('date format'), max_length=20, default='YYYY-MM-DD')
    number_format = models.CharField(_('number format'), max_length=20, default='comma', choices=[('comma', '1,000.00'), ('dot', '1.000,00')])
    
    class Meta:
        db_table = 'accounts_profile'
        verbose_name = _('profile')
        verbose_name_plural = _('profiles')
        indexes = [
            models.Index(fields=['user', 'tenant_id']),
            models.Index(fields=['employee_type', 'tenant_id']),
        ]
    
    def __str__(self):
        return f"Profile for {self.user.get_full_name()}"
    
    def get_full_address(self):
        parts = [self.address, self.city, self.country]
        return ', '.join(p for p in parts if p)
    
    def has_skill(self, skill_name):
        return any(s.get('name') == skill_name for s in self.skills)

    def get_skill_level(self, skill_name):
        for skill in self.skills:
            if skill.get('name') == skill_name:
                return skill.get('level', 'unknown')
        return None