from django.db import models


class BaseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def active(self):
        return self.get_queryset()

    def deleted(self):
        return super().get_queryset().filter(is_deleted=True)

    def all_with_deleted(self):
        return super().get_queryset()