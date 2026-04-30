from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from ....models import Location
from ..serializers.location import LocationSerializer, LocationDetailSerializer, LocationCreateUpdateSerializer
from ..filters.location_filter import LocationFilter
from ..throttles.structure_limits import HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import CanViewDepartment, CanEditDepartment
from .base import BaseStructureViewSet


class LocationViewSet(BaseStructureViewSet):
    queryset = Location.objects.select_related('parent').all()
    filterset_class = LocationFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'city', 'country']
    ordering_fields = ['code', 'name', 'country', 'city', 'created_at']
    ordering = ['country', 'city', 'code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LocationDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return LocationCreateUpdateSerializer
        return LocationSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanEditDepartment]
        else:
            self.permission_classes = [CanViewDepartment]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        tenant_id = request.user.tenant_id
        location = Location.objects.filter(code=code, tenant_id=tenant_id, is_deleted=False).first()
        if not location:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LocationDetailSerializer(location, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-country/(?P<country>[^/.]+)')
    def get_by_country(self, request, country=None):
        tenant_id = request.user.tenant_id
        locations = Location.objects.filter(
            country__iexact=country,
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        serializer = LocationSerializer(locations, many=True, context={'request': request})
        return Response({
            'country': country,
            'locations': serializer.data,
            'count': locations.count()
        })
    
    @action(detail=False, methods=['get'], url_path='headquarters')
    def get_headquarters(self, request):
        tenant_id = request.user.tenant_id
        headquarters = Location.objects.filter(
            is_headquarters=True,
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).first()
        if not headquarters:
            return Response({'message': 'No headquarters location found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LocationDetailSerializer(headquarters, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        total = Location.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        active = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        headquarters = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_headquarters=True).count()
        type_distribution = {}
        types = Location.objects.filter(tenant_id=tenant_id, is_deleted=False).values('type').annotate(count=models.Count('id'))
        for loc_type in types:
            type_distribution[loc_type['type']] = loc_type['count']
        country_distribution = {}
        countries = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).values('country').annotate(count=models.Count('id'))
        for country in countries:
            if country['country']:
                country_distribution[country['country']] = country['count']
        total_capacity = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).aggregate(total=models.Sum('seating_capacity'))['total'] or 0
        total_occupancy = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).aggregate(total=models.Sum('current_occupancy'))['total'] or 0
        return Response({
            'total_locations': total,
            'active_locations': active,
            'inactive_locations': total - active,
            'headquarters_count': headquarters,
            'type_distribution': type_distribution,
            'country_distribution': country_distribution,
            'total_seating_capacity': total_capacity,
            'total_current_occupancy': total_occupancy,
            'overall_occupancy_rate': round((total_occupancy / total_capacity * 100), 2) if total_capacity > 0 else 0
        })
    
    @action(detail=True, methods=['get'], url_path='sub-locations')
    def get_sub_locations(self, request, pk=None):
        location = self.get_object()
        children = location.sub_locations.filter(is_deleted=False)
        serializer = LocationSerializer(children, many=True, context={'request': request})
        return Response({
            'parent_id': str(location.id),
            'parent_name': location.name,
            'sub_locations': serializer.data,
            'count': children.count()
        })
    
    @action(detail=True, methods=['post'], url_path='update-occupancy')
    def update_occupancy(self, request, pk=None):
        location = self.get_object()
        new_occupancy = request.data.get('current_occupancy')
        if new_occupancy is None:
            return Response({'error': 'current_occupancy is required'}, status=status.HTTP_400_BAD_REQUEST)
        if location.seating_capacity and new_occupancy > location.seating_capacity:
            return Response({'error': f'Occupancy cannot exceed seating capacity of {location.seating_capacity}'}, status=status.HTTP_400_BAD_REQUEST)
        location.current_occupancy = new_occupancy
        location.save(update_fields=['current_occupancy', 'updated_at'])
        self._invalidate_cache()
        return Response({
            'message': 'Occupancy updated successfully',
            'location_id': str(location.id),
            'location_name': location.name,
            'current_occupancy': location.current_occupancy,
            'seating_capacity': location.seating_capacity,
            'occupancy_rate': round((location.current_occupancy / location.seating_capacity * 100), 2) if location.seating_capacity else None
        })