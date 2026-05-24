import { useState, useEffect } from 'react';
import FlightTrajectory from './FlightTrajectory';

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
import styles from './FlightResults.module.css';

const iataCityMap = {
  // Indian Airports
  'DEL': 'Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bengaluru',
  'CCU': 'Kolkata',
  'MAA': 'Chennai',
  'HYD': 'Hyderabad',
  'COK': 'Kochi',
  'AMD': 'Ahmedabad',
  'PNQ': 'Pune',
  'JAI': 'Jaipur',
  'IXL': 'Leh',
  'GOI': 'Goa',
  'GOX': 'Goa',
  'TRV': 'Thiruvananthapuram',
  'SXR': 'Srinagar',
  'IXB': 'Bagdogra',
  'GAU': 'Guwahati',
  'LKO': 'Lucknow',
  'PAT': 'Patna',
  'BBI': 'Bhubaneswar',
  'IND': 'Indore',
  'VGA': 'Vijayawada',
  'IXC': 'Chandigarh',
  'CJB': 'Coimbatore',
  'NAG': 'Nagpur',
  'BDQ': 'Vadodara',
  'SXV': 'Salem',
  'JLR': 'Jabalpur',
  'VTZ': 'Visakhapatnam',
  'IXR': 'Ranchi',
  'IXJ': 'Jammu',
  'IXZ': 'Port Blair',
  
  // International Airports
  'JFK': 'New York',
  'LHR': 'London',
  'DXB': 'Dubai',
  'SIN': 'Singapore',
  'HND': 'Tokyo',
  'NRT': 'Tokyo',
  'CDG': 'Paris',
  'FRA': 'Frankfurt',
  'AMS': 'Amsterdam',
  'HKG': 'Hong Kong',
  'SYD': 'Sydney',
  'MEL': 'Melbourne',
  'BKK': 'Bangkok',
  'KUL': 'Kuala Lumpur',
  'ICN': 'Seoul',
  'PEK': 'Beijing',
  'PVG': 'Shanghai',
  'ORD': 'Chicago',
  'LAX': 'Los Angeles',
  'SFO': 'San Francisco',
  'MIA': 'Miami',
  'DFW': 'Dallas',
  'ATL': 'Atlanta',
  'YYZ': 'Toronto',
  'YVR': 'Vancouver',
  'MAD': 'Madrid',
  'FCO': 'Rome',
  'MUC': 'Munich',
  'IST': 'Istanbul',
  'DOH': 'Doha',
  'AUH': 'Abu Dhabi',
  'KIX': 'Osaka',
  'TPE': 'Taipei'
};

function getCityName(iata, airportName) {
  if (!iata) return '';
  const code = iata.toUpperCase().trim();
  if (iataCityMap[code]) {
    return iataCityMap[code];
  }
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
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'landed' || s === 'arrived') return styles.statusLanded;
  if (s === 'active' || s === 'en-route') return styles.statusActive;
  if (s === 'cancelled') return styles.statusCancelled;
  if (s === 'scheduled') return styles.statusScheduled;
  if (s === 'diverted') return styles.statusDiverted;
  return '';
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


export default function FlightResults({ flights, loading, error, serverNow }) {
  const hasDepartures = flights?.some(f => f.search_type === 'departure');
  const hasArrivals = flights?.some(f => f.search_type === 'arrival');
  const isAirportSearch = hasDepartures || hasArrivals;

  const [activeSubTab, setActiveSubTab] = useState('departure');
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertStatus, setAlertStatus] = useState({});

  // Reset states when flights array changes
  useEffect(() => {
    setActiveSubTab(hasDepartures ? 'departure' : (hasArrivals ? 'arrival' : 'departure'));
    setExpandedCardIndex(null);
    setAlertPhone('');
    setAlertStatus({});
  }, [flights, hasDepartures, hasArrivals]);

  const saveFlightHistory = (flight) => {
    try {
      const historyStr = localStorage.getItem('flight_tracker_clicked_flights');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      const flightNum = flight.flight?.iata || flight.flight?.icao || '';
      if (!flightNum) return;
      
      history = history.filter(item => {
        const itemNum = item.flight?.iata || item.flight?.icao || '';
        return itemNum.toLowerCase() !== flightNum.toLowerCase();
      });
      
      history.unshift({
        flight: {
          iata: flight.flight?.iata,
          icao: flight.flight?.icao,
          number: flight.flight?.number
        },
        departure: {
          iata: flight.departure?.iata,
          airport: flight.departure?.airport
        },
        arrival: {
          iata: flight.arrival?.iata,
          airport: flight.arrival?.airport
        },
        airline: {
          name: flight.airline?.name
        },
        timestamp: Date.now()
      });
      
      history = history.slice(0, 5);
      localStorage.setItem('flight_tracker_clicked_flights', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (index, flight) => {
    if (expandedCardIndex === index) {
      setExpandedCardIndex(null);
    } else {
      setExpandedCardIndex(index);
      saveFlightHistory(flight);
    }
  };

  const getMockTemp = (iata) => {
    if (!iata) return 24;
    const hash = iata.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 15) + 18; // 18 to 32 degrees C
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          <span>Fetching flight data...</span>
        </div>
      </div>
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

  // Compute effective time for each flight + client-side time filter
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

  // Client-side: remove flights whose time is more than 2 min in the past
  // but keep active (in-air) and recently landed flights
  const graceMs = 2 * 60 * 1000;
  const clientFiltered = withTime.filter(({ flight: f, effectiveMs }) => {
    if (effectiveMs >= now - graceMs) return true; // future or within grace
    const status = f.flight_status?.toLowerCase();
    if (status === 'active' || status === 'en-route') return true; // in-air
    if (status === 'landed' || status === 'arrived') {
      const arrTime = getUtcTime(
        f.arrival?.actual || f.arrival?.estimated || f.arrival?.scheduled,
        f.arrival?.iata, f.arrival?.timezone
      );
      if (now - arrTime <= 50 * 60 * 1000) return true; // recently landed
    }
    return false;
  });

  // Sort ascending by effective time (nearest upcoming first)
  clientFiltered.sort((a, b) => a.effectiveMs - b.effectiveMs);
  const sortedFlights = clientFiltered.map(item => item.flight);

  const departureCount = flights.filter(f => f.search_type === 'departure').length;
  const arrivalCount = flights.filter(f => f.search_type === 'arrival').length;

  return (
    <div className={styles.container}>
      {/* Airport Departures & Arrivals Tabs */}
      {isAirportSearch && (
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
      )}

      <div className={styles.resultsHeader}>
        <span className={styles.resultCount}>
          {sortedFlights.length} {isAirportSearch ? activeSubTab : ''} flight{sortedFlights.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className={styles.grid}>
        {sortedFlights.map((flight, i) => {
          const isDiverted = flight.flight_status?.toLowerCase() === 'diverted';
          const isDelayedMajor = (flight.departure?.delay && flight.departure.delay >= 60) || (flight.arrival?.delay && flight.arrival.delay >= 60);
          const isDelayedSubtle = (flight.departure?.delay && flight.departure.delay > 0) || (flight.arrival?.delay && flight.arrival.delay > 0);
          const isExpanded = expandedCardIndex === i;

          return (
            <div 
              key={i} 
              className={`${styles.card} ${styles.cardFadeIn} ${isDelayedMajor ? styles.cardDelayedHighlight : (isDelayedSubtle ? styles.cardDelayed : '')} ${isExpanded ? styles.cardExpanded : ''}`} 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Card Interactive Trigger Area */}
              <div 
                className={styles.cardInteractiveArea} 
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
                {/* Diverted alert banner */}
                {isDiverted && (
                  <div className={styles.divertedBanner}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>FLIGHT DIVERTED - SEE DETAILS BELOW</span>
                  </div>
                )}

                {/* Major Delay warning banner */}
                {isDelayedMajor && !isDiverted && (
                  <div className={styles.delayBanner}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>MAJOR DELAY - FLIGHT RESCHEDULED BY +{flight.departure?.delay || flight.arrival?.delay} MIN</span>
                  </div>
                )}

                {/* Trajectory visualization */}
                <FlightTrajectory flight={flight} />

                {/* Detail row */}
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>DEPARTURE</span>
                    <span className={styles.detailValue}>
                      {getCityName(flight.departure?.iata, flight.departure?.airport) ? `${getCityName(flight.departure.iata, flight.departure.airport)} - ` : ''}
                      {flight.departure?.airport || 'N/A'}
                    </span>
                    <span className={styles.detailTime}>
                      {formatTime(flight.departure?.scheduled)}
                      {flight.departure?.scheduled && (
                        <span className={styles.dateLabel}> • {formatDate(flight.departure.scheduled)}</span>
                      )}
                      {flight.departure?.actual && flight.departure?.actual !== flight.departure?.scheduled && (
                        <span className={styles.actualTime}> (Act: {formatTime(flight.departure.actual)})</span>
                      )}
                    </span>
                    {flight.departure?.delay ? (
                      <span className={`${styles.delayBadge} ${styles.delayDelayed}`}>
                        Delayed +{flight.departure.delay}m
                      </span>
                    ) : flight.departure?.delay === 0 ? (
                      <span className={`${styles.delayBadge} ${styles.delayOnTime}`}>On Time</span>
                    ) : null}
                  </div>
                  
                  <div className={styles.detailItem} style={{ textAlign: 'right' }}>
                    <span className={styles.detailLabel}>ARRIVAL</span>
                    <span className={styles.detailValue}>
                      {getCityName(flight.arrival?.iata, flight.arrival?.airport) ? `${getCityName(flight.arrival.iata, flight.arrival.airport)} - ` : ''}
                      {flight.arrival?.airport || 'N/A'}
                    </span>
                    <span className={styles.detailTime}>
                      {formatTime(flight.arrival?.scheduled)}
                      {flight.arrival?.scheduled && (
                        <span className={styles.dateLabel}> • {formatDate(flight.arrival.scheduled)}</span>
                      )}
                      {flight.arrival?.estimated && (
                        <span className={styles.etaText}> (ETA: {formatTime(flight.arrival.estimated)})</span>
                      )}
                    </span>
                    {flight.arrival?.delay ? (
                      <span className={`${styles.delayBadge} ${styles.delayDelayed}`} style={{ alignSelf: 'flex-end' }}>
                        Delayed +{flight.arrival.delay}m
                      </span>
                    ) : flight.arrival?.delay === 0 ? (
                      <span className={`${styles.delayBadge} ${styles.delayOnTime}`} style={{ alignSelf: 'flex-end' }}>On Time</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Expandable Details Drawer */}
              {isExpanded && (
                <div className={styles.expandedPanel}>
                  <div className={styles.expandedGrid}>
                    
                    {/* Col 1: Timetable & Full Airport details */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        FLIGHT SCHEDULE
                      </h4>
                      <div className={styles.infoCard}>
                        <div className={styles.airportBlock}>
                          <strong className={styles.airportBlockTitle}>Departure</strong>
                          <span className={styles.airportNameFull}>{flight.departure?.airport || 'N/A'}</span>
                          <span className={styles.airportMeta}>
                            City: {getCityName(flight.departure?.iata, flight.departure?.airport) || 'N/A'} | Timezone: {flight.departure?.timezone || 'N/A'}
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
                            City: {getCityName(flight.arrival?.iata, flight.arrival?.airport) || 'N/A'} | Timezone: {flight.arrival?.timezone || 'N/A'}
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                        AIRLINE & AIRCRAFT
                      </h4>
                      <div className={styles.infoCard}>
                        {/* Airline Brand & Logo */}
                        <div className={styles.airlineBrandBlock}>
                          <div className={styles.airlineLogoPlaceholder}>
                            {flight.airline?.name ? flight.airline.name.charAt(0).toUpperCase() : 'F'}
                          </div>
                          <div className={styles.airlineTextDetails}>
                            <span className={styles.airlineNameExpanded}>{flight.airline?.name || 'Unknown Airline'}</span>
                            <span className={styles.airlineCodes}>
                              IATA: {flight.airline?.iata || 'N/A'} | ICAO: {flight.airline?.icao || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Model IATA/ICAO</span>
                          <span className={styles.dataValue}>{flight.aircraft?.iata || flight.aircraft?.icao || 'N/A'}</span>
                        </div>
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Registration No.</span>
                          <span className={styles.dataValue}>{flight.aircraft?.registration || 'N/A'}</span>
                        </div>
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>Transponder (Hex)</span>
                          <span className={styles.dataValue} style={{ fontFamily: 'var(--font-mono)' }}>{flight.aircraft?.icao24 || 'N/A'}</span>
                        </div>

                        {flight.live ? (
                          <>
                            <div className={styles.divider} />
                            <strong className={styles.subHeader}>Live Telemetry</strong>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>Coordinates</span>
                              <span className={styles.dataValue}>{flight.live.latitude?.toFixed(4)}°, {flight.live.longitude?.toFixed(4)}°</span>
                            </div>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>Altitude</span>
                              <span className={styles.dataValue}>{flight.live.altitude?.toLocaleString()} M</span>
                            </div>
                            <div className={styles.dataRow}>
                              <span className={styles.dataLabel}>Heading Angle</span>
                              <span className={styles.dataValue}>{flight.live.direction}°</span>
                            </div>
                          </>
                        ) : (
                          <div className={styles.telemetryOffline}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            <span>Live GPS Unavailable</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Destination Weather */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
                        ARRIVAL WEATHER
                      </h4>
                      <div className={styles.weatherCard}>
                        <div className={styles.weatherHeader}>
                          <span className={styles.weatherCity}>{getCityName(flight.arrival?.iata, flight.arrival?.airport) || flight.arrival?.iata || 'Arrival'}</span>
                          <span className={styles.weatherSub}>Live forecast</span>
                        </div>
                        <div className={styles.weatherMain}>
                          <span className={styles.weatherTemp}>{getMockTemp(flight.arrival?.iata)}°C</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.07-1.22.2A5 5 0 0 0 5 13c0 2.2 1.8 4 4 4h8.5Z"/></svg>
                        </div>
                        <div className={styles.weatherDetails}>
                          <div className={styles.weatherDetail}>
                            <span>Wind:</span> <strong>12 km/h</strong>
                          </div>
                          <div className={styles.weatherDetail}>
                            <span>Humid:</span> <strong>58%</strong>
                          </div>
                          <div className={styles.weatherDetail}>
                            <span>Condition:</span> <strong>Clear Sky</strong>
                          </div>
                        </div>
                        <span className={styles.apiTag}>Powered by WeatherAPI</span>
                      </div>
                    </div>

                    {/* Col 4: SMS Alert Subscription */}
                    <div className={styles.expandedColumn}>
                      <h4 className={styles.sectionHeader}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 9.92z"/></svg>
                        FLIGHT NOTIFIER
                      </h4>
                      <div className={styles.alertCard}>
                        <span className={styles.alertTitle}>SMS / WhatsApp Notifications</span>
                        <p className={styles.alertDesc}>Get instant gates & delay updates powered by Twilio API.</p>
                        
                        {alertStatus[i] === 'success' ? (
                          <div className={styles.alertSuccess}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Subscribed {alertPhone}!</span>
                          </div>
                        ) : (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!alertPhone.trim()) return;
                              setAlertStatus(prev => ({ ...prev, [i]: 'success' }));
                            }}
                            className={styles.alertForm}
                            onClick={(e) => e.stopPropagation()} // Prevent card collapse when clicking form
                          >
                            <input 
                              type="tel"
                              value={alertPhone}
                              onChange={(e) => setAlertPhone(e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className={styles.alertInput}
                              required
                            />
                            <button type="submit" className={styles.alertButton}>
                              Notify Me
                            </button>
                          </form>
                        )}
                        <span className={styles.apiTag}>Twilio Gateway Sandbox</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Footer info */}
              <div className={styles.cardFooter}>
                <span className={styles.footerItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  {flight.airline?.name || 'Unknown'}
                </span>
                
                {flight.departure?.gate && (
                  <span className={styles.footerItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <polyline points="12 12 16 14"></polyline>
                    </svg>
                    Gate {flight.departure.gate}
                  </span>
                )}
                
                {flight.departure?.terminal && (
                  <span className={styles.footerItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    Dep Term {flight.departure.terminal}
                  </span>
                )}

                {flight.arrival?.terminal && (
                  <span className={styles.footerItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    Arr Term {flight.arrival.terminal}
                  </span>
                )}

                {flight.arrival?.baggage && (
                  <span className={`${styles.footerItem} ${styles.baggageHighlight}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="14" width="18" height="4" rx="1" ry="1"></rect>
                      <path d="M12 2v12"></path>
                      <path d="M7 10h10"></path>
                    </svg>
                    Belt {flight.arrival.baggage}
                  </span>
                )}

                {/* Expand/Collapse details link */}
                <button
                  type="button"
                  className={styles.expandToggleBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(i, flight);
                  }}
                >
                  <span>{isExpanded ? 'Collapse Details' : 'View Full Details'}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`${styles.toggleArrow} ${isExpanded ? styles.arrowOpen : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
