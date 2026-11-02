'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import FlightTrajectory from './FlightTrajectory';
import SplitFlapLoader from './SplitFlapLoader';
import { getAirlineInfo } from '../data/airlines';
import { iconicDestinations, getAirportPhoto, getAirportLandmarkName } from '../data/destinations';
import { indianPublicAirports } from '../data/airports';
import { useSettings } from '../lib/settingsContext';
import { generateQRCodeSVG } from '../lib/qrcode';
import styles from './FlightResults.module.css';

// Build fast city lookup for all 144 Indian public commercial airports
const airportDbCityMap = {};
indianPublicAirports.forEach(a => {
  if (a.iata && a.city) {
    airportDbCityMap[a.iata.toUpperCase()] = a.city;
  }
});

function getFlightDuration(scheduledDep, scheduledArr) {
  if (!scheduledDep || !scheduledArr) return '2h 15m';
  const depMs = new Date(scheduledDep).getTime();
  const arrMs = new Date(scheduledArr).getTime();
  if (isNaN(depMs) || isNaN(arrMs) || arrMs <= depMs) {
    return '2h 15m';
  }
  const diffMins = Math.round((arrMs - depMs) / (1000 * 60));
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  if (h <= 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const landmarkFallbackMap = {
  'DEL': '/destinations/delhi_india_gate.jpg',
  'BOM': '/destinations/mumbai_gateway.jpg',
  'BLR': '/destinations/bengaluru_vidhana_soudha.jpg',
  'JAI': '/destinations/jaipur_hawa_mahal.jpg',
  'SXR': '/destinations/kashmir_dal_lake.jpg',
  'GOI': '/destinations/goa_beach.jpg',
  'GOX': '/destinations/goa_beach.jpg',
  'COK': '/destinations/kerala_backwaters.jpg',
  'TRV': '/destinations/kerala_backwaters.jpg',
  'CCU': '/destinations/kolkata_victoria_memorial.jpg',
  'AGR': '/destinations/taj_mahal_agra.jpg'
};

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

function getUtcTime(dateStr, iata, apiTz) {
  if (!dateStr) return 0;
  const tz = resolveTimezone(iata, apiTz);
  return getUtcTimeFromLocal(dateStr, tz);
}

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

function getCityName(iata, airportName) {
  if (!iata) return '';
  const code = iata.toUpperCase().trim();
  if (airportDbCityMap[code]) return airportDbCityMap[code];
  if (iataCityMap[code]) return iataCityMap[code];
  if (airportName) {
    const firstWord = airportName.split(' ')[0];
    if (firstWord.toLowerCase() === 'chhatrapati') return 'Mumbai';
    if (firstWord.toLowerCase() === 'kempegowda') return 'Bengaluru';
    if (firstWord.toLowerCase() === 'netaji') return 'Kolkata';
    if (firstWord.toLowerCase() === 'indira') return 'Delhi';
    if (firstWord.toLowerCase() === 'rajiv') return 'Hyderabad';
    if (firstWord.toLowerCase() === 'chaudhary') return 'Lucknow';
    if (firstWord.toLowerCase() === 'sardar') return 'Ahmedabad';
    return firstWord;
  }
  return '';
}

function getStatusClass(status) {
  if (!status) return styles.statusScheduled;
  const s = status.toLowerCase();
  if (s === 'landed' || s === 'arrived') return styles.statusLanded;
  if (s === 'active' || s === 'en-route') return styles.statusActive;
  if (s === 'cancelled') return styles.statusCancelled;
  if (s === 'diverted') return styles.statusDiverted;
  return styles.statusScheduled;
}

function formatTime(dateStr) {
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = match[3];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]}`;
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function getCountdownInfo(flight, now) {
  if (!now) now = Date.now();
  const status = flight.flight_status?.toLowerCase();
  
  if (status === 'active' || status === 'en-route') {
    return { text: 'In Flight • Live', type: 'active' };
  }
  
  const arrTime = flight.arrival?.actual || flight.arrival?.estimated || flight.arrival?.scheduled;
  if (status === 'landed' || status === 'arrived') {
    if (arrTime) {
      const arrMs = new Date(arrTime).getTime();
      const diff = Math.max(0, Math.round((now - arrMs) / 60000));
      return { text: `Landed ${diff}m ago`, type: 'landed' };
    }
    return { text: 'Flight Landed', type: 'landed' };
  }
  
  const depTime = flight.departure?.actual || flight.departure?.estimated || flight.departure?.scheduled;
  if (depTime) {
    const depMs = new Date(depTime).getTime();
    const diff = Math.round((depMs - now) / 60000);
    if (diff > 0) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return { text: `Departs in ${h > 0 ? `${h}h ` : ''}${m}m`, type: 'upcoming' };
    }
  }
  return null;
}

function getSimulatedSeat(flightIata) {
  if (!flightIata) return '12A';
  const num = parseInt(flightIata.replace(/\D/g, '') || '12', 10);
  const rows = (num % 28) + 1;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatLetter = letters[num % letters.length];
  return `${rows.toString().padStart(2, '0')}${seatLetter}`;
}

function getBoardingTime(scheduledTimeStr) {
  if (!scheduledTimeStr) return '--:--';
  const match = scheduledTimeStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return '--:--';
  let totalMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) - 40;
  if (totalMin < 0) totalMin += 1440;
  let h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function FlightResults({ flights, loading, error, serverNow, searchContext }) {
  const { settings, convertSpeed, convertAltitude } = useSettings();
  const hasDepartures = flights?.some(f => f.search_type === 'departure');
  const hasArrivals = flights?.some(f => f.search_type === 'arrival');
  const isAirportSearch = hasDepartures || hasArrivals;

  const [activeSubTab, setActiveSubTab] = useState('departure');
  const [timeWindow, setTimeWindow] = useState(settings?.defaultAirportWindow || '4h');
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [savedFlightCodes, setSavedFlightCodes] = useState([]);

  // Card Template Selector: 'scenic' | 'executive' | 'radar' | 'classic'
  const [cardTemplate, setCardTemplate] = useState('scenic');

  // Stub code display view: 'qr' | 'barcode' (per flight code)
  const [stubViewMap, setStubViewMap] = useState({});

  // Digital Boarding Pass & QR Scanner Modal
  const [activeScanFlight, setActiveScanFlight] = useState(null);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanVerified, setScanVerified] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    const loadSaved = () => {
      try {
        const savedStr = localStorage.getItem('flightdeck_saved_flights');
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          setSavedFlightCodes(parsed.map(f => f.flight?.iata || f.flight?.icao));
        } else {
          setSavedFlightCodes([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSaved();
    window.addEventListener('flightdeck_saved_flights_updated', loadSaved);
    return () => window.removeEventListener('flightdeck_saved_flights_updated', loadSaved);
  }, []);

  const handleToggleSaveFlight = (flight) => {
    try {
      const flightCode = flight.flight?.iata || flight.flight?.icao;
      if (!flightCode) return;

      const savedStr = localStorage.getItem('flightdeck_saved_flights');
      let saved = savedStr ? JSON.parse(savedStr) : [];
      
      const exists = saved.some(f => (f.flight?.iata || f.flight?.icao) === flightCode);
      if (exists) {
        saved = saved.filter(f => (f.flight?.iata || f.flight?.icao) !== flightCode);
      } else {
        saved.unshift({
          ...flight,
          savedAt: Date.now()
        });
      }
      localStorage.setItem('flightdeck_saved_flights', JSON.stringify(saved));
      setSavedFlightCodes(saved.map(f => f.flight?.iata || f.flight?.icao));
      window.dispatchEvent(new Event('flightdeck_saved_flights_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setActiveSubTab(hasDepartures ? 'departure' : (hasArrivals ? 'arrival' : 'departure'));
    setExpandedCardIndex(null);
  }, [flights, hasDepartures, hasArrivals]);

  useEffect(() => {
    if (settings?.defaultAirportWindow) {
      setTimeWindow(settings.defaultAirportWindow);
    }
  }, [settings?.defaultAirportWindow]);

  const toggleExpand = (index, flight) => {
    if (expandedCardIndex === index) {
      setExpandedCardIndex(null);
    } else {
      setExpandedCardIndex(index);
    }
  };

  const getMockTemp = (iata) => {
    if (!iata) return 26;
    const hash = iata.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 15) + 18;
  };

  const toggleStubCodeView = (e, flightIata) => {
    e.stopPropagation();
    setStubViewMap(prev => ({
      ...prev,
      [flightIata]: prev[flightIata] === 'barcode' ? 'qr' : 'barcode'
    }));
  };

  const openScanModal = (e, flight) => {
    e.stopPropagation();
    setActiveScanFlight(flight);
    setScanVerified(false);
    setIsSimulatingScan(false);
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setScanVerified(false);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setScanVerified(true);
    }, 1200);
  };

  const handleCopyShareLink = (flightIata, depIata, arrIata) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flightdeck.app';
    const url = `${origin}/?flight=${flightIata}&from=${depIata}&to=${arrIata}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2600);
    });
  };

  if (loading) {
    let title = "Live Flight Radar Search";
    let sub = "Querying Live ADS-B Transponders & Airspace Traffic";
    if (searchContext) {
      if (searchContext.activeTab === 'route' && searchContext.fromAirport && searchContext.toAirport) {
        title = `${searchContext.fromAirport} → ${searchContext.toAirport}`;
        sub = "Scanning direct airline schedules & live radar";
      } else if (searchContext.activeTab === 'airport' && searchContext.query) {
        title = `${searchContext.query} Airport Radar`;
        sub = "Live departures, arrivals & ground telemetry";
      } else if (searchContext.activeTab === 'flight' && searchContext.query) {
        title = `Flight ${searchContext.query}`;
        sub = "Live en-route ADS-B transponder tracking";
      }
    }
    return (
      <SplitFlapLoader 
        routeTitle={title}
        routeSubtitle={sub}
      />
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) return null;

  const now = serverNow || Date.now();

  const tabFiltered = isAirportSearch
    ? flights.filter(f => f.search_type === activeSubTab)
    : flights;

  const withTime = tabFiltered.map(f => {
    const isArrival = isAirportSearch && activeSubTab === 'arrival';
    let timeStr, iata, apiTz;
    if (isArrival) {
      timeStr = f.arrival?.estimated || f.arrival?.actual || f.arrival?.scheduled;
      iata = f.arrival?.iata;
      apiTz = f.arrival?.timezone;
    } else {
      timeStr = f.departure?.estimated || f.departure?.actual || f.departure?.scheduled;
      iata = f.departure?.iata;
      apiTz = f.departure?.timezone;
    }
    const effectiveMs = getUtcTime(timeStr, iata, apiTz);
    return { flight: f, effectiveMs };
  });

  const graceMs = 2 * 60 * 1000;
  const clientFiltered = withTime.filter(({ flight: f, effectiveMs }) => {
    if (effectiveMs >= now - graceMs) return true;
    const status = f.flight_status?.toLowerCase();
    if (status === 'active' || status === 'en-route') return true;
    if (status === 'landed' || status === 'arrived') {
      const arrTime = getUtcTime(
        f.arrival?.actual || f.arrival?.estimated || f.arrival?.scheduled,
        f.arrival?.iata, f.arrival?.timezone
      );
      if (now - arrTime <= 50 * 60 * 1000) return true;
    }
    return false;
  });

  const count2h = clientFiltered.filter(item => {
    const diff = item.effectiveMs - now;
    return (diff >= -graceMs && diff <= 2 * 60 * 60 * 1000) || item.flight.flight_status === 'active';
  }).length;

  const count4h = clientFiltered.filter(item => {
    const diff = item.effectiveMs - now;
    return (diff >= -graceMs && diff <= 4 * 60 * 60 * 1000) || item.flight.flight_status === 'active';
  }).length;

  const count8h = clientFiltered.filter(item => {
    const diff = item.effectiveMs - now;
    return (diff >= -graceMs && diff <= 8 * 60 * 60 * 1000) || item.flight.flight_status === 'active';
  }).length;

  const countAll = clientFiltered.length;

  const windowFiltered = isAirportSearch ? clientFiltered.filter(item => {
    if (timeWindow === 'all') return true;
    const maxDiff = (timeWindow === '2h' ? 2 : (timeWindow === '4h' ? 4 : 8)) * 60 * 60 * 1000;
    const diff = item.effectiveMs - now;
    return (diff >= -graceMs && diff <= maxDiff) || item.flight.flight_status === 'active';
  }) : clientFiltered;

  windowFiltered.sort((a, b) => a.effectiveMs - b.effectiveMs);
  const sortedFlights = windowFiltered.map(item => item.flight);

  const departureCount = flights.filter(f => f.search_type === 'departure').length;
  const arrivalCount = flights.filter(f => f.search_type === 'arrival').length;

  return (
    <div className={styles.container}>
      {/* Airport Departures & Arrivals Tabs */}
      {isAirportSearch && (
        <>
          <div className={styles.subTabs}>
            {hasDepartures && (
              <button
                className={`${styles.subTabBtn} ${activeSubTab === 'departure' ? styles.activeSubTab : ''}`}
                onClick={() => setActiveSubTab('departure')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(45 12 12)"/>
                </svg>
                Departures ({departureCount})
              </button>
            )}
            {hasArrivals && (
              <button
                className={`${styles.subTabBtn} ${activeSubTab === 'arrival' ? styles.activeSubTab : ''}`}
                onClick={() => setActiveSubTab('arrival')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(135 12 12)"/>
                </svg>
                Arrivals ({arrivalCount})
              </button>
            )}
          </div>

          {/* Time Window Filters */}
          <div className={styles.timeWindowBar}>
            <span className={styles.timeFilterLabel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              TIME WINDOW:
            </span>
            <div className={styles.windowChips}>
              <button
                type="button"
                className={`${styles.windowChip} ${timeWindow === '2h' ? styles.activeWindowChip : ''}`}
                onClick={() => setTimeWindow('2h')}
              >
                Next 2 Hours ({count2h})
              </button>
              <button
                type="button"
                className={`${styles.windowChip} ${timeWindow === '4h' ? styles.activeWindowChip : ''}`}
                onClick={() => setTimeWindow('4h')}
              >
                Next 4 Hours ({count4h})
              </button>
              <button
                type="button"
                className={`${styles.windowChip} ${timeWindow === '8h' ? styles.activeWindowChip : ''}`}
                onClick={() => setTimeWindow('8h')}
              >
                Next 8 Hours ({count8h})
              </button>
              <button
                type="button"
                className={`${styles.windowChip} ${timeWindow === 'all' ? styles.activeWindowChip : ''}`}
                onClick={() => setTimeWindow('all')}
              >
                All Day ({countAll})
              </button>
            </div>
          </div>
        </>
      )}

      {/* Top Header & Card Template Switcher */}
      <div className={styles.topControlRow}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultCount}>
            {sortedFlights.length} {isAirportSearch ? activeSubTab : ''} flight{sortedFlights.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {/* Card Style Template Switcher */}
        <div className={styles.templateBar}>
          <span className={styles.templateLabel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            CARD TEMPLATE:
          </span>
          <div className={styles.templateChips}>
            <button
              type="button"
              className={`${styles.templateChip} ${cardTemplate === 'scenic' ? styles.activeTemplateChip : ''}`}
              onClick={() => setCardTemplate('scenic')}
              title="Dual Destination Photographic Landmark Backdrop"
            >
              🏛️ Scenic Dual-Place
            </button>
            <button
              type="button"
              className={`${styles.templateChip} ${cardTemplate === 'executive' ? styles.activeTemplateChip : ''}`}
              onClick={() => setCardTemplate('executive')}
              title="Authentic Airline Fleet Livery Theme"
            >
              ✈️ Executive Livery
            </button>
            <button
              type="button"
              className={`${styles.templateChip} ${cardTemplate === 'radar' ? styles.activeTemplateChip : ''}`}
              onClick={() => setCardTemplate('radar')}
              title="Cyberpunk Pitch-Black Radar HUD"
            >
              📡 Cyberpunk Radar
            </button>
            <button
              type="button"
              className={`${styles.templateChip} ${cardTemplate === 'classic' ? styles.activeTemplateChip : ''}`}
              onClick={() => setCardTemplate('classic')}
              title="Classic Airline Boarding Pass"
            >
              🎫 Classic Pass
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Boarding Passes */}
      <div className={styles.grid}>
        {sortedFlights.map((flight, i) => {
          const isDelayedMajor = (flight.departure?.delay && flight.departure.delay >= 60) || (flight.arrival?.delay && flight.arrival.delay >= 60);
          const isExpanded = expandedCardIndex === i;

          const flightIata = flight.flight?.iata || flight.flight?.icao || 'N/A';
          const depIata = flight.departure?.iata || '---';
          const arrIata = flight.arrival?.iata || '---';
          const airline = getAirlineInfo(flight.airline?.iata || flight.flight?.iata || flight.flight?.icao) || {
            name: flight.airline?.name || 'Commercial Airline',
            iata: flightIata.slice(0, 2),
            logo: null
          };

          const countdown = getCountdownInfo(flight, now);
          const boardingTime = getBoardingTime(flight.departure?.scheduled);
          const duration = getFlightDuration(flight.departure?.scheduled, flight.arrival?.scheduled);
          const depPhotoUrl = getAirportPhoto(depIata, '/destinations/delhi_india_gate.jpg');
          const arrPhotoUrl = getAirportPhoto(arrIata, '/destinations/mumbai_gateway.jpg');
          const depLandmark = getAirportLandmarkName(depIata);
          const arrLandmark = getAirportLandmarkName(arrIata);
          const depCity = getCityName(depIata, flight.departure?.airport) || depIata;
          const arrCity = getCityName(arrIata, flight.arrival?.airport) || arrIata;
          const isSaved = savedFlightCodes.includes(flightIata);

          // Code display type: 'qr' or 'barcode'
          const stubCodeView = stubViewMap[flightIata] || 'qr';

          // Generate Real Working Scannable QR Code SVG
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flightdeck.app';
          const flightUrl = `${origin}/?flight=${flightIata}&from=${depIata}&to=${arrIata}`;
          const qrCodeObj = generateQRCodeSVG(flightUrl, 78, 'currentColor');

          return (
            <div 
              key={i} 
              className={`${styles.boardingPass} ${styles.cardFadeIn} ${isDelayedMajor ? styles.passDelayed : ''} ${isExpanded ? styles.passExpanded : ''} ${styles[`template_${cardTemplate}`] || ''}`} 
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* BOARDING PASS SURFACE: Left Main Pass + Perforation + Right Stub */}
              <div 
                className={styles.passSurface}
                onClick={() => toggleExpand(i, flight)}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(i, flight);
                  }
                }}
              >
                {/* DUAL DESTINATION ATMOSPHERIC BACKDROP (Departure + Arrival) */}
                {cardTemplate === 'scenic' && settings?.showLandmarkWatermark !== false && (
                  <div className={styles.fullCardBackgroundWrap} aria-hidden="true">
                    {/* Left side: Departure Landmark Image */}
                    <div 
                      className={styles.depCardBackgroundImage} 
                      style={{ backgroundImage: `url(${depPhotoUrl})` }}
                      title={`Departure Landmark: ${depLandmark || depCity}`}
                    />
                    {/* Right side: Arrival Landmark Image */}
                    <div 
                      className={styles.arrCardBackgroundImage} 
                      style={{ backgroundImage: `url(${arrPhotoUrl})` }}
                      title={`Arrival Landmark: ${arrLandmark || arrCity}`}
                    />
                    {/* Ambient Frosted Scrim Overlay */}
                    <div className={styles.fullCardBackgroundOverlay} />
                  </div>
                )}

                {/* 1. LEFT MAIN TICKET BODY */}
                <div className={styles.ticketMain}>
                  {/* Top Airline & Pass Banner */}
                  <div className={styles.ticketHeader}>
                    <div className={styles.carrierInfo}>
                      {airline.logo ? (
                        <div className={styles.airlineLogoWrap} title={airline.name}>
                          <Image
                            src={airline.logo}
                            alt={airline.name}
                            width={110}
                            height={30}
                            className={styles.airlineLogoImg}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <span className={styles.carrierName}>{airline.name}</span>
                      )}
                      <span className={styles.flightCodeBadge}>{flightIata}</span>
                      <button
                        type="button"
                        className={`${styles.saveFlightBtn} ${isSaved ? styles.savedActive : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSaveFlight(flight);
                        }}
                        title={isSaved ? "Saved to Home screen" : "Pin flight to Home screen"}
                        aria-label={isSaved ? "Saved to Home screen" : "Pin flight to Home screen"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                        </svg>
                        <span>{isSaved ? "Pinned" : "Pin"}</span>
                      </button>
                    </div>

                    <div className={styles.ticketHeaderRight}>
                      {countdown && (
                        <span className={`${styles.countdownBadge} ${countdown.type === 'landed' ? styles.countdownLanded : (countdown.type === 'active' ? styles.countdownActive : '')}`}>
                          {countdown.text}
                        </span>
                      )}

                      <span className={`${styles.statusBadge} ${getStatusClass(flight.flight_status)}`}>
                        {flight.flight_status ? flight.flight_status.toUpperCase() : 'SCHEDULED'}
                      </span>
                    </div>
                  </div>

                  {/* Route Display Hub: [Departure Info] <---> [Sleek Curve] <---> [Arrival Info] */}
                  <div className={styles.routeHubRow}>
                    {/* DEPARTURE HUB (LEFT SIDE) */}
                    <div className={styles.routeHubDep}>
                      <div className={styles.hubInfo}>
                        <div className={styles.hubStageHeader}>
                          <span className={styles.hubStageLabel}>DEPARTURE</span>
                          {depLandmark && <span className={styles.landmarkMiniTag} title={depLandmark}>📍 {depCity}</span>}
                        </div>
                        <div className={styles.hubIata}>{depIata}</div>
                        <div className={styles.hubCity} title={flight.departure?.airport || ''}>{depCity}</div>
                        <div className={styles.hubTime}>
                          <span className={styles.hubTimeVal}>{formatTime(flight.departure?.scheduled)}</span>
                          <span className={styles.hubTimeDate}>{formatDate(flight.departure?.scheduled)}</span>
                        </div>
                        {(flight.departure?.terminal || flight.departure?.gate) && (
                          <div className={styles.hubFacilityPill}>
                            {flight.departure.terminal ? `T${flight.departure.terminal}` : ''}
                            {flight.departure.gate ? ` • Gate ${flight.departure.gate}` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CENTER SLEEK TRAJECTORY ARC */}
                    <div className={styles.routeHubCenter}>
                      <FlightTrajectory flight={flight} embedded={true} />
                      <div className={styles.hubRouteMeta}>
                        <span className={styles.hubDurationBadge}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {duration}
                        </span>
                        <span className={styles.hubStatusPill}>
                          {flight.flight_status === 'active' || flight.flight_status === 'en-route' ? (
                            <>
                              <span className={styles.hubLiveDot}></span>
                              <span>LIVE IN AIRWAY</span>
                            </>
                          ) : flight.flight_status === 'landed' ? (
                            <span>ARRIVED & TAXIING</span>
                          ) : (
                            <span>NON-STOP</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* DESTINATION HUB (RIGHT SIDE) */}
                    <div className={styles.routeHubArr}>
                      <div className={styles.hubInfo} style={{ textAlign: 'right', alignItems: 'flex-end' }}>
                        <div className={styles.hubStageHeader} style={{ justifyContent: 'flex-end' }}>
                          {arrLandmark && <span className={styles.landmarkMiniTag} title={arrLandmark}>📍 {arrCity}</span>}
                          <span className={styles.hubStageLabel}>ARRIVAL</span>
                        </div>
                        <div className={styles.hubIata}>{arrIata}</div>
                        <div className={styles.hubCity} title={flight.arrival?.airport || ''}>{arrCity}</div>
                        <div className={styles.hubTime}>
                          <span className={styles.hubTimeVal}>{formatTime(flight.arrival?.scheduled)}</span>
                          <span className={styles.hubTimeDate}>{formatDate(flight.arrival?.scheduled)}</span>
                        </div>
                        {(flight.arrival?.terminal || flight.arrival?.baggage) && (
                          <div className={styles.hubFacilityPill} style={{ alignSelf: 'flex-end' }}>
                            {flight.arrival.terminal ? `T${flight.arrival.terminal}` : ''}
                            {flight.arrival.baggage ? ` • Belt ${flight.arrival.baggage}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Bottom Metadata Chips */}
                  <div className={styles.ticketFooter}>
                    <div className={styles.ticketMetaChips}>
                      <span className={styles.metaChip}>
                        <span className={styles.metaLabel}>DATE</span>
                        <span className={styles.metaValue}>{formatDate(flight.departure?.scheduled) || 'Today'}</span>
                      </span>

                      {(flight.departure?.gate || flight.departure?.terminal) && (
                        <span className={styles.metaChip}>
                          <span className={styles.metaLabel}>GATE</span>
                          <span className={styles.metaValue}>
                            {flight.departure.gate ? `Gate ${flight.departure.gate}` : `Term ${flight.departure.terminal}`}
                          </span>
                        </span>
                      )}

                      {flight.arrival?.baggage && (
                        <span className={styles.metaChip}>
                          <span className={styles.metaLabel}>BAGGAGE</span>
                          <span className={styles.metaValue}>Belt {flight.arrival.baggage}</span>
                        </span>
                      )}

                      <span className={styles.metaChip}>
                        <span className={styles.metaLabel}>SEAT</span>
                        <span className={styles.metaValue}>{getSimulatedSeat(flightIata)}</span>
                      </span>
                    </div>

                    <div className={styles.inspectHint}>
                      <span>{isExpanded ? 'Hide Full Specs' : 'Inspect Radar & Weather'}</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. PERFORATION WITH AUTHENTIC CUTOUT NOTCHES */}
                <div className={styles.perforation} aria-hidden="true">
                  <div className={styles.notchTop} />
                  <div className={styles.perforationLine} />
                  <div className={styles.notchBottom} />
                </div>

                {/* 3. RIGHT TEAR-OFF STUB WITH WORKING SCANNABLE QR CODE & BARCODE */}
                <div className={styles.ticketStub}>
                  <div className={styles.stubHeader}>
                    <span className={styles.stubTitle}>FLIGHT STUB</span>
                    <span className={styles.stubFlightNo}>{flightIata}</span>
                  </div>

                  <div className={styles.stubRoute}>
                    <div className={styles.stubOrigin}>
                      <span className={styles.stubStageLabel}>DEP</span>
                      <span className={styles.stubIata}>{depIata}</span>
                      <span className={styles.stubCity}>{depCity}</span>
                    </div>

                    <div className={styles.stubPlaneIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)"/>
                      </svg>
                    </div>

                    <div className={styles.stubDest}>
                      <span className={styles.stubStageLabel} style={{ textAlign: 'right' }}>ARR</span>
                      <span className={styles.stubIata}>{arrIata}</span>
                      <span className={styles.stubCity}>{arrCity}</span>
                    </div>
                  </div>

                  <div className={styles.stubGrid}>
                    <div className={styles.stubField}>
                      <span className={styles.stubLabel}>BOARDING</span>
                      <strong className={styles.stubValue}>{boardingTime}</strong>
                    </div>

                    <div className={styles.stubField}>
                      <span className={styles.stubLabel}>GATE</span>
                      <strong className={styles.stubValue}>{flight.departure?.gate || flight.departure?.terminal || 'TBD'}</strong>
                    </div>

                    <div className={styles.stubField}>
                      <span className={styles.stubLabel}>SEAT</span>
                      <strong className={styles.stubValue}>{getSimulatedSeat(flightIata)}</strong>
                    </div>

                    <div className={styles.stubField}>
                      <span className={styles.stubLabel}>GROUP</span>
                      <strong className={styles.stubValue}>ZONE 1</strong>
                    </div>
                  </div>

                  {/* INTERACTIVE WORKING QR CODE / BARCODE SECTION */}
                  <div 
                    className={styles.stubCodeBox}
                    onClick={(e) => openScanModal(e, flight)}
                    title="Click to Scan QR / Inspect Digital Boarding Pass"
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.codeSwitchHeader}>
                      <div className={styles.codeTypeToggle}>
                        <button
                          type="button"
                          className={`${styles.codeTypeBtn} ${stubCodeView === 'qr' ? styles.activeCodeType : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStubViewMap(prev => ({ ...prev, [flightIata]: 'qr' }));
                          }}
                        >
                          QR Pass
                        </button>
                        <button
                          type="button"
                          className={`${styles.codeTypeBtn} ${stubCodeView === 'barcode' ? styles.activeCodeType : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStubViewMap(prev => ({ ...prev, [flightIata]: 'barcode' }));
                          }}
                        >
                          Barcode
                        </button>
                      </div>

                      <span className={styles.scanBadge}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                        SCAN
                      </span>
                    </div>

                    {stubCodeView === 'qr' ? (
                      /* REAL SCANNABLE QR CODE */
                      <div className={styles.qrCodeWrapper}>
                        <div 
                          className={styles.qrSvgHolder}
                          dangerouslySetInnerHTML={{ __html: qrCodeObj.svg }}
                        />
                        <span className={styles.qrScanHint}>Point camera or click to scan</span>
                      </div>
                    ) : (
                      /* AUTHENTIC IATA BARCODE */
                      <div className={styles.barcodeWrapper}>
                        <svg className={styles.barcodeSvg} viewBox="0 0 160 38" preserveAspectRatio="none">
                          <rect x="0" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="5" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="8" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="13" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="20" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="23" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="28" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="33" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="36" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="43" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="47" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="50" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="56" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="61" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="68" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="71" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="76" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="82" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="86" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="93" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="97" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="103" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="106" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="111" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="118" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="122" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="128" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="133" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="137" y="0" width="4" height="38" fill="currentColor" />
                          <rect x="144" y="0" width="2" height="38" fill="currentColor" />
                          <rect x="149" y="0" width="1" height="38" fill="currentColor" />
                          <rect x="153" y="0" width="3" height="38" fill="currentColor" />
                          <rect x="158" y="0" width="2" height="38" fill="currentColor" />
                        </svg>
                        <span className={styles.stubTicketNum}>{flightIata} • IATA SCANNABLE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EXPANDABLE FLIGHT SPECS DRAWER */}
              {isExpanded && (
                <div className={styles.expandedPanel}>
                  <div className={styles.expandedGrid}>
                    
                    {/* Col 1: Timetable & Full Airport details */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        FLIGHT SCHEDULE
                      </h4>
                      <div className={styles.infoCard}>
                        <div className={styles.airportBlock}>
                          <strong className={styles.airportBlockTitle}>Departure</strong>
                          <span className={styles.airportNameFull}>{flight.departure?.airport || 'N/A'}</span>
                          <span className={styles.airportMeta}>
                            City: {depCity} | Timezone: {flight.departure?.timezone || 'IST (Asia/Kolkata)'}
                          </span>
                          <div className={styles.timeGrid}>
                            <div className={styles.timeLabelValue}>
                              <span>Scheduled:</span> <strong>{formatTime(flight.departure?.scheduled)}</strong>
                            </div>
                            {flight.departure?.actual && (
                              <div className={styles.timeLabelValue}>
                                <span>Actual:</span> <strong className={styles.actualHighlight}>{formatTime(flight.departure.actual)}</strong>
                              </div>
                            )}
                          </div>
                          {(flight.departure?.terminal || flight.departure?.gate) && (
                            <div className={styles.facilityGrid}>
                              {flight.departure.terminal && (
                                <span className={styles.facilityBadge}>Term {flight.departure.terminal}</span>
                              )}
                              {flight.departure.gate && (
                                <span className={styles.facilityBadge}>Gate {flight.departure.gate}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.airportBlock}>
                          <strong className={styles.airportBlockTitle}>Arrival</strong>
                          <span className={styles.airportNameFull}>{flight.arrival?.airport || 'N/A'}</span>
                          <span className={styles.airportMeta}>
                            City: {arrCity} | Timezone: {flight.arrival?.timezone || 'IST (Asia/Kolkata)'}
                          </span>
                          <div className={styles.timeGrid}>
                            <div className={styles.timeLabelValue}>
                              <span>Scheduled:</span> <strong>{formatTime(flight.arrival?.scheduled)}</strong>
                            </div>
                            {flight.arrival?.estimated && (
                              <div className={styles.timeLabelValue}>
                                <span>Estimated:</span> <strong className={styles.etaHighlight}>{formatTime(flight.arrival.estimated)}</strong>
                              </div>
                            )}
                          </div>
                          {(flight.arrival?.terminal || flight.arrival?.gate || flight.arrival?.baggage) && (
                            <div className={styles.facilityGrid}>
                              {flight.arrival.terminal && (
                                <span className={styles.facilityBadge}>Term {flight.arrival.terminal}</span>
                              )}
                              {flight.arrival.gate && (
                                <span className={styles.facilityBadge}>Gate {flight.arrival.gate}</span>
                              )}
                              {flight.arrival.baggage && (
                                <span className={`${styles.facilityBadge} ${styles.baggageBadge}`}>Belt {flight.arrival.baggage}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Aircraft Specifications & Telemetry */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                        AIRLINE & AIRCRAFT
                      </h4>
                      <div className={styles.infoCard}>
                        <div className={styles.airlineBrandBlock}>
                          {airline.logo ? (
                            <Image 
                              src={airline.logo} 
                              alt={airline.name} 
                              width={90} 
                              height={28} 
                              style={{ objectFit: 'contain' }}
                            />
                          ) : (
                            <div className={styles.airlineLogoPlaceholder}>
                              {airline.name ? airline.name.charAt(0).toUpperCase() : 'F'}
                            </div>
                          )}
                          <div className={styles.airlineTextDetails}>
                            <span className={styles.airlineNameExpanded}>{airline.name}</span>
                            <span className={styles.airlineCodes}>
                              IATA: {airline.iata || flight.airline?.iata || 'N/A'} | ICAO: {airline.icao || flight.airline?.icao || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Model IATA/ICAO</span>
                          <span className={styles.dataValue}>{flight.aircraft?.iata || flight.aircraft?.icao || 'Airbus A320neo / Boeing 737 MAX'}</span>
                        </div>
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Registration Tail</span>
                          <span className={styles.dataValue}>{flight.aircraft?.registration || flight.live?.registration || 'VT-Registered'}</span>
                        </div>
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Transponder (Hex)</span>
                          <span className={styles.dataValue} style={{ fontFamily: 'var(--font-mono)' }}>{flight.aircraft?.icao24 || flight.live?.hex || 'N/A'}</span>
                        </div>

                        {flight.live ? (
                          <>
                            <div className={styles.divider} />
                            <strong className={styles.subHeader}>Live ADS-B Telemetry</strong>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>Ground Speed</span>
                              <span className={styles.dataValue}>
                                {convertSpeed ? `${convertSpeed(flight.live.speed_horizontal || (flight.live.speed ? flight.live.speed * 0.539957 : 450)).value} ${convertSpeed(flight.live.speed_horizontal || (flight.live.speed ? flight.live.speed * 0.539957 : 450)).unit}` : `${Math.round(flight.live.speed_horizontal || 450)} KTS`}
                              </span>
                            </div>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>Flight Altitude</span>
                              <span className={styles.dataValue}>
                                {convertAltitude ? `${convertAltitude(flight.live.altitude ? flight.live.altitude * 3.28084 : 32000).value} ${convertAltitude(flight.live.altitude ? flight.live.altitude * 3.28084 : 32000).unit}` : `${Math.round(flight.live.altitude || 32000).toLocaleString()} FT`}
                              </span>
                            </div>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>True Heading</span>
                              <span className={styles.dataValue}>
                                {Math.round(flight.live.direction || 0)}° {flight.live.direction !== undefined ? (flight.live.direction > 180 ? 'W' : 'E') : ''}
                              </span>
                            </div>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>GPS Position</span>
                              <span className={styles.dataValue}>{flight.live.latitude?.toFixed(4)}°, {flight.live.longitude?.toFixed(4)}°</span>
                            </div>
                          </>
                        ) : (
                          <div className={styles.telemetryOffline}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            <span>Live Flight Radar Active</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Destination Weather */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="4" r="4"/></svg>
                        ARRIVAL WEATHER
                      </h4>
                      <div className={styles.weatherCard}>
                        <div className={styles.weatherHeader}>
                          <span className={styles.weatherCity}>{arrCity}</span>
                          <span className={styles.weatherSub}>Live METAR Telemetry</span>
                        </div>
                        <div className={styles.weatherMain}>
                          <span className={styles.weatherTemp}>{getMockTemp(arrIata)}°C</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.07-1.22.2A5 5 0 0 0 5 13c0 2.2 1.8 4 4 4h8.5Z"/></svg>
                        </div>
                        <div className={styles.weatherDetails}>
                          <div className={styles.weatherDetail}>
                            <span>Wind:</span> <strong>12 kts (VRB)</strong>
                          </div>
                          <div className={styles.weatherDetail}>
                            <span>Humidity:</span> <strong>54%</strong>
                          </div>
                          <div className={styles.weatherDetail}>
                            <span>Sky:</span> <strong>Good Visibility</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.openScannerBtn}
                          onClick={(e) => openScanModal(e, flight)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                          Open Digital Boarding Pass & QR Scanner
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          DIGITAL BOARDING PASS & QR SCANNER MODAL
          ======================================================== */}
      {activeScanFlight && (
        <div 
          className={styles.modalBackdrop}
          onClick={() => setActiveScanFlight(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className={styles.scannerModal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalPlaneIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(45 12 12)"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Digital Boarding Pass & QR Scanner</h3>
                  <span className={styles.modalSub}>IATA BCBP • Verified ADS-B Telemetry</span>
                </div>
              </div>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setActiveScanFlight(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Scannable High-Res QR Code Card with Laser Sweep */}
              <div className={styles.scannerDisplayCard}>
                <div className={styles.scannerFrame}>
                  <div className={styles.scannerCorners} />
                  
                  {/* Dynamic Real SVG QR Code */}
                  <div 
                    className={styles.modalQrHolder}
                    dangerouslySetInnerHTML={{ 
                      __html: generateQRCodeSVG(
                        `${typeof window !== 'undefined' ? window.location.origin : 'https://flightdeck.app'}/?flight=${activeScanFlight.flight?.iata || 'FLIGHT'}&from=${activeScanFlight.departure?.iata}&to=${activeScanFlight.arrival?.iata}`,
                        180,
                        'var(--text-primary)',
                        'transparent'
                      ).svg 
                    }}
                  />

                  {/* Laser Scan Beam Animation */}
                  <div className={`${styles.laserScanLine} ${isSimulatingScan ? styles.laserActive : ''}`} />
                </div>

                <div className={styles.scanInstructionBlock}>
                  <div className={styles.qrCodeUrlBadge}>
                    <span>flightdeck.app/?flight={activeScanFlight.flight?.iata || 'FLIGHT'}</span>
                  </div>
                  <p className={styles.scanPromptText}>
                    Point any smartphone camera to scan directly into FlightDeck, or test below:
                  </p>

                  <button
                    type="button"
                    className={`${styles.simulateScanBtn} ${isSimulatingScan ? styles.simulating : ''} ${scanVerified ? styles.verified : ''}`}
                    onClick={handleSimulateScan}
                    disabled={isSimulatingScan}
                  >
                    {isSimulatingScan ? (
                      <>
                        <span className={styles.simulatingSpinner} />
                        Scanning Transponder & BCBP...
                      </>
                    ) : scanVerified ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        PASS VERIFIED • VALIDATED
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                        Simulate Gate Scanner
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pass Details Info Card */}
              <div className={styles.modalPassCard}>
                <div className={styles.modalFlightHeader}>
                  <div>
                    <span className={styles.modalAirlineName}>{activeScanFlight.airline?.name || 'Commercial Airline'}</span>
                    <strong className={styles.modalFlightCode}>{activeScanFlight.flight?.iata || activeScanFlight.flight?.icao}</strong>
                  </div>
                  <div className={styles.modalStatusPill}>
                    {activeScanFlight.flight_status ? activeScanFlight.flight_status.toUpperCase() : 'SCHEDULED'}
                  </div>
                </div>

                {/* Route Route Row */}
                <div className={styles.modalRouteRow}>
                  <div>
                    <span className={styles.modalIata}>{activeScanFlight.departure?.iata}</span>
                    <span className={styles.modalCityName}>{getCityName(activeScanFlight.departure?.iata, activeScanFlight.departure?.airport)}</span>
                    <span className={styles.modalTime}>{formatTime(activeScanFlight.departure?.scheduled)}</span>
                  </div>
                  
                  <div className={styles.modalRouteArrow}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)"/>
                    </svg>
                    <span>{getFlightDuration(activeScanFlight.departure?.scheduled, activeScanFlight.arrival?.scheduled)}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.modalIata}>{activeScanFlight.arrival?.iata}</span>
                    <span className={styles.modalCityName}>{getCityName(activeScanFlight.arrival?.iata, activeScanFlight.arrival?.airport)}</span>
                    <span className={styles.modalTime}>{formatTime(activeScanFlight.arrival?.scheduled)}</span>
                  </div>
                </div>

                {/* Seat, Terminal, Gate, Boarding Group Grid */}
                <div className={styles.modalMetaGrid}>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>PASSENGER</span>
                    <strong className={styles.modalMetaVal}>Verified Aviator</strong>
                  </div>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>SEAT</span>
                    <strong className={styles.modalMetaVal}>{getSimulatedSeat(activeScanFlight.flight?.iata)} (Window)</strong>
                  </div>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>GATE</span>
                    <strong className={styles.modalMetaVal}>{activeScanFlight.departure?.gate || 'Gate 14'}</strong>
                  </div>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>TERMINAL</span>
                    <strong className={styles.modalMetaVal}>Term {activeScanFlight.departure?.terminal || '1'}</strong>
                  </div>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>BOARDING</span>
                    <strong className={styles.modalMetaVal}>{getBoardingTime(activeScanFlight.departure?.scheduled)}</strong>
                  </div>
                  <div className={styles.modalMetaCell}>
                    <span className={styles.modalMetaLabel}>BAGGAGE</span>
                    <strong className={styles.modalMetaVal}>Belt {activeScanFlight.arrival?.baggage || '3'}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.copyLinkBtn}
                    onClick={() => handleCopyShareLink(
                      activeScanFlight.flight?.iata || '',
                      activeScanFlight.departure?.iata || '',
                      activeScanFlight.arrival?.iata || ''
                    )}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    {copyToast ? 'Link Copied! Ready to Scan' : 'Copy Scannable Flight Link'}
                  </button>

                  <button
                    type="button"
                    className={styles.closeDoneBtn}
                    onClick={() => setActiveScanFlight(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
