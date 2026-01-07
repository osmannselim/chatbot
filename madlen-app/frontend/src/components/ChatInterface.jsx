/**
 * ChatInterface Component
 * 
 * Main chat interface with message history, input field, and model selection.
 * Features:
 * - Optimistic UI updates
 * - Auto-scroll to latest message
 * - Loading states
 * - Error handling
 * - Session continuity
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Trash2 } from 'lucide-react';
import { sendMessage } from '../services/api';
import MessageBubble from './MessageBubble';
import ModelSelector from './ModelSelector';

export default function ChatInterface() {
    // State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
    const [sessionId, setSessionId] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Create optimistic user message
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: trimmedInput,
            timestamp: new Date().toISOString(),
        };

        // Add user message immediately (Optimistic UI)
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Call API
            const result = await sendMessage(trimmedInput, selectedModel, sessionId);

            if (result.success) {
                // Store session ID for future messages
                if (result.data.session_id && !sessionId) {
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
            setIsLoading(false);
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
        setMessages([]);
        setSessionId(null);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
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
                        disabled={isLoading}
                    />

                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
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
                        {isLoading && (
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
                                disabled={isLoading}
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
                            disabled={!input.trim() || isLoading}
                            className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
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
    );
}
