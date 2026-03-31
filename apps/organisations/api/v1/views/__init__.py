"""
Views for organisations API v1
"""

from .registration import OrganisationRegistrationView
from .tenant import OrganisationViewSet
from .structure import DepartmentViewSet, PositionViewSet, TeamViewSet, HierarchyViewSet
from .subscription import PlanViewSet, SubscriptionViewSet
from .settings import OrganisationSettingsViewSet, BrandingViewSet
from .domains import DomainViewSet
from .contacts import ContactViewSet
from .features import FeatureFlagViewSet

__all__ = [
    'OrganisationRegistrationView',
    'OrganisationViewSet',
    'DepartmentViewSet',
    'PositionViewSet',
    'TeamViewSet',
    'HierarchyViewSet',
    'PlanViewSet',
    'SubscriptionViewSet',
    'OrganisationSettingsViewSet',
    'BrandingViewSet',
    'DomainViewSet',
    'ContactViewSet',
    'FeatureFlagViewSet',
]