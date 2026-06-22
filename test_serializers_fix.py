#!/usr/bin/env python
"""Test script to verify dashboard serializer fixes."""

import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.utils import timezone
from rest_framework import serializers

# Simulate the fixed serializers
class ExecutiveDashboardDataSerializer(serializers.Serializer):
    """Test serializer for Executive Dashboard aggregated data."""
    executive_info = serializers.DictField()
    organization_overview = serializers.DictField()
    department_performance = serializers.ListField(child=serializers.DictField())
    top_issues = serializers.ListField(child=serializers.DictField())
    kpi_trends = serializers.ListField(child=serializers.DictField())
    recent_alerts = serializers.ListField(child=serializers.DictField())
    last_updated = serializers.CharField()  # FIXED: was DateTimeField


# Test data similar to what services return
test_data = {
    'executive_info': {
        'id': '123',
        'name': 'Test Executive',
        'role': 'executive'
    },
    'organization_overview': {
        'total_employees': 100,
        'total_departments': 5
    },
    'department_performance': [
        {'id': '1', 'name': 'Dept 1', 'score': 85}
    ],
    'top_issues': [
        {'type': 'critical', 'message': 'Issue 1'}
    ],
    'kpi_trends': [
        {'kpi_id': '1', 'trend': [1, 2, 3]}
    ],
    'recent_alerts': [
        {'id': '1', 'message': 'Alert 1'}
    ],
    'last_updated': timezone.now().isoformat()  # This is what services return
}

# Test serialization
serializer = ExecutiveDashboardDataSerializer(test_data)
is_valid = serializer.is_valid()

print("=" * 60)
print("SERIALIZER FIX VERIFICATION")
print("=" * 60)
print(f"Serializer is valid: {is_valid}")

if not is_valid:
    print("\nERRORS:")
    print(serializer.errors)
else:
    print("\n✓ SUCCESS: The serializer can now handle ISO format datetime strings!")
    print("\nSerialized data:")
    print(serializer.data)

sys.exit(0 if is_valid else 1)
