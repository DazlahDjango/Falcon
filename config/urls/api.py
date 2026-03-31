from django.urls import path, include

urlpatterns = [
    # Organisations API
    path('organisations/', include('apps.organisations.api.v1.urls')),
    
    # Auth endpoints (If applicable, adding placeholder for now)
    # path('auth/', include('apps.accounts.api.urls')),
]
