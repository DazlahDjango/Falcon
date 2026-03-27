from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import Profile
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer

class SkillSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    level = serializers.ChoiceField(choices=['beginner', 'intermediate', 'advance', 'expert'])
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
    class Meta(ProfileListSerializer.Meta):
        fields = ProfileListSerializer.Meta.fields + [
            'skills', 'certifications', 'education', 'date_of_birth',
            'address', 'alternative_email', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation'
        ]

class ProfileUpdateSerializer(serializers.ModelSerializer):
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
        if value:
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(_("Avatar size must be less than 5MB"))
        return value
    
class SkillUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    level = serializers.ChoiceField(choices=['beginer', 'intermidiate', 'advanced', 'expert'])
    years_expirience = serializers.IntegerField(min_value=0, default=0)

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