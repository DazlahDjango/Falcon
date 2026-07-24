# apps/reportplt/api/v1/serializers/analytics.py
from rest_framework import serializers
from typing import Dict, Any, List

class AnalyticsRequestSerializer(serializers.Serializer):
    """
    Base serializer for analytics requests.
    """
    report_id = serializers.UUIDField(required=True)
    params = serializers.DictField(required=False, default=dict)
    period = serializers.ChoiceField(
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly'),
        ],
        required=False,
        default='monthly'
    )
    date_range = serializers.DictField(required=False)

class TrendAnalysisSerializer(AnalyticsRequestSerializer):
    """
    Serializer for trend analysis.
    """
    metric = serializers.CharField(required=True)
    compare_by = serializers.ChoiceField(
        choices=[
            ('department', 'Department'),
            ('team', 'Team'),
            ('category', 'Category'),
            ('period', 'Period'),
        ],
        required=False
    )
    periods = serializers.IntegerField(required=False, default=12)

class PerformanceAnalysisSerializer(AnalyticsRequestSerializer):
    """
    Serializer for performance analysis.
    """
    metric = serializers.CharField(required=True)
    group_by = serializers.ChoiceField(
        choices=[
            ('department', 'Department'),
            ('team', 'Team'),
            ('user', 'User'),
            ('category', 'Category'),
        ],
        required=False
    )
    threshold = serializers.FloatField(required=False, default=80)

class ComparativeAnalysisSerializer(AnalyticsRequestSerializer):
    """
    Serializer for comparative analysis.
    """
    compare_type = serializers.ChoiceField(
        choices=[
            ('department', 'Department'),
            ('team', 'Team'),
            ('period', 'Period'),
            ('category', 'Category'),
        ],
        required=True
    )
    compare_ids = serializers.ListField(child=serializers.UUIDField(), required=True)
    metric = serializers.CharField(required=True)

class PredictiveAnalysisSerializer(AnalyticsRequestSerializer):
    """
    Serializer for predictive analysis.
    """
    prediction_type = serializers.ChoiceField(
        choices=[
            ('linear', 'Linear Regression'),
            ('moving_average', 'Moving Average'),
            ('exponential', 'Exponential Smoothing'),
            ('holt_winters', 'Holt-Winters'),
        ],
        default='linear'
    )
    periods_ahead = serializers.IntegerField(required=False, default=3)
    confidence = serializers.FloatField(required=False, default=0.95)

class AnomalyDetectionSerializer(AnalyticsRequestSerializer):
    """
    Serializer for anomaly detection.
    """
    detection_type = serializers.ChoiceField(
        choices=[
            ('zscore', 'Z-Score'),
            ('iqr', 'IQR'),
            ('trend', 'Trend Anomaly'),
            ('sudden_change', 'Sudden Change'),
        ],
        default='zscore'
    )
    threshold = serializers.FloatField(required=False, default=2.0)
    window_size = serializers.IntegerField(required=False, default=30)

class AnalyticsResponseSerializer(serializers.Serializer):
    """
    Base serializer for analytics responses.
    """
    status = serializers.CharField()
    data = serializers.DictField()
    generated_at = serializers.DateTimeField()
    report_id = serializers.UUIDField()

class TrendResultSerializer(serializers.Serializer):
    """
    Serializer for trend analysis results.
    """
    periods = serializers.ListField(child=serializers.CharField())
    values = serializers.ListField(child=serializers.FloatField())
    trend_direction = serializers.CharField()
    growth_rate = serializers.FloatField()
    mom_growth = serializers.ListField(child=serializers.FloatField())
    yoy_growth = serializers.ListField(child=serializers.FloatField())
    average = serializers.FloatField()
    min = serializers.FloatField()
    max = serializers.FloatField()
    volatility = serializers.FloatField()
    trend_line = serializers.ListField(child=serializers.FloatField())

class PerformanceResultSerializer(serializers.Serializer):
    """
    Serializer for performance analysis results.
    """
    items = serializers.ListField(child=serializers.DictField())
    summary = serializers.DictField()
    rankings = serializers.DictField()
    status_distribution = serializers.DictField()

class ComparativeResultSerializer(serializers.Serializer):
    """
    Serializer for comparative analysis results.
    """
    groups = serializers.DictField()
    rankings = serializers.ListField()
    top_group = serializers.CharField()
    bottom_group = serializers.CharField()
    overall_avg = serializers.FloatField()

class PredictiveResultSerializer(serializers.Serializer):
    """
    Serializer for predictive analysis results.
    """
    forecast = serializers.ListField(child=serializers.FloatField())
    confidence_intervals = serializers.ListField(child=serializers.DictField())
    last_actual = serializers.FloatField()
    trend_direction = serializers.CharField()
    method = serializers.CharField()

class AnomalyResultSerializer(serializers.Serializer):
    """
    Serializer for anomaly detection results.
    """
    anomalies = serializers.ListField(child=serializers.DictField())
    summary = serializers.DictField()
    total_data_points = serializers.IntegerField()
    anomaly_rate = serializers.FloatField()