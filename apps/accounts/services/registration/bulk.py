import csv
import io
import logging
from typing import List, Dict, Tuple
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import User, Profile, UserPreference
from apps.accounts.services.auth.password import PasswordService
from apps.accounts.services.auth.audit import AuditService

logger = logging.getLogger(__name__)

class BulkUserImportService:
    def __init__(self):
        self.password_service = PasswordService()
        self.audit_service = AuditService()

    def import_users_from_csv(self, file_content: str, tenant_id: str, request_user=None, request=None) -> Tuple[int, List[str], List[Dict]]:
        """
        Imports users from a CSV string.
        Returns: (success_count, error_messages, imported_users_data)
        """
        success_count = 0
        errors = []
        imported_data = []

        csv_file = io.StringIO(file_content)
        reader = csv.DictReader(csv_file)
        
        required_headers = {'email', 'username'}
        if not required_headers.issubset(set(reader.fieldnames or [])):
            return 0, [_("CSV is missing required headers: email, username")], []

        for row_idx, row in enumerate(reader, start=1):
            email = row.get('email', '').strip().lower()
            username = row.get('username', '').strip()
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            role = row.get('role', 'staff').strip().lower()
            employee_id = row.get('employee_id', '').strip()
            department = row.get('department', '').strip()
            title = row.get('title', '').strip()

            if not email or not username:
                errors.append(f"Row {row_idx}: Email and username are required.")
                continue

            if User.objects.filter(email__iexact=email).exists():
                errors.append(f"Row {row_idx}: User with email '{email}' already exists.")
                continue

            if User.objects.filter(username__iexact=username).exists():
                errors.append(f"Row {row_idx}: User with username '{username}' already exists.")
                continue

            from apps.accounts.constants import UserRoles
            if role not in UserRoles.ALL:
                role = UserRoles.STAFF
                
            if request_user and request_user.role == UserRoles.CLIENT_ADMIN:
                if role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
                    errors.append(f"Row {row_idx}: Client Admin cannot import/create Super Admin or Client Admin accounts.")
                    continue

            try:
                user = User(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    employee_id=employee_id,
                    department=department,
                    title=title,
                    tenant_id=tenant_id,
                    is_active=True,
                    is_verified=False
                )

                raw_password, password_change_required, mode = self.password_service.generate_default_password_for_user(user, tenant_id)
                if mode == 'invite_only':
                    user.set_unusable_password()
                    user.password_change_required = False
                else:
                    user.set_password(raw_password)
                    user.password_change_required = password_change_required

                user.save()

                Profile.objects.create(user=user, tenant_id=tenant_id)
                UserPreference.objects.create(user=user, tenant_id=tenant_id)

                success_count += 1
                imported_data.append({
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'role': user.role,
                    'mode': mode,
                    'raw_password': raw_password if mode != 'invite_only' else None
                })
                
                self.audit_service.log(
                    user=user,
                    action='user.bulk_import_create',
                    action_type='create',
                    request=request,
                    severity='info',
                    metadata={'mode': mode, 'imported_by': str(request_user.id) if request_user else 'system'}
                )

            except Exception as e:
                logger.error(f"Error importing row {row_idx}: {str(e)}")
                errors.append(f"Row {row_idx}: Unexpected error: {str(e)}")

        if success_count > 0 and request_user:
            self.audit_service.log(
                user=request_user,
                action='user.bulk_import_completed',
                action_type='create',
                request=request,
                severity='info',
                metadata={'success_count': success_count, 'errors_count': len(errors), 'tenant_id': str(tenant_id)}
            )

        return success_count, errors, imported_data
