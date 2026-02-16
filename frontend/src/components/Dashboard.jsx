import React, { useState, useEffect, useRef } from 'react';
import SensorCard from './SensorCard';
import AlertPanel from './AlertPanel';
import MaintenancePanel from './MaintenancePanel';
import ModeToggle from './ModeToggle';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Dashboard = () => {
    const [sensorData, setSensorData] = useState({
        engine_temperature: 92.0,
        oil_pressure: 42.0,
        brake_wear: 45.0,
        battery_voltage: 12.8,
        tire_pressure: 33.0
    });

    const [diagnosticReport, setDiagnosticReport] = useState({
        status: 'System Healthy',
        component_states: {}
    });

    const reportRef = useRef(diagnosticReport);
    useEffect(() => {
        reportRef.current = diagnosticReport;
    }, [diagnosticReport]);

    const fetchDiagnostics = async (data) => {
        try {
            const res = await fetch(`${API_URL}/sensor-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const report = await res.json();
                setDiagnosticReport(report);
            }
        } catch (e) {
            console.error("Dashboard Status Sync Failure:", e);
        }
    };

    // Advanced Telemetry Simulation (Commercial Grade)
    useEffect(() => {
        const interval = setInterval(() => {
            setSensorData(prev => {
                const newData = { ...prev };
                const states = reportRef.current.component_states || {};

                Object.keys(prev).forEach(key => {
                    const state = states[key];
                    const isRecentlyServiced = state?.recentlyServiced;

                    if (isRecentlyServiced) {
                        // COOLDOWN: Lock to safe baseline range
                        if (key === 'brake_wear') newData[key] = Math.max(18, Math.min(22, prev[key] + (Math.random() - 0.5) * 0.1));
                        else if (key === 'engine_temperature') newData[key] = Math.max(89, Math.min(91, prev[key] + (Math.random() - 0.5) * 0.2));
                        else newData[key] = prev[key] + (Math.random() - 0.5) * 0.1;
                    } else if (state?.flagged) {
                        // CRITICAL STATE: Maintain high value until service
                        newData[key] = prev[key] + (Math.random() - 0.5) * 0.1;
                    } else {
                        // NORMAL TELEMETRY TRENDS
                        if (key === 'brake_wear') newData[key] = Math.min(100, prev[key] + (Math.random() * 0.7));
                        else if (key === 'engine_temperature') newData[key] = Math.min(125, prev[key] + (Math.random() * 0.5));
                        else if (key === 'oil_pressure') newData[key] = Math.max(15, prev[key] - (Math.random() * 0.4));
                        else if (key === 'battery_voltage') newData[key] = Math.max(10, prev[key] - 0.02);
                        else newData[key] = prev[key] + (Math.random() - 0.5) * 1.2;
                    }
                });

                fetchDiagnostics(newData);
                return newData;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleServiceComplete = (id) => {
        // Individual Reset logic (Part 1 - Phase 6)
        setSensorData(prev => {
            const threshold = reportRef.current.component_states?.[id]?.threshold || 100;
            const safeBaseline = threshold * 0.7; // Reset to 30% below threshold

            return {
                ...prev,
                [id]: safeBaseline
            };
        });
    };

    const isCritical = diagnosticReport.status === "Action Required";

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>SmartVahan <span className="subtitle">Vehicle Health Monitor</span></h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <ModeToggle />
                        <div className={`status-indicator-pill ${isCritical ? 'critical' : ''}`}>
                            <span className={`pulse-dot ${isCritical ? 'red' : 'green'}`}></span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{diagnosticReport.status}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <section className="dashboard-grid">
                    <SensorCard
                        title="Engine Thermal"
                        value={sensorData.engine_temperature.toFixed(1)}
                        unit="°C" icon="🌡️"
                        isCritical={diagnosticReport.component_states?.engine_temperature?.flagged}
                        serviceCount={diagnosticReport.component_states?.engine_temperature?.serviceCount}
                    />
                    <SensorCard
                        title="Liquid Pressure"
                        value={sensorData.oil_pressure.toFixed(1)}
                        unit="PSI" icon="🛢️"
                        isCritical={diagnosticReport.component_states?.oil_pressure?.flagged}
                        serviceCount={diagnosticReport.component_states?.oil_pressure?.serviceCount}
                    />
                    <SensorCard
                        title="Friction Material"
                        value={sensorData.brake_wear.toFixed(1)}
                        unit="%" icon="🛑"
                        isCritical={diagnosticReport.component_states?.brake_wear?.flagged}
                        serviceCount={diagnosticReport.component_states?.brake_wear?.serviceCount}
                    />
                    <SensorCard
                        title="Energy Storage"
                        value={sensorData.battery_voltage.toFixed(2)}
                        unit="V" icon="🔋"
                        isCritical={diagnosticReport.component_states?.battery_voltage?.flagged}
                        serviceCount={diagnosticReport.component_states?.battery_voltage?.serviceCount}
                    />
                    <SensorCard
                        title="Pneumatic Load"
                        value={sensorData.tire_pressure.toFixed(1)}
                        unit="PSI" icon="🛞"
                        isCritical={diagnosticReport.component_states?.tire_pressure?.flagged}
                        serviceCount={diagnosticReport.component_states?.tire_pressure?.serviceCount}
                    />
                </section>

                <div className="bottom-layout">
                    <MaintenancePanel />
                    <AlertPanel
                        componentStates={diagnosticReport.component_states}
                        onServiceComplete={handleServiceComplete}
                    />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
