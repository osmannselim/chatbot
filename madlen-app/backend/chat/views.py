"""
Views for the Chat application.

These views handle the REST API endpoints for chat functionality,
with full OpenTelemetry instrumentation for observability.
"""

import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from opentelemetry import trace
from opentelemetry.trace import Status as TraceStatus, StatusCode

from .models import ChatMessage
from .serializers import (
    ChatRequestSerializer,
    ChatMessageSerializer,
)
from .services import OpenRouterService
from .exceptions import (
    OpenRouterException,
    InvalidAPIKeyError,
    OpenRouterConnectionError,
    RateLimitError,
)


class ChatAPIView(APIView):
    """
    API endpoint for chat interactions.
    
    POST /api/chat/send/
    
    Accepts a message from the user, sends it to OpenRouter,
    and returns the AI assistant's response along with conversation history.
    
    Request Body:
        {
            "message": "Hello, how are you?",
            "model_name": "openai/gpt-3.5-turbo",  // optional
            "session_id": "uuid-here"  // optional
        }
    
    Response:
        {
            "response": "I'm doing great! How can I help you?",
            "model": "openai/gpt-3.5-turbo",
            "session_id": "uuid-here",
            "history": [...]
        }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tracer = trace.get_tracer(__name__)
        self.openrouter_service = OpenRouterService()
    
    def post(self, request):
        """Handle POST requests to send a chat message."""
        
        # Create custom span for the entire request processing
        with self.tracer.start_as_current_span("processing_chat_request") as span:
            
            # Step 1: Validate input
            serializer = ChatRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                span.set_status(TraceStatus(StatusCode.ERROR, "Validation failed"))
                span.set_attribute("error.type", "validation_error")
                return Response(
                    {
                        "error": "Validation failed",
                        "detail": serializer.errors,
                        "code": "VALIDATION_ERROR"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            validated_data = serializer.validated_data
            message = validated_data['message']
            model_name = validated_data.get('model_name') or self.openrouter_service.default_model
            session_id = validated_data.get('session_id') or str(uuid.uuid4())
            
            # Set span attributes for observability
            span.set_attribute("chat.session_id", session_id)
            span.set_attribute("chat.model", model_name)
            span.set_attribute("chat.message_length", len(message))
            
            try:
                # Step 2: Save the user's message to database
                user_message = ChatMessage.objects.create(
                    role=ChatMessage.RoleChoices.USER,
                    content=message,
                    model_name=model_name,
                    session_id=session_id
                )
                span.set_attribute("chat.user_message_id", user_message.id)
                
                # Step 3: Get conversation history for context
                conversation_history = self._get_conversation_history(session_id, exclude_id=user_message.id)
                
                # Step 4: Call OpenRouter API
                ai_response = self.openrouter_service.generate_response(
                    message=message,
                    model=model_name,
                    conversation_history=conversation_history
                )
                
                # Step 5: Save the assistant's response to database
                assistant_message = ChatMessage.objects.create(
                    role=ChatMessage.RoleChoices.ASSISTANT,
                    content=ai_response['content'],
                    model_name=ai_response.get('model', model_name),
                    session_id=session_id
                )
                span.set_attribute("chat.assistant_message_id", assistant_message.id)
                span.set_attribute("chat.response_length", len(ai_response['content']))
                
                # Step 6: Get updated history and return response
                history = ChatMessage.objects.filter(session_id=session_id).order_by('timestamp')
                history_serializer = ChatMessageSerializer(history, many=True)
                
                span.set_status(TraceStatus(StatusCode.OK))
                
                return Response({
                    "response": ai_response['content'],
                    "model": ai_response.get('model', model_name),
                    "session_id": session_id,
                    "history": history_serializer.data
                })
            
            except InvalidAPIKeyError as e:
                span.set_status(TraceStatus(StatusCode.ERROR, "Invalid API key"))
                span.record_exception(e)
                return Response(
                    {
                        "error": "Configuration error",
                        "detail": str(e),
                        "code": e.code
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            except RateLimitError as e:
                span.set_status(TraceStatus(StatusCode.ERROR, "Rate limit exceeded"))
                span.record_exception(e)
                return Response(
                    {
                        "error": "Rate limit exceeded",
                        "detail": str(e),
                        "code": e.code
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            except OpenRouterConnectionError as e:
                span.set_status(TraceStatus(StatusCode.ERROR, "Connection error"))
                span.record_exception(e)
                return Response(
                    {
                        "error": "Service temporarily unavailable",
                        "detail": str(e),
                        "code": e.code
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            except OpenRouterException as e:
                span.set_status(TraceStatus(StatusCode.ERROR, str(e)))
                span.record_exception(e)
                return Response(
                    {
                        "error": "AI service error",
                        "detail": str(e),
                        "code": e.code
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            except Exception as e:
                # Catch any unexpected errors - log and return 503, not 500
                span.set_status(TraceStatus(StatusCode.ERROR, f"Unexpected error: {str(e)}"))
                span.record_exception(e)
                return Response(
                    {
                        "error": "An unexpected error occurred",
                        "detail": "Please try again later",
                        "code": "INTERNAL_ERROR"
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
    
    def _get_conversation_history(self, session_id: str, exclude_id: int = None) -> list:
        """
        Get conversation history for context.
        
        Returns the last 10 messages formatted for OpenRouter API.
        """
        queryset = ChatMessage.objects.filter(session_id=session_id)
        
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        
        # Get last 10 messages for context
        messages = queryset.order_by('-timestamp')[:10]
        
        # Reverse to get chronological order and format for API
        return [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(messages)
        ]
