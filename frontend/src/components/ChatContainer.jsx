/**
 * ChatContainer – Main Integrated AI Assistant UI
 * 
 * Performance: Orchestrates chat operations using the independent chatStore.
 * Securely passes the current 'mode' from modeStore to the backend on every message.
 */

import React, { useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChatStore from '../stores/chatStore';
import useModeStore from '../stores/modeStore';
import API_URL from '../services/config';

const ChatContainer = React.memo(() => {
    const addMessage = useChatStore((s) => s.addMessage);
    const messages = useChatStore((s) => s.messages);
    const isTyping = useChatStore((s) => s.isTyping);
    const setTyping = useChatStore((s) => s.setTyping);

    // Current mode for zero-lag backend logic
    const mode = useModeStore((s) => s.mode);

    const handleSendMessage = useCallback(async (text) => {
        // Add user message to UI instantly
        addMessage({ role: 'user', content: text, timestamp: new Date() });

        setTyping(true);

        try {
            // Clean history for API consumption (limit to last 5 for performance)
            const history = messages
                .slice(-5)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history,
                    mode // NO network request on toggle, but current mode is sent here!
                })
            });

            if (!res.ok) throw new Error('API Sync Failed');

            const data = await res.json();

            // Add AI response to UI
            addMessage({
                role: 'model',
                content: data.response,
                timestamp: new Date(data.timestamp)
            });
        } catch (err) {
            console.error("[CHAT ERROR]", err);
            addMessage({
                role: 'model',
                content: "I'm having trouble connecting to the ECU right now. Please check your connection and try again.",
                timestamp: new Date()
            });
        } finally {
            setTyping(false);
        }
    }, [addMessage, messages, setTyping, mode]);

    return (
        <div className="panel-container chat-container">
            <div className="diagnostic-panel">
                <div className="panel-header-fixed">
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-teal)' }}>
                        SmartVahan AI Assistant
                    </h3>
                    <div className="chat-badge" style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.6 }}>
                        {mode === 'demo' ? '⚡ DEMO SIMULATION' : '✨ LIVE GEMINI CORE'}
                    </div>
                </div>

                <div className="chat-body">
                    <MessageList />
                    <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
                </div>
            </div>
        </div>
    );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
