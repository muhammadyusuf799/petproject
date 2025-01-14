from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
import math

class CustomPagination(LimitOffsetPagination):

    def paginate_queryset(self, queryset, request, view=None):
        self.count = self.get_count(queryset)
        self.limit = self.get_limit(request)
        self.offset = self.get_offset(request)
        self.request = request
        
        self.total_pages = math.ceil(self.count / self.limit)
        self.current_page = (self.offset // self.limit) + 1

        if self.offset >= self.count:
            self.offset = max(0, (self.total_pages - 1) * self.limit)
            self.current_page = self.total_pages

        return list(queryset[self.offset:self.offset + self.limit])

    def get_paginated_response(self, data):
        visible_pages = self.get_visible_pages(self.current_page, self.total_pages)
        response = {
            'data':data,
            'pagination': {
                'next': self.get_next_link(),
                'prev': self.get_previous_link(),
                'count': self.count,
                'limit': self.limit,
                'offset': self.offset,
                'current_page': self.current_page,
                'total_pages': self.total_pages,
                'pages': visible_pages,
            }
        }
        return Response(response)
    
    def get_visible_pages(self,current_page, total_pages):
        visible_pages = []

        visible_pages.extend(range(1,min(4,total_pages + 1)))

        if total_pages > 6 and current_page > 4:
            visible_pages.append("...")

        start = max(4, current_page - 1)
        end = min(total_pages - 2, current_page + 1)
        visible_pages.extend(range(start, end + 1))

        if total_pages > 6 and current_page < total_pages - 3:
            visible_pages.append("...")

        visible_pages.extend(range(max(total_pages - 2, 4), total_pages + 1))

        return visible_pages