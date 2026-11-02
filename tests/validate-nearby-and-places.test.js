const assert = require('assert');

async function run() {
  const { placeToAirportMap, findAirportsByPlace } = await import('../data/placeMapping.js');
  const { airportCoordinates, calculateHaversineDistance, estimateRoadMetrics, formatTravelTime } = await import('../lib/roadDistance.js');

  console.log('==================================================');
  console.log('TEST SUITE: Place Mapping & Road Distance Engine');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function it(desc, fn) {
    try {
      fn();
      console.log(`  [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 1. Place Mapping Tests
  it('Place mapping database contains 70+ Indian tourist & district places', () => {
    assert(placeToAirportMap.length >= 70, `Expected >= 70 places, got ${placeToAirportMap.length}`);
  });

  it('Agra resolves to AGR (Agra Airport)', () => {
    const matches = findAirportsByPlace('Agra');
    assert(matches.length > 0, 'No match for Agra');
    assert.strictEqual(matches[0].airportIata, 'AGR');
  });

  it('Taj Mahal resolves to AGR', () => {
    const matches = findAirportsByPlace('Taj Mahal');
    assert(matches.length > 0, 'No match for Taj Mahal');
    assert.strictEqual(matches[0].airportIata, 'AGR');
  });

  it('Rishikesh resolves to DED (Jolly Grant Airport)', () => {
    const matches = findAirportsByPlace('Rishikesh');
    assert(matches.length > 0, 'No match for Rishikesh');
    assert.strictEqual(matches[0].airportIata, 'DED');
  });

  it('Ooty resolves to CJB (Coimbatore Intl)', () => {
    const matches = findAirportsByPlace('Ooty');
    assert(matches.length > 0, 'No match for Ooty');
    assert.strictEqual(matches[0].airportIata, 'CJB');
  });

  it('Manali resolves to KUU (Kullu Manali Airport)', () => {
    const matches = findAirportsByPlace('Manali');
    assert(matches.length > 0, 'No match for Manali');
    assert.strictEqual(matches[0].airportIata, 'KUU');
  });

  it('Gurugram resolves to DEL (Indira Gandhi Intl)', () => {
    const matches = findAirportsByPlace('Gurugram');
    assert(matches.length > 0, 'No match for Gurugram');
    assert.strictEqual(matches[0].airportIata, 'DEL');
  });

  it('Puri resolves to BBI (Biju Patnaik Intl)', () => {
    const matches = findAirportsByPlace('Puri');
    assert(matches.length > 0, 'No match for Puri');
    assert.strictEqual(matches[0].airportIata, 'BBI');
  });

  // 2. Road Distance Metrics Tests
  it('Airport GPS coordinates include all top Indian hubs (DEL, BOM, BLR, CCU, HYD, MAA)', () => {
    const hubs = ['DEL', 'BOM', 'BLR', 'CCU', 'HYD', 'MAA'];
    for (const hub of hubs) {
      assert(airportCoordinates[hub], `Missing coords for hub ${hub}`);
      assert(typeof airportCoordinates[hub].lat === 'number', `Invalid lat for ${hub}`);
      assert(typeof airportCoordinates[hub].lon === 'number', `Invalid lon for ${hub}`);
    }
  });

  it('Haversine distance between Connaught Place Delhi and DEL is approx 14-16 km', () => {
    const cpLat = 28.6315;
    const cpLon = 77.2167;
    const dist = calculateHaversineDistance(cpLat, cpLon, airportCoordinates.DEL.lat, airportCoordinates.DEL.lon);
    assert(dist >= 12 && dist <= 18, `Distance was ${dist}`);
  });

  it('Road estimation model applies winding factor greater than aerial distance', () => {
    const metrics = estimateRoadMetrics(100, false);
    assert(metrics.roadDistanceKm > 100, 'Road distance must exceed straight-line distance');
    assert(metrics.durationMinutes > 60, '100km drive should take > 1 hour');
  });

  it('Hilly terrain applies higher curvature coefficient (1.42x) and slower speed', () => {
    const plainMetrics = estimateRoadMetrics(100, false);
    const hillMetrics = estimateRoadMetrics(100, true);
    assert(hillMetrics.roadDistanceKm > plainMetrics.roadDistanceKm, 'Hills must have more road distance due to ghat bends');
    assert(hillMetrics.durationMinutes > plainMetrics.durationMinutes, 'Hills must take longer travel duration');
  });

  it('formatTravelTime accurately formats minutes into hrs and mins', () => {
    assert.strictEqual(formatTravelTime(45), '45 mins');
    assert.strictEqual(formatTravelTime(60), '1 hr');
    assert.strictEqual(formatTravelTime(95), '1 hr 35 mins');
    assert.strictEqual(formatTravelTime(150), '2 hrs 30 mins');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
