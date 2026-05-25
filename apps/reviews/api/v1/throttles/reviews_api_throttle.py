"""Global Reviews API rate limit — 100 requests/minute (CIA Availability)."""

from rest_framework.throttling import SimpleRateThrottle

from apps.reviews.services.settings import ReviewsSettingsService


class ReviewsAPIThrottle(SimpleRateThrottle):
    scope = 'reviews_api'
    rate = '100/min'

    def get_rate(self):
        limit = ReviewsSettingsService.get_section('security').get(
            'api_rate_limit_per_minute', 100,
        )
        return f'{limit}/min'

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            ident = self.get_ident(request)
            return self.cache_format % {'scope': self.scope, 'ident': ident}
        tenant_id = getattr(request.user, 'tenant_id', 'global')
        return f'throttle_reviews_{tenant_id}_{request.user.id}_{self.scope}'
