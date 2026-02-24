/**
 * SmartVahan – Global Mode Store (Zustand)
 * 
 * This is the SINGLE SOURCE OF TRUTH for the Demo/Real mode.
 * 
 * Design decisions:
 * - Mode is stored ONLY in memory (no API call on toggle)
 * - Initialized once from localStorage (instant, no network)
 * - Backend is NOT involved in toggle — only in the next chat/sensor message
 * - Zero re-renders of unrelated components (Zustand subscriptions are fine-grained)
 */

import { create } from 'zustand';

// Persist mode to localStorage so it survives page refresh (no backend call needed at startup)
const STORAGE_KEY = 'sv_mode';

const getInitialMode = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'real' || stored === 'demo') return stored;
    } catch {
        // localStorage unavailable (e.g. private mode restrictions)
    }
    return 'demo'; // safe default
};

const useModeStore = create((set) => ({
    mode: getInitialMode(),

    /**
     * Toggle mode instantly — pure in-memory operation.
     * No API call. No async. No delay.
     * The backend will receive the correct mode on the NEXT outgoing request.
     */
    toggleMode: () =>
        set((state) => {
            const newMode = state.mode === 'demo' ? 'real' : 'demo';
            try {
                localStorage.setItem(STORAGE_KEY, newMode);
            } catch {
                // ignore storage errors
            }
            return { mode: newMode };
        }),

    /**
     * Explicitly set mode (used for initialization from backend if needed)
     */
    setMode: (mode) => {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // ignore
        }
        set({ mode });
    },
}));

export default useModeStore;
