"""
Custom exceptions for the Chat application.

These exceptions provide clean error handling for OpenRouter API interactions.
"""


class OpenRouterException(Exception):
    """Base exception for all OpenRouter-related errors."""
    
    def __init__(self, message: str = "An error occurred with OpenRouter", code: str = "OPENROUTER_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class OpenRouterAPIError(OpenRouterException):
    """Raised when OpenRouter API returns an error response."""
    
    def __init__(self, message: str = "OpenRouter API returned an error", status_code: int = None, code: str = "API_ERROR"):
        self.status_code = status_code
        super().__init__(message, code)


class OpenRouterConnectionError(OpenRouterException):
    """Raised when unable to connect to OpenRouter API."""
    
    def __init__(self, message: str = "Unable to connect to OpenRouter API", code: str = "CONNECTION_ERROR"):
        super().__init__(message, code)


class InvalidAPIKeyError(OpenRouterException):
    """Raised when the API key is invalid or missing."""
    
    def __init__(self, message: str = "Invalid or missing OpenRouter API key", code: str = "INVALID_API_KEY"):
        super().__init__(message, code)


class RateLimitError(OpenRouterException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, message: str = "OpenRouter rate limit exceeded", code: str = "RATE_LIMIT"):
        super().__init__(message, code)
