/**
 * MessageInput – Chat input and submission
 */

import React, { useState, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';

const MessageInput = React.memo(({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text.trim());
            setText('');
        }
    }, [text, disabled, onSendMessage]);

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Type a vehicle question..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={disabled}
                aria-label="Message Input"
            />
            <button
                type="submit"
                className="send-btn"
                disabled={!text.trim() || disabled}
                title="Send Message"
            >
                <SendHorizontal size={20} />
            </button>
        </form>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
