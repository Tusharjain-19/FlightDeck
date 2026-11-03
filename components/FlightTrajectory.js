'use client';

import { useEffect, useRef, useState, useMemo, useId } from 'react';
import Image from 'next/image';
import { getAirlineInfo } from './airlineData';
import { useSettings } from '../lib/settingsContext';
import { getFlightPhase } from '../lib/flightPhase';
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
  if (!status) return 0.05;
  const s = status.toLowerCase();
  if (s === 'landed' || s === 'arrived') return 1.0;
  if (s === 'scheduled' || s === 'cancelled') return 0.0;

  const altitude = live?.altitude ? Math.round(live.altitude) : null;
  const isEnRoute = s === 'active' || s === 'en-route';

  if (!departure?.scheduled || !arrival?.scheduled) {
    if (isEnRoute) {
      if (altitude) {
        if (altitude > 9000) return 0.55;
        if (altitude > 6000) return 0.35;
        if (altitude > 3000) return 0.2;
      }
      return 0.5;
    }
    return 0.05;
  }

  const depTz = resolveTimezone(departure.iata, departure.timezone);
  const arrTz = resolveTimezone(arrival.iata, arrival.timezone);
  const depTime = getUtcTimeFromLocal(departure.actual || departure.scheduled, depTz);
  const arrTime = getUtcTimeFromLocal(arrival.estimated || arrival.scheduled, arrTz);
  const now = Date.now();

  if (isEnRoute && now <= depTime) {
    if (altitude) {
      if (altitude > 9000) return 0.55;
      if (altitude > 6000) return 0.35;
      if (altitude > 3000) return 0.2;
    }
    return 0.15;
  }

  if (isEnRoute && now >= arrTime) {
    return 0.96;
  }

  let p = (now - depTime) / (arrTime - depTime);
  if (isNaN(p) || p < 0 || p > 1) {
    p = 0.5;
  }

  return Math.min(0.98, Math.max(0.08, 0.08 + 0.88 * p));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

/**
 * Realistic Aeronautical Flight Curve Generator
 * Models smooth takeoff ascent, sustained high-altitude cruise dome, and steady glide-slope descent
 */
function getPointOnArc(t, width, height, padding, embedded = false) {
  const startX = padding;
  const endX = width - padding;
  const clampedT = Math.max(0, Math.min(1, t));
  const x = startX + (endX - startX) * clampedT;

  // Aerodynamic parabolic flight curve: smooth continuous arc from departure to arrival
  const peakHeight = embedded ? height * 0.46 : height * 0.58;
  const baseY = embedded ? height * 0.76 : height * 0.74;
  
  const curveFactor = Math.sin(Math.PI * clampedT);
  const y = baseY - (peakHeight * curveFactor);

  return { x, y };
}

function getMilestones(status, embedded = false, width = 800) {
  if (embedded) {
    if (width < 260) {
      return [
        { id: 'gate', label: 'GATE', t: 0, alt: '0 FT' },
        { id: 'cruise', label: 'CRUISE', t: 0.5, alt: '36,000 FT' },
        { id: 'landed', label: 'LANDED', t: 1.0, alt: '0 FT' },
      ];
    }
    return [
      { id: 'gate', label: 'GATE', t: 0, alt: '0 FT' },
      { id: 'climb', label: 'CLIMB', t: 0.22, alt: '18,000 FT' },
      { id: 'cruise', label: 'CRUISE', t: 0.5, alt: '36,000 FT' },
      { id: 'descent', label: 'DESCENT', t: 0.78, alt: '16,000 FT' },
      { id: 'landed', label: 'LANDED', t: 1.0, alt: '0 FT' },
    ];
  }

  return [
    { id: 'gate', label: 'GATE', t: 0, alt: '0 FT' },
    { id: 'taxi', label: 'TAXI', t: 0.08, alt: 'Ground' },
    { id: 'climb', label: 'CLIMB', t: 0.24, alt: '18,000 FT' },
    { id: 'cruise', label: 'CRUISE', t: 0.5, alt: '36,000 FT' },
    { id: 'descent', label: 'DESCENT', t: 0.76, alt: '18,000 FT' },
    { id: 'approach', label: 'APPROACH', t: 0.90, alt: '3,200 FT' },
    { id: 'landed', label: 'LANDED', t: 1.0, alt: '0 FT' },
  ];
}

function shortenAirportName(name) {
  if (!name) return 'N/A';
  let clean = name
    .replace(/\b(International|Airport|Field|Regional|Municipal|Helipart|Intercontinental|Spacial|ICAO|IATA)\b/gi, '')
    .trim();
  if (clean.length > 18) {
    clean = clean.substring(0, 16) + '...';
  }
  return clean || name;
}

export default function FlightTrajectory({ flight, embedded = false }) {
  const { convertSpeed, convertAltitude } = useSettings();
  const rawUid = useId ? useId() : 'trj';
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const svgRef = useRef(null);
  const completedPathRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height: embedded ? 92 : 280 });
  
  // Interactive Hover / Scrub state
  const [hoverT, setHoverT] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        const w = Math.max(240, Math.round(rect.width));
        // Compact height for embedded mode: sleek ~82px - 98px
        const h = embedded
          ? Math.max(80, Math.min(100, Math.round(w * 0.16)))
          : Math.max(200, Math.min(290, Math.round(w * 0.42)));
        setDims({ width: w, height: h });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [embedded]);

  const flightPhase = useMemo(() => getFlightPhase(flight), [flight]);
  const realProgress = calculateProgress(flight.departure, flight.arrival, flight.flight_status, flight.live);
  const activeT = hoverT !== null ? hoverT : flightPhase.t;

  const { width, height } = dims;
  // Make the curve extend cleanly from departure to arrival without edge clipping
  const padding = embedded ? 24 : 60;
  const milestones = getMilestones(flight.flight_status, embedded, width);
  const baseY = embedded ? height * 0.76 : height * 0.74;

  // Completed arc drawing animation
  useEffect(() => {
    const path = completedPathRef.current;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = length;
      path.getBoundingClientRect(); // force reflow
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
      path.style.strokeDashoffset = '0';
    }
  }, [realProgress, width]);

  // Build full arc path
  const arcPoints = useMemo(() => {
    const pts = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = getPointOnArc(t, width, height, padding, embedded);
      pts.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    }
    return pts;
  }, [width, height, padding, embedded]);

  const arcPath = `M ${arcPoints.join(' L ')}`;

  // Completed arc: tracks strictly up to the plane's real phase position
  const planeT = activeT;
  const completedPoints = useMemo(() => {
    if (planeT <= 0.03) return [];
    const pts = [];
    const steps = Math.max(2, Math.floor(planeT * 120));
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * planeT;
      const pt = getPointOnArc(t, width, height, padding, embedded);
      pts.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    }
    return pts;
  }, [planeT, width, height, padding, embedded]);

  const completedPath = completedPoints.length > 1 ? `M ${completedPoints.join(' L ')}` : '';

  // Area under curve fill path
  const startPt = getPointOnArc(0, width, height, padding, embedded);
  const currentPt = getPointOnArc(planeT, width, height, padding, embedded);
  const areaPath = completedPoints.length > 1
    ? `M ${startPt.x.toFixed(1)},${baseY} L ${completedPoints.join(' L ')} L ${currentPt.x.toFixed(1)},${baseY} Z`
    : '';

  // Plane position: sits firmly at its real flight stage along the arc
  const planePos = getPointOnArc(planeT, width, height, padding, embedded);
  const prevPos = getPointOnArc(Math.max(0, planeT - 0.02), width, height, padding, embedded);
  const nextPos = getPointOnArc(Math.min(1, planeT + 0.02), width, height, padding, embedded);
  const angle = Math.atan2(nextPos.y - prevPos.y, nextPos.x - prevPos.x) * (180 / Math.PI) + 90;

  const badgeWidth = embedded ? 96 : 110;
  const halfBadge = badgeWidth / 2;
  const badgeX = Math.max(halfBadge + 6, Math.min(width - halfBadge - 6, planePos.x));
  const badgeY = Math.max(embedded ? 12 : 18, planePos.y - (embedded ? 18 : 26));

  const depIata = flight.departure?.iata || '---';
  const arrIata = flight.arrival?.iata || '---';
  const statusText = flight.flight_status || 'scheduled';
  const flightIata = flight.flight?.iata || flight.flight?.icao || 'N/A';

  // Advanced Telemetry (Converted to Aviation Standard Units)
  const isLive = flight.live !== null && flight.live !== undefined;
  const rawSpeedKts = flight.live?.speed_horizontal ? Math.round(flight.live.speed_horizontal * 0.539957) : 465;
  const rawAltFt = flight.live?.altitude ? Math.round(flight.live.altitude * 3.28084) : Math.round(36000 * Math.pow(Math.sin(Math.PI * activeT), 0.75));
  const heading = flight.live?.direction !== undefined ? Math.round(flight.live.direction) : null;
  const vSpeedFpm = flight.live?.v_speed !== undefined ? Math.round(flight.live.v_speed * 196.85) : null;

  const speedKts = isLive ? rawSpeedKts : (activeT > 0.1 && activeT < 0.95 ? 465 : null);
  const altitudeFt = isLive ? rawAltFt : (activeT > 0.05 && activeT < 0.98 ? rawAltFt : null);

  const delayVal = flight.departure?.delay || flight.arrival?.delay || 0;
  const airlineInfo = getAirlineInfo(flight.airline?.iata || flight.flight?.iata || flight.flight?.icao);

  // Mouse / Touch scrub handlers
  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    const rawT = (relativeX - padding) / (width - 2 * padding);
    const clampedT = Math.max(0, Math.min(1, rawT));
    setHoverT(clampedT);
  };

  const handlePointerLeave = () => {
    setHoverT(null);
    setIsScrubbing(false);
  };

  // Active milestone finder
  let currentMilestone = milestones[0];
  for (let m of milestones) {
    if (activeT >= m.t - 0.08) {
      currentMilestone = m;
    }
  }

  return (
    <div 
      className={`${styles.trajectoryCard} ${embedded ? styles.trajectoryEmbedded : ''}`}
      onPointerLeave={handlePointerLeave}
    >
      {/* Header bar (Standalone Mode) */}
      {!embedded && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {airlineInfo?.logo ? (
              <div className={styles.airlineLogoBox} title={airlineInfo.name}>
                <Image
                  src={airlineInfo.logo}
                  alt={airlineInfo.name}
                  width={110}
                  height={32}
                  className={styles.airlineLogoImg}
                />
              </div>
            ) : (
              <span className={styles.airline}>{flight.airline?.name || ''}</span>
            )}
            <span className={styles.flightBadge}>{flightIata}</span>
            {flight.live?.registration && (
              <span className={styles.regBadge}>{flight.live.registration}</span>
            )}
            {isLive && (
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot}></span>
                <span className={styles.liveText}>ADS-B LIVE</span>
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
      )}

      {/* Telemetry gauges (Standalone Mode) */}
      {!embedded && isLive && (
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
                {heading}° <span style={{ display: 'inline-block', transform: `rotate(${heading}deg)`, marginLeft: '4px' }}>↑</span>
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

      {/* Interactive SVG Trajectory Area */}
      <div 
        className={styles.svgContainer} 
        ref={svgRef}
        onPointerMove={handlePointerMove}
        onPointerDown={() => setIsScrubbing(true)}
        onPointerUp={() => setIsScrubbing(false)}
        role="region"
        aria-label="Flight trajectory arc animation"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          className={styles.svg}
        >
          <defs>
            {/* Smooth glowing laser trail for flight path (full mode only, no clipping artifact) */}
            {!embedded && (
              <filter id={`laserGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}

            {/* Neon Area Fill Gradient under the arc */}
            <linearGradient id={`altitudeGradient_${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={embedded ? "0.22" : "0.28"} />
              <stop offset="60%" stopColor="#2563eb" stopOpacity={embedded ? "0.08" : "0.12"} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            {/* Airplane Engine Afterglow */}
            <radialGradient id={`engineGlow_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            {/* Trajectory Laser Gradient */}
            <linearGradient id={`laserPathGradient_${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Runway Base Ground Line */}
          <line
            x1={padding - 20}
            y1={baseY}
            x2={width - padding + 20}
            y2={baseY}
            stroke={embedded ? '#94a3b8' : 'var(--trajectory-line)'}
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* Altitude Gradient Area under Completed Flight Path (full mode only) */}
          {!embedded && areaPath && (
            <path
              d={areaPath}
              fill={`url(#altitudeGradient_${uid})`}
              className={styles.altitudeArea}
            />
          )}

          {/* Inactive / Planned Flight Corridor Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke={embedded ? '#94a3b8' : 'var(--trajectory-line)'}
            strokeWidth={embedded ? "2.2" : "2.2"}
            strokeDasharray="6 4"
            opacity="0.9"
            className={styles.corridorArc}
          />

          {/* Glowing Completed Laser Trajectory Arc */}
          {completedPath && (
            <path
              ref={completedPathRef}
              d={completedPath}
              fill="none"
              stroke={`url(#laserPathGradient_${uid})`}
              strokeWidth={embedded ? "3.2" : "3.4"}
              strokeLinecap="round"
              filter={embedded ? undefined : `url(#laserGlow_${uid})`}
              className={styles.completedArc}
            />
          )}

          {/* Milestone Waypoint Beacons */}
          {milestones.map((m) => {
            const pt = getPointOnArc(m.t, width, height, padding, embedded);
            const isCompleted = activeT >= m.t;
            const isCurrent = Math.abs(activeT - m.t) < 0.08;

            return (
              <g key={m.id} className={styles.milestoneGroup}>
                {/* Vertical Altitude Drop Line */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={baseY}
                  stroke={isCompleted ? 'rgba(14, 165, 233, 0.6)' : (embedded ? '#94a3b8' : 'var(--trajectory-line)')}
                  strokeWidth={isCurrent ? "1.5" : "1"}
                  strokeDasharray={isCurrent ? "2 2" : "3 3"}
                  opacity={isCompleted ? "0.9" : "0.7"}
                />

                {/* Waypoint Base Pin on Ground */}
                <circle
                  cx={pt.x}
                  cy={baseY}
                  r={isCurrent ? (embedded ? 2.5 : 3) : (embedded ? 1.5 : 2)}
                  fill={isCompleted ? '#0ea5e9' : (embedded ? '#475569' : 'var(--text-muted)')}
                />

                {/* Radar Waypoint Dot on Arc */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isCurrent ? (embedded ? 4.5 : 6) : (embedded ? 2.8 : 3.5)}
                  fill={isCompleted ? '#38bdf8' : (embedded ? '#f8fafc' : 'var(--bg-card)')}
                  stroke={isCompleted ? '#0284c7' : (embedded ? '#475569' : 'var(--trajectory-line)')}
                  strokeWidth={isCurrent ? "2" : "1.5"}
                  className={isCurrent ? styles.activeBeaconDot : ''}
                />

                {/* Radiating Radar Ring on Active Current Waypoint */}
                {isCurrent && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={embedded ? "9" : "14"}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="1.5"
                    opacity="0.6"
                  >
                    <animate attributeName="r" from={embedded ? "5" : "7"} to={embedded ? "14" : "20"} dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Waypoint Label - Solid High Contrast Ink with crisp halo */}
                <text
                  x={pt.x}
                  y={baseY + (embedded ? 13 : 18)}
                  textAnchor="middle"
                  fontSize={embedded ? "8.5" : "10"}
                  fontFamily="var(--font-mono)"
                  fontWeight={isCurrent ? "950" : "900"}
                  letterSpacing="0.08em"
                  paintOrder="stroke fill"
                  stroke="var(--bg-card)"
                  strokeWidth="3px"
                  strokeLinejoin="round"
                  fill={isCurrent ? '#0284c7' : (isCompleted ? '#0284c7' : '#0f172a')}
                  className={`${styles.waypointLabel} ${isCurrent ? styles.waypointLabelActive : ''}`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Standalone Airport IATA Labels */}
          {!embedded && (
            <>
              {/* Departure */}
              <text
                x={padding}
                y={baseY + 42}
                textAnchor="middle"
                fontSize="20"
                fontFamily="var(--font-heading)"
                fontWeight="800"
                fill="var(--text-primary)"
              >
                {depIata}
              </text>
              <text
                x={padding}
                y={baseY + 56}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="var(--font-mono)"
                fontWeight="600"
                fill="var(--text-secondary)"
              >
                {iataCityMap[depIata] ? `${iataCityMap[depIata]}` : shortenAirportName(flight.departure?.airport || '')}
              </text>

              {/* Arrival */}
              <text
                x={width - padding}
                y={baseY + 42}
                textAnchor="middle"
                fontSize="20"
                fontFamily="var(--font-heading)"
                fontWeight="800"
                fill="var(--text-primary)"
              >
                {arrIata}
              </text>
              <text
                x={width - padding}
                y={baseY + 56}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="var(--font-mono)"
                fontWeight="600"
                fill="var(--text-secondary)"
              >
                {iataCityMap[arrIata] ? `${iataCityMap[arrIata]}` : shortenAirportName(flight.arrival?.airport || '')}
              </text>
            </>
          )}

          {/* Live Flight Telemetry HUD Badge above Airplane (full mode only) */}
          {!embedded && speedKts !== null && (
            <g 
              transform={`translate(${planePos.x}, ${planePos.y - 26})`}
              className={styles.speedHudTag}
            >
              <rect 
                x="-46" 
                y="-10" 
                width="92" 
                height="18" 
                rx="4" 
                fill="var(--bg-card)" 
                stroke="#0ea5e9" 
                strokeWidth="1" 
                className={styles.hudBadgeBg}
              />
              <text 
                x="0" 
                y="3" 
                textAnchor="middle" 
                fontSize="9" 
                fontFamily="var(--font-mono)" 
                fontWeight="700" 
                fill="#0ea5e9"
              >
                {convertSpeed ? `${convertSpeed(speedKts).value} ${convertSpeed(speedKts).unit}` : `${speedKts} KTS`}
              </text>
            </g>
          )}

          {/* Authentic Commercial Jetliner Vector SVG sticking at verified aircraft stage */}
          <g 
            transform={`translate(${planePos.x}, ${planePos.y}) rotate(${angle})`}
            className={styles.airplaneContainer}
          >
            {/* Subtle radar pulse beacon around aircraft position */}
            <circle
              cx="0"
              cy="0"
              r={embedded ? "13" : "16"}
              fill="rgba(2, 132, 199, 0.14)"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className={styles.planeGlowPulse}
            />

            <g transform={embedded ? "scale(1.18) translate(-12, -12)" : "scale(1.38) translate(-12, -12)"}>
              {/* White contrast outline halo for 100% visibility against all backgrounds */}
              <path
                d="M 12 1.5 C 12.6 2.2 13.4 3.8 13.4 6.5 L 13.4 9 L 22.5 13.2 L 22.5 14.5 L 14 12.8 L 14 16 L 13.2 19 L 17.5 21.6 L 17.5 22.5 L 12 21.5 L 6.5 22.5 L 6.5 21.6 L 10.8 19 L 10 16 L 10 12.8 L 1.5 14.5 L 1.5 13.2 L 10.6 9 L 10.6 6.5 C 10.6 3.8 11.4 2.2 12 1.5 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Aerodynamic jet body in clean aircraft blue */}
              <path
                d="M 12 1.5 C 12.6 2.2 13.4 3.8 13.4 6.5 L 13.4 9 L 22.5 13.2 L 22.5 14.5 L 14 12.8 L 14 16 L 13.2 19 L 17.5 21.6 L 17.5 22.5 L 12 21.5 L 6.5 22.5 L 6.5 21.6 L 10.8 19 L 10 16 L 10 12.8 L 1.5 14.5 L 1.5 13.2 L 10.6 9 L 10.6 6.5 C 10.6 3.8 11.4 2.2 12 1.5 Z"
                fill="#0284c7"
                stroke="#0369a1"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className={styles.airlinerBody}
              />
              {/* Twin jet turbines under wings */}
              <rect x="7.8" y="11" width="1.6" height="3.2" rx="0.8" fill="#0369a1" stroke="#ffffff" strokeWidth="0.6" />
              <rect x="14.6" y="11" width="1.6" height="3.2" rx="0.8" fill="#0369a1" stroke="#ffffff" strokeWidth="0.6" />
              {/* Cockpit canopy visor */}
              <ellipse cx="12" cy="4.2" rx="1.1" ry="1.8" fill="#ffffff" />
            </g>
          </g>

          {/* Live Flight Phase Badge directly above aircraft mentioning stage (e.g. TAXIING TO RUNWAY) */}
          <g 
            transform={`translate(${badgeX}, ${badgeY})`}
            className={styles.phaseBadgeGroup}
          >
            <rect
              x={-halfBadge}
              y="-9"
              width={badgeWidth}
              height="18"
              rx="9"
              fill="var(--bg-card, #ffffff)"
              stroke="#0ea5e9"
              strokeWidth="1"
              className={styles.phaseBadgeBg}
            />
            <circle cx={-halfBadge + 10} cy="0" r="2.5" fill="#10b981" />
            <text
              x="6"
              y="3"
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="var(--text-primary, #0f172a)"
            >
              {flightPhase.shortLabel || flightPhase.label}
            </text>
          </g>

          {/* Interactive Scrub Indicator / Hover Ring */}
          {hoverT !== null && (
            <g transform={`translate(${planePos.x}, ${planePos.y})`}>
              <circle r={embedded ? "8" : "12"} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
      </div>

      {/* Standalone Timer bar & Flight Info */}
      {!embedded && (
        <>
          <div className={styles.timerBar}>
            <div className={styles.timerSection}>
              <span className={styles.timerLabel}>DEPARTURE</span>
              <span className={styles.timerValue}>
                {formatLocalTime(flight.departure?.scheduled)}
              </span>
              <span className={styles.timerDate}>
                {flight.departure?.scheduled ? formatDate(flight.departure.scheduled) : ''}
              </span>
            </div>
            
            <div className={styles.progressInfo}>
              <div className={styles.progressBadge}>
                <span className={styles.progressPercent}>{Math.round(activeT * 100)}%</span>
                <span className={styles.progressSubLabel}>AIRWAY TRAJECTORY</span>
              </div>
              <div className={styles.flightPhaseTag}>
                {currentMilestone.label} PHASE
              </div>
            </div>

            <div className={styles.timerSection} style={{ textAlign: 'right' }}>
              <span className={styles.timerLabel}>ARRIVAL</span>
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
              {flight.departure?.terminal && <span className={styles.facilityItem}>Term {flight.departure.terminal}</span>}
              {flight.departure?.gate && <span className={styles.facilityItem}>Gate {flight.departure.gate}</span>}
            </div>
            <div className={styles.facilitySection} style={{ justifyContent: 'flex-end' }}>
              {flight.arrival?.terminal && <span className={styles.facilityItem}>Term {flight.arrival.terminal}</span>}
              {flight.arrival?.gate && <span className={styles.facilityItem}>Gate {flight.arrival.gate}</span>}
              {flight.arrival?.baggage && <span className={styles.facilityItem}>Belt {flight.arrival.baggage}</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
