from .base import SoftDeleteManager

class ReportAuditLogManager(SoftDeleteManager):
    def by_action(self, action):
        return self.get_queryset().filter(action=action)

    def sensitive_access(self):
        return self.get_queryset().filter(sensitivity_level__in=['confidential', 'restricted'])
