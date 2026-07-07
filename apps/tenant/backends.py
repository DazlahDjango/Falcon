from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.exceptions import MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class OrganizationAuthenticationBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        org_id = None
        if request and hasattr(request, 'organization_id'):
            org_id = request.organization_id
        is_superuser_override = kwargs.get('is_superuser_override', False)
        try:
            user = User.objects.get(Q(email__iexact=username) | Q(username__iexact=username))
        except User.DoesNotExist:
            User().set_password(password)
            return None
        except MultipleObjectsReturned:
            return None
        if not self.user_can_authenticate(user):
            return None
        if not user.check_password(password):
            return None
        if org_id and not is_superuser_override:
            if not user.organization_id:
                return None
            if str(user.organization_id) != str(org_id):
                return None
        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class SuperuserOrganizationBackend(OrganizationAuthenticationBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        try:
            user = User.objects.get(Q(email__iexact=username) | Q(username__iexact=username))
        except User.DoesNotExist:
            User().set_password(password)
            return None
        if user.check_password(password) and user.is_superuser:
            return user
        return None