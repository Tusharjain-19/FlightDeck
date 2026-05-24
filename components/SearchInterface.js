'use client';

import { useState, useEffect } from 'react';
import FlightResults from './FlightResults';
import styles from './SearchInterface.module.css';

export default function SearchInterface() {
  const [activeTab, setActiveTab] = useState('airport');
  const [query, setQuery] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [serverNow, setServerNow] = useState(null);
  
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentFlights, setRecentFlights] = useState([]);

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

  useEffect(() => {
    loadHistory();
  }, []);

  const saveSearchHistory = (q, type) => {
    try {
      const historyStr = localStorage.getItem('flight_tracker_searches');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      // Filter out duplicate queries to keep it clean, then add to front
      history = history.filter(item => !(item.query.toLowerCase() === q.toLowerCase() && item.type === type));
      history.unshift({ query: q.toUpperCase(), type, timestamp: Date.now() });
      
      // Cap history at 5 items
      history = history.slice(0, 5);
      localStorage.setItem('flight_tracker_searches', JSON.stringify(history));
      setRecentSearches(history);
    } catch (e) {
      console.error(e);
    }
  };

  const performSearch = async (q, type) => {
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setFlights([]);
    setSearched(true);

    try {
      const localDate = new Date();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const clientNow = Date.now();

      const res = await fetch(`/api/flights?type=${type}&query=${encodeURIComponent(q.trim())}&date=${dateStr}&clientNow=${clientNow}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        if (data.serverNow) setServerNow(data.serverNow);
        saveSearchHistory(q.trim(), type);
      } else {
        setError('No flights found. Try a different code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query, activeTab);
  };

  const handleHistoryClick = (q, type) => {
    setActiveTab(type);
    setQuery(q.toUpperCase());
    performSearch(q, type);
  };

  const handleClear = () => {
    setQuery('');
    setFlights([]);
    setError(null);
    setSearched(false);
    loadHistory();
  };

  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'airport' ? styles.active : ''}`}
            onClick={() => { setActiveTab('airport'); setQuery(''); setFlights([]); setError(null); setSearched(false); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
            By Airport
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'flight' ? styles.active : ''}`}
            onClick={() => { setActiveTab('flight'); setQuery(''); setFlights([]); setError(null); setSearched(false); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            By Flight No.
          </button>
        </div>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.inputWrapper}>
            <label htmlFor="searchQuery" className={styles.label}>
              {activeTab === 'airport' ? 'Airport Code (e.g., JFK)' : 'Flight Number (e.g., AA100)'}
            </label>
            <div className={styles.inputGroup}>
              <input
                id="searchQuery"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder={activeTab === 'airport' ? 'Enter 3-letter IATA code' : 'Enter flight number'}
                className={styles.input}
                maxLength={activeTab === 'airport' ? 3 : 10}
              />
              
              {searched && (
                <button type="button" onClick={handleClear} className={styles.clearBtn} title="Clear search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <svg className={styles.spinnerBtn} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Search History & Recent Flights */}
        {!searched && (recentSearches.length > 0 || recentFlights.length > 0) && (
          <div className={styles.historyContainer}>
            {recentSearches.length > 0 && (
              <div className={styles.historySection}>
                <h3 className={styles.historyTitle}>Recent Searches</h3>
                <div className={styles.historyChips}>
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      className={styles.historyChip}
                      onClick={() => handleHistoryClick(item.query, item.type)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <span>{item.query}</span>
                      <span className={styles.chipType}>{item.type === 'airport' ? 'Airport' : 'Flight'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentFlights.length > 0 && (
              <div className={styles.historySection}>
                <h3 className={styles.historyTitle}>Recently Clicked</h3>
                <div className={styles.historyGrid}>
                  {recentFlights.map((item, idx) => {
                    const fNum = item.flight?.iata || item.flight?.icao || `FLIGHT ${item.flight?.number}`;
                    return (
                      <button
                        key={idx}
                        className={styles.historyFlightCard}
                        onClick={() => handleHistoryClick(fNum, 'flight')}
                      >
                        <div className={styles.hFlightHeader}>
                          <span className={styles.hFlightNum}>{fNum}</span>
                          <span className={styles.hFlightAirline}>{item.airline?.name}</span>
                        </div>
                        <div className={styles.hFlightRoute}>
                          <span>{item.departure?.iata}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                          <span>{item.arrival?.iata}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <FlightResults flights={flights} loading={loading} error={error} serverNow={serverNow} />
    </>
  );
}
