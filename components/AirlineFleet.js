'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllAirlines } from '../data/airlines';
import styles from './AirlineFleet.module.css';

export default function AirlineFleet({ onSelectAirline }) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState(null);

  const airlineList = getAllAirlines().filter(a => a.country === 'India');

  const handleCardClick = (airline) => {
    setSelectedCode(airline.iata);
    if (onSelectAirline) {
      onSelectAirline(airline);
    } else {
      router.push(`/?flight=${airline.iata}`);
    }
  };

  return (
    <section className={styles.section} id="airlines-section">
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
            OFFICIAL INDIAN CARRIER FLEET
          </span>
          <h2 className={styles.title}>Airlines Operating in India</h2>
          <p className={styles.subtitle}>
            Real official logos and website links for all scheduled commercial airlines operating across India.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {airlineList.map((airline) => {
          const isSelected = selectedCode === airline.iata;
          return (
            <div
              key={airline.iata}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => handleCardClick(airline)}
            >
              <div className={styles.logoContainer}>
                <div className={styles.logoInner}>
                  <Image
                    src={airline.logo}
                    alt={`${airline.name} official logo`}
                    width={160}
                    height={46}
                    className={styles.logoImg}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <div>
                    <h3 className={styles.airlineName}>{airline.name}</h3>
                    <a
                      href={airline.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{airline.website}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                  <span className={styles.codePill}>{airline.iata}</span>
                </div>

                <p className={styles.slogan}>"{airline.slogan}"</p>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <strong>ICAO:</strong> {airline.icao}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Hub:</strong> {airline.hub}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Type:</strong> {airline.type.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className={styles.cardAction}>
                <span>Track {airline.name} Flights</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
