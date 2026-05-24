const API_KEY = 'c8f0df33-6e6d-4c2a-93f9-da42e43e8071';

async function checkAirLabsTime() {
  const url = `https://airlabs.co/api/v9/schedules?dep_iata=BLR&api_key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.response) {
      console.log('No response:', data);
      return;
    }
    
    const flights = data.response.filter(f => !f.cs_flight_iata);
    console.log(`Operating flights returned: ${flights.length}`);
    
    flights.sort((a, b) => {
      const tA = a.dep_time || a.dep_time_utc || '';
      const tB = b.dep_time || b.dep_time_utc || '';
      return tA.localeCompare(tB);
    });
    
    console.log('\nEarliest flights:');
    flights.slice(0, 5).forEach(f => console.log(`${f.flight_iata} | dep: ${f.dep_time} | status: ${f.status}`));
    
    console.log('\nLatest flights:');
    flights.slice(-5).forEach(f => console.log(`${f.flight_iata} | dep: ${f.dep_time} | status: ${f.status}`));
    
  } catch (err) {
    console.error(err);
  }
}

checkAirLabsTime();
