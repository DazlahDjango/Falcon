from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from apps.reviews.models import ReviewTemplate
from apps.reviews.api.v1.serializers import ReviewTemplateSerializer, ReviewTemplateListSerializer
from .base_views import BaseReviewViewSet
from apps.reviews.api.v1.permissions import IsAdminOnly

class ReviewTemplateViewSet(BaseReviewViewSet):
    queryset = ReviewTemplate.objects.all()
    def get_serializer_class(self):
        return ReviewTemplateListSerializer if self.action == 'list' else ReviewTemplateSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'set_default', 'activate', 'deactivate', 'duplicate']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, created_by=self.request.user)
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        template = self.get_object()
        ReviewTemplate.objects.filter(tenant_id=template.tenant_id).update(is_default=False)
        template.is_default = True
        template.save()
        return Response(self.get_serializer(template).data)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        template = self.get_object()
        template.is_active = True
        template.save()
        return Response(self.get_serializer(template).data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        template = self.get_object()
        if template.is_default:
            return Response({'error': 'Cannot deactivate default template'}, status=status.HTTP_400_BAD_REQUEST)
        template.is_active = False
        template.save()
        return Response(self.get_serializer(template).data)
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        template = self.get_object()
        new_template = ReviewTemplate.objects.create(
            tenant_id=template.tenant_id,
            name=f"{template.name} (Copy)",
            description=template.description,
            included_sections=template.included_sections,
            custom_sections=template.custom_sections,
            required_sections=template.required_sections,
            section_order=template.section_order,
            applies_to_self_assessment=template.applies_to_self_assessment,
            applies_to_supervisor_review=template.applies_to_supervisor_review,
            applies_to_360_feedback=template.applies_to_360_feedback,
            max_strength_chars=template.max_strength_chars,
            max_improvement_chars=template.max_improvement_chars,
            max_goals_chars=template.max_goals_chars,
            is_active=True,
            is_default=False,
            created_by=request.user,
            version=1
        )
        return Response(self.get_serializer(new_template).data, status=status.HTTP_201_CREATED)
    @action(detail=False, methods=['get'])
    def default(self, request):
        template = self.get_queryset().filter(is_default=True, is_active=True).first()
        if not template:
            template = self.get_queryset().filter(is_active=True).first()
        if not template:
            return Response({}, status=status.HTTP_200_OK)
        return Response(self.get_serializer(template).data)
    @action(detail=False, methods=['get'])
    def active(self, request):
        templates = self.get_queryset().filter(is_active=True)
        return Response(self.get_serializer(templates, many=True).data)