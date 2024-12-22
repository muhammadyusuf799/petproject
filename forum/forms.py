from django.forms import ModelForm
from .models import Post

class AddPostForm(ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'description', 'author_name']
    