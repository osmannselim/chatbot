/**
 * API Service Layer
 * 
 * Provides a clean interface for communicating with the Django backend.
 * All API calls go through /api which is proxied to the backend.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI responses
});

/**
 * Send a chat message and get AI response
 * 
 * @param {string} message - The user's message
 * @param {string} model - The AI model to use
 * @param {string|null} sessionId - Optional session ID for conversation continuity
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendMessage(message, model = 'openai/gpt-3.5-turbo', sessionId = null) {
    try {
        const payload = {
            message,
            model_name: model,
        };

        if (sessionId) {
            payload.session_id = sessionId;
        }

        const response = await api.post('/chat/send/', payload);

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const errorData = error.response.data;
            return {
                success: false,
                error: errorData.detail || errorData.error || 'An error occurred',
                code: errorData.code || 'UNKNOWN_ERROR',
                status: error.response.status,
            };
        } else if (error.request) {
            // Request made but no response
            return {
                success: false,
                error: 'Unable to connect to the server. Please check your connection.',
                code: 'NETWORK_ERROR',
            };
        } else {
            // Error setting up request
            return {
                success: false,
                error: error.message || 'An unexpected error occurred',
                code: 'CLIENT_ERROR',
            };
        }
    }
}

/**
 * Health check for the API
 * 
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
    try {
        await api.get('/');
        return true;
    } catch {
        return false;
    }
}

export default api;
