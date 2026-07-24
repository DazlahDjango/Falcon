# apps/reportplt/models/report_dashboard.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportDashboard(BaseModel):
    TYPES_CHOICES = [
        ('executive', 'Executive Dashboard'),
        ('departmental', 'Departmental Dashboard'),
        ('team', 'Team Dashboard'),
        ('personal', 'Personal Dashboard'),
        ('custom', 'Custom Dashboard'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    description = models.TextField(_('description'), blank=True)
    dashboard_type = models.CharField(_('dashboard type'), max_length=50, choices=TYPES_CHOICES, default='personal')
    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='dashboards')
    is_default = models.BooleanField(_('is default'), default=False)
    is_shared = models.BooleanField(_('is shared'), default=False)
    is_published = models.BooleanField(_('is published'), default=False)
    layout = models.JSONField(_('layout configuration'), default=dict)
    config = models.JSONField(_('dashboard configuration'), default=dict)
    theme = models.JSONField(_('theme configuration'), default=dict)
    widgets_order = models.JSONField(_('widgets order'), default=list)
    refresh_interval = models.IntegerField(_('refresh interval (seconds)'), default=300)
    allowed_roles = models.JSONField(_('allowed roles'), default=list)
    allowed_users = models.JSONField(_('allowed users'), default=list)
    allowed_departments = models.JSONField(_('allowed departments'), default=list)
    tags = models.JSONField(_('tags'), default=list)
    last_viewed_at = models.DateTimeField(_('last viewed at'), null=True, blank=True)
    view_count = models.PositiveIntegerField(_('view count'), default=0)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_dashboard'
        verbose_name = _('report dashboard')
        verbose_name_plural = _('report dashboards')
        indexes = [
            models.Index(fields=['tenant_id', 'owner', 'dashboard_type']),
            models.Index(fields=['tenant_id', 'is_default', 'owner']),
            models.Index(fields=['tenant_id', 'is_shared', 'is_published']),
            models.Index(fields=['tenant_id', 'last_viewed_at']),
        ]
        unique_together = [['tenant_id', 'owner', 'name']]
    
    def __str__(self):
        return self.name
    
    def is_accessible_by(self, user):
        if user.is_superuser or user.role == 'super_admin':
            return True
        if self.owner_id == user.id:
            return True
        if self.is_shared:
            if user.role in self.allowed_roles:
                return True
            if str(user.id) in self.allowed_users:
                return True
            if user.department and user.department in self.allowed_departments:
                return True
        return False
    
    def record_view(self, user):
        self.last_viewed_at = timezone.now()
        self.view_count += 1
        self.save(update_fields=['last_viewed_at', 'view_count'])
    
    def add_widget(self, widget):
        if widget.id not in self.widgets_order:
            self.widgets_order.append(str(widget.id))
            self.save(update_fields=['widgets_order'])
    
    def remove_widget(self, widget):
        if str(widget.id) in self.widgets_order:
            self.widgets_order.remove(str(widget.id))
            self.save(update_fields=['widgets_order'])
    
    def reorder_widgets(self, widget_ids):
        self.widgets_order = [str(wid) for wid in widget_ids]
        self.save(update_fields=['widgets_order'])