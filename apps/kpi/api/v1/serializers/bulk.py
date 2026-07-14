from rest_framework import serializers
from django.core.exceptions import ValidationError

class BulkKPIUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    dry_run = serializers.BooleanField(default=False)

    def validate_file(self, value):
        if not value.name.lower().endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 10MB")
        return value


class BulkActualUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    dry_run = serializers.BooleanField(default=False)

    def validate_file(self, value):
        if not value.name.lower().endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 10MB")
        return value

    def validate(self, data):
        year = data.get('year')
        month = data.get('month')
        if year and month:
            if month < 1 or month > 12:
                raise serializers.ValidationError("Month must be between 1 and 12")
            from django.utils import timezone
            now = timezone.now()
            if year > now.year or (year == now.year and month > now.month):
                raise serializers.ValidationError("Cannot upload data for future periods")
        return data


class BulkTargetUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    year = serializers.IntegerField()
    dry_run = serializers.BooleanField(default=False)

    def validate_file(self, value):
        if not value.name.lower().endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 10MB")
        return value


class BulkUploadResultSerializer(serializers.Serializer):
    total_rows = serializers.IntegerField()
    created = serializers.IntegerField()
    updated = serializers.IntegerField()
    errors = serializers.ListField(child=serializers.DictField())
    dry_run = serializers.BooleanField()