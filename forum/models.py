from django.core.validators import MinLengthValidator
from django.db import models

class Post(models.Model):
    title = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(limit_value=5)]
        )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author_name = models.CharField(
        max_length=30,
        )

    class Meta:
        indexes = [
            models.Index(fields=['title', 'description'], name='idx_title_description')
        ]

    def __str__(self) -> str:
        return self.title

class Comment(models.Model):
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')