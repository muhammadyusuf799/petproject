from django.shortcuts import render
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = PageNumberPagination
    
    def list(self, request, *args, **kwargs):
        posts = self.get_queryset()        
        return render(request, 'index.html', {
            'posts':posts
        })
        
    def retrieve(self, request, *args, **kwargs):
        post = self.get_object()
        
        return render(request, 'post_detail.html', {
            'post':post
        })

class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def list(self, request, *args, **kwargs):
        comments = self.get_queryset()
        return render(request, 'post_detail.html',{
            'comments':comments
        })