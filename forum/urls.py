from django.urls import path
from django.urls.conf import include
from .views import PostViewSet, CommentViewSet
from rest_framework import routers

router = routers.DefaultRouter()

router.register('posts', PostViewSet)
urlpatterns = [
    path('', include(router.urls)),
]
