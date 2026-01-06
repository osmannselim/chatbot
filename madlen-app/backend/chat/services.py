"""
Service layer for OpenRouter API interactions.

This module provides the OpenRouterService class which handles all communication
with the OpenRouter API, including proper error handling and OpenTelemetry instrumentation.
"""

import time
import requests
from typing import Optional
from django.conf import settings
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

from .exceptions import (
    OpenRouterAPIError,
    OpenRouterConnectionError,
    InvalidAPIKeyError,
    RateLimitError,
)


class OpenRouterService:
    """
    Service class for interacting with the OpenRouter API.
    
    This class wraps all OpenRouter API calls with proper error handling
    and OpenTelemetry instrumentation for observability.
    """
    
    def __init__(self):
        self.api_url = getattr(settings, 'OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions')
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', '')
        self.default_model = getattr(settings, 'OPENROUTER_DEFAULT_MODEL', 'openai/gpt-3.5-turbo')
        self.timeout = 60  # seconds
        
        # Get tracer for custom spans
        self.tracer = trace.get_tracer(__name__)
    
    def _validate_api_key(self) -> None:
        """Validate that API key is configured."""
        if not self.api_key:
            raise InvalidAPIKeyError("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in .env")
    
    def _get_headers(self) -> dict:
        """Get headers for OpenRouter API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Chatbot Backend",
        }
    
    def generate_response(
        self,
        message: str,
        model: Optional[str] = None,
        conversation_history: Optional[list] = None
    ) -> dict:
        """
        Generate a response from the OpenRouter API.
        
        Args:
            message: The user's message to send to the AI.
            model: The model to use (defaults to settings.OPENROUTER_DEFAULT_MODEL).
            conversation_history: Optional list of previous messages for context.
        
        Returns:
            dict with keys:
                - content: The assistant's response text
                - model: The model that was used
                - usage: Token usage information (if available)
        
        Raises:
            InvalidAPIKeyError: If API key is missing or invalid.
            OpenRouterConnectionError: If unable to connect to OpenRouter.
            OpenRouterAPIError: If OpenRouter returns an error response.
            RateLimitError: If rate limit is exceeded.
        """
        # Validate API key before making request
        self._validate_api_key()
        
        # Use default model if not specified
        model = model or self.default_model
        
        # Build messages array
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add the current user message
        messages.append({
            "role": "user",
            "content": message
        })
        
        # Build request payload
        payload = {
            "model": model,
            "messages": messages,
        }
        
        # Create custom span for OpenRouter API call
        with self.tracer.start_as_current_span("openrouter_api_call") as span:
            # Set span attributes for observability
            span.set_attribute("openrouter.model", model)
            span.set_attribute("openrouter.message_length", len(message))
            span.set_attribute("openrouter.message_count", len(messages))
            span.set_attribute("http.url", self.api_url)
            span.set_attribute("http.method", "POST")
            
            start_time = time.time()
            
            try:
                response = requests.post(
                    self.api_url,
                    headers=self._get_headers(),
                    json=payload,
                    timeout=self.timeout
                )
                
                # Calculate response time
                response_time_ms = (time.time() - start_time) * 1000
                span.set_attribute("openrouter.response_time_ms", response_time_ms)
                span.set_attribute("http.status_code", response.status_code)
                
                # Handle different response status codes
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract response content
                    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                    usage = data.get('usage', {})
                    
                    # Set success attributes
                    span.set_attribute("openrouter.response_length", len(content))
                    span.set_attribute("openrouter.tokens_used", usage.get('total_tokens', 0))
                    span.set_status(Status(StatusCode.OK))
                    
                    return {
                        "content": content,
                        "model": data.get('model', model),
                        "usage": usage
                    }
                
                elif response.status_code == 401:
                    span.set_status(Status(StatusCode.ERROR, "Invalid API key"))
                    span.record_exception(InvalidAPIKeyError())
                    raise InvalidAPIKeyError("OpenRouter API key is invalid")
                
                elif response.status_code == 429:
                    span.set_status(Status(StatusCode.ERROR, "Rate limit exceeded"))
                    span.record_exception(RateLimitError())
                    raise RateLimitError("OpenRouter rate limit exceeded. Please try again later.")
                
                else:
                    # Parse error message from response
                    try:
                        error_data = response.json()
                        error_message = error_data.get('error', {}).get('message', f"API error: {response.status_code}")
                    except Exception:
                        error_message = f"OpenRouter API error: HTTP {response.status_code}"
                    
                    span.set_status(Status(StatusCode.ERROR, error_message))
                    raise OpenRouterAPIError(error_message, status_code=response.status_code)
            
            except requests.exceptions.Timeout as e:
                span.set_status(Status(StatusCode.ERROR, "Request timeout"))
                span.record_exception(e)
                raise OpenRouterConnectionError(f"Request to OpenRouter timed out after {self.timeout}s")
            
            except requests.exceptions.ConnectionError as e:
                span.set_status(Status(StatusCode.ERROR, "Connection failed"))
                span.record_exception(e)
                raise OpenRouterConnectionError("Failed to connect to OpenRouter API. Please check your internet connection.")
            
            except requests.exceptions.RequestException as e:
                span.set_status(Status(StatusCode.ERROR, str(e)))
                span.record_exception(e)
                raise OpenRouterConnectionError(f"Request failed: {str(e)}")
