from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from apps.accounts.models import User
import logging

class MaintenanceNotifier:
    def notify_users(self, window):
        try:
            users = User.objects.filter(is_active=True, is_verified=True)
            for user in users:
                self._send_notification(user, window)
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to send maintenance notifications: {e}")
    def notify_all_users(self, window):
        self.notify_users(window)
    def notify_admins(self, window, admin_role='super_admin'):
        admins = User.objects.filter(role=admin_role, is_active=True)
        for admin in admins:
            self._send_admin_notification(admin, window)
    def _send_notification(self, user, window):
        context = {
            'user_name': user.get_full_name(),
            'title': window.title,
            'maintenance_type': window.get_maintenance_type_display(),
            'scheduled_start': window.scheduled_start,
            'scheduled_end': window.scheduled_end,
            'reason': window.reason,
        }
        html_body = render_to_string('config/email/maintenance_notice.html', context)
        send_mail(
            subject=f"[Falcon PMS] Maintenance Notice: {window.title}",
            message=f"Maintenance scheduled from {window.scheduled_start} to {window.scheduled_end}. Reason: {window.reason}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=True,
        )
    def _send_admin_notification(self, admin, window):
        context = {
            'admin_name': admin.get_full_name(),
            'window': window,
            'affected_apps': list(window.affected_apps.values_list('name', flat=True)),
        }
        html_body = render_to_string('config/email/admin_maintenance_alert.html', context)
        send_mail(
            subject=f"[Falcon PMS ADMIN] Maintenance Window {window.status}: {window.title}",
            message=f"Maintenance window {window.title} is {window.status}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin.email],
            html_message=html_body,
            fail_silently=True,
        )