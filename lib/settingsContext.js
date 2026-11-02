'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
  speedUnit: 'kts', // 'kts' | 'kmh' | 'mph'
  altitudeUnit: 'ft', // 'ft' | 'm'
  vSpeedUnit: 'fpm', // 'fpm' | 'ms'
  timeFormat: '12h', // '12h' | '24h'
  defaultAirportWindow: '4h', // '2h' | '4h' | '8h' | 'all'
  showLandmarkWatermark: true,
  showGauges: true
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: () => {},
  convertSpeed: (speedKts) => ({ value: 0, unit: 'KTS' }),
  convertAltitude: (altFt) => ({ value: 0, unit: 'FT' }),
  convertVSpeed: (vFpm) => ({ value: 0, unit: 'FPM' }),
  formatTimeWithPref: (dateStr) => '--:--'
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flightdeck_user_settings');
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      console.warn('Could not load settings from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('flightdeck_user_settings', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save settings to localStorage', e);
      }
      return next;
    });
  };

  const convertSpeed = (speedKts) => {
    if (speedKts === null || speedKts === undefined) return { value: '--', unit: settings.speedUnit.toUpperCase() };
    const val = Number(speedKts);
    if (isNaN(val)) return { value: '--', unit: settings.speedUnit.toUpperCase() };
    
    if (settings.speedUnit === 'kmh') {
      return { value: Math.round(val * 1.852), unit: 'KM/H' };
    }
    if (settings.speedUnit === 'mph') {
      return { value: Math.round(val * 1.15078), unit: 'MPH' };
    }
    return { value: Math.round(val), unit: 'KTS' };
  };

  const convertAltitude = (altFt) => {
    if (altFt === null || altFt === undefined) return { value: '--', unit: settings.altitudeUnit.toUpperCase() };
    const val = Number(altFt);
    if (isNaN(val)) return { value: '--', unit: settings.altitudeUnit.toUpperCase() };

    if (settings.altitudeUnit === 'm') {
      return { value: Math.round(val * 0.3048).toLocaleString(), unit: 'M' };
    }
    return { value: Math.round(val).toLocaleString(), unit: 'FT' };
  };

  const convertVSpeed = (vFpm) => {
    if (vFpm === null || vFpm === undefined) return { value: '--', unit: settings.vSpeedUnit.toUpperCase() };
    const val = Number(vFpm);
    if (isNaN(val)) return { value: '--', unit: settings.vSpeedUnit.toUpperCase() };

    if (settings.vSpeedUnit === 'ms') {
      const ms = (val * 0.00508).toFixed(1);
      return { value: (val > 0 ? '+' : '') + ms, unit: 'M/S' };
    }
    return { value: (val > 0 ? '+' : '') + Math.round(val), unit: 'FPM' };
  };

  const formatTimeWithPref = (dateStr) => {
    if (!dateStr) return '--:--';
    const match = dateStr.match(/T(\d{2}):(\d{2})/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      if (settings.timeFormat === '24h') {
        return `${hours.toString().padStart(2, '0')}:${minutes} Z`;
      }
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings.timeFormat !== '24h' });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        convertSpeed,
        convertAltitude,
        convertVSpeed,
        formatTimeWithPref,
        isLoaded
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
