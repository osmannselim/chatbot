"""
Serializers for the Chat application.

These serializers handle validation of incoming requests and serialization
of responses for the Chat API.
"""

from rest_framework import serializers
from .models import ChatMessage


class ChatRequestSerializer(serializers.Serializer):
    """
    Serializer for incoming chat requests.
    
    Validates the message content and optional model selection.
    """
    message = serializers.CharField(
        required=True,
        min_length=1,
        max_length=10000,
        help_text="The message content to send to the AI assistant"
    )
    model_name = serializers.CharField(
        required=False,
        max_length=100,
        default=None,
        help_text="The AI model to use (e.g., 'openai/gpt-4'). Defaults to server configuration."
    )
    session_id = serializers.CharField(
        required=False,
        max_length=100,
        default=None,
        allow_blank=True,
        help_text="Optional session ID to group messages into a conversation"
    )
    
    def validate_message(self, value):
        """Validate and clean the message content."""
        # Strip whitespace
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("Message cannot be empty or contain only whitespace")
        
        return value


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for ChatMessage model.
    
    Used to serialize chat messages for API responses.
    """
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'model_name', 'timestamp', 'session_id']
        read_only_fields = ['id', 'timestamp']


class ChatResponseSerializer(serializers.Serializer):
    """
    Serializer for chat API response.
    
    Provides a structured response format for the chat endpoint.
    """
    response = serializers.CharField(help_text="The AI assistant's response")
    model = serializers.CharField(help_text="The model that generated the response")
    session_id = serializers.CharField(help_text="The session ID for this conversation")
    history = ChatMessageSerializer(many=True, help_text="The conversation history")


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for error responses.
    
    Provides a consistent error response format.
    """
    error = serializers.CharField(help_text="Human-readable error message")
    detail = serializers.CharField(help_text="Detailed error description", required=False)
    code = serializers.CharField(help_text="Machine-readable error code")
