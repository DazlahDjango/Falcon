from rest_framework import serializers

class BulkKPIUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    framework_id = serializers.UUIDField()
    dry_run = serializers.BooleanField(default=False)
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        return value

class BulkActualUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    dry_run = serializers.BooleanField(default=False)
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        return value
    def validate(self, data):
        from ....utils.date_utils import validate_period
        try:
            validate_period(data['year'], data['month'])
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data

class BulkTargetUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    year = serializers.IntegerField()
    dry_run = serializers.BooleanField(default=False)
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        return value

class BulkUploadResultSerializer(serializers.Serializer):
    total_rows = serializers.IntegerField()
    created = serializers.IntegerField()
    updated = serializers.IntegerField()
    errors = serializers.ListField()
    dry_run = serializers.BooleanField()