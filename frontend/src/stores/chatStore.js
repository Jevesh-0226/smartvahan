/**
 * SmartVahan – Chat Store (Zustand)
 * 
 * Manages chat history and messages independently from the dashboard state.
 * This prevents chat updates from triggering expensive dashboard re-renders.
 */

import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [
        {
            id: 'welcome',
            role: 'model',
            content: "Hello! I'm your SmartVahan AI Assistant. I'm connected to your vehicle's ECU. How can I help you today?",
            timestamp: new Date()
        }
    ],
    isTyping: false,

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: Date.now().toString() }]
    })),

    setTyping: (isTyping) => set({ isTyping }),

    clearChat: () => set({
        messages: [{
            id: 'initial',
            role: 'model',
            content: "Chat cleared. Ready for your questions!",
            timestamp: new Date()
        }]
    })
}));

export default useChatStore;
