from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import Profile
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer

class SkillSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    level = serializers.ChoiceField(choices=['beginner', 'intermediate', 'advanced', 'expert'])
    years_experience = serializers.IntegerField(min_value=0, default=0)
    added_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class CertificationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    issuer = serializers.CharField(max_length=200)
    issued_date = serializers.DateField()
    expiry_date = serializers.DateField(required=False, allow_null=True)
    credintial_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    added_at = serializers.DateTimeField(read_only=True)

class ProfileMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'avatar', 'employee_type', 'title', 'city', 'country']

class ProfileListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user = UserMinimalSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'user_id', 'avatar', 'bio', 'employee_type',
            'cost_center', 'title', 'city', 'country', 'work_phone', 'mobile_phone',
            'reports_to', 'created_at', 'updated_at', 'created_by', 'modified_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'modified_by']

class ProfilDetailSerializer(ProfileListSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    education = serializers.JSONField(read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    completion_status = serializers.SerializerMethodField()

    class Meta(ProfileListSerializer.Meta):
        fields = ProfileListSerializer.Meta.fields + [
            'skills', 'certifications', 'education', 'date_of_birth',
            'address', 'alternative_email', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation',
            'completion_percentage', 'completion_status'
        ]

    def get_completion_percentage(self, obj):
        try:
            from apps.accounts.services.profile.profile_manager import ProfileService
            service = ProfileService()
            return service.get_profile_completion_percentage(obj.user)
        except Exception as e:
            return 100

    def get_completion_status(self, obj):
        try:
            pct = self.get_completion_percentage(obj)
            if pct == 100:
                return 'Complete'
            if pct >= 75:
                return 'Almost Complete'
            if pct >= 50:
                return 'In Progress'
            return 'Incomplete'
        except Exception:
            return 'Complete'

class ProfileUpdateSerializer(serializers.ModelSerializer):
    number_format = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_format = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            'avatar', 'bio', 'date_of_birth', 'alternative_email',
            'work_phone', 'mobile_phone', 'address', 'city', 'country',
            'employee_type', 'cost_center', 'title', 'reports_to',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'timezone', 'date_format', 'number_format'
        ]
    def validate_avatar(self, value):
        if value and hasattr(value, 'size'):
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(_("Avatar size must be less than 5MB"))
        return value

    def validate_number_format(self, value):
        if not value:
            return 'comma'
        if value in ['1,000.00', 'comma']:
            return 'comma'
        if value in ['1.000,00', 'dot']:
            return 'dot'
        return 'comma'
    
class SkillUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    level = serializers.ChoiceField(choices=['beginner', 'intermediate', 'advanced', 'expert'])
    years_experience = serializers.IntegerField(min_value=0, default=0)

class CertificationUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    issuer = serializers.CharField(max_length=200)
    issued_date = serializers.DateField()
    expiry_date = serializers.DateField(required=False, allow_null=True)
    credential_id = serializers.CharField(max_length=100, required=False, allow_blank=True)

class ProfileSerializer(DynamicFieldsModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'modified_by', 'tenant_id']