from django.db import models
from django.utils.translation import gettext_lazy as _

class HierarchicalMixin(models.Model):
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='children', verbose_name=_('parent'))
    path = models.CharField(_('materialized path'), max_length=255, db_index=True, blank=True)
    depth = models.PositiveSmallIntegerField(_('depth'), default=0)
    level = models.CharField(_('organization level'), max_length=20, db_index=True, blank=True)

    class Meta:
        abstract = True

    def get_ancestors(self):
        ancestors = []
        current = self
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return ancestors

    def get_descendants(self, include_self=False):
        descendants = list(self.children.filter(is_deleted=False, is_active=True))
        for child in self.children.all():
            descendants.extend(child.get_descendants())
        if include_self:
            descendants.insert(0, self)
        return descendants

    def get_full_path(self, separator=' / '):
        ancestors = self.get_ancestors()
        path_parts = [a.name for a in reversed(ancestors)] + [self.name]
        return separator.join(path_parts)

    def is_ancestor_of(self, other):
        return other.path.startswith(self.path) and self.id != other.id

    def is_descendant_of(self, other):
        return self.path.startswith(other.path) and self.id != other.id

    def get_siblings(self, include_self=False):
        siblings = self.__class__.objects.filter(parent=self.parent, is_deleted=False, is_active=True)
        if not include_self:
            siblings = siblings.exclude(id=self.id)
        return siblings

    def get_root(self):
        ancestors = self.get_ancestors()
        return ancestors[-1] if ancestors else self

    def get_children_count(self):
        return self.children.filter(is_deleted=False, is_active=True).count()

    def get_depth(self):
        return self.depth

    def get_level(self):
        return self.level