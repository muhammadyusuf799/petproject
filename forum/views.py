from django.shortcuts import render
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


class PostViewSet(ModelViewSet):
    '''
    Post ViewSet to add CRUD functionalities on Forum App
    '''
    queryset = Post.objects.all() # initial queryset, the set of data from database
    serializer_class = PostSerializer # serializer, to serialize (convert python dictionaries and other structures to JSON format, or vise versa)
    filter_backends = [SearchFilter] # DRF built-in filter customization class, SearchFilter class is used to filter customize depending on URL (?search=)
    search_fields = ['title', 'description'] # required by DRF built-in filter to point which fields in database are need to be searched

    def get_queryset(self):
        queryset = Post.objects.all()
        search_term = self.request.query_params.get("search", None)
        
        if search_term:
            queryset = queryset.filter(Q(title__icontains=search_term) | Q(description__icontains = search_term))   
            return queryset

        return queryset
    
    def list(self, request, *args, **kwargs):
        '''
        Custom list function to get the list of Posts
        '''
        queryset = self.filter_queryset(self.get_queryset())  # Apply filters
        paginator = PageNumberPagination()  # DRF paginator
        paginator.page_size = 20
        page = paginator.paginate_queryset(queryset, request)  # Paginated queryset

        # Check if the request is an AJAX call
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Return JSON response for AJAX calls
            serializer = self.get_serializer(page if page else queryset, many=True, context={
                'paginator':paginator,
                'page_obj': paginator.page
            })
            return Response(serializer.data)

        # For regular requests, render the HTML template
        if page is not None:  # Paginate if possible
            serializer = self.get_serializer(page, many=True)
            context = {
                'posts': serializer.data,
                'paginator': paginator,
                'page_obj': paginator.page,
            }
            return render(request, 'index.html', context)

        # Render without pagination
        serializer = self.get_serializer(queryset, many=True)
        context = {
            'posts': serializer.data,
        }
        return render(request, 'index.html', context)
                
    def retrieve(self, request, *args, **kwargs):
        '''
        Customer retrieve function to get the post details
        '''
        post = self.get_object() # get single object from database
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