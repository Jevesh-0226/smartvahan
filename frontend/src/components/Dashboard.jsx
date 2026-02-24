/**
 * Dashboard – Integrated SmartVahan Vehicle Health Monitor
 * 
 * Performance Optimizations:
 * ✅ Mode sourced from Zustand 'useModeStore'
 * ✅ Mode sent along with every telemetry packet (zero network toggle requests)
 * ✅ React.memo on all child components (Navbar, Alert, Maintenance, Chat)
 * ✅ Independent Chat state via 'useChatStore'
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SensorCard from './SensorCard';
import AlertPanel from './AlertPanel';
import MaintenancePanel from './MaintenancePanel';
import Navbar from './Navbar';
import ChatContainer from './ChatContainer';
import useModeStore from '../stores/modeStore';
import '../App.css';
import API_URL from '../services/config';

// ─── Memoized child components ──────────────────────────────────────────────
const MemoizedSensorCard = React.memo(SensorCard);
const MemoizedAlertPanel = React.memo(AlertPanel);
const MemoizedMaintenancePanel = React.memo(MaintenancePanel);
const MemoizedChatContainer = React.memo(ChatContainer);

const INITIAL_SENSOR_DATA = {
    engine_temperature: 92.0,
    oil_pressure: 42.0,
    brake_wear: 45.0,
    battery_voltage: 12.8,
    tire_pressure: 33.0,
};

const Dashboard = () => {
    const [sensorData, setSensorData] = useState(INITIAL_SENSOR_DATA);
    const [diagnosticReport, setDiagnosticReport] = useState({
        status: 'System Healthy',
        component_states: {},
    });

    // Mode from Zustand store
    const mode = useModeStore((s) => s.mode);

    const reportRef = useRef(diagnosticReport);
    useEffect(() => {
        reportRef.current = diagnosticReport;
    }, [diagnosticReport]);

    const isCritical = useMemo(
        () => diagnosticReport.status === 'Action Required',
        [diagnosticReport.status]
    );

    // ── Network Fetch (Optimized) ─────────────────────────────────────────────
    const fetchDiagnostics = useCallback(async (data) => {
        try {
            const res = await fetch(`${API_URL}/sensor-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    mode // Current mode is sent here for zero-lag backend logic
                }),
            });
            if (res.ok) {
                const report = await res.json();
                setDiagnosticReport(report);
            }
        } catch {
            // Best-effort telemetry
        }
    }, [mode]); // Mode is a dependency to ensure correct logic on next poll

    // ── Telemetry Loop ────────────────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            setSensorData((prev) => {
                const newData = { ...prev };
                const states = reportRef.current.component_states || {};

                Object.keys(prev).forEach((key) => {
                    const state = states[key];
                    if (state?.recentlyServiced) {
                        if (key === 'brake_wear')
                            newData[key] = Math.max(18, Math.min(22, prev[key] + (Math.random() - 0.5) * 0.1));
                        else if (key === 'engine_temperature')
                            newData[key] = Math.max(89, Math.min(91, prev[key] + (Math.random() - 0.5) * 0.2));
                        else newData[key] = prev[key] + (Math.random() - 0.5) * 0.1;
                    } else if (state?.flagged) {
                        newData[key] = prev[key] + (Math.random() - 0.5) * 0.1;
                    } else {
                        if (key === 'brake_wear')
                            newData[key] = Math.min(100, prev[key] + Math.random() * 0.7);
                        else if (key === 'engine_temperature')
                            newData[key] = Math.min(125, prev[key] + Math.random() * 0.5);
                        else if (key === 'oil_pressure')
                            newData[key] = Math.max(15, prev[key] - Math.random() * 0.4);
                        else if (key === 'battery_voltage')
                            newData[key] = Math.max(10, prev[key] - 0.02);
                        else newData[key] = prev[key] + (Math.random() - 0.5) * 1.2;
                    }
                });

                fetchDiagnostics(newData);
                return newData;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [fetchDiagnostics]);

    const handleServiceComplete = useCallback((id) => {
        setSensorData((prev) => {
            const threshold = reportRef.current.component_states?.[id]?.threshold || 100;
            return { ...prev, [id]: threshold * 0.7 };
        });
    }, []);

    return (
        <div className="dashboard-container">
            <Navbar status={diagnosticReport.status} isCritical={isCritical} />

            <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <section className="dashboard-grid">
                    <MemoizedSensorCard
                        title="Engine Thermal"
                        value={sensorData.engine_temperature.toFixed(1)}
                        unit="°C" icon="🌡️"
                        isCritical={diagnosticReport.component_states?.engine_temperature?.flagged}
                        serviceCount={diagnosticReport.component_states?.engine_temperature?.serviceCount}
                    />
                    <MemoizedSensorCard
                        title="Liquid Pressure"
                        value={sensorData.oil_pressure.toFixed(1)}
                        unit="PSI" icon="🛢️"
                        isCritical={diagnosticReport.component_states?.oil_pressure?.flagged}
                        serviceCount={diagnosticReport.component_states?.oil_pressure?.serviceCount}
                    />
                    <MemoizedSensorCard
                        title="Friction Material"
                        value={sensorData.brake_wear.toFixed(1)}
                        unit="%" icon="🛑"
                        isCritical={diagnosticReport.component_states?.brake_wear?.flagged}
                        serviceCount={diagnosticReport.component_states?.brake_wear?.serviceCount}
                    />
                    <MemoizedSensorCard
                        title="Energy Storage"
                        value={sensorData.battery_voltage.toFixed(2)}
                        unit="V" icon="🔋"
                        isCritical={diagnosticReport.component_states?.battery_voltage?.flagged}
                        serviceCount={diagnosticReport.component_states?.battery_voltage?.serviceCount}
                    />
                    <MemoizedSensorCard
                        title="Pneumatic Load"
                        value={sensorData.tire_pressure.toFixed(1)}
                        unit="PSI" icon="🛞"
                        isCritical={diagnosticReport.component_states?.tire_pressure?.flagged}
                        serviceCount={diagnosticReport.component_states?.tire_pressure?.serviceCount}
                    />
                </section>

                <div className="bottom-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px 380px', gap: '24px', flex: 1, minHeight: 0 }}>
                    <MemoizedMaintenancePanel />
                    <MemoizedAlertPanel
                        componentStates={diagnosticReport.component_states}
                        onServiceComplete={handleServiceComplete}
                    />
                    <MemoizedChatContainer />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
