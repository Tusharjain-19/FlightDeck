/**
 * Automated Test: Route Search & Telemetry Logic Verification
 */

async function runTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Route Search & ADS-B Telemetry Logic');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test live local API route search DEL -> BOM
  try {
    const res = await fetch('http://localhost:3000/api/flights?type=route&dep=DEL&arr=BOM');
    assert(res.status === 200, 'Route API endpoint returns HTTP 200');
    const data = await res.json();
    assert(Array.isArray(data.data), 'Route response contains data array');
    assert(data.data.length > 0, `Route DEL -> BOM returns active scheduled flights (Found: ${data.data.length})`);
    
    if (data.data.length > 0) {
      const firstFlight = data.data[0];
      assert(!!firstFlight.departure?.iata, `Flight has departure IATA: ${firstFlight.departure?.iata}`);
      assert(!!firstFlight.arrival?.iata, `Flight has arrival IATA: ${firstFlight.arrival?.iata}`);
    }
  } catch(e) {
    console.error('  [FAIL] Could not query local API (ensure dev server is running):', e.message);
    failed++;
  }

  // 2. Test live local API airport search BLR
  try {
    const res = await fetch('http://localhost:3000/api/flights?type=airport&query=BLR');
    assert(res.status === 200, 'Airport board API endpoint returns HTTP 200');
    const data = await res.json();
    assert(Array.isArray(data.data) && data.data.length > 0, `Airport BLR returns flight boards (Found: ${data.data ? data.data.length : 0})`);
  } catch(e) {
    console.error('  [FAIL] Airport query failed:', e.message);
    failed++;
  }

  // 3. Test ADS-B live point search around Delhi Airport
  try {
    const adsbRes = await fetch('https://api.adsb.lol/v2/point/28.5562/77.1000/100', {
      headers: { 'User-Agent': 'FlightDeckTests/1.0' }
    });
    assert(adsbRes.status === 200, 'Live ADS-B community feeder returns HTTP 200');
    const adsbData = await adsbRes.json();
    assert(Array.isArray(adsbData.ac), `ADS-B community feed returns aircraft array (Tracked: ${adsbData.ac ? adsbData.ac.length : 0})`);
  } catch(e) {
    console.error('  [FAIL] ADS-B query failed:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
