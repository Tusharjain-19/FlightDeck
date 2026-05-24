import { NextResponse } from 'next/server';

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

const airlineNameMap = {
  // Indian Airlines
  '6E': 'IndiGo', 'AI': 'Air India', 'UK': 'Vistara', 'I5': 'AIX Connect',
  'IX': 'Air India Express', 'SG': 'SpiceJet', 'QP': 'Akasa Air', '9I': 'Alliance Air',
  '2T': 'TruJet', '9W': 'Jet Airways',
  // International Airlines
  'EK': 'Emirates', 'EY': 'Etihad Airways', 'QR': 'Qatar Airways', 'BA': 'British Airways',
  'LH': 'Lufthansa', 'AF': 'Air France', 'KL': 'KLM Royal Dutch Airlines', 'SQ': 'Singapore Airlines',
  'MH': 'Malaysia Airlines', 'CX': 'Cathay Pacific', 'TG': 'Thai Airways', 'QF': 'Qantas',
  'UA': 'United Airlines', 'DL': 'Delta Air Lines', 'AA': 'American Airlines', 'AC': 'Air Canada',
  'JL': 'Japan Airlines', 'NH': 'All Nippon Airways', 'NZ': 'Air New Zealand', 'TK': 'Turkish Airlines',
  'VS': 'Virgin Atlantic', 'FZ': 'flydubai', 'G9': 'Air Arabia', 'WY': 'Oman Air',
  'GF': 'Gulf Air', 'KU': 'Kuwait Airways', 'SV': 'Saudia', 'UL': 'SriLankan Airlines',
  'BG': 'Biman Bangladesh', 'KB': 'Drukair', 'RA': 'Nepal Airlines', 'SU': 'Aeroflot'
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'airport' or 'flight'
  const query = searchParams.get('query');
  const clientDate = searchParams.get('date'); // 'YYYY-MM-DD'
  const clientNowParam = searchParams.get('clientNow');

  if (!type || !query) {
    return NextResponse.json({ error: 'Missing type or query parameter' }, { status: 400 });
  }

  const apiKey = process.env.AIRLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AirLabs API key not configured' }, { status: 500 });
  }

  function mapAirLabs(f, liveData) {
    const formatTime = (t) => t ? t.replace(' ', 'T') + ':00' : null;
    let live = null;
    if (liveData) {
      live = {
        speed_horizontal: liveData.speed,
        altitude: liveData.alt, // meters from API
        direction: liveData.dir, // heading degrees
        v_speed: liveData.v_speed, // vertical speed
        squawk: liveData.squawk || liveData.hex,
        registration: liveData.reg_number,
        aircraft_type: liveData.aircraft_icao
      };
    }

    return {
      flight_date: f.dep_time ? f.dep_time.split(' ')[0] : null,
      flight_status: f.status,
      departure: {
        airport: f.dep_iata,
        timezone: null,
        iata: f.dep_iata,
        icao: f.dep_icao,
        terminal: f.dep_terminal,
        gate: f.dep_gate,
        delay: f.dep_delayed,
        scheduled: formatTime(f.dep_time),
        estimated: formatTime(f.dep_estimated),
        actual: formatTime(f.dep_actual)
      },
      arrival: {
        airport: f.arr_iata,
        timezone: null,
        iata: f.arr_iata,
        icao: f.arr_icao,
        terminal: f.arr_terminal,
        gate: f.arr_gate,
        baggage: f.arr_baggage,
        delay: f.arr_delayed,
        scheduled: formatTime(f.arr_time),
        estimated: formatTime(f.arr_estimated),
        actual: null
      },
      airline: {
        name: airlineNameMap[f.airline_iata] || f.airline_iata,
        iata: f.airline_iata,
        icao: f.airline_icao
      },
      flight: {
        number: f.flight_number,
        iata: f.flight_iata,
        icao: f.flight_icao,
        codeshared: f.cs_flight_iata ? { flight_iata: f.cs_flight_iata, airline_name: f.cs_airline_iata } : null
      },
      aircraft: {
        registration: null,
        iata: null,
        icao: f.aircraft_icao,
        icao24: null
      },
      live: live,
      search_type: f.search_type
    };
  }

  try {
    let flightsList = [];

    if (type === 'airport') {
      const [depResponse, arrResponse, depLiveRes, arrLiveRes] = await Promise.all([
        fetch(`https://airlabs.co/api/v9/schedules?dep_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] })),
        fetch(`https://airlabs.co/api/v9/schedules?arr_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] })),
        fetch(`https://airlabs.co/api/v9/flights?dep_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] })),
        fetch(`https://airlabs.co/api/v9/flights?arr_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] }))
      ]);

      if (depResponse.error && arrResponse.error) {
        return NextResponse.json(
          { error: depResponse.error.message || 'AirLabs API error' },
          { status: 400 }
        );
      }

      const liveMap = {};
      (depLiveRes.response || []).forEach(f => { if (f.flight_iata) liveMap[f.flight_iata] = f; });
      (arrLiveRes.response || []).forEach(f => { if (f.flight_iata) liveMap[f.flight_iata] = f; });

      const depRaw = (depResponse.response || []).filter(f => !f.cs_flight_iata);
      const arrRaw = (arrResponse.response || []).filter(f => !f.cs_flight_iata);

      const departures = depRaw.map(f => mapAirLabs({ ...f, search_type: 'departure' }, liveMap[f.flight_iata]));
      const arrivals = arrRaw.map(f => mapAirLabs({ ...f, search_type: 'arrival' }, liveMap[f.flight_iata]));
      flightsList = [...departures, ...arrivals];
    } else if (type === 'flight') {
      const [response, liveRes] = await Promise.all([
        fetch(`https://airlabs.co/api/v9/schedules?flight_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] })),
        fetch(`https://airlabs.co/api/v9/flights?flight_iata=${query}&api_key=${apiKey}`, { cache: 'no-store' })
          .then(res => res.json())
          .catch(() => ({ response: [] }))
      ]);
      const data = response;

      if (data.error) {
        return NextResponse.json(
          { error: data.error.message || 'AirLabs API error' },
          { status: 400 }
        );
      }
      
      const liveMap = {};
      (liveRes.response || []).forEach(f => { if (f.flight_iata) liveMap[f.flight_iata] = f; });

      flightsList = (data.response || []).map(f => mapAirLabs(f, liveMap[f.flight_iata]));
    }

    if (flightsList.length === 0) {
      return NextResponse.json({ data: [] });
    }


    const now = clientNowParam ? parseInt(clientNowParam, 10) : Date.now();
    const expiryTimeMs = 50 * 60 * 1000; // 50 minutes
    const graceMs = 2 * 60 * 1000; // 2-minute grace for recently departed/arrived

    // 1. Filter out landed flights older than 50 minutes, and restrict to clientDate, and filter past departures/arrivals
    const filteredFlights = flightsList.filter(flight => {
      if (clientDate && flight.flight_date && flight.flight_date !== clientDate) {
        return false;
      }

      if (type === 'flight') {
        return true;
      }

      const status = flight.flight_status?.toLowerCase();
      const isActive = status === 'active' || status === 'en-route';
      const isLanded = status === 'landed' || status === 'arrived';

      const isArrival = flight.search_type === 'arrival';
      const airportTime = isArrival
        ? (flight.arrival?.estimated || flight.arrival?.actual || flight.arrival?.scheduled)
        : (flight.departure?.estimated || flight.departure?.actual || flight.departure?.scheduled);
      const iata = isArrival ? flight.arrival?.iata : flight.departure?.iata;
      const tz = resolveTimezone(iata, isArrival ? flight.arrival?.timezone : flight.departure?.timezone);
      const effectiveTime = getUtcTimeFromLocal(airportTime, tz);

      // For departures: show flights departing from (now - graceMs) onwards
      // For arrivals: show flights arriving from (now - graceMs) onwards
      if (effectiveTime < now - graceMs) {
        // Flight time is in the past
        if (isActive) {
          if (isArrival) {
            return true; // Active arrival still incoming
          } else {
            return (now - effectiveTime <= 15 * 60 * 1000); // Show recently departed (15 min)
          }
        }
        if (isLanded) {
          const arrTimeStr = flight.arrival?.actual || flight.arrival?.estimated || flight.arrival?.scheduled;
          const arrIata = flight.arrival?.iata;
          const arrTz = resolveTimezone(arrIata, flight.arrival?.timezone);
          const arrTime = getUtcTimeFromLocal(arrTimeStr, arrTz);
          if (now - arrTime <= expiryTimeMs) {
            return true; // Recently landed (within 50 mins)
          }
        }
        return false;
      }

      return true;
    });


    // 2. If searching for a specific flight, return exactly ONE active or recently landed/upcoming flight
    if (type === 'flight' && filteredFlights.length > 0) {
      const getRank = (flight) => {
        const status = flight.flight_status?.toLowerCase();
        if (status === 'active' || status === 'en-route') return 1;
        if (status === 'landed' || status === 'arrived') return 2;
        if (status === 'scheduled') return 3;
        return 4;
      };

      filteredFlights.sort((a, b) => {
        const rankA = getRank(a);
        const rankB = getRank(b);
        if (rankA !== rankB) return rankA - rankB;

        // If ranks are equal, sort by closeness of departure time to current time
        const timeA = new Date(a.departure?.scheduled || 0).getTime();
        const timeB = new Date(b.departure?.scheduled || 0).getTime();
        return Math.abs(timeA - now) - Math.abs(timeB - now);
      });

      // Keep only the single top-ranked flight
      return NextResponse.json({ data: [filteredFlights[0]] });
    }

    // 3. For airport searches, pre-sort by effective time ascending (earliest first)
    if (type === 'airport') {
      filteredFlights.sort((a, b) => {
        const isArrivalA = a.search_type === 'arrival';
        const isArrivalB = b.search_type === 'arrival';
        const timeA = isArrivalA
          ? (a.arrival?.estimated || a.arrival?.actual || a.arrival?.scheduled)
          : (a.departure?.estimated || a.departure?.actual || a.departure?.scheduled);
        const timeB = isArrivalB
          ? (b.arrival?.estimated || b.arrival?.actual || b.arrival?.scheduled)
          : (b.departure?.estimated || b.departure?.actual || b.departure?.scheduled);
        const tzA = resolveTimezone(
          isArrivalA ? a.arrival?.iata : a.departure?.iata,
          isArrivalA ? a.arrival?.timezone : a.departure?.timezone
        );
        const tzB = resolveTimezone(
          isArrivalB ? b.arrival?.iata : b.departure?.iata,
          isArrivalB ? b.arrival?.timezone : b.departure?.timezone
        );
        return getUtcTimeFromLocal(timeA, tzA) - getUtcTimeFromLocal(timeB, tzB);
      });
    }

    return NextResponse.json({ data: filteredFlights, serverNow: now });
  } catch (err) {
    console.error('Aviationstack fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}

