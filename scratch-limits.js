const API_KEY = 'e7f4e87acf6a4b64693c48c1af95084e';

async function checkLimit() {
  const url = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&limit=1`;
  try {
    const res = await fetch(url);
    console.log('--- Headers ---');
    for (let [key, value] of res.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const data = await res.json();
    if (data.error) {
      console.log('\nError response:');
      console.log(data.error);
    } else {
      console.log('\nSuccess. Check if there is any usage info in the payload (like meta/pagination):');
      console.log(data.pagination || 'No pagination/meta info');
    }
  } catch (err) {
    console.error(err);
  }
}

checkLimit();
