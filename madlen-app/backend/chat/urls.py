"""
URL configuration for the chat application.
"""

from django.urls import path
from .views import ChatAPIView, SessionListAPIView, ChatHistoryAPIView

app_name = 'chat'

urlpatterns = [
    path('send/', ChatAPIView.as_view(), name='chat-send'),
    path('sessions/', SessionListAPIView.as_view(), name='session-list'),
    path('history/', ChatHistoryAPIView.as_view(), name='chat-history'),
]
