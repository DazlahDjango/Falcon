from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from uuid import UUID

class BaseStructureSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    tenant_id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    class Meta:
        abstract = True
    def validate_tenant_id(self, value):
        request = self.context.get('request')
        if request and hasattr(request.user, 'tenant_id'):
            if value and str(value) != str(request.user.tenant_id):
                raise serializers.ValidationError(_("Tenant ID does not match user's tenant."))
        return value

class BaseStructureDetailSerializer(BaseStructureSerializer):
    created_by = serializers.UUIDField(read_only=True)
    updated_by = serializers.UUIDField(read_only=True)
    deleted_by = serializers.UUIDField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)

def get_node_leader_info(node):
    """
    Extract leader / manager details for any organizational node (Division, Department, Section, Unit).
    Returns dict: { user_id, name, email, title } or None
    """
    if not node:
        return None

    from apps.structure.models.employment import Employment
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # 1. Division director_id
    if hasattr(node, 'director_id') and node.director_id:
        user = User.objects.filter(id=node.director_id).first()
        if user:
            name = user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email
            emp = Employment.objects.filter(user_id=user.id, is_current=True, is_deleted=False).select_related('position').first()
            title = emp.position.title if emp and emp.position else "Director"
            return {
                'user_id': str(user.id),
                'name': name,
                'email': user.email,
                'title': title,
            }

    # 2. manager ForeignKey (Position)
    if hasattr(node, 'manager') and node.manager:
        emp = Employment.objects.filter(position=node.manager, is_current=True, is_deleted=False).first()
        if emp and emp.user_id:
            user = User.objects.filter(id=emp.user_id).first()
            if user:
                name = user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email
                return {
                    'user_id': str(user.id),
                    'name': name,
                    'email': user.email,
                    'title': node.manager.title,
                }
        return {
            'user_id': None,
            'name': 'Vacant',
            'email': '',
            'title': node.manager.title,
        }

    # 3. is_manager Employment under this node
    emp = None
    level = getattr(node, 'level', '')
    if level == 'division' or node.__class__.__name__ == 'Division':
        emp = Employment.objects.filter(position__division_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'department' or node.__class__.__name__ == 'Department':
        emp = Employment.objects.filter(position__department_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'section' or node.__class__.__name__ == 'Section':
        emp = Employment.objects.filter(position__section_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'unit' or node.__class__.__name__ == 'Unit':
        emp = Employment.objects.filter(position__unit_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()

    if emp and emp.user_id:
        user = User.objects.filter(id=emp.user_id).first()
        if user:
            name = user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email
            title = emp.position.title if emp.position else 'Lead'
            return {
                'user_id': str(user.id),
                'name': name,
                'email': user.email,
                'title': title,
            }

    return None
