/**
 * ChatInterface Component
 * 
 * Main chat interface with message history, input field, model selection,
 * and session management.
 * 
 * Features:
 * - Optimistic UI updates
 * - Auto-scroll to latest message
 * - Loading states
 * - Error handling
 * - Session management (new chat, switch sessions)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, Loader2, Bot, Trash2 } from 'lucide-react';
import { sendMessage, fetchSessions, fetchHistory } from '../services/api';
import MessageBubble from './MessageBubble';
import ModelSelector from './ModelSelector';
import Sidebar from './Sidebar';

export default function ChatInterface() {
    // State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.3-70b-instruct:free');
    const [sessionId, setSessionId] = useState(() => uuidv4());
    const [sessions, setSessions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when session changes
    useEffect(() => {
        inputRef.current?.focus();
    }, [sessionId]);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        const result = await fetchSessions();
        if (result.success) {
            setSessions(result.data || []);
        }
        setIsLoadingSessions(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleNewChat = useCallback(() => {
        setSessionId(uuidv4());
        setMessages([]);
        inputRef.current?.focus();
    }, []);

    const handleSelectSession = useCallback(async (id) => {
        if (id === sessionId) return;

        setSessionId(id);
        setIsLoading(true);

        const result = await fetchHistory(id);
        if (result.success && result.data.messages) {
            setMessages(result.data.messages);
        } else {
            setMessages([]);
        }

        setIsLoading(false);
    }, [sessionId]);

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isSending) return;

        // Create optimistic user message
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: trimmedInput,
            timestamp: new Date().toISOString(),
        };

        // Check if this is a new session (first message)
        const isNewSession = messages.length === 0;

        // Add user message immediately (Optimistic UI)
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsSending(true);

        try {
            // Call API
            const result = await sendMessage(trimmedInput, selectedModel, sessionId);

            if (result.success) {
                // Update session ID if server assigned a new one
                if (result.data.session_id && result.data.session_id !== sessionId) {
                    setSessionId(result.data.session_id);
                }

                // Add AI response
                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: result.data.response,
                    timestamp: new Date().toISOString(),
                    model: result.data.model,
                };

                setMessages((prev) => [...prev, aiMessage]);

                // Refresh session list if this was a new session
                if (isNewSession) {
                    loadSessions();
                }
            } else {
                // Add error message to chat
                const errorMessage = {
                    id: Date.now() + 1,
                    role: 'error',
                    content: `Error: ${result.error}`,
                    timestamp: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            // Unexpected error
            const errorMessage = {
                id: Date.now() + 1,
                role: 'error',
                content: 'An unexpected error occurred. Please try again.',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        handleNewChat();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                sessions={sessions}
                currentSessionId={sessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                isLoading={isLoadingSessions}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Madlen Chat</h1>
                            <p className="text-xs text-gray-500">Powered by OpenRouter</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ModelSelector
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                            disabled={isSending}
                        />

                        {messages.length > 0 && (
                            <button
                                onClick={handleClearChat}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="New chat"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </header>

                {/* Messages Area */}
                <main className="flex-1 overflow-y-auto px-4 py-6">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        // Empty state
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Bot className="h-16 w-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Start a conversation</p>
                            <p className="text-sm">Type a message below to begin chatting</p>
                        </div>
                    ) : (
                        // Messages list
                        <div className="max-w-3xl mx-auto">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {/* Loading indicator */}
                            {isSending && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Input Area */}
                <footer className="bg-white border-t border-gray-200 px-4 py-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-end gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isSending}
                                    rows={1}
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    style={{
                                        minHeight: '48px',
                                        maxHeight: '120px',
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isSending}
                                className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-2">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
