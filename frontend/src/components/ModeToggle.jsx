import React, { useState, useEffect } from 'react';

import API_URL from '../config';

const ModeToggle = () => {
    const [mode, setMode] = useState('demo'); // Default to demo
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/get-mode`)
            .then(res => res.json())
            .then(data => {
                setMode(data.currentMode);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch mode:", err);
                setLoading(false);
            });
    }, []);

    const toggleMode = async () => {
        const newMode = mode === 'demo' ? 'real' : 'demo';
        setMode(newMode); // Optimistic update

        try {
            const res = await fetch(`${API_URL}/set-mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: newMode })
            });

            if (!res.ok) throw new Error("Failed to set mode");

            const data = await res.json();
            setMode(data.currentMode); // Confirm from server

            // Allow parent or global toast if needed, but for now just console
            console.log(`Switched to ${data.currentMode} mode`);

        } catch (err) {
            console.error("Mode switch error:", err);
            setMode(mode); // Revert on error
        }
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
