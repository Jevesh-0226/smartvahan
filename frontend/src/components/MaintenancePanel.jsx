/**
 * MaintenancePanel – Maintenance History Logs
 *
 * Performance: React.memo'd — component is completely isolated from mode state.
 * useCallback on all handlers to ensure stable references.
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';
import API_URL from '../services/config';

const MaintenancePanel = React.memo(() => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/maintenance-history`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch {
            // Silent fail — panel will show stale data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [fetchHistory]);

    const handleDelete = useCallback(
        async (e, record_id) => {
            e.stopPropagation();

            if (!record_id) {
                alert('This record cannot be deleted (ID missing).');
                return;
            }

            if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;

            try {
                const response = await fetch(`${API_URL}/maintenance/${record_id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    // Optimistic update — instantly remove from UI
                    setHistory((prev) => prev.filter((item) => item.id !== record_id));
                } else {
                    alert('Failed to delete record. It may have been modified externally.');
                }
            } catch {
                alert('Server communication error.');
            }
        },
        []
    );

    return (
        <div className="panel-container">
            <div className="diagnostic-panel">
                <div
                    className="panel-header-fixed"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-teal)' }}>
                        Maintenance History Logs
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Active Records: {history.length}
                    </span>
                </div>

                <div className="panel-content-scroll">
                    {loading ? (
                        <div className="healthy-state" style={{ height: '200px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Loading records...
                            </p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="healthy-state" style={{ height: '200px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Fleet maintenance database is empty.
                            </p>
                        </div>
                    ) : (
                        history.map((record) => (
                            <div key={record.id || record.global_id} className="history-item">
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <div className="history-comp-name">{record.component_name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span
                                            style={{
                                                color: 'var(--accent-teal)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                opacity: 0.8,
                                            }}
                                        >
                                            {record.diagnosisSource === 'Gemini Live'
                                                ? '✓ LIVE AI VERIFIED'
                                                : record.diagnosisSource}
                                        </span>
                                        <button
                                            className="delete-record-btn"
                                            title="Delete Record"
                                            onClick={(e) => handleDelete(e, record.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="history-grid-info">
                                    <div>
                                        <span
                                            style={{
                                                color: 'var(--text-secondary)',
                                                display: 'block',
                                                fontSize: '0.65rem',
                                            }}
                                        >
                                            TIMESTAMP
                                        </span>
                                        {record.service_date}
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                color: 'var(--text-secondary)',
                                                display: 'block',
                                                fontSize: '0.65rem',
                                            }}
                                        >
                                            VALUE @ EVENT
                                        </span>
                                        {record.value_at_service}
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                color: 'var(--text-secondary)',
                                                display: 'block',
                                                fontSize: '0.65rem',
                                            }}
                                        >
                                            LIFECYCLE
                                        </span>
                                        Service Count: {record.service_count}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: '14px',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        paddingTop: '12px',
                                    }}
                                >
                                    <div className="report-section">
                                        <h4>TECHNICAL CAUSE</h4>
                                        <p>{record.cause}</p>
                                    </div>
                                    <div className="report-section" style={{ marginTop: '12px' }}>
                                        <h4>SYSTEM EFFECT</h4>
                                        <p style={{ color: '#FCA5A5' }}>{record.effect}</p>
                                    </div>
                                    <div className="report-section" style={{ marginTop: '12px' }}>
                                        <h4>REPAIR SOLUTION</h4>
                                        <p style={{ color: '#CBD5E1' }}>{record.solution}</p>
                                    </div>
                                    <div className="report-section" style={{ marginTop: '12px' }}>
                                        <h4>PREVENTION ADVISORY</h4>
                                        <p style={{ color: '#94A3B8' }}>{record.prevention}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
});

MaintenancePanel.displayName = 'MaintenancePanel';

export default MaintenancePanel;
