'use client';

import { useSettings } from '../../lib/settingsContext';
import styles from './settings.module.css';

export default function SettingsPage() {
  const {
    settings,
    updateSetting,
    convertSpeed,
    convertAltitude,
    convertVSpeed,
    formatTimeWithPref
  } = useSettings();

  const handleReset = () => {
    updateSetting('speedUnit', 'kts');
    updateSetting('altitudeUnit', 'ft');
    updateSetting('vSpeedUnit', 'fpm');
    updateSetting('timeFormat', '12h');
    updateSetting('defaultAirportWindow', '4h');
    updateSetting('showLandmarkWatermark', true);
    updateSetting('showGauges', true);
  };

  const sampleSpeed = 485; // Kts
  const sampleAlt = 34000; // Ft
  const sampleVSpeed = 1200; // Fpm
  const sampleTime = '2026-11-02T15:45:00';

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          SYSTEM CONFIGURATION
        </span>
        <h1 className={styles.title}>FlightDeck Preferences</h1>
        <p className={styles.subtitle}>
          Configure your preferred measurement units, schedule time-window filters, and boarding pass aesthetics.
        </p>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* 1. Velocity / Ground Speed Unit */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            Aircraft Speed Unit
          </h2>
          <p className={styles.cardDesc}>
            Unit used for aircraft telemetry, ground speed badges on radar, and boarding pass specs.
          </p>
          <div className={styles.optionPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.speedUnit === 'kts' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('speedUnit', 'kts')}
            >
              <span>KTS</span>
              <span className={styles.pillSub}>(Knots - ICAO Standard)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.speedUnit === 'kmh' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('speedUnit', 'kmh')}
            >
              <span>KM/H</span>
              <span className={styles.pillSub}>(Kilometers per Hour)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.speedUnit === 'mph' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('speedUnit', 'mph')}
            >
              <span>MPH</span>
              <span className={styles.pillSub}>(Miles per Hour)</span>
            </button>
          </div>
        </div>

        {/* 2. Altitude Unit */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
            Flight Altitude Unit
          </h2>
          <p className={styles.cardDesc}>
            Unit used for flight levels, barometric cruising altitude, and approach gradients.
          </p>
          <div className={styles.optionPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.altitudeUnit === 'ft' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('altitudeUnit', 'ft')}
            >
              <span>FT</span>
              <span className={styles.pillSub}>(Feet - Aviation Standard)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.altitudeUnit === 'm' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('altitudeUnit', 'm')}
            >
              <span>M</span>
              <span className={styles.pillSub}>(Meters - Metric Standard)</span>
            </button>
          </div>
        </div>

        {/* 3. Vertical Climb / Descent Speed */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Vertical Speed (Climb / Descent Rate)
          </h2>
          <p className={styles.cardDesc}>
            Unit used for climb and descent rates during takeoff, cruise, and approach phases.
          </p>
          <div className={styles.optionPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.vSpeedUnit === 'fpm' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('vSpeedUnit', 'fpm')}
            >
              <span>FPM</span>
              <span className={styles.pillSub}>(Feet per Minute)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.vSpeedUnit === 'ms' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('vSpeedUnit', 'ms')}
            >
              <span>M/S</span>
              <span className={styles.pillSub}>(Meters per Second)</span>
            </button>
          </div>
        </div>

        {/* 4. Time Display Format */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Time & Schedule Format
          </h2>
          <p className={styles.cardDesc}>
            Display format for departure, arrival, and boarding times on all passes and boards.
          </p>
          <div className={styles.optionPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.timeFormat === '12h' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('timeFormat', '12h')}
            >
              <span>12-Hour</span>
              <span className={styles.pillSub}>(e.g. 03:45 PM IST)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.timeFormat === '24h' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('timeFormat', '24h')}
            >
              <span>24-Hour</span>
              <span className={styles.pillSub}>(e.g. 15:45 Z Aviation Zulu)</span>
            </button>
          </div>
        </div>

        {/* 5. Default Airport Search Window */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Default Airport Flight Schedule Window
          </h2>
          <p className={styles.cardDesc}>
            When entering an airport code (e.g. DEL, BOM), this window determines the default upcoming flights filter.
          </p>
          <div className={styles.optionPills}>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.defaultAirportWindow === '2h' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('defaultAirportWindow', '2h')}
            >
              <span>Next 2 Hours</span>
              <span className={styles.pillSub}>(Immediate traffic)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.defaultAirportWindow === '4h' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('defaultAirportWindow', '4h')}
            >
              <span>Next 4 Hours</span>
              <span className={styles.pillSub}>(Standard window)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.defaultAirportWindow === '8h' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('defaultAirportWindow', '8h')}
            >
              <span>Next 8 Hours</span>
              <span className={styles.pillSub}>(Extended shift)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillBtn} ${settings.defaultAirportWindow === 'all' ? styles.pillActive : ''}`}
              onClick={() => updateSetting('defaultAirportWindow', 'all')}
            >
              <span>All Day Today</span>
              <span className={styles.pillSub}>(Full 24h schedule)</span>
            </button>
          </div>
        </div>

        {/* 6. Boarding Pass Watermark & Visuals */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Visual Display & Watermarks
          </h2>
          <p className={styles.cardDesc}>
            Control visual flourishes like transparent destination silhouettes and telemetry gauges.
          </p>
          
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabelGroup}>
              <span className={styles.toggleLabel}>Transparent Landmark Watermarks</span>
              <span className={styles.toggleSub}>
                Renders a subtle, transparent silhouette of the arrival city (e.g. Gateway of India, India Gate) in the ticket body.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.showLandmarkWatermark !== false}
                onChange={(e) => updateSetting('showLandmarkWatermark', e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabelGroup}>
              <span className={styles.toggleLabel}>Live Telemetry Gauges</span>
              <span className={styles.toggleSub}>
                Display speed, altitude, and heading gauges directly in the flight inspection drawer.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.showGauges !== false}
                onChange={(e) => updateSetting('showGauges', e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Live Settings Preview
          </h2>
          <p className={styles.cardDesc}>
            See how your unit selections and watermark settings look in real time:
          </p>

          <div className={styles.previewBox}>
            {settings.showLandmarkWatermark !== false && (
              <div
                className={styles.previewWatermark}
                style={{ backgroundImage: 'url(/destinations/mumbai_gateway.jpg)' }}
              />
            )}
            <div className={styles.previewContent}>
              <div className={styles.previewHeader}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>DEL → BOM</strong>
                  <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    AI 101 • FlightDeck 787
                  </span>
                </div>
                <span className={styles.previewBadge}>ACTIVE</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Departure: <strong>{formatTimeWithPref(sampleTime)}</strong>
              </div>

              <div className={styles.previewTelemetry}>
                <div className={styles.previewMetric}>
                  <div className={styles.previewMetricLabel}>Ground Speed</div>
                  <div className={styles.previewMetricVal}>
                    {convertSpeed(sampleSpeed).value} {convertSpeed(sampleSpeed).unit}
                  </div>
                </div>
                <div className={styles.previewMetric}>
                  <div className={styles.previewMetricLabel}>Altitude</div>
                  <div className={styles.previewMetricVal}>
                    {convertAltitude(sampleAlt).value} {convertAltitude(sampleAlt).unit}
                  </div>
                </div>
                <div className={styles.previewMetric}>
                  <div className={styles.previewMetricLabel}>Climb Rate</div>
                  <div className={styles.previewMetricVal} style={{ color: '#10b981' }}>
                    {convertVSpeed(sampleVSpeed).value} {convertVSpeed(sampleVSpeed).unit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="button" onClick={handleReset} className={styles.resetBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset to Aviation Defaults
          </button>
        </div>

      </div>
    </div>
  );
}
