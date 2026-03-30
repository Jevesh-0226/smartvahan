/**
 * AlertPanel – ECU Diagnostic Monitor
 *
 * Performance: React.memo'd — only re-renders when componentStates prop changes.
 * useCallback on all handlers — stable references to prevent child re-renders.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import '../App.css';
import API_URL from '../services/config';

const AlertPanel = React.memo(({ componentStates, onServiceComplete }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [servicingId, setServicingId] = useState(null);

    const toggleExpand = useCallback((id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleService = useCallback(
        async (e, id) => {
            e.stopPropagation();
            setServicingId(id);
            try {
                const response = await fetch(`${API_URL}/service-complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ component_name: id }),
                });
                if (response.ok) {
                    onServiceComplete(id);
                    setExpandedId(null);
                }
            } catch {
                // Silent fail — user can retry
            } finally {
                setServicingId(null);
            }
        },
        [onServiceComplete]
    );

    // Memoized source style computation — avoids object creation on each render
    const getSourceStyle = useCallback((source) => {
        if (source === 'Demo Mode')
            return { color: '#60A5FA', background: 'rgba(59, 130, 246, 0.1)' };
        if (
            source === 'Fallback System' ||
            source === 'Fallback Mode' ||
            source === 'CONNECTION FAILED'
        )
            return { color: '#FFA500', background: 'rgba(255, 165, 0, 0.1)' };
        return { color: 'var(--accent-teal)', background: 'rgba(0, 179, 164, 0.1)' };
    }, []);

    // Memoized flagged list — avoids Object.values on every render
    const flaggedComponents = useMemo(
        () => Object.values(componentStates || {}).filter((c) => c.flagged),
        [componentStates]
    );

    return (
        <div className="panel-container">
            <div className="diagnostic-panel">
                <div
                    className="panel-header-fixed"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} style={{ color: 'var(--accent-teal)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-teal)' }}>
                            ECU Diagnostic Monitor
                        </h3>
                    </div>
                    <div
                        style={{
                            fontSize: '0.65rem',
                            padding: '4px 8px',
                            background: 'rgba(0,179,164,0.1)',
                            borderRadius: '4px',
                            color: 'var(--accent-teal)',
                            fontWeight: 600
                        }}
                    >
                        LIVE AI STREAM
                    </div>
                </div>

                <div className="panel-content-scroll">
                    {flaggedComponents.length === 0 ? (
                        <div className="healthy-state" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            height: '100%',
                            opacity: 0.8
                        }}>
                            <CheckCircle size={48} style={{ color: 'var(--accent-green)', marginBottom: '16px' }} />
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                                System Healthy. No intervention required.
                            </p>
                        </div>
                    ) : (
                        flaggedComponents.map((comp) => {
                            const isExpanded = expandedId === comp.id;
                            const isServicing = servicingId === comp.id;
                            const sourceStyle = getSourceStyle(comp.diagnosis?.diagnosisSource);

                            return (
                                <div
                                    key={comp.id}
                                    className={`alert-card ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => toggleExpand(comp.id)}
                                >
                                    <div className="alert-main-info">
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 10,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <AlertTriangle size={16} style={{ color: 'var(--accent-red)' }} />
                                                <span
                                                    style={{
                                                        color: 'var(--accent-red)',
                                                        fontWeight: 700,
                                                        fontSize: '0.95rem',
                                                        letterSpacing: '0.02em'
                                                    }}
                                                >
                                                    {comp.name.toUpperCase()}
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: '0.65rem',
                                                    color: sourceStyle.color,
                                                    background: sourceStyle.background,
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {comp.diagnosis?.diagnosisSource?.toUpperCase() || 'ANALYZING...'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginLeft: '24px' }}>
                                            Anomaly detected at{' '}
                                            <strong style={{ color: 'var(--accent-red)' }}>
                                                {comp.value.toFixed(1)}
                                                {comp.unit}
                                            </strong>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div
                                            className="diag-report-area"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="report-section">
                                                <h4>TECHNICAL CAUSE</h4>
                                                <p>{comp.diagnosis?.cause || 'Connecting to diagnostic source...'}</p>
                                            </div>
                                            <div className="report-section" style={{ marginTop: '12px' }}>
                                                <h4>SYSTEM EFFECT</h4>
                                                <p style={{ color: '#FCA5A5' }}>{comp.diagnosis?.effect}</p>
                                            </div>
                                            <div className="report-section" style={{ marginTop: '12px' }}>
                                                <h4>REPAIR SOLUTION</h4>
                                                <p style={{ color: '#CBD5E1' }}>{comp.diagnosis?.solution}</p>
                                            </div>
                                            <div className="report-section" style={{ marginTop: '12px' }}>
                                                <h4>PREVENTION ADVISORY</h4>
                                                <p style={{ color: '#94A3B8' }}>{comp.diagnosis?.prevention}</p>
                                            </div>

                                            <button
                                                className="service-now-btn"
                                                onClick={(e) => handleService(e, comp.id)}
                                                disabled={isServicing}
                                            >
                                                {isServicing ? 'Initiating Reset...' : 'SERVICE NOW'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
});

AlertPanel.displayName = 'AlertPanel';

export default AlertPanel;
