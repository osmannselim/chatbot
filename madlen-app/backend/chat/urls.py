"""
URL configuration for the Chat application.
"""

from django.urls import path
from .views import ChatAPIView


app_name = 'chat'

urlpatterns = [
    path('send/', ChatAPIView.as_view(), name='chat-send'),
]
