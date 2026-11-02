'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlightResults from './FlightResults';
import { findAirportsByPlace } from '../data/placeMapping';
import { findNearestAirportsByRoad } from '../lib/roadDistance';
import styles from './SearchInterface.module.css';

const popularAirports = [
  { iata: 'DEL', city: 'Delhi', name: 'Indira Gandhi Intl' },
  { iata: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Intl' },
  { iata: 'BLR', city: 'Bengaluru', name: 'Kempegowda Intl' },
  { iata: 'GOI', city: 'Goa', name: 'Dabolim Intl' },
  { iata: 'JAI', city: 'Jaipur', name: 'Jaipur Intl' },
  { iata: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam Intl' },
  { iata: 'COK', city: 'Kochi', name: 'Cochin Intl' },
  { iata: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Intl' }
];

export default function SearchInterface() {
  const [activeTab, setActiveTab] = useState('route'); // 'route' | 'airport' | 'flight'
  const [query, setQuery] = useState('');
  const [fromAirport, setFromAirport] = useState('DEL');
  const [toAirport, setToAirport] = useState('BOM');
  const [isSwapping, setIsSwapping] = useState(false);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [serverNow, setServerNow] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentFlights, setRecentFlights] = useState([]);

  // Road Distance & Geolocation State
  const [isLocatingRoad, setIsLocatingRoad] = useState(false);
  const [nearestRoadInfo, setNearestRoadInfo] = useState(null);
  const [locateRoadError, setLocateRoadError] = useState(null);

  // Pinned Flights State
  const [pinnedFlights, setPinnedFlights] = useState([]);

  // Time-based greeting
  const [greeting, setGreeting] = useState('Good Day, Aviator');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning, Aviator');
    else if (hr < 17) setGreeting('Good Afternoon, Aviator');
    else setGreeting('Good Evening, Aviator');
  }, []);

  const loadHistory = () => {
    try {
      const searches = localStorage.getItem('flight_tracker_searches');
      const clicked = localStorage.getItem('flight_tracker_clicked_flights');
      if (searches) setRecentSearches(JSON.parse(searches));
      if (clicked) setRecentFlights(JSON.parse(clicked));
    } catch (e) {
      console.error(e);
    }
  };

  const loadPinnedFlights = () => {
    try {
      const savedStr = localStorage.getItem('flightdeck_saved_flights');
      if (savedStr) {
        setPinnedFlights(JSON.parse(savedStr));
      } else {
        setPinnedFlights([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnpinFlight = (flightCode) => {
    try {
      const savedStr = localStorage.getItem('flightdeck_saved_flights');
      let saved = savedStr ? JSON.parse(savedStr) : [];
      saved = saved.filter(f => (f.flight?.iata || f.flight?.icao) !== flightCode);
      localStorage.setItem('flightdeck_saved_flights', JSON.stringify(saved));
      setPinnedFlights(saved);
      window.dispatchEvent(new Event('flightdeck_saved_flights_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const getArrivalEtaText = (flight) => {
    if (!flight) return { text: 'Scheduled', isLive: false };
    const status = flight.flight_status?.toLowerCase();
    if (status === 'landed') return { text: 'Landed', isLive: false, pillClass: 'landed' };
    
    const arrTime = flight.arrival?.scheduled;
    if (!arrTime) return { text: 'In Flight', isLive: true, pillClass: 'active' };
    
    const diffMins = Math.round((new Date(arrTime).getTime() - Date.now()) / 60000);
    if (diffMins <= 0) return { text: 'Landed & Taxiing', isLive: false, pillClass: 'landed' };
    if (diffMins < 60) return { text: `In ${diffMins} mins`, isLive: true, pillClass: 'active' };
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return { text: `In ${h}h ${m}m`, isLive: true, pillClass: 'active' };
  };

  useEffect(() => {
    loadHistory();
    loadPinnedFlights();
    window.addEventListener('flightdeck_saved_flights_updated', loadPinnedFlights);

    // Support deep-linking and multi-page routing (?airport=DEL, ?flight=6E205, ?from=DEL&to=BOM)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const airportParam = params.get('airport');
      const flightParam = params.get('flight');
      const fromParam = params.get('from');
      const toParam = params.get('to');
      const airlineParam = params.get('airline');

      if (airportParam) {
        setActiveTab('airport');
        setQuery(airportParam.toUpperCase());
        performSearch(airportParam.toUpperCase(), 'airport');
      } else if (flightParam) {
        setActiveTab('flight');
        setQuery(flightParam.toUpperCase());
        performSearch(flightParam.toUpperCase(), 'flight');
      } else if (fromParam && toParam) {
        setActiveTab('route');
        setFromAirport(fromParam.toUpperCase());
        setToAirport(toParam.toUpperCase());
        performSearch('', 'route', { dep: fromParam.toUpperCase(), arr: toParam.toUpperCase() });
      } else if (airlineParam) {
        setActiveTab('flight');
        setQuery(airlineParam.toUpperCase());
        performSearch(airlineParam.toUpperCase(), 'flight');
      }
    }

    return () => window.removeEventListener('flightdeck_saved_flights_updated', loadPinnedFlights);
  }, []);

  const saveSearchHistory = (q, type) => {
    try {
      const historyStr = localStorage.getItem('flight_tracker_searches');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      history = history.filter(item => !(item.query.toLowerCase() === q.toLowerCase() && item.type === type));
      history.unshift({ query: q.toUpperCase(), type, timestamp: Date.now() });
      history = history.slice(0, 5);
      localStorage.setItem('flight_tracker_searches', JSON.stringify(history));
      setRecentSearches(history);
    } catch (e) {
      console.error(e);
    }
  };

  const performSearch = async (q, type, extraParams = {}) => {
    setLoading(true);
    setError(null);
    setFlights([]);
    setSearched(true);
    setActiveSection('flights');

    try {
      const localDate = new Date();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const clientNow = Date.now();

      let url = '';
      if (type === 'route') {
        const dep = (extraParams.dep || fromAirport).trim().toUpperCase();
        const arr = (extraParams.arr || toAirport).trim().toUpperCase();
        url = `/api/flights?type=route&dep=${dep}&arr=${arr}&date=${dateStr}&clientNow=${clientNow}`;
        saveSearchHistory(`${dep} → ${arr}`, 'route');
      } else {
        if (!q.trim()) return;
        url = `/api/flights?type=${type}&query=${encodeURIComponent(q.trim())}&date=${dateStr}&clientNow=${clientNow}`;
        saveSearchHistory(q.trim(), type);
      }

      const fetchStart = Date.now();
      const res = await fetch(url);
      const data = await res.json();

      // Ensure at least 1.2s for the cinematic mechanical split-flap flip to shine
      const elapsed = Date.now() - fetchStart;
      if (elapsed < 1200) {
        await new Promise(r => setTimeout(r, 1200 - elapsed));
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        if (data.serverNow) setServerNow(data.serverNow);
      } else {
        setError(type === 'route' 
          ? `No scheduled direct flights found between ${fromAirport} and ${toAirport} for today.`
          : 'No flights found. Try a different code.'
        );
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Road Distance & Real Location Engine
  const handleLocateNearestByRoad = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocateRoadError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingRoad(true);
    setLocateRoadError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearestList = await findNearestAirportsByRoad(pos.coords.latitude, pos.coords.longitude, 1);
          if (nearestList.length > 0) {
            const nearest = nearestList[0];
            setNearestRoadInfo(nearest);
            setQuery(nearest.iata);
            performSearch(nearest.iata, 'airport');
          } else {
            setLocateRoadError('No commercial airport found within road network reach.');
          }
        } catch (err) {
          console.error('Road distance computation failed:', err);
          setLocateRoadError('Failed to compute highway driving distances.');
        } finally {
          setIsLocatingRoad(false);
        }
      },
      (err) => {
        setIsLocatingRoad(false);
        setLocateRoadError('Location permission denied. Please enter an airport or city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'route') {
      performSearch('', 'route');
    } else if (activeTab === 'airport') {
      const trimmed = query.trim();
      const placeMatches = trimmed.length >= 2 ? findAirportsByPlace(trimmed) : [];
      if (placeMatches.length > 0 && trimmed.length > 3) {
        const resolvedIata = placeMatches[0].airportIata;
        setQuery(resolvedIata);
        performSearch(resolvedIata, 'airport');
      } else {
        performSearch(query, 'airport');
      }
    } else {
      performSearch(query, activeTab);
    }
  };

  const handleSwapAirports = () => {
    setIsSwapping(true);
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
    setTimeout(() => setIsSwapping(false), 400);
  };

  const handleHistoryClick = (q, type) => {
    if (type === 'route') {
      const parts = q.split('→').map(s => s.trim());
      if (parts.length === 2) {
        setActiveTab('route');
        setFromAirport(parts[0]);
        setToAirport(parts[1]);
        performSearch('', 'route', { dep: parts[0], arr: parts[1] });
      }
    } else {
      setActiveTab(type);
      setQuery(q.toUpperCase());
      performSearch(q, type);
    }
  };

  const handleDestinationSelect = (iata) => {
    setActiveTab('airport');
    setQuery(iata);
    performSearch(iata, 'airport');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleAirlineSelect = (airline) => {
    setActiveTab('flight');
    setQuery(airline.iata);
    performSearch(airline.hub, 'airport');
  };

  const handleClear = () => {
    setQuery('');
    setFlights([]);
    setError(null);
    setSearched(false);
    loadHistory();
  };

  const getAirportDetails = (code) => {
    return popularAirports.find(a => a.iata === code) || { iata: code, city: code, name: 'Airport' };
  };

  return (
    <>
      {/* Mobile & Web Hero Header with World Map Graphic Motif */}
      <div className={styles.heroSection}>
        <div className={styles.worldMapDots} aria-hidden="true" />
        <div className={styles.heroTopBar}>
          <div className={styles.greetingGroup}>
            <span className={styles.greetingText}>{greeting}</span>
            <h1 className={styles.heroTitle}>Where Are You Going?</h1>
          </div>
          <div className={styles.liveFeedsPill}>
            <span className={styles.pulseDot} />
            <span className={styles.liveFeedText}>ADS-B LIVE</span>
          </div>
        </div>

        {/* Elevated Search Card */}
        <div className={styles.searchCard}>
          {/* Segmented Top Tabs */}
          <div className={styles.tabs} role="tablist">
            <button
              className={`${styles.tabBtn} ${activeTab === 'route' ? styles.active : ''}`}
              onClick={() => { setActiveTab('route'); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'route'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              Route Search
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'flight' ? styles.active : ''}`}
              onClick={() => { setActiveTab('flight'); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'flight'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Flight Status
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'airport' ? styles.active : ''}`}
              onClick={() => { setActiveTab('airport'); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'airport'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
              Airport Board
            </button>
          </div>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            {/* Route Tab: From -> Swap -> To */}
            {activeTab === 'route' && (
              <div className={styles.routeBoxes}>
                <div className={styles.routeBox}>
                  <span className={styles.routeLabel}>FROM</span>
                  <div className={styles.routeAirport}>
                    <input
                      type="text"
                      value={fromAirport}
                      onChange={(e) => setFromAirport(e.target.value.toUpperCase())}
                      maxLength={3}
                      className={styles.iataInput}
                      placeholder="DEL"
                    />
                    <div className={styles.routeSub}>
                      <strong>{getAirportDetails(fromAirport).city}</strong>
                      <span>{getAirportDetails(fromAirport).name}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className={`${styles.swapBtn} ${isSwapping ? styles.swapping : ''}`}
                  title="Swap Origin and Destination"
                  aria-label="Swap Origin and Destination"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                </button>

                <div className={styles.routeBox}>
                  <span className={styles.routeLabel}>TO</span>
                  <div className={styles.routeAirport}>
                    <input
                      type="text"
                      value={toAirport}
                      onChange={(e) => setToAirport(e.target.value.toUpperCase())}
                      maxLength={3}
                      className={styles.iataInput}
                      placeholder="BOM"
                    />
                    <div className={styles.routeSub}>
                      <strong>{getAirportDetails(toAirport).city}</strong>
                      <span>{getAirportDetails(toAirport).name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Airport Board or Flight Status Tab */}
            {activeTab !== 'route' && (
              <div className={styles.singleInputWrapper}>
                <label htmlFor="searchQuery" className={styles.routeLabel}>
                  {activeTab === 'airport' ? 'AIRPORT IATA (DEL) OR PLACE/TOWN (AGRA, RISHIKESH, OOTY)' : 'FLIGHT CALLSIGN / NUMBER'}
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="searchQuery"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value.toUpperCase());
                      setNearestRoadInfo(null);
                    }}
                    placeholder={activeTab === 'airport' ? 'e.g. DEL, BOM or place like Agra, Rishikesh, Ooty...' : 'e.g. 6E205, AI101, UK955, SG8169'}
                    className={styles.mainInput}
                    maxLength={activeTab === 'airport' ? 30 : 10}
                  />
                  {searched && (
                    <button type="button" onClick={handleClear} className={styles.clearBtn} title="Clear search" aria-label="Clear search">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Airport Tab Extra Features: Place Resolver & Nearest Airport by Road */}
                {activeTab === 'airport' && (
                  <>
                    <div className={styles.airportExtraControls}>
                      {query.trim().length >= 2 && findAirportsByPlace(query.trim()).length > 0 ? (
                        <button
                          type="button"
                          className={styles.placeSuggestionPill}
                          onClick={() => {
                            const match = findAirportsByPlace(query.trim())[0];
                            setQuery(match.airportIata);
                            performSearch(match.airportIata, 'airport');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Place: {findAirportsByPlace(query.trim())[0].place} → {findAirportsByPlace(query.trim())[0].airportIata} ({findAirportsByPlace(query.trim())[0].airportName})</span>
                        </button>
                      ) : <span />}

                      <button
                        type="button"
                        onClick={handleLocateNearestByRoad}
                        disabled={isLocatingRoad}
                        className={styles.nearbyLocatePill}
                        title="Find Nearest Airport to Your Location"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                        </svg>
                        <span>{isLocatingRoad ? 'Locating Serving Airport...' : 'Nearest Airport'}</span>
                      </button>
                    </div>

                    {nearestRoadInfo && (
                      <div className={styles.roadLocationToast}>
                        <div>
                          <strong>Nearest Airport: {nearestRoadInfo.name} ({nearestRoadInfo.iata})</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {nearestRoadInfo.routeDescription}
                          </div>
                        </div>
                        <span className={styles.roadMetricsText}>
                          {nearestRoadInfo.roadDistanceKm} km • ~{nearestRoadInfo.durationText}
                        </span>
                      </div>
                    )}

                    {locateRoadError && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>
                        {locateRoadError}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Live Flight Radar Date Banner (Today Only) */}
            <div className={styles.dateRow}>
              <div className={styles.dateLabelGroup}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Live Flight Radar</span>
              </div>

              <div className={styles.datePills}>
                <div className={styles.datePillLive}>
                  <span className={styles.livePulseDot} />
                  <span>Today's Active Schedule</span>
                </div>
              </div>
            </div>

            {/* Quick Popular Indian Airports */}
            <div className={styles.quickAirports}>
              <span className={styles.quickLabel}>Quick Hubs:</span>
              <div className={styles.quickChips}>
                {popularAirports.slice(0, 6).map((ap) => (
                  <button
                    key={ap.iata}
                    type="button"
                    className={styles.quickChip}
                    onClick={() => {
                      if (activeTab === 'route') {
                        setToAirport(ap.iata);
                      } else {
                        setQuery(ap.iata);
                        performSearch(ap.iata, 'airport');
                      }
                    }}
                  >
                    <strong>{ap.iata}</strong> {ap.city}
                  </button>
                ))}
              </div>
            </div>

            {/* Search CTA Button */}
            <button type="submit" className={styles.ctaBtn} disabled={loading}>
              {loading ? (
                <span className={styles.loadingSpinner}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.spinIcon}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Tracking Live Flight...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>{activeTab === 'route' ? 'Search Direct Flights' : 'Track Live Status'}</span>
                </>
              )}
            </button>
          </form>

          {/* Recent Searches */}
          {!searched && recentSearches.length > 0 && (
            <div className={styles.recentSection}>
              <span className={styles.recentTitle}>Recent Searches</span>
              <div className={styles.recentChips}>
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    className={styles.recentChip}
                    onClick={() => handleHistoryClick(item.query, item.type)}
                  >
                    <span>{item.query}</span>
                    <span className={styles.chipTag}>{item.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned / Saved Flights Quick Hub on Home Screen */}
      {pinnedFlights.length > 0 && (
        <section className={styles.savedFlightsSection} aria-label="Pinned Flights">
          <div className={styles.savedFlightsHeader}>
            <div className={styles.savedFlightsTitle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="var(--accent)">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              <span>Pinned Live Flights</span>
              <span className={styles.savedFlightsCount}>{pinnedFlights.length}</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quick Live Tracking</span>
          </div>

          <div className={styles.savedFlightsGrid}>
            {pinnedFlights.map((flight, idx) => {
              const flightCode = flight.flight?.iata || flight.flight?.icao || 'N/A';
              const depIata = flight.departure?.iata || '---';
              const arrIata = flight.arrival?.iata || '---';
              const depCity = flight.departure?.airport?.split(' ')[0] || depIata;
              const arrCity = flight.arrival?.airport?.split(' ')[0] || arrIata;
              const eta = getArrivalEtaText(flight);

              return (
                <div key={idx} className={styles.savedFlightCard}>
                  <div className={styles.savedCardTop}>
                    <div className={styles.savedCarrierRow}>
                      <span className={styles.savedFlightCode}>{flightCode}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {flight.airline?.name || 'Commercial Airline'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.unpinBtn}
                      onClick={() => handleUnpinFlight(flightCode)}
                      title="Unpin Flight"
                      aria-label={`Unpin flight ${flightCode}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className={styles.savedRouteRow}>
                    <div className={styles.savedStation}>
                      <span className={styles.savedIata}>{depIata}</span>
                      <span className={styles.savedCity}>{depCity}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span className={`${styles.savedEtaBadge} ${eta.isLive ? styles.savedEtaActive : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                        {eta.text}
                      </span>
                    </div>

                    <div className={styles.savedStation} style={{ textAlign: 'right', alignItems: 'flex-end' }}>
                      <span className={styles.savedIata}>{arrIata}</span>
                      <span className={styles.savedCity}>{arrCity}</span>
                    </div>
                  </div>

                  {/* Detailed Terminal, Gate & Belt Telemetry */}
                  <div className={styles.savedMetaGrid}>
                    <div className={styles.savedMetaItem}>
                      <span className={styles.savedMetaLabel}>TERMINAL</span>
                      <span className={styles.savedMetaValue}>
                        {flight.arrival?.terminal ? `T${flight.arrival.terminal}` : (flight.departure?.terminal ? `T${flight.departure.terminal}` : 'T1')}
                      </span>
                    </div>

                    <div className={styles.savedMetaItem}>
                      <span className={styles.savedMetaLabel}>GATE</span>
                      <span className={styles.savedMetaValue}>
                        {flight.departure?.gate ? `G${flight.departure.gate}` : (flight.arrival?.gate ? `G${flight.arrival.gate}` : 'TBD')}
                      </span>
                    </div>

                    <div className={styles.savedMetaItem}>
                      <span className={styles.savedMetaLabel}>BAGGAGE BELT</span>
                      <span className={styles.savedMetaValue} style={{ color: flight.arrival?.baggage ? '#10b981' : 'var(--text-primary)' }}>
                        {flight.arrival?.baggage ? `Belt ${flight.arrival.baggage}` : 'TBD'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.savedCardAction}>
                    <button
                      type="button"
                      className={styles.trackSavedBtn}
                      onClick={() => {
                        setActiveTab('flight');
                        setQuery(flightCode);
                        performSearch(flightCode, 'flight');
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                    >
                      Track Live Board
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Flight Results View */}
      <div id="results-view">
        <FlightResults 
          flights={flights} 
          loading={loading} 
          error={error} 
          serverNow={serverNow} 
          searchContext={{ activeTab, query, fromAirport, toAirport }} 
        />
      </div>

      {/* Multi-page Quick Navigation Links */}
      <div className={styles.quickNavSection}>
        <div className={styles.quickNavGrid}>
          <Link href="/airports" className={styles.quickNavCard}>
            <div className={styles.quickNavIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className={styles.quickNavContent}>
              <div className={styles.quickNavHeader}>
                <strong className={styles.quickNavTitle}>144 Indian Public Airports</strong>
                <span className={styles.quickNavBadge}>144 AIRPORTS</span>
              </div>
              <p className={styles.quickNavDesc}>
                Explore full directory of operational commercial airports in India and iconic landmarks from Kashmir to Kerala.
              </p>
            </div>
          </Link>

          <Link href="/airlines" className={styles.quickNavCard}>
            <div className={styles.quickNavIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
            </div>
            <div className={styles.quickNavContent}>
              <div className={styles.quickNavHeader}>
                <strong className={styles.quickNavTitle}>Indian Airlines Fleet</strong>
                <span className={styles.quickNavBadge}>9 CARRIERS</span>
              </div>
              <p className={styles.quickNavDesc}>
                Official carrier directory with genuine vector logos, callsigns, hubs, and direct booking links.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
