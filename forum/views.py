from django.shortcuts import render
from django.db.models import Q
from django.http import JsonResponse
from django.core.cache import cache
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from .pagination import CustomPagination

class PostViewSet(ModelViewSet):
    '''
    Post ViewSet to add CRUD functionalities on Forum App
    '''
    queryset = Post.objects.all() # initial queryset, the set of data from database
    serializer_class = PostSerializer # serializer, to serialize (convert python dictionaries and other structures to JSON format, or vise versa)
    pagination_class = CustomPagination
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
        paginator = self.pagination_class()  # Custom paginator
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)  # Paginated queryset
        cache_key = f"posts:{request.query_params.urlencode()}"

        # Check if the request is an AJAX call
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':

            # Check cached data in Redis
            cached_data = cache.get(cache_key)
            if cached_data:
                print("Caching from Redis")
                return JsonResponse(cached_data, safe=False)

            # If there is no data requested in Redis, get the data from database and cache it to Redis, then send response to front
            # Return JSON response for AJAX calls
            serializer = self.get_serializer(paginated_queryset, many = True)
            response_data = {
                'posts':serializer.data,
                'pagination': {
                    'next':paginator.get_next_link(),
                    'prev':paginator.get_previous_link(),
                    'count':paginator.count,
                    'limit':paginator.limit,
                    'offset':paginator.offset,
                    'current_page':paginator.current_page,
                    'total_pages':paginator.total_pages,
                    'pages':paginator.get_visible_pages(
                        paginator.current_page,
                        paginator.total_pages
                    )
                }
            }
            cache.set(cache_key, response_data, timeout=360) # 6 minutes timeout
            print("Fetchng from database and saving to Redis...")
            return JsonResponse(response_data, safe=False)

        # For regular requests, render the HTML template
        if paginated_queryset is not None:  # Paginate if possible

            # check the data requested in Redis, if exists return

            cached_data = cache.get(cache_key)
            if cached_data:
                print("Caching from Redis...")
                # return JsonResponse(cached_data, safe=False)
                return render(request, 'index.html', cached_data)

            # if does not exist in Redis, get from database save to Redis and return
            serializer = self.get_serializer(paginated_queryset, many=True)
            context = {
                'posts':serializer.data,
                'pagination': {
                    'next':paginator.get_next_link(),
                    'prev':paginator.get_previous_link(),
                    'count':paginator.count,
                    'limit':paginator.limit,
                    'offset':paginator.offset,
                    'current_page':paginator.current_page,
                    'total_pages':paginator.total_pages,
                    'pages':paginator.get_visible_pages(
                        paginator.current_page,
                        paginator.total_pages
                    )
                }
            }
            cache.set(cache_key, context, timeout=360)
            print("Fetching from database and saving to Redis...")
            return render(request, 'index.html', context)

        # Render without pagination
        # check requested data in Redis, if exists return
        cached_data = cache.get(cache_key)
        if cached_data:
            print("Fetching from Redis...")
            return render(request, 'index.html', context=cached_data)
        
        # else fetch from database, save to Redis and return
        serializer = self.get_serializer(queryset, many=True)
        response_data = {
            'posts':serializer.data,
        }
        cache.set(cache_key, response_data, timeout=360)
        print("Fetching from database and saving to Redis, returning...")
        return render(request, 'index.html', context=response_data)
                
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