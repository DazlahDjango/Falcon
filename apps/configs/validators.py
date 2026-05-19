import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from croniter import croniter
from datetime import datetime
from .models import AppDependency

def validate_cron_expression(value):
    """Validate cron expression string."""
    if not value or not value.strip():
        raise ValidationError(_("Cron expression cannot be empty."))
    try:
        croniter(value, datetime.now())
    except (ValueError, KeyError) as e:
        raise ValidationError(_(f"Invalid cron expression: {str(e)}"))

def validate_weekday_only_schedule(value, weekday_only):
    """Validate that schedule respects weekday-only constraint."""
    if weekday_only:
        cron_parts = value.split()
        if len(cron_parts) >= 5:
            day_of_week = cron_parts[4]
            if day_of_week and day_of_week != '*':
                weekend_days = ['6', '7', '0', 'sat', 'sun', 'SAT', 'SUN']
                for weekend in weekend_days:
                    if weekend in day_of_week:
                        raise ValidationError(_("Weekday-only schedules cannot run on weekends (Saturday or Sunday)."))

def validate_positive_integer(value, field_name="Value"):
    """Validate that value is a positive integer."""
    if value is not None and value <= 0:
        raise ValidationError(_(f"{field_name} must be a positive integer."))

def validate_non_negative_integer(value, field_name="Value"):
    """Validate that value is a non-negative integer."""
    if value is not None and value < 0:
        raise ValidationError(_(f"{field_name} cannot be negative."))

def validate_percentage(value, field_name="Value"):
    """Validate that value is between 0 and 100."""
    if value is not None and (value < 0 or value > 100):
        raise ValidationError(_(f"{field_name} must be between 0 and 100."))

def validate_retention_days(days):
    """Validate retention days (1-365)."""
    if days < 1 or days > 365:
        raise ValidationError(_("Retention days must be between 1 and 365."))

def validate_rto_rpo(rto_minutes, rpo_minutes):
    """Validate that RTO is not less than RPO."""
    if rto_minutes < rpo_minutes:
        raise ValidationError(_("RTO (Recovery Time Objective) cannot be less than RPO (Recovery Point Objective)."))

def validate_backup_chain_length(length):
    """Validate incremental chain length (1-365)."""
    if length < 1 or length > 365:
        raise ValidationError(_("Incremental chain length must be between 1 and 365."))

def validate_timeout_minutes(minutes):
    """Validate backup timeout (5-1440 minutes)."""
    if minutes < 5 or minutes > 1440:
        raise ValidationError(_("Backup timeout must be between 5 and 1440 minutes."))

def validate_parallel_workers(workers):
    """Validate parallel workers (1-16)."""
    if workers < 1 or workers > 16:
        raise ValidationError(_("Parallel workers must be between 1 and 16."))

def validate_risk_score(score):
    """Validate risk score (0-100)."""
    if score < 0 or score > 100:
        raise ValidationError(_("Risk score must be between 0 and 100."))

def validate_schedule_window(start_date, end_date):
    """Validate that start date is before end date."""
    if start_date and end_date and start_date >= end_date:
        raise ValidationError(_("Start date/time must be before end date/time."))

def validate_maintenance_duration(minutes):
    """Validate maintenance duration (1-1440 minutes)."""
    if minutes < 1 or minutes > 1440:
        raise ValidationError(_("Maintenance duration must be between 1 and 1440 minutes (24 hours)."))

def validate_checksum(value):
    """Validate SHA-256 checksum format."""
    if value and not re.match(r'^[a-fA-F0-9]{64}$', value):
        raise ValidationError(_("Checksum must be a valid SHA-256 hash (64 hex characters)."))

def validate_storage_path(value):
    """Validate storage path format for different storage locations."""
    if not value or not value.strip():
        raise ValidationError(_("Storage path cannot be empty."))
    if value.startswith('s3://'):
        if not re.match(r'^s3://[a-z0-9.-]+/[a-zA-Z0-9/._-]+$', value, re.IGNORECASE):
            raise ValidationError(_("Invalid S3 URI format. Expected: s3://bucket-name/path"))
    elif value.startswith('gs://'):
        if not re.match(r'^gs://[a-z0-9.-]+/[a-zA-Z0-9/._-]+$', value, re.IGNORECASE):
            raise ValidationError(_("Invalid GCS URI format. Expected: gs://bucket-name/path"))
    elif value.startswith('azure://'):
        if not re.match(r'^azure://[a-z0-9.-]+/[a-zA-Z0-9/._-]+$', value, re.IGNORECASE):
            raise ValidationError(_("Invalid Azure URI format. Expected: azure://container-name/path"))

def validate_key_alias(value):
    """Validate encryption key alias."""
    if not value or not value.strip():
        raise ValidationError(_("Key alias cannot be empty."))
    if not re.match(r'^[a-zA-Z0-9_-]+$', value):
        raise ValidationError(_("Key alias can only contain letters, numbers, underscores, and hyphens."))

def validate_backup_type_for_app(backup_type, app):
    """Validate that backup type is supported for the app."""
    from .constants import BackupType
    if backup_type == BackupType.CDP and app.name == 'reviews':
        raise ValidationError(_("CDP backup type is not supported for Reviews app due to schema constraints."))

def validate_s3_bucket_name(bucket_name):
    """Validate S3 bucket name format."""
    if not bucket_name:
        return
    if len(bucket_name) < 3 or len(bucket_name) > 63:
        raise ValidationError(_("Bucket name must be between 3 and 63 characters."))
    if not re.match(r'^[a-z0-9.-]+$', bucket_name):
        raise ValidationError(_("Bucket name can only contain lowercase letters, numbers, dots, and hyphens."))
    if '..' in bucket_name:
        raise ValidationError(_("Bucket name cannot contain consecutive dots."))
    if bucket_name.startswith('-') or bucket_name.endswith('-'):
        raise ValidationError(_("Bucket name cannot start or end with a hyphen."))

def validate_retention_policy(full_weeks, monthly):
    """Validate retention policy values."""
    if full_weeks and (full_weeks < 1 or full_weeks > 52):
        raise ValidationError(_("Full backup retention weeks must be between 1 and 52."))
    if monthly and (monthly < 1 or monthly > 120):
        raise ValidationError(_("Monthly backup retention must be between 1 and 120 months."))

def validate_dependency_chain(dependencies):
    """Validate that dependency chain has no cycles."""
    from collections import defaultdict, deque
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    for dep in dependencies:
        graph[dep.source_app_id].append(dep.target_app_id)
        in_degree[dep.target_app_id] += 1
    queue = deque([node for node in graph if in_degree[node] == 0])
    visited = 0
    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    if visited != len(graph):
        raise ValidationError(_("Circular dependency detected in app dependencies."))

def validate_recovery_order(order_list):
    """Validate that recovery order respects dependencies."""
    from collections import defaultdict
    positions = {app: idx for idx, app in enumerate(order_list)}
    dependencies = AppDependency.objects.all()
    for dep in dependencies:
        if positions.get(dep.source_app_id, -1) < positions.get(dep.target_app_id, -1):
            raise ValidationError(_(f"Recovery order violates dependency: {dep.source_app.name} must come before {dep.target_app.name}"))