from .base import SoftDeleteManager

class ReportTemplateManager(SoftDeleteManager):
    def by_category(self, category):
        return self.not_deleted().filter(category=category)

    def production_templates(self):
        return self.by_category('production')

    def system_templates(self):
        return self.by_category('system')

    def active_templates(self):
        return self.not_deleted().filter(is_active=True)
