import React, { useState, useEffect } from 'react';

import API_URL from '../config';

const ModeToggle = () => {
    const [mode, setMode] = useState('demo'); // Default to demo
    const [loading, setLoading] = useState(true);

    // Fetch current mode on component mount
    useEffect(() => {
        console.log('[MODE TOGGLE] Fetching current mode from backend...');

        fetch(`${API_URL}/get-mode`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch mode: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const currentMode = data.currentMode || data.mode || 'demo';
                setMode(currentMode);
                setLoading(false);
                console.log(`[MODE TOGGLE] Initial mode set to: ${currentMode}`);
            })
            .catch(err => {
                console.error("[MODE TOGGLE] Failed to fetch mode:", err);
                // Default to demo mode on error
                setMode('demo');
                setLoading(false);
            });
    }, []);

    const toggleMode = async () => {
        const newMode = mode === 'demo' ? 'real' : 'demo';
        const previousMode = mode;

        // Optimistic update
        setMode(newMode);
        setLoading(true);

        try {
            console.log(`[MODE TOGGLE] Switching from ${previousMode} to ${newMode}`);

            const res = await fetch(`${API_URL}/set-mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: newMode })
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();

            // Confirm mode from server response
            const confirmedMode = data.currentMode || data.mode;
            setMode(confirmedMode);

            console.log(`[MODE TOGGLE] Successfully switched to ${confirmedMode} mode`);

            // Show success notification (you can replace with a toast library)
            showNotification(`Switched to ${confirmedMode.toUpperCase()} mode`, 'success');

        } catch (err) {
            console.error("[MODE TOGGLE ERROR]", err);

            // Revert to previous mode on error
            setMode(previousMode);

            showNotification(`Failed to switch mode: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Simple notification function (can be replaced with react-toastify or similar)
    const showNotification = (message, type) => {
        console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
        // TODO: Integrate with a proper toast notification library
    };


    if (loading) return <div className="mode-toggle loading">...</div>;

    const isDemo = mode === 'demo';

    return (
        <button
            onClick={toggleMode}
            className={`mode-toggle-btn ${isDemo ? 'demo' : 'real'}`}
            title={`Click to switch to ${isDemo ? 'Real' : 'Demo'} Mode`}
        >
            <span className="status-dot"></span>
            {isDemo ? 'Demo Mode Active' : 'Real Mode Active'}
        </button>
    );
};

export default ModeToggle;
