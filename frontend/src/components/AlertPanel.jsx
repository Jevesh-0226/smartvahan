import React, { useState } from 'react';
import '../App.css';

import API_URL from '../services/config';

const AlertPanel = ({ componentStates, onServiceComplete }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [servicingId, setServicingId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleService = async (e, id) => {
        e.stopPropagation();
        setServicingId(id);
        try {
            const response = await fetch(`${API_URL}/service-complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ component_name: id })
            });

            if (response.ok) {
                onServiceComplete(id);
                setExpandedId(null);
            }
        } catch (e) {
            console.error("Diagnostic Reset Failure:", e);
        } finally {
            setServicingId(null);
        }
    };

    const getSourceStyle = (source) => {
        if (source === "Demo Mode") {
            return { color: '#60A5FA', background: 'rgba(59, 130, 246, 0.1)' }; // Blue
        }
        if (source === "Fallback System" || source === "Fallback Mode" || source === "CONNECTION FAILED") {
            return { color: '#FFA500', background: 'rgba(255, 165, 0, 0.1)' }; // Orange
        }
        return { color: 'var(--accent-teal)', background: 'rgba(0, 179, 164, 0.1)' }; // Teal (Gemini/Default)
    };

    const flaggedComponents = Object.values(componentStates || {}).filter(c => c.flagged);

    return (
        <div className="panel-container">
            <div className="diagnostic-panel">
                <div className="panel-header-fixed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-teal)' }}>
                        ECU Diagnostic Monitor
                    </h3>
                    <div style={{ fontSize: '0.65rem', padding: '4px 8px', background: 'rgba(0,179,164,0.1)', borderRadius: '4px', color: 'var(--accent-teal)' }}>
                        Live AI Stream
                    </div>
                </div>

                <div className="panel-content-scroll">
                    {flaggedComponents.length === 0 ? (
                        <div className="healthy-state">
                            <div className="check-icon">✓</div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>System Healthy. No intervention required.</p>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ color: 'var(--accent-red)', fontWeight: 700, fontSize: '0.95rem' }}>
                                                ⚠ {comp.name.toUpperCase()}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: sourceStyle.color,
                                                background: sourceStyle.background,
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}>
                                                {comp.diagnosis?.diagnosisSource || "Analyzing..."}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                            Anomaly detected at <strong>{comp.value.toFixed(1)}{comp.unit}</strong>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="diag-report-area" onClick={(e) => e.stopPropagation()}>
                                            <div className="report-section">
                                                <h4>TECHNICAL CAUSE</h4>
                                                <p>{comp.diagnosis?.cause || "Connecting to diagnostic source..."}</p>
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
};

export default AlertPanel;
