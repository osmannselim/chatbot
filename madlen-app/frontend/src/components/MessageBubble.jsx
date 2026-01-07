/**
 * MessageBubble Component
 * 
 * Renders a single chat message with appropriate styling based on role.
 * User messages: Right-aligned, blue background
 * Assistant messages: Left-aligned, gray background with markdown support
 */

import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const isError = message.role === 'error';

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Error message styling
    if (isError) {
        return (
            <div className="flex justify-center my-2">
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg max-w-md">
                    <p className="text-sm">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-200 text-gray-800 rounded-bl-md'
                    }`}
            >
                {/* Message content */}
                {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                )}

                {/* Timestamp */}
                <p
                    className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                >
                    {formatTime(message.timestamp)}
                </p>
            </div>
        </div>
    );
}
