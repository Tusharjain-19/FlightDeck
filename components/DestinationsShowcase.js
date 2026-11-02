'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { iconicDestinations } from '../data/destinations';
import { indianPublicAirports } from '../data/airports';
import { findAirportsByPlace } from '../data/placeMapping';
import { findNearestAirportsByRoad } from '../lib/roadDistance';
import styles from './DestinationsShowcase.module.css';

export default function DestinationsShowcase({ onSelectDestination }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('featured'); // 'featured' | 'all' | 'nearby'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Geolocation & Road Distance state
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState([]);
  const [nearbyError, setNearbyError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  const handleAirportClick = (code) => {
    if (onSelectDestination) {
      onSelectDestination(code);
    } else {
      router.push(`/?airport=${code}`);
    }
  };

  // Find Nearest Airport by Real Geolocation & Driving Road Distance
  const handleLocateNearby = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setNearbyError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setNearbyError(null);
    setViewMode('nearby');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        try {
          // Calculate road driving distances (via OSRM live router & Indian highway model)
          const results = await findNearestAirportsByRoad(latitude, longitude, 6);
          setNearbyAirports(results);
        } catch (err) {
          console.error('Road distance computation failed:', err);
          setNearbyError('Failed to compute highway driving distances. Please try again.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation permission denied/unavailable:', err.message);
        setIsLocating(false);
        setNearbyError('Location permission denied or unavailable. Please enable location access or search by city.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Place-to-Airport matches for the current query
  const matchedPlaces = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    return findAirportsByPlace(searchQuery.trim());
  }, [searchQuery]);

  // Filtered Featured Destinations
  const filteredFeatured = useMemo(() => {
    return iconicDestinations.filter(item => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'NORTH') return ['DEL', 'JAI', 'SXR', 'AGR'].includes(item.iata);
      if (activeFilter === 'SOUTH') return ['BLR', 'COK'].includes(item.iata);
      if (activeFilter === 'WEST') return ['BOM', 'GOI'].includes(item.iata);
      if (activeFilter === 'EAST') return ['CCU'].includes(item.iata);
      return true;
    });
  }, [activeFilter]);

  // Filtered All Public Airports (including smart place resolution)
  const filteredAllAirports = useMemo(() => {
    const placeIatas = new Set(matchedPlaces.map(p => p.airportIata));

    return indianPublicAirports.filter(a => {
      const q = searchQuery.trim().toUpperCase();
      const matchesSearch = !q || 
        a.iata.includes(q) || 
        a.city.toUpperCase().includes(q) || 
        a.name.toUpperCase().includes(q) || 
        a.state.toUpperCase().includes(q) ||
        placeIatas.has(a.iata);

      if (!matchesSearch) return false;

      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'INTL') return a.type.toLowerCase().includes('international');
      if (activeFilter === 'NORTH') {
        return ['Delhi', 'Punjab', 'Haryana', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh'].some(s => a.state.includes(s));
      }
      if (activeFilter === 'SOUTH') {
        return ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana'].some(s => a.state.includes(s));
      }
      if (activeFilter === 'WEST') {
        return ['Maharashtra', 'Gujarat', 'Goa'].some(s => a.state.includes(s));
      }
      if (activeFilter === 'EAST') {
        return ['West Bengal', 'Bihar', 'Jharkhand', 'Odisha', 'Chhattisgarh'].some(s => a.state.includes(s));
      }
      if (activeFilter === 'NORTH-EAST') {
        return ['Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'].some(s => a.state.includes(s));
      }
      return true;
    });
  }, [searchQuery, activeFilter, matchedPlaces]);

  return (
    <section className={styles.section} id="destinations-section">
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.subtitleBadge}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            DISCOVER INDIAN AVIATION
          </span>
          <h2 className={styles.title}>All Public Airports & Iconic Landmarks</h2>
          <p className={styles.description}>
            Explore operational commercial airports across India, search by place/district, or calculate the nearest airport by road driving distance. Tap any airport to track live flights!
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className={styles.viewToggleGroup}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'featured' ? styles.toggleActive : ''}`}
            onClick={() => { setViewMode('featured'); setActiveFilter('ALL'); }}
          >
            Featured ({iconicDestinations.length})
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'all' ? styles.toggleActive : ''}`}
            onClick={() => { setViewMode('all'); setActiveFilter('ALL'); }}
          >
            All Airports ({indianPublicAirports.length})
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'nearby' ? styles.toggleActive : ''}`}
            onClick={handleLocateNearby}
          >
            Nearest Airports
          </button>
        </div>
      </div>

      {/* Nearby Hero Action Banner */}
      {viewMode === 'nearby' && (
        <div className={styles.nearbyHeroBox}>
          <div className={styles.nearbyHeroText}>
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Nearest Commercial Airports
            </h3>
            <p>
              Calculated with real road routes and transfer times to find your most accessible departures.
            </p>
          </div>
          <button 
            className={styles.locateGpsBtn} 
            onClick={handleLocateNearby} 
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Locating Serving Airports...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Refresh My Location
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter Bar & Search */}
      {viewMode !== 'nearby' && (
        <div className={styles.controlsBar}>
          <div className={styles.filterPills}>
            {viewMode === 'featured' ? (
              ['ALL', 'NORTH', 'SOUTH', 'WEST', 'EAST'].map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))
            ) : (
              ['ALL', 'INTL', 'NORTH', 'SOUTH', 'WEST', 'EAST', 'NORTH-EAST'].map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat === 'INTL' ? 'International' : cat}
                </button>
              ))
            )}
          </div>

          {viewMode === 'all' && (
            <div className={styles.searchWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, town (e.g. Agra, Rishikesh, Ooty), or IATA..."
                className={styles.airportSearchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={styles.clearSearchBtn} aria-label="Clear search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Smart Place-to-Airport Match Banner */}
      {viewMode === 'all' && matchedPlaces.length > 0 && (
        <div className={styles.placeMatchBanner}>
          <span className={styles.placeMatchTag}>PLACE DETECTED</span>
          <span>
            <strong>{matchedPlaces[0].place}</strong> ({matchedPlaces[0].state}) is served by <strong>{matchedPlaces[0].airportName} ({matchedPlaces[0].airportIata})</strong>
          </span>
        </div>
      )}

      {/* View Mode: Nearby Airports By Road */}
      {viewMode === 'nearby' && (
        <div>
          {nearbyError && (
            <div className={styles.noResultsBox} style={{ color: '#ef4444' }}>
              <p>{nearbyError}</p>
            </div>
          )}

          {isLocating && nearbyAirports.length === 0 && (
            <div className={styles.noResultsBox}>
              <p>Locating serving airports and flight schedules...</p>
            </div>
          )}

          {!isLocating && nearbyAirports.length > 0 && (
            <div className={styles.airportGrid}>
              {nearbyAirports.map((ap, rank) => (
                <div key={ap.iata} className={styles.allAirportCard} onClick={() => handleAirportClick(ap.iata)}>
                  <div className={styles.apCardHeader}>
                    <div className={styles.apCodeGroup}>
                      <span className={styles.apIata}>{ap.iata}</span>
                      <span className={styles.apIcao}>#{rank + 1} NEAREST AIRPORT</span>
                    </div>
                    <span className={`${styles.apTypeBadge} ${styles.typeIntl}`}>
                      {ap.type}
                    </span>
                  </div>

                  <div className={styles.apCardBody}>
                    <h4 className={styles.apName}>{ap.name}</h4>
                    <span className={styles.apCityState}>{ap.city}, {ap.state}</span>

                    {/* Transfer Distance & Duration Metrics */}
                    <div className={styles.roadMetricsBadgeRow}>
                      <span className={styles.roadDistanceBadge}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {ap.roadDistanceKm} km travel
                      </span>
                      <span className={styles.roadDurationBadge}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ~{ap.durationText}
                      </span>
                    </div>

                    <div className={styles.highwayRouteName}>
                      {ap.routeDescription}
                    </div>
                  </div>

                  <div className={styles.apCardAction}>
                    <span>Track {ap.iata} Flights</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Mode: Featured Destinations */}
      {viewMode === 'featured' && (
        <div className={styles.carouselGrid}>
          {filteredFeatured.map((dest) => (
            <div key={dest.id} className={styles.destCard} onClick={() => onSelectDestination ? onSelectDestination(dest.iata) : handleAirportClick(dest.iata)}>
              <div className={styles.imageWrapper}>
                <Image
                  src={dest.image}
                  alt={`${dest.landmark} in ${dest.city}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.image}
                  priority={dest.id === 'delhi' || dest.id === 'mumbai'}
                />
                <div className={styles.imageOverlay} />
                
                <div className={styles.topBadges}>
                  <span className={styles.iataBadge}>{dest.iata}</span>
                  <span className={styles.tagBadge}>{dest.tag}</span>
                </div>

                <div className={styles.cardContent}>
                  <span className={styles.cityText}>{dest.city}, {dest.state}</span>
                  <h3 className={styles.landmarkText}>{dest.landmark}</h3>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.airportName}>{dest.airport}</span>
                    <button
                      className={styles.trackBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAirportClick(dest.iata);
                      }}
                    >
                      Track Live
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode: Complete Indian Public Airports Directory (137 Public Airports) */}
      {viewMode === 'all' && (
        <div className={styles.airportGrid}>
          {filteredAllAirports.map((ap) => (
            <div key={ap.iata} className={styles.allAirportCard} onClick={() => handleAirportClick(ap.iata)}>
              <div className={styles.apCardHeader}>
                <div className={styles.apCodeGroup}>
                  <span className={styles.apIata}>{ap.iata}</span>
                  <span className={styles.apIcao}>{ap.icao}</span>
                </div>
                <span className={`${styles.apTypeBadge} ${ap.type.toLowerCase().includes('international') ? styles.typeIntl : styles.typeDom}`}>
                  {ap.type}
                </span>
              </div>

              <div className={styles.apCardBody}>
                <h4 className={styles.apName}>{ap.name}</h4>
                <span className={styles.apCityState}>{ap.city}, {ap.state}</span>
                
                <div className={styles.landmarkRow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.landmarkPin}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className={styles.landmarkName}>{ap.landmark}</span>
                </div>
              </div>

              <div className={styles.apCardAction}>
                <span>Track {ap.iata} Flights</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          ))}
          {filteredAllAirports.length === 0 && (
            <div className={styles.noResultsBox}>
              <p>No operational public airports match "{searchQuery}". Try searching by another city or code.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
