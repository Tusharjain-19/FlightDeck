const API_KEY = 'c8f0df33-6e6d-4c2a-93f9-da42e43e8071';

async function checkAirLabsLimit() {
  const url = `https://airlabs.co/api/v9/schedules?dep_iata=BLR&api_key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Default length: ${data.response ? data.response.length : 0}`);
  } catch (err) { }
}

async function checkAirLabsLimit300() {
  const url = `https://airlabs.co/api/v9/schedules?dep_iata=BLR&limit=300&api_key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`With limit 300 length: ${data.response ? data.response.length : 0}`);
  } catch (err) { }
}

checkAirLabsLimit().then(checkAirLabsLimit300);
