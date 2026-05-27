from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.reviews.api.v1.serializers.system_settings import ReviewsSystemSettingsSerializer
from apps.reviews.services.settings import ReviewsSettingsService


class ReviewsSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = ReviewsSettingsService.get_record()
        return Response(ReviewsSystemSettingsSerializer(record).data)

    def patch(self, request):
        record = ReviewsSettingsService.get_record()
        serializer = ReviewsSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(ReviewsSystemSettingsSerializer(record).data)


class ReviewsSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = ReviewsSettingsService.reset_to_defaults(user_id=str(request.user.id))
        return Response(
            ReviewsSystemSettingsSerializer(record).data,
            status=status.HTTP_200_OK,
        )
