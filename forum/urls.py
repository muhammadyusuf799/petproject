from django.urls import path
from django.urls.conf import include
from .views import PostViewSet
from rest_framework import routers
from .swagger import schema_view

router = routers.DefaultRouter()

router.register('posts', PostViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
