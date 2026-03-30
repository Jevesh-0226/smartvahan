/**
 * ModeToggle – Ultra-Instant Demo/Real Mode Switch
 *
 * Performance contract:
 * ✅ ZERO network requests on toggle
 * ✅ ZERO async operations on toggle
 * ✅ ZERO loading state
 * ✅ GPU-accelerated CSS transition (transform: translateZ(0))
 * ✅ Mode persisted via localStorage (no backend needed at startup)
 * ✅ Next message sent to backend carries the correct mode via store
 */

import React, { useCallback } from 'react';
import { Play, Zap } from 'lucide-react';
import useModeStore from '../stores/modeStore';

const ModeToggle = React.memo(() => {
    // Fine-grained Zustand subscriptions — only re-renders this component
    const mode = useModeStore((s) => s.mode);
    const toggleMode = useModeStore((s) => s.toggleMode);

    const handleClick = useCallback(() => {
        toggleMode(); // purely synchronous, in-memory, <1ms
    }, [toggleMode]);

    const isDemo = mode === 'demo';

    return (
        <button
            id="mode-toggle-btn"
            onClick={handleClick}
            className={`mode-toggle-btn ${isDemo ? 'demo' : 'real'}`}
            title={`Click to switch to ${isDemo ? 'Real' : 'Demo'} Mode`}
            aria-label={`Current mode: ${isDemo ? 'Demo' : 'Real'}. Click to switch.`}
            aria-pressed={!isDemo}
        >
            {isDemo ? <Play size={14} fill="currentColor" /> : <Zap size={14} fill="currentColor" />}
            <span className="mode-label">
                {isDemo ? 'Demo Mode' : 'Real Mode'}
            </span>
            {/* Small badge indicating AI source */}
            <span className="mode-badge" aria-hidden="true">
                {isDemo ? 'SIMULATED' : 'LIVE AI'}
            </span>
        </button>
    );
});

ModeToggle.displayName = 'ModeToggle';

export default ModeToggle;
