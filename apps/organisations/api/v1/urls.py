"""
API v1 URLs for organisations app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.organisations.api.v1.views.registration import OrganisationRegistrationView
from apps.organisations.api.v1.views.tenant import OrganisationViewSet
from apps.organisations.api.v1.views.structure import (
    DepartmentViewSet,
    PositionViewSet,
    TeamViewSet,
    HierarchyViewSet,
)
from apps.organisations.api.v1.views.subscription import PlanViewSet, SubscriptionViewSet
from apps.organisations.api.v1.views.settings import OrganisationSettingsViewSet, BrandingViewSet
from apps.organisations.api.v1.views.domains import DomainViewSet
from apps.organisations.api.v1.views.contacts import ContactViewSet
from apps.organisations.api.v1.views.features import FeatureFlagViewSet

# Create router
router = DefaultRouter()
router.register(r'organisations', OrganisationViewSet, basename='organisation')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'hierarchy', HierarchyViewSet, basename='hierarchy')
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'settings', OrganisationSettingsViewSet, basename='settings')
router.register(r'branding', BrandingViewSet, basename='branding')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'feature-flags', FeatureFlagViewSet, basename='feature-flag')

urlpatterns = [
    path('register/', OrganisationRegistrationView.as_view(), name='organisation-register'),
    path('', include(router.urls)),
]