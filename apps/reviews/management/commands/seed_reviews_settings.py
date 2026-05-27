"""Seed Reviews system settings singleton."""

from django.core.management.base import BaseCommand

from apps.reviews.services.settings import ReviewsSettingsService


class Command(BaseCommand):
    help = 'Create or refresh Reviews system settings from defaults'

    def handle(self, *args, **options):
        record = ReviewsSettingsService.get_record()
        defaults = ReviewsSettingsService.get_defaults()
        if not record.settings:
            ReviewsSettingsService.update_settings(defaults)
            self.stdout.write(self.style.SUCCESS('Seeded reviews system settings'))
        else:
            merged = ReviewsSettingsService.get_settings(use_cache=False)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Reviews settings OK (v{record.version}, keys={list(merged.keys())})',
                ),
            )
