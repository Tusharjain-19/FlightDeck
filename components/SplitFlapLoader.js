import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SplitFlapLoader.module.css';

const initialMatrix = [
  ['N', 'E', 'W', ' ', 'D', 'E', 'L', 'H', 'I', ' ', ' ', 'D', 'E', 'L', ' ', '0', '8', ':', '3', '0'],
  ['M', 'U', 'M', 'B', 'A', 'I', ' ', ' ', ' ', ' ', ' ', 'B', 'O', 'M', ' ', '1', '0', ':', '1', '5'],
  ['B', 'E', 'N', 'G', 'A', 'L', 'U', 'R', 'U', ' ', ' ', 'B', 'L', 'R', ' ', '1', '1', ':', '4', '5'],
  ['J', 'A', 'I', 'P', 'U', 'R', ' ', ' ', ' ', ' ', ' ', 'J', 'A', 'I', ' ', '1', '3', ':', '2', '0'],
  ['D', 'U', 'B', 'A', 'I', ' ', ' ', ' ', ' ', ' ', ' ', 'D', 'X', 'B', ' ', '1', '5', ':', '0', '0'],
  ['K', 'O', 'L', 'K', 'A', 'T', 'A', ' ', ' ', ' ', ' ', 'C', 'C', 'U', ' ', '1', '6', ':', '3', '0'],
  ['S', 'R', 'I', 'N', 'A', 'G', 'A', 'R', ' ', ' ', ' ', 'S', 'X', 'R', ' ', '1', '8', ':', '1', '0'],
  ['H', 'Y', 'D', 'E', 'R', 'A', 'B', 'A', 'D', ' ', ' ', 'H', 'Y', 'D', ' ', '1', '9', ':', '4', '0'],
  ['G', 'O', 'A', ' ', 'M', 'O', 'P', 'A', ' ', ' ', ' ', 'G', 'O', 'X', ' ', '2', '1', ':', '0', '5'],
  ['C', 'H', 'E', 'N', 'N', 'A', 'I', ' ', ' ', ' ', ' ', 'M', 'A', 'A', ' ', '2', '2', ':', '2', '0'],
  ['K', 'O', 'C', 'H', 'I', ' ', ' ', ' ', ' ', ' ', ' ', 'C', 'O', 'K', ' ', '2', '3', ':', '4', '5']
];

const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:- ';

export default function SplitFlapLoader({ 
  routeTitle = 'Live Airspace Radar Search',
  routeSubtitle = 'Querying Live ADS-B Transponders & Schedules'
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [board, setBoard] = useState(initialMatrix);
  const [animatingTiles, setAnimatingTiles] = useState({});

  const statusMessages = [
    'Getting all available flights...',
    'Connecting to nearest airport radar feeds...',
    'Scanning Indian airspace & en-route traffic...',
    'Resolving live transponder altitudes & trajectories...',
    'Synchronizing gate, terminal & arrival telemetry...'
  ];

  // Rotate status messages smoothly
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 1600);
    return () => clearInterval(statusInterval);
  }, [statusMessages.length]);

  // Authentic mechanical split-flap flip cycling
  useEffect(() => {
    const flapInterval = setInterval(() => {
      const flips = {};
      setBoard(prevBoard => {
        return prevBoard.map((row, rIdx) => {
          return row.map((char, cIdx) => {
            if (Math.random() < 0.16 && char !== ' ') {
              const key = `${rIdx}-${cIdx}`;
              flips[key] = true;
              const randChar = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
              return randChar;
            }
            return char;
          });
        });
      });
      setAnimatingTiles(flips);
    }, 180);

    return () => clearInterval(flapInterval);
  }, []);

  return (
    <div className={styles.fullScreenCinema} role="status" aria-live="polite">
      {/* Dark Ambient Vignette Background */}
      <div className={styles.ambientVignette} />

      {/* Top Floating Header Bar */}
      <header className={styles.topHeader}>
        <div className={styles.topHeaderInner}>
          <div className={styles.brandBadge}>
            <Image
              src="/logo.png"
              alt="FlightDeck Logo"
              width={32}
              height={32}
              className={styles.brandLogoImg}
              priority
            />
          </div>

          <div className={styles.routeHeaderInfo}>
            <h1 className={styles.routeMainTitle}>{routeTitle}</h1>
            <div className={styles.routeSubMeta}>
              <span className={styles.radarLivePill}>
                <span className={styles.livePulseDot} />
                LIVE RADAR
              </span>
              <span className={styles.routeSubText}>{routeSubtitle}</span>
            </div>
          </div>

          <div className={styles.headerRightPlaceholder} />
        </div>
      </header>

      {/* Full-Screen Edge-to-Edge Mechanical Split-Flap Matrix */}
      <main className={styles.matrixViewport}>
        <div className={styles.matrixContainer}>
          {board.map((row, rIdx) => (
            <div key={rIdx} className={styles.matrixRow}>
              {row.map((ch, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const isFlipping = animatingTiles[key];
                return (
                  <div 
                    key={cIdx} 
                    className={`${styles.flapTile} ${ch !== ' ' ? styles.flapTileActive : styles.flapTileSpace} ${isFlipping ? styles.flapFlipping : ''}`}
                  >
                    <span className={styles.flapLetter}>{ch}</span>
                    <div className={styles.tileSplitHinge} />
                    <div className={styles.tileGlossReflection} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Floating Bottom Drawer / Progress Card (Inspired by inspo/searchingloding1.jpeg) */}
      <footer className={styles.bottomDrawer}>
        <div className={styles.bottomDrawerCard}>
          <div className={styles.progressTrack}>
            <div className={styles.progressGlowBar} />
          </div>

          <div className={styles.statusRow}>
            <svg className={styles.spinnerSvg} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            <span className={styles.statusMessage}>{statusMessages[statusIndex]}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
