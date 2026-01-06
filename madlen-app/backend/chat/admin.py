from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    # Admin configuration for ChatMessage model.
    
    list_display = ('id', 'role', 'short_content', 'model_name', 'session_id', 'timestamp')
    list_filter = ('role', 'model_name', 'timestamp')
    search_fields = ('content', 'session_id')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)
    
    def short_content(self, obj):
        # Display truncated content in list view.
        return obj.content[:75] + '...' if len(obj.content) > 75 else obj.content
    short_content.short_description = 'Content'
