from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.configs.models import RegisteredApp, BackupPolicy, BackupJob, BackupArtifact, MaintenanceWindow
from apps.configs.services.backup.backup_retention import BackupRetention
from apps.configs.services.registry.dependency_resolver import DependencyResolver

@receiver(post_save, sender=RegisteredApp)
def on_app_registered(sender, instance, created, **kwargs):
    if created:
        BackupPolicy.objects.get_or_create(
            app=instance,
            defaults={
                'backup_type': 'full',
                'status': 'enabled',
                'retention_days': instance.backup_retention_days,
                'encryption_enabled': True,
            }
        )

@receiver(post_save, sender=BackupJob)
def on_backup_complete(sender, instance, created, **kwargs):
    if instance.status == 'completed' and not created:
        retention = BackupRetention()
        retention.apply_retention_policy(instance.app_id)

@receiver(pre_delete, sender=BackupArtifact)
def on_artifact_delete(sender, instance, **kwargs):
    from apps.configs.services.backup.backup_storage import BackupStorage
    storage = BackupStorage()
    storage.delete(instance.storage_path)

@receiver(post_save, sender=MaintenanceWindow)
def on_maintenance_created(sender, instance, created, **kwargs):
    if created:
        from apps.configs.services.maintenance.maintenance_notifier import MaintenanceNotifier
        notifier = MaintenanceNotifier()
        notifier.notify_admins(instance, 'super_admin')