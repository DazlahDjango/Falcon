from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ....models import PaymentMethod
from ..serializers import PaymentMethodSerializer, PaymentMethodListSerializer, PaymentMethodCreateSerializer, PaymentMethodDeleteSerializer
from ....services.decorators import tenant_isolation
from ..permissions import IsClientAdmin, IsAuthenticated

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_deleted=False)
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'set_default']:
            self.permission_classes = [IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentMethodListSerializer
        if self.action == 'create':
            return PaymentMethodCreateSerializer
        if self.action == 'destroy':
            return PaymentMethodDeleteSerializer
        return PaymentMethodSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'super_admin':
            return super().get_queryset()
        tenant_id = self.request.tenant_id if hasattr(self.request, 'tenant_id') else user.tenant_id
        return super().get_queryset().filter(tenant_id=tenant_id, status__in=['active', 'default'])
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'tenant_id': request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id})
        serializer.is_valid(raise_exception=True)
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        payment_method = PaymentMethod.objects.create(tenant_id=tenant_id, authorization_code=serializer.validated_data['authorization_code'], email=serializer.validated_data['email'], payment_type='card')
        if not PaymentMethod.objects.filter(tenant_id=tenant_id, is_default=True).exists():
            payment_method.set_as_default()
        return Response(PaymentMethodSerializer(payment_method).data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        payment_method = self.get_object()
        serializer = PaymentMethodDeleteSerializer(data=request.data, context={'payment_method': payment_method, 'tenant_id': request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id})
        serializer.is_valid(raise_exception=True)
        is_last = serializer.validated_data.get('is_last_method', False)
        if is_last:
            return Response({'warning': 'This is your last payment method. Add a new one before deleting.'}, status=status.HTTP_400_BAD_REQUEST)
        payment_method.remove()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        payment_method = self.get_object()
        payment_method.set_as_default()
        return Response(PaymentMethodSerializer(payment_method).data)