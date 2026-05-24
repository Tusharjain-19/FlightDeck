'use client';

import { useState, useEffect } from 'react';
import styles from './LiveClock.module.css';

export default function LiveClock() {
  const [dateTime, setDateTime] = useState(null);

  useEffect(() => {
    const formatDateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
      return { time: timeStr, date: dateStr };
    };

    setDateTime(formatDateTime());
    const timer = setInterval(() => {
      setDateTime(formatDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!dateTime) {
    return <div className={styles.clockPlaceholder}>00:00:00</div>;
  }

  return (
    <div className={styles.clockContainer}>
      <span className={styles.date}>{dateTime.date}</span>
      <span className={styles.divider}>|</span>
      <span className={styles.time}>{dateTime.time}</span>
    </div>
  );
}
