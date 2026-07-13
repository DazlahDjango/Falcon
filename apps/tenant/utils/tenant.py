from django.apps import apps
from django.core.exceptions import ImproperlyConfigured


def get_organization_model():
    from django.conf import settings
    try:
        org_model = settings.AUTH_ORGANIZATION_MODEL
    except AttributeError:
        raise ImproperlyConfigured("AUTH_ORGANIZATION_MODEL must be defined in settings")
    try:
        return apps.get_model(org_model, require_ready=False)
    except ValueError:
        raise ImproperlyConfigured(f"AUTH_ORGANIZATION_MODEL must be of the form 'app_label.model_name', got '{org_model}'")
    except LookupError:
        raise ImproperlyConfigured(f"AUTH_ORGANIZATION_MODEL '{org_model}' refers to model that has not been installed")


def get_organization_model_string():
    from django.conf import settings
    return getattr(settings, 'AUTH_ORGANIZATION_MODEL', 'organization.Organization')