"""
OpenTelemetry instrumentation setup for Django.

This module initializes OpenTelemetry with OTLP exporter to send traces to Jaeger.
Import this module early in your application (e.g., in manage.py or wsgi.py).
"""

import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor


def configure_opentelemetry():
    """
    Configure OpenTelemetry with OTLP exporter for sending traces to Jaeger.
    
    This function should be called once during application startup.
    """
    # Get configuration from environment or use defaults
    service_name = os.getenv('OTEL_SERVICE_NAME', 'chatbot-backend')
    otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4317')
    
    # Create a resource with service information
    resource = Resource.create({
        SERVICE_NAME: service_name,
        "service.version": "1.0.0",
        "deployment.environment": os.getenv('ENVIRONMENT', 'development'),
    })
    
    # Create a TracerProvider with the resource
    provider = TracerProvider(resource=resource)
    
    # Configure OTLP exporter to send traces to Jaeger
    otlp_exporter = OTLPSpanExporter(
        endpoint=otlp_endpoint,
        insecure=True  # For local development; use TLS in production
    )
    
    # Add BatchSpanProcessor for efficient trace export
    processor = BatchSpanProcessor(otlp_exporter)
    provider.add_span_processor(processor)
    
    # Set the TracerProvider as the global tracer provider
    trace.set_tracer_provider(provider)
    
    # Instrument Django automatically
    DjangoInstrumentor().instrument()
    
    # Instrument requests library (used for OpenRouter API calls)
    RequestsInstrumentor().instrument()
    
    print(f"✅ OpenTelemetry configured: sending traces to {otlp_endpoint}")
    
    return provider


def get_tracer(name: str = __name__):
    """
    Get a tracer instance for creating custom spans.
    
    Usage:
        from core.telemetry import get_tracer
        tracer = get_tracer(__name__)
        
        with tracer.start_as_current_span("my_operation") as span:
            span.set_attribute("key", "value")
            # ... your code here
    """
    return trace.get_tracer(name)
