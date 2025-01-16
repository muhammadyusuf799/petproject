from django.urls import path
from django.urls.conf import include
from rest_framework import routers
from .views import PostViewSet, CommentViewSet

router = routers.DefaultRouter()

router.register('posts', PostViewSet)
router.register('comments', CommentViewSet, basename='comments')

urlpatterns = [
    # path('', include(router.urls)),
]

urlpatterns += router.urls
