/**
 * Authentic Aviation Flight Phase Calculator
 * Accurately models real-time aircraft state along trajectory:
 * - At Gate (Boarding/Stationed)
 * - Taxiing to Runway (Pushback / Pre-takeoff ground roll)
 * - Climb (Takeoff ascent up to cruising flight level)
 * - Cruise (Sustained airway flight level FL340-FL380)
 * - Descent (Glide slope descent & final runway approach)
 * - Landed (Touchdown & arrival at destination gate)
 */

export function getFlightPhase(flight) {
  if (!flight) {
    return {
      id: 'gate',
      label: 'AT GATE • BOARDING',
      shortLabel: 'AT GATE',
      t: 0.02,
      altFt: 0,
      description: 'Aircraft stationed at gate'
    };
  }

  const status = (flight.flight_status || 'scheduled').toLowerCase();

  // 1. Touchdown / Arrived at destination
  if (status === 'landed' || status === 'arrived') {
    return {
      id: 'landed',
      label: 'TOUCHDOWN • ARRIVED',
      shortLabel: 'ARRIVED',
      t: 1.0,
      altFt: 0,
      description: 'Flight completed and arrived at destination'
    };
  }

  const now = Date.now();
  const depTimeMs = flight.departure?.actual 
    ? new Date(flight.departure.actual).getTime() 
    : (flight.departure?.scheduled ? new Date(flight.departure.scheduled).getTime() : 0);
  const arrTimeMs = flight.arrival?.estimated 
    ? new Date(flight.arrival.estimated).getTime() 
    : (flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).getTime() : 0);

  const speedKts = flight.live?.speed_horizontal 
    ? Math.round(flight.live.speed_horizontal * 0.539957) 
    : null;
  const altMeters = flight.live?.altitude;
  const altFt = altMeters ? Math.round(altMeters * 3.28084) : null;
  const vSpeed = flight.live?.v_speed;

  // 2. Scheduled flight
  if (status === 'scheduled') {
    if (depTimeMs > 0) {
      const diffMins = (depTimeMs - now) / 60000;
      // If departure is within 20 minutes, or within 10 minutes past scheduled time
      if (diffMins <= 20 && diffMins >= -15) {
        return {
          id: 'taxi',
          label: 'TAXIING TO RUNWAY',
          shortLabel: 'TAXIING',
          t: 0.08,
          altFt: 0,
          description: 'Aircraft taxiing to active runway for takeoff'
        };
      }
    }
    return {
      id: 'gate',
      label: 'AT GATE • BOARDING',
      shortLabel: 'AT GATE',
      t: 0.02,
      altFt: 0,
      description: 'Aircraft stationed at gate'
    };
  }

  // 3. Active / En-route flight
  let progress = 0.50;
  if (depTimeMs > 0 && arrTimeMs > depTimeMs) {
    progress = Math.max(0.08, Math.min(0.96, (now - depTimeMs) / (arrTimeMs - depTimeMs)));
  }

  // Active ground taxi check
  if (speedKts !== null && speedKts < 45 && progress < 0.20 && (!altFt || altFt < 800)) {
    return {
      id: 'taxi',
      label: 'TAXIING ON RUNWAY',
      shortLabel: 'TAXIING',
      t: 0.08,
      altFt: 0,
      description: 'Aircraft taxiing on runway surface'
    };
  }

  // Climb phase
  if (progress < 0.28 || (altFt && altFt < 22000 && (!vSpeed || vSpeed > 0) && progress < 0.5)) {
    const altDisplay = altFt ? ` • FL${Math.round(altFt / 100)}` : ' • FL180';
    return {
      id: 'climb',
      label: `CLIMBING${altDisplay}`,
      shortLabel: 'CLIMBING',
      t: Math.max(0.14, Math.min(0.30, progress)),
      altFt: altFt || 18000,
      description: 'Aircraft climbing to cruising altitude'
    };
  }

  // Cruise phase
  if (progress >= 0.28 && progress < 0.74) {
    const altDisplay = altFt ? ` • FL${Math.round(altFt / 100)}` : ' • FL360';
    return {
      id: 'cruise',
      label: `CRUISING${altDisplay}`,
      shortLabel: 'CRUISING',
      t: progress,
      altFt: altFt || 36000,
      description: 'Aircraft at cruising airway flight level'
    };
  }

  // Descent phase
  const altDisplay = altFt ? ` • FL${Math.round(altFt / 100)}` : '';
  return {
    id: 'descent',
    label: `DESCENT • ON APPROACH${altDisplay}`,
    shortLabel: 'ON APPROACH',
    t: Math.min(0.94, Math.max(0.76, progress)),
    altFt: altFt || 8000,
    description: 'Aircraft descending on arrival approach'
  };
}
