from django.shortcuts import render
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
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

    
    def list(self, request, *args, **kwargs):
        '''
        Custom list function to get the list of Posts
        '''
        queryset = self.filter_queryset(self.get_queryset()) # custom queryset referencing to filter_backends
        paginator = PageNumberPagination() # DRF built-in paginator class
        paginator.page_size = 20 # Number of queryset instances that must be displayed
        page = paginator.paginate_queryset(queryset, request)

        page = self.paginate_queryset(queryset) # returns the instances of queryset for one page
        if page is not None: # check if it is possible to paginate, is there enough objects in queryset
            serializer = self.get_serializer(page, many=True)
            context = {
                'posts':serializer.data,
                'paginator':paginator,
                'page_obj':paginator.page,
            }
            return render(request, 'index.html', context=context)

        
        serializer = self.get_serializer(queryset, many=True)
        context = {
            'posts':serializer.data,
        }

        return render(request, 'index.html', context=context)
                
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