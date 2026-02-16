import React, { useState } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AlertPanel = ({ activeAlerts, onServiceComplete }) => {
    const [expanded, setExpanded] = useState(null);
    const [servicing, setServicing] = useState("");

    const toggleExpand = (componentName) => {
        setExpanded(expanded === componentName ? null : componentName);
    };

    const handleService = async (componentName) => {
        setServicing(componentName);
        try {
            const response = await fetch(`${API_URL}/service-complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ component_name: componentName })
            });

            if (response.ok) {
                onServiceComplete(componentName);
            } else {
                alert("Service failed on backend");
            }
        } catch (e) {
            console.error("Service Error", e);
        } finally {
            setServicing("");
        }
    };

    const alertKeys = Object.keys(activeAlerts || {});

    if (alertKeys.length === 0) {
        return (
            <div className="alert-section" style={{ textAlign: 'center', color: '#64748b' }}>
                <h3>Diagnostic Status</h3>
                <p>System Healthy. No critical issues detected.</p>
                <div style={{ fontSize: '4rem', opacity: 0.2 }}>✓</div>
            </div>
        );
    }

    return (
        <div className="alert-section">
            <div className="alert-header">
                <span style={{ color: '#ef4444' }}>⚠</span>
                <span>Active Alerts ({alertKeys.length})</span>
            </div>

            {alertKeys.map((componentName) => {
                const alertData = activeAlerts[componentName];
                const aiData = alertData.analysis;
                const isExpanded = expanded === componentName;
                const isServicing = servicing === componentName;

                return (
                    <div key={componentName} className="alert-item">
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                            onClick={() => toggleExpand(componentName)}
                        >
                            <div>
                                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>🚨 {componentName.replace(/_/g, ' ')} Alert</h3>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>
                                    Critical Value: {alertData.value} {alertData.unit}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Active for: {Math.floor((Date.now() - alertData.timestamp) / 1000)} seconds
                                </div>
                            </div>
                            <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</div>
                        </div>

                        {isExpanded && aiData && (
                            <div className="ai-analysis">
                                <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 'bold' }}>
                                    AI DIAGNOSTIC ANALYSIS
                                </div>

                                <div className="analysis-grid">
                                    <div className="analysis-box">
                                        <h4>Possible Causes</h4>
                                        <ul>
                                            {aiData.possible_causes?.map((cause, i) => <li key={i}>{cause}</li>) || <li>Wait for analysis...</li>}
                                        </ul>
                                    </div>

                                    <div className="analysis-box">
                                        <h4>Immediate Actions</h4>
                                        <ul>
                                            {aiData.immediate_actions?.map((action, i) => <li key={i} style={{ color: '#f87171' }}>{action}</li>)}
                                        </ul>
                                    </div>

                                    <div className="analysis-box">
                                        <h4>Review & Risk</h4>
                                        <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                            <strong style={{ color: '#f59e0b' }}>Severity:</strong> {aiData.severity}<br />
                                            <strong style={{ color: '#f59e0b' }}>Risk:</strong> {aiData.risk_ignored}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleService(componentName);
                                        }}
                                        disabled={isServicing}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: isServicing ? '#64748b' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: isServicing ? 'wait' : 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        {isServicing ? 'Processing...' : '🔧 Mark Service Done'}
                                    </button>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                                        Click only after designated maintenance is completed. System will reset component health.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isExpanded && !aiData && (
                            <div className="ai-analysis">Analyzing data with Gemini AI...</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AlertPanel;
