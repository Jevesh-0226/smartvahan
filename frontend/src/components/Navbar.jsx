/**
 * Navbar – Global Application Header
 * 
 * Performance: React.memo'd to prevent re-renders when dashboard data updates.
 * Contains the ModeToggle which manages its own state via Zustand.
 */

import React from 'react';
import ModeToggle from './ModeToggle';

const Navbar = React.memo(({ status, isCritical }) => {
    return (
        <header className="dashboard-header">
            <div className="header-content">
                <div className="brand">
                    <h1>
                        SmartVahan <span className="subtitle">Vehicle Health Monitor</span>
                    </h1>
                </div>

                <div className="nav-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <ModeToggle />

                    <div className={`status-indicator-pill ${isCritical ? 'critical' : ''}`}>
                        <span className={`pulse-dot ${isCritical ? 'red' : 'green'}`} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
});

Navbar.displayName = 'Navbar';

export default Navbar;
