/**
 * Automated Test: Public Airports in India Database Verification
 */

const { indianPublicAirports, getAllAirports, getAirportByIata, searchAirports, getAirportsByState } = require('../data/airports');

function runTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Indian Public Airports Database (Wikipedia)');
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

  // 1. Test dataset size
  const airports = getAllAirports();
  assert(airports.length >= 130, `Database contains >= 130 operational public airports (Total: ${airports.length})`);

  // 2. Test major hubs presence
  const majorHubs = ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'MAA', 'COK', 'GOI', 'GOX', 'JAI', 'SXR', 'IXC', 'ATQ', 'TRZ', 'IXZ'];
  majorHubs.forEach(code => {
    const ap = getAirportByIata(code);
    assert(!!ap, `Major hub "${code}" exists: ${ap ? ap.name : 'Missing'}`);
    if (ap) {
      assert(ap.iata === code, `${code} has matching IATA`);
      assert(ap.icao.startsWith('V'), `${code} has valid Indian ICAO code starting with V (${ap.icao})`);
      assert(!!ap.landmark && ap.landmark.length > 3, `${code} has landmark defined: "${ap.landmark}"`);
    }
  });

  // 3. Test uniqueness of IATA codes
  const iataSet = new Set();
  let duplicates = 0;
  airports.forEach(a => {
    if (iataSet.has(a.iata)) {
      duplicates++;
    }
    iataSet.add(a.iata);
  });
  assert(duplicates === 0, `All ${airports.length} airport IATA codes are unique (duplicates: ${duplicates})`);

  // 4. Test search functionality
  const delhiResults = searchAirports('DEL');
  assert(delhiResults.length > 0 && delhiResults.some(a => a.iata === 'DEL'), 'Search "DEL" returns Indira Gandhi Intl');

  const mumbaiResults = searchAirports('Mumbai');
  assert(mumbaiResults.length > 0 && mumbaiResults.some(a => a.iata === 'BOM'), 'Search "Mumbai" returns Chhatrapati Shivaji Intl');

  // 5. Test state filtering
  const keralaAirports = getAirportsByState('Kerala');
  assert(keralaAirports.length >= 4, `Kerala has >= 4 commercial international airports (found: ${keralaAirports.length})`);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
