import React from 'react';
import '../App.css';

const SensorCard = ({ title, value, unit, isCritical, icon }) => {
  return (
    <div className={`sensor-card ${isCritical ? 'alert critical-pulse' : ''}`}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="sensor-title">{title}</h3>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div className="card-body">
        <div className="sensor-value" style={{ color: isCritical ? '#ef4444' : '#10b981' }}>
          {value}
          <span className="sensor-unit" style={{ marginLeft: 4 }}>{unit}</span>
        </div>
        {/* Simple Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
          <div 
            style={{ 
              width: `${Math.min(value, 100)}%`, // Normalize based on actual min/max later
              height: '100%', 
              background: isCritical ? '#ef4444' : '#10b981',
              transition: 'width 0.5s ease-in-out, background-color 0.3s'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
