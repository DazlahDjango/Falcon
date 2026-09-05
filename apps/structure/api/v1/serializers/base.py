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

    # 1. Direct explicit lead/director UUID fields on the model
    explicit_user_id = None
    if hasattr(node, 'unit_lead_id') and node.unit_lead_id:
        explicit_user_id = node.unit_lead_id
    elif hasattr(node, 'section_lead_id') and node.section_lead_id:
        explicit_user_id = node.section_lead_id
    elif hasattr(node, 'director_id') and node.director_id:
        explicit_user_id = node.director_id
    elif hasattr(node, 'head_of_department_id') and node.head_of_department_id:
        explicit_user_id = node.head_of_department_id
    elif hasattr(node, 'department_head_id') and node.department_head_id:
        explicit_user_id = node.department_head_id

    if explicit_user_id:
        user = User.objects.filter(id=explicit_user_id).first()
        if user:
            name = user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email
            emp = Employment.objects.filter(user_id=user.id, is_current=True, is_deleted=False).select_related('position').first()
            title = emp.position.title if emp and emp.position else "Lead / Manager"
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

    # 3. is_manager / is_team_lead Employment under this node
    emp = None
    level = getattr(node, 'level', '')
    node_cls = node.__class__.__name__
    if level == 'division' or node_cls == 'Division':
        emp = Employment.objects.filter(position__division_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'department' or node_cls == 'Department':
        emp = Employment.objects.filter(position__department_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'section' or node_cls == 'Section':
        emp = Employment.objects.filter(position__section_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
    elif level == 'unit' or node_cls == 'Unit':
        emp = Employment.objects.filter(position__unit_id=node.id, is_manager=True, is_current=True, is_deleted=False).select_related('position').first()
        if not emp:
            emp = Employment.objects.filter(position__unit_id=node.id, is_team_lead=True, is_current=True, is_deleted=False).select_related('position').first()

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

def get_node_staff_members(node):
    """
    Returns list of direct staff/employees under this node.
    """
    if not node:
        return []

    from apps.structure.models.employment import Employment
    from django.contrib.auth import get_user_model
    User = get_user_model()

    level = getattr(node, 'level', '')
    node_cls = node.__class__.__name__

    if level == 'division' or node_cls == 'Division':
        qs = Employment.objects.filter(position__division_id=node.id, is_current=True, is_deleted=False)
    elif level == 'department' or node_cls == 'Department':
        qs = Employment.objects.filter(position__department_id=node.id, is_current=True, is_deleted=False)
    elif level == 'section' or node_cls == 'Section':
        qs = Employment.objects.filter(position__section_id=node.id, is_current=True, is_deleted=False)
    elif level == 'unit' or node_cls == 'Unit':
        qs = Employment.objects.filter(position__unit_id=node.id, is_current=True, is_deleted=False)
    else:
        return []

    employments = qs.select_related('position').order_by('-is_manager', '-is_executive', '-is_team_lead')
    user_ids = [e.user_id for e in employments if e.user_id]
    users_by_id = {u.id: u for u in User.objects.filter(id__in=user_ids)}

    result = []
    for emp in employments:
        user = users_by_id.get(emp.user_id)
        if not user:
            continue
        full_name = user.get_full_name() or f"{user.first_name} {user.last_name}".strip() or user.email
        result.append({
            'employment_id': str(emp.id),
            'user_id': str(user.id),
            'name': full_name,
            'email': user.email,
            'position_id': str(emp.position_id) if emp.position_id else None,
            'position_title': emp.position.title if emp.position else 'Staff',
            'job_code': emp.position.job_code if emp.position else None,
            'employment_type': emp.employment_type if hasattr(emp, 'employment_type') else 'FULL_TIME',
            'is_manager': emp.is_manager,
            'is_executive': emp.is_executive,
            'is_team_lead': getattr(emp, 'is_team_lead', False),
            'is_primary': emp.is_primary,
            'is_active': emp.is_active,
        })
    return result
