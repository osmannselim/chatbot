/**
 * Sidebar Component
 * 
 * Collapsible sidebar with session management.
 * Features:
 * - New chat button
 * - Session list with preview
 * - Collapsible toggle
 */

import { Plus, MessageSquare, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Sidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    isLoading,
    isOpen,
    onToggle
}) {

    // Format relative time
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Collapsed state - show only toggle button
    if (!isOpen) {
        return (
            <div className="bg-gray-900 p-2 flex flex-col items-center">
                <button
                    onClick={onToggle}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Open sidebar"
                >
                    <PanelLeft className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen transition-all duration-300">
            {/* Header with Toggle and New Chat */}
            <div className="p-3 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                    <button
                        onClick={onToggle}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Close sidebar"
                    >
                        <PanelLeftClose className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-300">Conversations</span>
                </div>

                <button
                    onClick={onNewChat}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto">
                {isLoading && sessions.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <MessageSquare className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-500 text-sm">No conversations yet</p>
                        <p className="text-gray-600 text-xs mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {sessions.map((session) => (
                            <button
                                key={session.session_id}
                                onClick={() => onSelectSession(session.session_id)}
                                className={`w-full text-left px-3 py-2.5 hover:bg-gray-800 transition-colors border-l-2 ${currentSessionId === session.session_id
                                        ? 'bg-gray-800 border-blue-500'
                                        : 'border-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 truncate">
                                            {session.title || 'New Chat'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatTime(session.last_message_at)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700">
                <p className="text-xs text-gray-600 text-center">
                    Madlen Chat
                </p>
            </div>
        </aside>
    );
}
