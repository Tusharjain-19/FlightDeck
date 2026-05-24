const API_KEY = 'c8f0df33-6e6d-4c2a-93f9-da42e43e8071';

async function checkAirLabsFlight() {
  const url = `https://airlabs.co/api/v9/schedules?flight_iata=MH105&api_key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Total results: ${data.response ? data.response.length : 0}`);
    if (data.response && data.response.length > 0) {
      console.log('Sample Schedule Item:');
      console.log(JSON.stringify(data.response[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

checkAirLabsFlight();
