'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTheme } from './ThemeProvider';
import styles from './SplitFlapLoader.module.css';

const COLS = 16;
const ROWS = 14;
const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -:>';

// 16-column Solari departure matrix rows modeled after authentic international airport FIDS boards
const BASE_ROWS = [
  'SAN FRANCISCO CA',
  'RIO DE JANEIRO  ',
  'BOSTON     DUBAI',
  '04:26     DENVER',
  'PANAMA      CITY',
  'AUCKLAND  HAVANA',
  'LIMA      CANCUN',
  'DOHA LOS ANGELES',
  '11:40    SEATTLE',
  'SEATTLE      AMS',
  'DELHI  -> MUMBAI',
  'BENGALURU -> BOM',
  'FRANKFURT  TOKYO',
  'ZURICH SINGAPORE'
];

const LOADING_STAGES = [
  { 
    text: 'Accessing Global Aviation Telemetry', 
    sub: 'Querying direct airline schedules & live radar transponders...', 
    minPct: 10,
    maxPct: 35 
  },
  { 
    text: 'Scanning Nonstop Corridors & Fares', 
    sub: 'Comparing Air India, IndiGo, Akasa Air, Vistara, SpiceJet...', 
    minPct: 36,
    maxPct: 64 
  },
  { 
    text: 'Computing Airway Vectors & Altitude', 
    sub: 'Calculating live flight corridors, climb profiles & gate assignments...', 
    minPct: 65,
    maxPct: 86 
  },
  { 
    text: 'Compiling FIDS Terminal Schedule', 
    sub: 'Assembling digital boarding passes & verified ADS-B telemetry...', 
    minPct: 87,
    maxPct: 98 
  }
];

export default function SplitFlapLoader({
  routeTitle,
  routeSubtitle
}) {
  const { theme } = useTheme() || { theme: 'dark' };
  const isLight = theme === 'light';

  // Build dynamic initial board matching search query
  const initialRows = useMemo(() => {
    const rows = [...BASE_ROWS];

    if (routeTitle && (routeTitle.includes('→') || routeTitle.includes('->') || routeTitle.toLowerCase().includes(' to '))) {
      const parts = routeTitle.split(/[→\->]| to /i).map(s => s.trim().toUpperCase());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const orig = parts[0].replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const dest = parts[1].replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const customLine = `${orig.padEnd(6, ' ')} -> ${dest.padStart(6, ' ')}`;
        rows[11] = customLine.padEnd(COLS, ' ').slice(0, COLS);
      }
    } else if (routeTitle) {
      const cleanTitle = routeTitle.replace(/[^A-Z0-9 ]/gi, '').toUpperCase().slice(0, COLS);
      rows[11] = cleanTitle.padEnd(COLS, ' ').slice(0, COLS);
    }

    return rows.map(r => r.padEnd(COLS, ' ').slice(0, COLS));
  }, [routeTitle]);

  // Matrix cell characters and flipping state
  const [gridChars, setGridChars] = useState(() => 
    initialRows.map(rowStr => rowStr.split(''))
  );
  const [flippingCells, setFlippingCells] = useState({});

  // Dynamic Telemetry & Progress States
  const [progressPct, setProgressPct] = useState(24);
  const [stageIndex, setStageIndex] = useState(0);

  // Active continuous mechanical Solari Split-Flap animation loop
  useEffect(() => {
    const flapInterval = setInterval(() => {
      const flips = {};
      const numFlaps = Math.floor(Math.random() * 8) + 6; // Flip 6 to 14 tiles simultaneously across the board

      setGridChars(prevGrid => {
        const nextGrid = prevGrid.map(row => [...row]);

        for (let i = 0; i < numFlaps; i++) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          const key = `${r}-${c}`;

          // Keep target route row mostly stable for legibility, but let other rows flip actively
          if (r === 11 && Math.random() > 0.08) continue;

          flips[key] = true;

          if (Math.random() > 0.4) {
            nextGrid[r][c] = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
          } else {
            nextGrid[r][c] = initialRows[r][c];
          }
        }

        return nextGrid;
      });

      setFlippingCells(flips);

      setTimeout(() => {
        setFlippingCells({});
      }, 220);
    }, 120);

    return () => clearInterval(flapInterval);
  }, [initialRows]);

  // Settle target route back to clear text periodically
  useEffect(() => {
    const settleInterval = setInterval(() => {
      setGridChars(prevGrid => {
        const nextGrid = prevGrid.map((row, r) => {
          if (r === 11) {
            return initialRows[r].split('');
          }
          return row;
        });
        return nextGrid;
      });
    }, 900);

    return () => clearInterval(settleInterval);
  }, [initialRows]);

  // Progressive live loading ticker
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgressPct(prev => {
        const inc = Math.random() * 2.8 + 1.2;
        const next = prev + inc;
        return next >= 98 ? 98 : next;
      });
    }, 320);

    return () => clearInterval(progressTimer);
  }, []);

  // Update current stage message based on progress percentage
  useEffect(() => {
    const rounded = Math.round(progressPct);
    const idx = LOADING_STAGES.findIndex(s => rounded >= s.minPct && rounded <= s.maxPct);
    if (idx !== -1 && idx !== stageIndex) {
      setStageIndex(idx);
    }
  }, [progressPct, stageIndex]);

  const currentStage = LOADING_STAGES[stageIndex] || LOADING_STAGES[0];
  const displayPct = Math.min(98, Math.round(progressPct));

  return (
    <div 
      className={`${styles.screenWrapper} ${isLight ? styles.lightTheme : styles.darkTheme}`} 
      role="status" 
      aria-live="polite"
    >
      {/* Ambient Airport Terminal Atmosphere */}
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.radarScanlines} aria-hidden="true" />

      {/* Center Stage: Edge-to-Edge Full-Screen Split-Flap Solari Board */}
      <main className={styles.fullScreenCenterStage}>
        <div className={styles.fullScreenBoardCard}>
          {/* Subtle Grid Dot Matrix Overlay */}
          <div className={styles.gridOverlay} />

          {/* Solari Split-Flap Matrix Grid (16 Columns x 14 Rows) */}
          <div className={styles.matrixGrid}>
            {gridChars.map((rowChars, r) => {
              const isTargetRow = r === 11;
              const isSecondaryRow = r === 12;

              return rowChars.map((ch, c) => {
                const key = `${r}-${c}`;
                const isFlipping = Boolean(flippingCells[key]);

                let cellModifier = styles.cellDefault;
                let textModifier = styles.textDefault;

                if (isTargetRow) {
                  cellModifier = styles.cellHighlightedRoute;
                  textModifier = styles.textHighlightedRoute;
                } else if (isSecondaryRow && c < 10) {
                  cellModifier = styles.cellSecondaryRoute;
                  textModifier = styles.textSecondaryRoute;
                }

                return (
                  <div
                    key={key}
                    className={`${styles.letterCell} ${cellModifier} ${isFlipping ? styles.flapFlip : ''}`}
                    aria-hidden="true"
                  >
                    {/* Mechanical Horizontal Split Hinge */}
                    <div className={styles.tileSplitHinge} />
                    {/* Top Flap Specular Reflection */}
                    <div className={styles.tileReflection} />
                    
                    <span className={`${styles.cellLetter} ${textModifier}`}>
                      {ch === ' ' ? '' : ch}
                    </span>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </main>

      {/* Bottom Floating Telemetry & Loading Progress Dock */}
      <footer className={styles.bottomLoaderWrapper}>
        <div className={styles.bottomLoaderCard}>
          {/* Progress Track with Gradient Shimmer */}
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${displayPct}%` }}
            />
            <div className={styles.progressShimmer} />
          </div>

          <div className={styles.progressDetailsRow}>
            <div className={styles.progressLeftGroup}>
              {/* Rotating Aeronautical Compass Spinner */}
              <div className={styles.airplaneRadarOrb}>
                <svg 
                  className={styles.radarSweepSpinner} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                <svg 
                  className={styles.airplaneIcon} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>

              {/* Progress Messages */}
              <div className={styles.statusTextCol}>
                <p className={styles.statusMainText}>{currentStage.text}</p>
                <p className={styles.statusSubText}>{currentStage.sub}</p>
              </div>
            </div>

            {/* Percentage Badge */}
            <div className={styles.percentBadge}>
              {displayPct}%
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
