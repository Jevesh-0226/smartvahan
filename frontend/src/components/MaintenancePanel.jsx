import React, { useState, useEffect } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const MaintenancePanel = () => {
    const [history, setHistory] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchHistory();
        fetchPredictions();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/maintenance-history`);
            if (res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchPredictions = async () => {
        try {
            const res = await fetch(`${API_URL}/next-service-prediction`);
            if (res.ok) setPredictions(await res.json());
        } catch (e) { console.error(e); }
    };

    return (
        <div className="maintenance-panel" style={{ marginTop: '30px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '20px', border: 'var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'upcoming' ? '#3b82f6' : '#94a3b8',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        paddingBottom: '5px',
                        borderBottom: activeTab === 'upcoming' ? '2px solid #3b82f6' : 'none'
                    }}
                >
                    📅 Upcoming Services
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'history' ? '#3b82f6' : '#94a3b8',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        paddingBottom: '5px',
                        borderBottom: activeTab === 'history' ? '2px solid #3b82f6' : 'none'
                    }}
                >
                    📜 Maintenance History
                </button>
            </div>

            {activeTab === 'upcoming' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {predictions.map((p, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '15px',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${p.days_remaining < 30 ? '#ef4444' : '#10b981'}`
                        }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>{p.component_name}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                                <span>Due: {p.predicted_date}</span>
                                <span style={{ color: p.days_remaining < 30 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                    {p.days_remaining} Days Left
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'history' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Component</th>
                                <th style={{ padding: '10px' }}>Issue Detected</th>
                                <th style={{ padding: '10px' }}>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((h, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                                    <td style={{ padding: '10px' }}>{h.service_date}</td>
                                    <td style={{ padding: '10px', color: '#3b82f6' }}>{h.component_name}</td>
                                    <td style={{ padding: '10px', color: '#ef4444' }}>{h.issue_detected}</td>
                                    <td style={{ padding: '10px' }}>{h.value_at_service}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No service history recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MaintenancePanel;
