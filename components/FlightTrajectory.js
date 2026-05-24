'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FlightTrajectory.module.css';

const iataTimezoneMap = {
  // Indian Airports
  'DEL': 'Asia/Kolkata', 'BOM': 'Asia/Kolkata', 'BLR': 'Asia/Kolkata', 'CCU': 'Asia/Kolkata',
  'MAA': 'Asia/Kolkata', 'HYD': 'Asia/Kolkata', 'COK': 'Asia/Kolkata', 'AMD': 'Asia/Kolkata',
  'PNQ': 'Asia/Kolkata', 'JAI': 'Asia/Kolkata', 'IXL': 'Asia/Kolkata', 'GOI': 'Asia/Kolkata',
  'GOX': 'Asia/Kolkata', 'TRV': 'Asia/Kolkata', 'SXR': 'Asia/Kolkata', 'IXB': 'Asia/Kolkata',
  'GAU': 'Asia/Kolkata', 'LKO': 'Asia/Kolkata', 'PAT': 'Asia/Kolkata', 'BBI': 'Asia/Kolkata',
  'IND': 'Asia/Kolkata', 'VGA': 'Asia/Kolkata', 'IXC': 'Asia/Kolkata', 'CJB': 'Asia/Kolkata',
  'NAG': 'Asia/Kolkata', 'BDQ': 'Asia/Kolkata', 'SXV': 'Asia/Kolkata', 'JLR': 'Asia/Kolkata',
  'VTZ': 'Asia/Kolkata', 'IXR': 'Asia/Kolkata', 'IXJ': 'Asia/Kolkata', 'IXZ': 'Asia/Kolkata',
  // International
  'JFK': 'America/New_York', 'LHR': 'Europe/London', 'DXB': 'Asia/Dubai', 'SIN': 'Asia/Singapore',
  'HND': 'Asia/Tokyo', 'NRT': 'Asia/Tokyo', 'CDG': 'Europe/Paris', 'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam', 'HKG': 'Asia/Hong_Kong', 'SYD': 'Australia/Sydney', 'MEL': 'Australia/Melbourne',
  'BKK': 'Asia/Bangkok', 'KUL': 'Asia/Kuala_Lumpur', 'ICN': 'Asia/Seoul', 'PEK': 'Asia/Shanghai',
  'PVG': 'Asia/Shanghai', 'ORD': 'America/Chicago', 'LAX': 'America/Los_Angeles', 'SFO': 'America/Los_Angeles',
  'MIA': 'America/New_York', 'DFW': 'America/Chicago', 'ATL': 'America/New_York', 'YYZ': 'America/Toronto',
  'YVR': 'America/Vancouver', 'MAD': 'Europe/Madrid', 'FCO': 'Europe/Rome', 'MUC': 'Europe/Munich',
  'IST': 'Europe/Istanbul', 'DOH': 'Asia/Qatar', 'AUH': 'Asia/Dubai', 'KIX': 'Asia/Tokyo', 'TPE': 'Asia/Taipei'
};

const iataCityMap = {
  // Indian Airports
  'DEL': 'New Delhi', 'BOM': 'Mumbai', 'BLR': 'Bengaluru', 'CCU': 'Kolkata',
  'MAA': 'Chennai', 'HYD': 'Hyderabad', 'COK': 'Kochi', 'AMD': 'Ahmedabad',
  'PNQ': 'Pune', 'JAI': 'Jaipur', 'IXL': 'Leh', 'GOI': 'Goa',
  'GOX': 'Goa (Mopa)', 'TRV': 'Thiruvananthapuram', 'SXR': 'Srinagar', 'IXB': 'Bagdogra',
  'GAU': 'Guwahati', 'LKO': 'Lucknow', 'PAT': 'Patna', 'BBI': 'Bhubaneswar',
  'IND': 'Indore', 'VGA': 'Vijayawada', 'IXC': 'Chandigarh', 'CJB': 'Coimbatore',
  'NAG': 'Nagpur', 'BDQ': 'Vadodara', 'SXV': 'Salem', 'JLR': 'Jabalpur',
  'VTZ': 'Visakhapatnam', 'IXR': 'Ranchi', 'IXJ': 'Jammu', 'IXZ': 'Port Blair',
  // International
  'JFK': 'New York', 'LHR': 'London', 'DXB': 'Dubai', 'SIN': 'Singapore',
  'HND': 'Tokyo', 'NRT': 'Tokyo', 'CDG': 'Paris', 'FRA': 'Frankfurt',
  'AMS': 'Amsterdam', 'HKG': 'Hong Kong', 'SYD': 'Sydney', 'MEL': 'Melbourne',
  'BKK': 'Bangkok', 'KUL': 'Kuala Lumpur', 'ICN': 'Seoul', 'PEK': 'Beijing',
  'PVG': 'Shanghai', 'ORD': 'Chicago', 'LAX': 'Los Angeles', 'SFO': 'San Francisco',
  'MIA': 'Miami', 'DFW': 'Dallas', 'ATL': 'Atlanta', 'YYZ': 'Toronto',
  'YVR': 'Vancouver', 'MAD': 'Madrid', 'FCO': 'Rome', 'MUC': 'Munich',
  'IST': 'Istanbul', 'DOH': 'Doha', 'AUH': 'Abu Dhabi', 'KIX': 'Osaka', 'TPE': 'Taipei'
};

function resolveTimezone(iata, apiTimezone) {
  if (apiTimezone) return apiTimezone;
  if (!iata) return null;
  const code = iata.toUpperCase().trim();
  return iataTimezoneMap[code] || null;
}

function getUtcTimeFromLocal(dateStr, timezone) {
  if (!dateStr) return 0;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return new Date(dateStr).getTime();

  const [_, yr, mo, dy, hr, min, sec] = match;
  
  try {
    const utcDate = new Date(Date.UTC(parseInt(yr, 10), parseInt(mo, 10) - 1, parseInt(dy, 10), parseInt(hr, 10), parseInt(min, 10), parseInt(sec, 10)));
    if (!timezone) return utcDate.getTime();
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(utcDate);
    const partMap = {};
    parts.forEach(p => partMap[p.type] = p.value);
    
    const formattedDate = new Date(Date.UTC(
      parseInt(partMap.year, 10),
      parseInt(partMap.month, 10) - 1,
      parseInt(partMap.day, 10),
      parseInt(partMap.hour, 10),
      parseInt(partMap.minute, 10),
      parseInt(partMap.second, 10)
    ));
    
    const diff = formattedDate.getTime() - utcDate.getTime();
    return utcDate.getTime() - diff;
  } catch (e) {
    return new Date(dateStr).getTime();
  }
}

function formatLocalTime(dateStr) {
  if (!dateStr) return '--:--';
  const match = dateStr.match(/T(\d{2}):(\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calculateProgress(departure, arrival, status, live) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s === 'landed' || s === 'arrived') return 1;
  if (s === 'scheduled' || s === 'cancelled') return 0;

  const altitude = live?.altitude ? Math.round(live.altitude) : null;
  const isEnRoute = s === 'active' || s === 'en-route';

  if (!departure?.scheduled || !arrival?.scheduled) {
    if (isEnRoute) {
      if (altitude) {
        if (altitude > 9000) return 0.5;
        if (altitude > 6000) return 0.35;
        if (altitude > 3000) return 0.2;
      }
      return 0.5;
    }
    return 0;
  }

  const depTz = resolveTimezone(departure.iata, departure.timezone);
  const arrTz = resolveTimezone(arrival.iata, arrival.timezone);
  const depTime = getUtcTimeFromLocal(departure.actual || departure.scheduled, depTz);
  const arrTime = getUtcTimeFromLocal(arrival.estimated || arrival.scheduled, arrTz);
  const now = Date.now();

  // If flight is active but departure scheduled time is in the future relative to now,
  // we have a date/timezone/clock mismatch. Fallback to altitude-based progress.
  if (isEnRoute && now <= depTime) {
    if (altitude) {
      if (altitude > 9000) return 0.5;
      if (altitude > 6000) return 0.35;
      if (altitude > 3000) return 0.2;
    }
    return 0.15; // default takeoff progress
  }

  // If flight is active but arrival scheduled time is in the past, show final approach
  if (isEnRoute && now >= arrTime) {
    return 0.95;
  }

  let p = (now - depTime) / (arrTime - depTime);
  if (isNaN(p) || p < 0 || p > 1) {
    p = 0.5;
  }

  return 0.1 + 0.85 * p;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}


function getPointOnArc(t, width, height, padding) {
  const startX = padding;
  const endX = width - padding;
  const x = startX + (endX - startX) * t;

  // Parabolic curve: peaks at t=0.5
  const peakHeight = height * 0.55;
  const baseY = height * 0.72;
  const y = baseY - (4 * peakHeight * t * (1 - t));

  return { x, y };
}

function getMilestones(status) {
  const milestones = [
    { id: 'gate', label: 'GATE', t: 0 },
    { id: 'takeoff', label: 'TAKEOFF', t: 0.1 },
    { id: 'climb', label: 'CLIMB', t: 0.25 },
    { id: 'cruise', label: 'CRUISE', t: 0.5 },
    { id: 'descent', label: 'DESCENT', t: 0.75 },
    { id: 'approach', label: 'APPROACH', t: 0.9 },
    { id: 'landed', label: 'LANDED', t: 1.0 },
  ];

  return milestones;
}

function shortenAirportName(name) {
  if (!name) return 'N/A';
  // Remove words like "International", "Airport", "Hub", etc.
  let clean = name
    .replace(/\b(International|Airport|Field|Regional|Municipal|Helipart|Intercontinental|Spacial|ICAO|IATA)\b/gi, '')
    .trim();
  // Limit length
  if (clean.length > 18) {
    clean = clean.substring(0, 16) + '...';
  }
  return clean || name;
}

export default function FlightTrajectory({ flight }) {
  const svgRef = useRef(null);
  const completedPathRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height: 280 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        // Set minimum height to 190 to avoid cutting off labels on mobile
        setDims({ width: rect.width, height: Math.max(190, Math.min(280, rect.width * 0.42)) });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progress = calculateProgress(flight.departure, flight.arrival, flight.flight_status, flight.live);
  const { width, height } = dims;
  const padding = 60;
  const milestones = getMilestones(flight.flight_status);

  // Completed arc drawing animation
  useEffect(() => {
    const path = completedPathRef.current;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.getBoundingClientRect(); // force reflow
      path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)';
      path.style.strokeDashoffset = '0';
    }
  }, [progress, width]);

  // Build arc path
  const arcPoints = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const pt = getPointOnArc(t, width, height, padding);
    arcPoints.push(`${pt.x},${pt.y}`);
  }
  const arcPath = `M ${arcPoints.join(' L ')}`;

  // Completed arc (up to progress)
  const completedPoints = [];
  const steps = Math.floor(progress * 100);
  for (let i = 0; i <= steps; i++) {
    const t = i / 100;
    const pt = getPointOnArc(t, width, height, padding);
    completedPoints.push(`${pt.x},${pt.y}`);
  }
  const completedPath = completedPoints.length > 1 ? `M ${completedPoints.join(' L ')}` : '';

  // Plane position
  const planePos = getPointOnArc(progress, width, height, padding);

  // Plane rotation (+90 degrees offset since default SVG plane shape points UP)
  const prevPos = getPointOnArc(Math.max(0, progress - 0.02), width, height, padding);
  const nextPos = getPointOnArc(Math.min(1, progress + 0.02), width, height, padding);
  const angle = Math.atan2(nextPos.y - prevPos.y, nextPos.x - prevPos.x) * (180 / Math.PI) + 90;

  const depIata = flight.departure?.iata || '---';
  const arrIata = flight.arrival?.iata || '---';
  const statusText = flight.flight_status || 'unknown';
  const flightIata = flight.flight?.iata || flight.flight?.icao || 'N/A';

  // Advanced Telemetry (Converted to Aviation Standard Units)
  const isLive = flight.live !== null && flight.live !== undefined;
  const speedKts = flight.live?.speed_horizontal ? Math.round(flight.live.speed_horizontal * 0.539957) : null;
  const altitudeFt = flight.live?.altitude ? Math.round(flight.live.altitude * 3.28084) : null;
  const heading = flight.live?.direction !== undefined ? Math.round(flight.live.direction) : null;
  const vSpeedFpm = flight.live?.v_speed !== undefined ? Math.round(flight.live.v_speed * 196.85) : null;

  const delayVal = flight.departure?.delay || flight.arrival?.delay || 0;
  const baseY = height * 0.72;

  return (
    <div className={styles.trajectoryCard}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.flightBadge}>{flightIata}</span>
          {flight.live?.registration && (
            <span className={styles.regBadge}>{flight.live.registration}</span>
          )}
          <span className={styles.airline}>{flight.airline?.name || ''}</span>
          {isLive && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              <span className={styles.liveText}>LIVE</span>
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          {delayVal > 0 && (
            <span className={styles.delayPill}>
              +{delayVal}M DELAY
            </span>
          )}
          <span className={`${styles.statusPill} ${styles[`status_${statusText.replace(/[^a-z]/g, '')}`] || ''}`}>
            {statusText.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Telemetry gauges */}
      {isLive && (
        <div className={styles.telemetry}>
          {speedKts !== null && (
            <div className={styles.gauge}>
              <div className={styles.gaugeValue}>{speedKts}</div>
              <div className={styles.gaugeLabel}>KTS</div>
              <div className={styles.gaugeTitle}>SPEED</div>
            </div>
          )}
          {altitudeFt !== null && (
            <div className={styles.gauge}>
              <div className={styles.gaugeValue}>{altitudeFt.toLocaleString()}</div>
              <div className={styles.gaugeLabel}>FT</div>
              <div className={styles.gaugeTitle}>ALTITUDE</div>
            </div>
          )}
          {heading !== null && (
            <div className={styles.gauge}>
              <div className={styles.gaugeValue}>
                {heading}° <span style={{display: 'inline-block', transform: `rotate(${heading}deg)`, marginLeft: '4px'}}>↑</span>
              </div>
              <div className={styles.gaugeLabel}>HDG</div>
              <div className={styles.gaugeTitle}>HEADING</div>
            </div>
          )}
          {vSpeedFpm !== null && Math.abs(vSpeedFpm) > 50 && (
            <div className={styles.gauge}>
              <div className={styles.gaugeValue} style={{ color: vSpeedFpm > 0 ? '#10b981' : '#ef4444' }}>
                {vSpeedFpm > 0 ? '+' : ''}{vSpeedFpm}
              </div>
              <div className={styles.gaugeLabel}>FPM</div>
              <div className={styles.gaugeTitle}>V. SPEED</div>
            </div>
          )}
          {flight.live?.squawk && (
            <div className={styles.gauge}>
              <div className={styles.gaugeValue} style={{ color: '#8b5cf6' }}>{flight.live.squawk}</div>
              <div className={styles.gaugeLabel}>SQK</div>
              <div className={styles.gaugeTitle}>SQUAWK</div>
            </div>
          )}
        </div>
      )}

      {/* SVG Trajectory */}
      <div className={styles.svgContainer} ref={svgRef}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          className={styles.svg}
        >
          {/* Ground line */}
          <line
            x1={padding - 20}
            y1={baseY}
            x2={width - padding + 20}
            y2={baseY}
            stroke="var(--trajectory-line)"
            strokeWidth="1"
          />

          {/* Full arc (background) */}
          <path
            d={arcPath}
            fill="none"
            stroke="var(--trajectory-line)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Completed arc */}
          {completedPath && (
            <path
              ref={completedPathRef}
              d={completedPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Milestone dots and labels */}
          {milestones.map((m) => {
            const pt = getPointOnArc(m.t, width, height, padding);
            const isCompleted = progress >= m.t;
            const isCurrent = Math.abs(progress - m.t) < 0.08;
            return (
              <g key={m.id}>
                {/* Vertical tick */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={baseY}
                  stroke={isCompleted ? 'rgba(59,130,246,0.3)' : 'var(--trajectory-line)'}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isCurrent ? 5 : 3}
                  fill={isCompleted ? '#3b82f6' : 'var(--text-muted)'}
                />
                {isCurrent && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Label */}
                <text
                  x={pt.x}
                  y={baseY + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="600"
                  letterSpacing="0.06em"
                  fill={isCompleted ? '#3b82f6' : 'var(--text-muted)'}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Departure code */}
          <text
            x={padding}
            y={baseY + 38}
            textAnchor="middle"
            fontSize="18"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="700"
            fill="var(--trajectory-text)"
          >
            {depIata}
          </text>
          
          {/* Departure airport name (Not city name) */}
          <text
            x={padding}
            y={baseY + 50}
            textAnchor="middle"
            fontSize="9"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="500"
            fill="var(--text-secondary)"
          >
            {iataCityMap[depIata] ? `${iataCityMap[depIata]}` : shortenAirportName(flight.departure?.airport || '')}
          </text>

          {/* Arrival code */}
          <text
            x={width - padding}
            y={baseY + 38}
            textAnchor="middle"
            fontSize="18"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="700"
            fill="var(--trajectory-text)"
          >
            {arrIata}
          </text>

          {/* Arrival airport name (Not city name) */}
          <text
            x={width - padding}
            y={baseY + 50}
            textAnchor="middle"
            fontSize="9"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="500"
            fill="var(--text-secondary)"
          >
            {iataCityMap[arrIata] ? `${iataCityMap[arrIata]}` : shortenAirportName(flight.arrival?.airport || '')}
          </text>

          {/* Plane speed tag above plane */}
          {speedKts !== null && (
            <g transform={`translate(${planePos.x}, ${planePos.y - 24})`}>
              <rect x="-38" y="-9" width="76" height="15" rx="3" fill="var(--bg-secondary)" stroke="#3b82f6" strokeWidth="0.8" />
              <text x="0" y="2" textAnchor="middle" fontSize="8.5" fontFamily="'IBM Plex Mono', monospace" fontWeight="700" fill="#3b82f6">
                {speedKts} KTS
              </text>
            </g>
          )}

          {/* Plane icon (scaled up and rotated facing the flight path) */}
          <g transform={`translate(${planePos.x}, ${planePos.y}) rotate(${angle})`}>
            <g transform="translate(-16.8, -16.8) scale(1.4)">
              <path
                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                fill="var(--trajectory-text)"
              />
            </g>
            {/* Plane glow */}
            <circle cx="0" cy="0" r="22" fill="var(--accent-glow)" className={styles.glowPulse} />
          </g>
        </svg>
      </div>

      {/* Timer bar */}
      <div className={styles.timerBar}>
        <div className={styles.timerSection}>
          <span className={styles.timerLabel}>DEP</span>
          <span className={styles.timerValue}>
            {formatLocalTime(flight.departure?.scheduled)}
          </span>
          <span className={styles.timerDate}>
            {flight.departure?.scheduled ? formatDate(flight.departure.scheduled) : ''}
          </span>
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.progressPercent}>{Math.round(progress * 100)}%</span>
        </div>
        <div className={styles.timerSection} style={{ textAlign: 'right' }}>
          <span className={styles.timerLabel}>ARR</span>
          <span className={styles.timerValue}>
            {formatLocalTime(flight.arrival?.scheduled)}
          </span>
          <span className={styles.timerDate}>
            {flight.arrival?.scheduled ? formatDate(flight.arrival.scheduled) : ''}
          </span>
        </div>
      </div>

      {/* Terminal & Belt Info */}
      <div className={styles.facilityBar}>
        <div className={styles.facilitySection}>
          {flight.departure?.terminal && <span className={styles.facilityItem}>T{flight.departure.terminal}</span>}
          {flight.departure?.gate && <span className={styles.facilityItem}>Gate {flight.departure.gate}</span>}
        </div>
        <div className={styles.facilitySection} style={{ justifyContent: 'flex-end' }}>
          {flight.arrival?.terminal && <span className={styles.facilityItem}>T{flight.arrival.terminal}</span>}
          {flight.arrival?.gate && <span className={styles.facilityItem}>Gate {flight.arrival.gate}</span>}
          {flight.arrival?.baggage && <span className={styles.facilityItem}>Belt {flight.arrival.baggage}</span>}
        </div>
      </div>

    </div>
  );
}

