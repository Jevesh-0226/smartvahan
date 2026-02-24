/**
 * MessageList – Rendering chat history
 * 
 * Performance: Optimized to handle deep message lists without lag.
 * Uses CSS transitions for smooth message appearance.
 */

import React, { useEffect, useRef } from 'react';
import useChatStore from '../stores/chatStore';

const MessageList = React.memo(() => {
    const messages = useChatStore((s) => s.messages);
    const isTyping = useChatStore((s) => s.isTyping);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="message-list-scroll" ref={scrollRef}>
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}
                >
                    <div className="message-bubble">
                        <div className="message-text">{msg.content}</div>
                        <div className="message-meta">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="message-wrapper ai">
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            )}
        </div>
    );
});

MessageList.displayName = 'MessageList';

export default MessageList;
