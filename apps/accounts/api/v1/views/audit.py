import logging
from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import AuditLog
from apps.accounts.services.audit.reporter import AuditReporterService
from apps.accounts.api.v1.serializers import (
    AuditLogSerializer,
    AuditLogListSerializer,
    AuditLogDetailSerializer,
    AuditLogExportSerializer
)
from apps.accounts.api.v1.filters import AuditLogFilter
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin, IsManagement
from .base import BaseReadOnlyViewset

logger = logging.getLogger(__name__)


class AuditLogViewSet(BaseReadOnlyViewset):
    """
    Audit Log ViewSet for viewing and exporting audit logs.
    
    Actions:
    - list: Get paginated audit logs
    - retrieve: Get detailed audit log
    - user_activity: Get activity for specific user
    - user_summary: Get current user's activity summary
    - tenant_summary: Get tenant-wide activity summary
    - security_events: Get security-related events
    - export: Export audit logs
    - compliance_report: Generate compliance report
    - object_history: Get history of specific object
    """
    
    queryset = AuditLog.objects.all()
    filterset_class = AuditLogFilter
    search_fields = ['action', 'ip_address', 'object_repr', 'user__email']
    ordering_fields = ['timestamp', 'created_at', 'severity']
    ordering = ['-timestamp']
    
    def get_serializer_class(self):
        action_serializers = {
            'list': AuditLogListSerializer,
            'retrieve': AuditLogDetailSerializer,
        }
        return action_serializers.get(self.action, AuditLogSerializer)
    
    def get_permissions(self):
        sensitive_actions = [
            'export', 'user_activity', 'tenant_summary',
            'security_events', 'compliance_report', 'object_history'
        ]
        if self.action in sensitive_actions:
            self.permission_classes = [IsAuthenticated, IsManagement]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.select_related('user')
        if not self.request.user.is_superuser:
            qs = qs.filter(tenant_id=self.request.user.tenant_id)
        return qs
    
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_activity(self, request, user_id=None):
        try:
            days = int(request.query_params.get('days', 30))
            limit = int(request.query_params.get('limit', 100))
            offset = int(request.query_params.get('offset', 0))
            days = max(1, min(days, 365))
            limit = max(1, min(limit, 500))
            audit_reporter = AuditReporterService()
            result = audit_reporter.get_user_activity(user_id, days, limit, offset)
            serializer = AuditLogListSerializer(
                result['logs'],
                many=True,
                context={'request': request}
            )
            return Response({
                'user_id': user_id,
                'period_days': days,
                'total': result['total'],
                'limit': result['limit'],
                'offset': result['offset'],
                'has_next': result['offset'] + result['limit'] < result['total'],
                'activities': serializer.data
            }, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {'error': 'Invalid parameters. days, limit, and offset must be integers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching user activity: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch user activity'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='user-summary')
    def user_summary(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            days = max(1, min(days, 365))
            audit_reporter = AuditReporterService()
            summary = audit_reporter.get_user_activity_summary(str(request.user.id), days)
            return Response(summary, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {'error': 'Invalid days parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching user summary: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch user summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='tenant-summary')
    def tenant_summary(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            days = max(1, min(days, 365))
            audit_reporter = AuditReporterService()
            summary = audit_reporter.get_tenant_activity(str(request.user.tenant_id), days)
            return Response(summary, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {'error': 'Invalid days parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching tenant summary: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch tenant summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='security-events')
    def security_events(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            days = max(1, min(days, 365))
            limit = int(request.query_params.get('limit', 100))
            limit = max(1, min(limit, 500))
            audit_reporter = AuditReporterService()
            events = audit_reporter.get_security_events(
                str(request.user.tenant_id),
                days,
                limit
            )
            serializer = AuditLogListSerializer(
                events,
                many=True,
                context={'request': request}
            )
            return Response({
                'days': days,
                'count': len(events),
                'events': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response(
                {'error': 'Invalid parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching security events: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch security events'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='export')
    def export(self, request):
        serializer = AuditLogExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        export_format = serializer.validated_data.get('format', 'json')
        date_range = (end_date - start_date).days
        if date_range > 90:
            return Response(
                {'error': 'Date range cannot exceed 90 days'},
                status=status.HTTP_400_BAD_REQUEST
            )
        audit_reporter = AuditReporterService()
        if export_format == 'json':
            data = audit_reporter.export_audit_logs(
                tenant_id=str(request.user.tenant_id),
                start_date=start_date,
                end_date=end_date,
                format_type='json'
            )
            return Response(data, status=status.HTTP_200_OK)
        return Response({
            'message': f'Export in {export_format} format initiated',
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=False, methods=['get'], url_path='compliance-report')
    def compliance_report(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required (format: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            if (end_date - start_date).days > 365:
                return Response(
                    {'error': 'Date range cannot exceed 365 days'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            audit_reporter = AuditReporterService()
            report = audit_reporter.get_compliance_report(
                tenant_id=str(request.user.tenant_id),
                start_date=start_date,
                end_date=end_date
            )
            return Response(report, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error generating compliance report: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to generate compliance report'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='object-history')
    def object_history(self, request):
        content_type = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')
        if not content_type or not object_id:
            return Response(
                {'error': 'content_type and object_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            audit_reporter = AuditReporterService()
            history = audit_reporter.get_object_history(content_type, object_id)
            serializer = AuditLogDetailSerializer(
                history,
                many=True,
                context={'request': request}
            )
            return Response({
                'content_type': content_type,
                'object_id': object_id,
                'count': len(history),
                'history': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching object history: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch object history'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='anomaly-detection')
    def anomaly_detection(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            days = max(1, min(days, 90))
            audit_reporter = AuditReporterService()
            anomalies = audit_reporter.get_anomaly_detection(
                str(request.user.tenant_id),
                days
            )
            return Response(anomalies, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {'error': 'Invalid days parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to detect anomalies'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )