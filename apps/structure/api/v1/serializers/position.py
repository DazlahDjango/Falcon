from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.position import Position
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class PositionSerializer(BaseStructureSerializer):
    reports_to_code = serializers.CharField(source='reports_to.job_code', read_only=True, allow_null=True)
    reports_to_title = serializers.CharField(source='reports_to.title', read_only=True, allow_null=True)
    reports_to_occupant_name = serializers.SerializerMethodField()
    is_vacant = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    
    division_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True, allow_null=True)
    cost_center_name = serializers.CharField(source='cost_center.name', read_only=True, allow_null=True)
    
    occupants = serializers.SerializerMethodField()
    primary_occupant = serializers.SerializerMethodField()
    direct_report_count = serializers.SerializerMethodField()
    span_warning = serializers.SerializerMethodField()
    
    class Meta:
        model = Position
        fields = [
            'id', 'tenant_id', 'job_code', 'title', 'grade', 'level', 'category',
            'reports_to_id', 'reports_to_code', 'reports_to_title', 'reports_to_occupant_name',
            'division_id', 'division_name', 'department_id', 'department_name',
            'section_id', 'section_name', 'unit_id', 'unit_name',
            'cost_center_id', 'cost_center_name', 'fte',
            'is_single_incumbent', 'current_incumbents_count',
            'max_incumbents', 'is_vacant', 'occupants', 'primary_occupant',
            'direct_report_count', 'span_warning', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'current_incumbents_count', 'created_at', 'updated_at']

    def _get_employments(self, obj):
        if not hasattr(obj, '_cached_employments'):
            from apps.structure.models.employment import Employment
            obj._cached_employments = list(
                Employment.objects.filter(position=obj, is_current=True, is_deleted=False, is_active=True)
            )
        return obj._cached_employments

    def get_is_vacant(self, obj):
        return len(self._get_employments(obj)) == 0

    def get_category(self, obj):
        if obj.level == 1 or 'CHIEF' in obj.job_code or 'EXECUTIVE' in obj.title.upper():
            return 'Executive'
        if obj.level in (2, 3) or 'MANAGER' in obj.title.upper() or 'DIRECTOR' in obj.title.upper() or 'HEAD' in obj.title.upper():
            return 'Manager / Supervisor'
        if obj.level == 4 or 'LEAD' in obj.title.upper() or 'SUPERVISOR' in obj.title.upper():
            return 'Team Lead'
        return 'Staff / Specialist'

    def get_occupants(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        emps = self._get_employments(obj)
        result = []
        for e in emps:
            u = User.objects.filter(id=e.user_id).first()
            if u:
                result.append({
                    'employment_id': str(e.id),
                    'user_id': str(u.id),
                    'name': u.get_full_name() or f"{u.first_name} {u.last_name}".strip() or u.email,
                    'email': u.email,
                    'is_primary': e.is_primary,
                    'employment_type': e.employment_type,
                    'is_manager': e.is_manager,
                    'is_executive': e.is_executive,
                    'is_team_lead': e.is_team_lead,
                })
        return result

    def get_primary_occupant(self, obj):
        occs = self.get_occupants(obj)
        return occs[0] if occs else None

    def get_reports_to_occupant_name(self, obj):
        if not obj.reports_to:
            return None
        from apps.structure.models.employment import Employment
        from django.contrib.auth import get_user_model
        User = get_user_model()
        parent_emp = Employment.objects.filter(position=obj.reports_to, is_current=True, is_deleted=False).first()
        if parent_emp and parent_emp.user_id:
            u = User.objects.filter(id=parent_emp.user_id).first()
            if u:
                return u.get_full_name() or u.email
        return 'Vacant'

    def get_direct_report_count(self, obj):
        return obj.direct_reports.filter(is_deleted=False, is_active=True).count()

    def get_span_warning(self, obj):
        # Optimal span of control is 3-7 direct reports. >7 gets a warning.
        count = self.get_direct_report_count(obj)
        return count > 7

class PositionDetailSerializer(BaseStructureDetailSerializer):
    reports_to_code = serializers.CharField(source='reports_to.job_code', read_only=True, allow_null=True)
    reports_to_title = serializers.CharField(source='reports_to.title', read_only=True, allow_null=True)
    reports_to_occupant_name = serializers.SerializerMethodField()
    is_vacant = serializers.SerializerMethodField()
    is_over_occupied = serializers.BooleanField(read_only=True)
    category = serializers.SerializerMethodField()
    
    division_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True, allow_null=True)
    cost_center_name = serializers.CharField(source='cost_center.name', read_only=True, allow_null=True)
    
    occupants = serializers.SerializerMethodField()
    primary_occupant = serializers.SerializerMethodField()
    direct_report_count = serializers.SerializerMethodField()
    direct_reports = serializers.SerializerMethodField()
    span_warning = serializers.SerializerMethodField()
    
    class Meta:
        model = Position
        fields = [
            'id', 'tenant_id', 'job_code', 'title', 'grade', 'level', 'category',
            'reports_to_id', 'reports_to_code', 'reports_to_title', 'reports_to_occupant_name',
            'division_id', 'division_name', 'department_id', 'department_name',
            'section_id', 'section_name', 'unit_id', 'unit_name',
            'cost_center_id', 'cost_center_name', 'fte',
            'min_tenure_months', 'required_competencies',
            'is_single_incumbent', 'current_incumbents_count',
            'max_incumbents', 'requires_supervisor_approval',
            'is_deleted', 'is_vacant', 'is_over_occupied',
            'occupants', 'primary_occupant',
            'direct_report_count', 'direct_reports', 'span_warning',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'current_incumbents_count', 'created_at', 'updated_at', 'deleted_at']
    
    def _get_employments(self, obj):
        if not hasattr(obj, '_cached_employments'):
            from apps.structure.models.employment import Employment
            obj._cached_employments = list(
                Employment.objects.filter(position=obj, is_current=True, is_deleted=False, is_active=True)
            )
        return obj._cached_employments

    def get_is_vacant(self, obj):
        return len(self._get_employments(obj)) == 0

    def get_category(self, obj):
        if obj.level == 1 or 'CHIEF' in obj.job_code or 'EXECUTIVE' in obj.title.upper():
            return 'Executive'
        if obj.level in (2, 3) or 'MANAGER' in obj.title.upper() or 'DIRECTOR' in obj.title.upper() or 'HEAD' in obj.title.upper():
            return 'Manager / Supervisor'
        if obj.level == 4 or 'LEAD' in obj.title.upper() or 'SUPERVISOR' in obj.title.upper():
            return 'Team Lead'
        return 'Staff / Specialist'

    def get_occupants(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        emps = self._get_employments(obj)
        result = []
        for e in emps:
            u = User.objects.filter(id=e.user_id).first()
            if u:
                result.append({
                    'employment_id': str(e.id),
                    'user_id': str(u.id),
                    'name': u.get_full_name() or f"{u.first_name} {u.last_name}".strip() or u.email,
                    'email': u.email,
                    'is_primary': e.is_primary,
                    'employment_type': e.employment_type,
                    'is_manager': e.is_manager,
                    'is_executive': e.is_executive,
                    'is_team_lead': e.is_team_lead,
                })
        return result

    def get_primary_occupant(self, obj):
        occs = self.get_occupants(obj)
        return occs[0] if occs else None

    def get_reports_to_occupant_name(self, obj):
        if not obj.reports_to:
            return None
        from apps.structure.models.employment import Employment
        from django.contrib.auth import get_user_model
        User = get_user_model()
        parent_emp = Employment.objects.filter(position=obj.reports_to, is_current=True, is_deleted=False).first()
        if parent_emp and parent_emp.user_id:
            u = User.objects.filter(id=parent_emp.user_id).first()
            if u:
                return u.get_full_name() or u.email
        return 'Vacant'

    def get_direct_report_count(self, obj):
        return obj.direct_reports.filter(is_deleted=False, is_active=True).count()

    def get_span_warning(self, obj):
        count = self.get_direct_report_count(obj)
        return count > 7

    def get_direct_reports(self, obj):
        from apps.structure.models.employment import Employment
        from django.contrib.auth import get_user_model
        User = get_user_model()
        reps = obj.direct_reports.filter(is_deleted=False, is_active=True).order_by('level', 'title')
        result = []
        for r in reps:
            emp = Employment.objects.filter(position=r, is_current=True, is_deleted=False).first()
            occupant_name = 'Vacant'
            occupant_email = ''
            if emp and emp.user_id:
                u = User.objects.filter(id=emp.user_id).first()
                if u:
                    occupant_name = u.get_full_name() or u.email
                    occupant_email = u.email
            result.append({
                'id': str(r.id),
                'job_code': r.job_code,
                'title': r.title,
                'level': r.level,
                'is_vacant': emp is None,
                'occupant_name': occupant_name,
                'occupant_email': occupant_email,
                'department_name': r.department.name if r.department else None,
            })
        return result

class PositionCreateUpdateSerializer(serializers.ModelSerializer):
    reports_to_id = serializers.UUIDField(required=False, allow_null=True)
    
    division_id = serializers.UUIDField(required=False, allow_null=True)
    department_id = serializers.UUIDField(required=False, allow_null=True)
    section_id = serializers.UUIDField(required=False, allow_null=True)
    unit_id = serializers.UUIDField(required=False, allow_null=True)
    cost_center_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Position
        fields = [
            'job_code', 'title', 'grade', 'level', 'reports_to_id',
            'division_id', 'department_id', 'section_id', 'unit_id',
            'cost_center_id', 'fte',
            'min_tenure_months', 'required_competencies',
            'is_single_incumbent', 'max_incumbents',
            'requires_supervisor_approval'
        ]
    
    def validate_job_code(self, value):
        from apps.structure.validators import validate_position_job_code
        validate_position_job_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Position.objects.filter(job_code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.job_code == value:
                return value
            raise serializers.ValidationError(_("Position with this job code already exists."))
        return value
    
    def validate_level(self, value):
        from apps.structure.validators import validate_position_level
        validate_position_level(value)
        return value
    
    def validate_grade(self, value):
        from apps.structure.validators import validate_grade
        if value:
            validate_grade(value)
        return value
    
    def validate_max_incumbents(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(_("Maximum incumbents must be positive."))
        return value
    
    def validate_required_competencies(self, value):
        from apps.structure.validators import validate_required_competencies
        if value:
            validate_required_competencies(value)
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)