# apps/tenant/utils.py

from django.apps import apps
from django.core.exceptions import ImproperlyConfigured


def get_tenant_model():
    from django.conf import settings

    try:
        tenant_model = settings.AUTH_TENANT_MODEL
    except AttributeError:
        raise ImproperlyConfigured(
            "AUTH_TENANT_MODEL must be defined in settings"
        )

    try:
        return apps.get_model(tenant_model, require_ready=False)
    except ValueError:
        raise ImproperlyConfigured(
            f"AUTH_TENANT_MODEL must be of the form 'app_label.model_name', got '{tenant_model}'"
        )
    except LookupError:
        raise ImproperlyConfigured(
            f"AUTH_TENANT_MODEL '{tenant_model}' refers to model that has not been installed"
        )


def get_tenant_model_string():
    from django.conf import settings
    return getattr(settings, 'AUTH_TENANT_MODEL', 'tenant.Client')
