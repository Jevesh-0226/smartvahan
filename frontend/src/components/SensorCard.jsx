/**
 * SensorCard – Individual vehicle telemetry display
 *
 * React.memo'd with custom comparison — only re-renders when
 * the actual displayed value changes (strings, booleans, numbers).
 * This prevents re-renders when Dashboard re-renders from other state.
 */

import React from 'react';
import '../App.css';

const SensorCard = React.memo(
  ({ title, value, unit, isCritical, icon, serviceCount }) => {
    return (
      <div className={`sensor-card ${isCritical ? 'critical' : ''}`}>
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <h3 className="sensor-title">{title}</h3>
          <div className="icon-container" aria-hidden="true">
            {icon}
          </div>
        </div>
        <div className="card-body">
          <div
            className="sensor-value"
            style={{ color: isCritical ? 'var(--accent-red)' : 'var(--accent-teal)' }}
          >
            {value}
            <span className="sensor-unit">{unit}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Service Count: {serviceCount || 0}
            </span>
          </div>

          <div
            className="progress-container"
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: `${Math.min(parseFloat(value) * 0.8, 100)}%`,
                height: '100%',
                background: isCritical ? 'var(--accent-red)' : 'var(--accent-teal)',
                boxShadow: isCritical ? '0 0 10px var(--accent-red)' : 'none',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                // GPU-accelerate the progress bar animation
                transform: 'translateZ(0)',
                willChange: 'width',
              }}
            />
          </div>
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if props actually changed
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.isCritical === nextProps.isCritical &&
    prevProps.serviceCount === nextProps.serviceCount
);

SensorCard.displayName = 'SensorCard';

export default SensorCard;
