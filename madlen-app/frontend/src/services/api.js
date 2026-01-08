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
 * Fetch all chat sessions
 * 
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function fetchSessions() {
    try {
        const response = await api.get('/chat/sessions/');
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Fetch chat history for a specific session
 * 
 * @param {string} sessionId - The session ID to fetch history for
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function fetchHistory(sessionId) {
    try {
        const response = await api.get(`/chat/history/?session_id=${sessionId}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Send a chat message and get AI response
 * 
 * @param {string} message - The user's message
 * @param {string} model - The AI model to use
 * @param {string|null} sessionId - Optional session ID for conversation continuity
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendMessage(message, model = 'meta-llama/llama-3.3-70b-instruct:free', sessionId = null) {
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
        return handleError(error);
    }
}

/**
 * Delete a chat session
 * 
 * @param {string} sessionId - The session ID to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteSession(sessionId) {
    try {
        await api.delete(`/chat/sessions/${sessionId}/`);
        return { success: true };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Handle API errors consistently
 */
function handleError(error) {
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

export default api;
