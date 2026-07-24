from apps.reportplt.managers.base import ReportingBaseManager

class GeneratedReportManager(ReportingBaseManager):
    def completed(self):
        return self.get_queryset().filter(status='completed')

    def pending(self):
        return self.get_queryset().filter(status='pending')

    def processing(self):
        return self.get_queryset().filter(status='processing')

    def failed(self):
        return self.get_queryset().filter(status='failed')

    def by_user(self, user):
        return self.get_queryset().filter(created_by=user)

    def expired(self, cutoff_date):
        return self.get_queryset().filter(created_at__lt=cutoff_date, file_path__isnull=False)
