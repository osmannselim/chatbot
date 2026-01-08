#!/usr/bin/env python3
"""
Fetch Free Models from OpenRouter

This script queries the OpenRouter API to discover all available free models.
Free models have pricing.prompt == "0" and pricing.completion == "0".
"""

import requests
import json
import sys


def fetch_free_models():
    """Fetch and filter free models from OpenRouter API."""
    
    url = "https://openrouter.ai/api/v1/models"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"Error fetching models: {e}", file=sys.stderr)
        return []
    
    models = data.get('data', [])
    free_models = []
    
    for model in models:
        pricing = model.get('pricing', {})
        prompt_price = pricing.get('prompt', '1')
        completion_price = pricing.get('completion', '1')
        
        # Check if model is free (both prompt and completion are "0")
        try:
            is_free = float(prompt_price) == 0 and float(completion_price) == 0
        except (ValueError, TypeError):
            is_free = prompt_price == "0" and completion_price == "0"
        
        if is_free:
            model_id = model.get('id', '')
            model_name = model.get('name', model_id)
            context_length = model.get('context_length', 0)
            
            free_models.append({
                'id': model_id,
                'name': model_name,
                'context_length': context_length,
            })
    
    # Sort by name for consistency
    free_models.sort(key=lambda x: x['name'].lower())
    
    return free_models


def main():
    print("Fetching free models from OpenRouter API...")
    print("-" * 60)
    
    free_models = fetch_free_models()
    
    if not free_models:
        print("No free models found or error occurred.")
        return
    
    print(f"Found {len(free_models)} free models:\n")
    
    # Print as formatted JSON for easy reading
    for i, model in enumerate(free_models, 1):
        print(f"{i:2}. {model['name']}")
        print(f"    ID: {model['id']}")
        print(f"    Context: {model['context_length']:,} tokens")
        print()
    
    # Also output as JSON for programmatic use
    print("-" * 60)
    print("JSON Output:")
    print(json.dumps(free_models, indent=2))


if __name__ == "__main__":
    main()
