/**
 * Automated Test: Airline SVG Logos & Metadata Verification
 */

const fs = require('fs');
const path = require('path');
const { indianAirlines, getAllAirlines, getAirlineInfo } = require('../data/airlines');

function runTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Indian Airlines Logos & Metadata');
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

  // 1. Test airline definitions
  const airlines = getAllAirlines();
  assert(airlines.length === 9, `Exactly 9 active scheduled operating airlines in India (found: ${airlines.length})`);

  // 2. Test required active Indian carriers exist
  const expectedCodes = ['6E', 'AI', 'IX', 'SG', 'QP', '9I', 'S5', 'IC', 'I1'];
  expectedCodes.forEach(code => {
    const a = indianAirlines[code];
    assert(!!a, `Airline with IATA "${code}" exists (${a ? a.name : 'Missing'})`);
    if (a) {
      assert(!!a.website && a.website.includes('.'), `${code} has valid official website name: "${a.website}"`);
      assert(!!a.hub && a.hub.length === 3, `${code} has valid hub airport: "${a.hub}"`);
      assert(!!a.icao && a.icao.length === 3, `${code} has valid ICAO code: "${a.icao}"`);
    }
  });

  // 3. Test that every airline SVG file exists and is transparent
  const publicDir = path.join(__dirname, '../public');
  expectedCodes.forEach(code => {
    const a = indianAirlines[code];
    if (a && a.logo) {
      const filePath = path.join(publicDir, a.logo);
      const exists = fs.existsSync(filePath);
      assert(exists, `Logo file exists for ${code}: ${a.logo}`);

      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        assert(content.includes('<svg') && content.includes('</svg>'), `${code} logo is valid SVG markup`);
        
        // Assert no solid background rectangle masking the container
        const hasSolidCardBg = content.includes('fill="#001b69"') && content.includes('<rect width="160"');
        assert(!hasSolidCardBg, `${code} has no artificial solid bounding rectangle`);
      }
    }
  });

  // 4. Test lookup helper functions & merged carrier mapping
  assert(getAirlineInfo('6E')?.name === 'IndiGo', 'getAirlineInfo("6E") resolves to IndiGo');
  assert(getAirlineInfo('AI101')?.name === 'Air India', 'getAirlineInfo("AI101") resolves flight prefix to Air India');
  assert(getAirlineInfo('QP1102')?.name === 'Akasa Air', 'getAirlineInfo("QP1102") resolves flight prefix to Akasa Air');
  assert(getAirlineInfo('S5')?.name === 'Star Air', 'getAirlineInfo("S5") resolves to Star Air');
  assert(getAirlineInfo('IC')?.name === 'Fly91', 'getAirlineInfo("IC") resolves to Fly91');
  assert(getAirlineInfo('I1')?.name === 'IndiaOne Air', 'getAirlineInfo("I1") resolves to IndiaOne Air');
  
  // 5. Test merged airlines gracefully map to parent carriers
  assert(getAirlineInfo('UK')?.iata === 'AI', 'Vistara "UK" lookup resolves to merged parent Air India');
  assert(getAirlineInfo('UK994')?.iata === 'AI', 'Vistara flight "UK994" resolves to Air India');
  assert(getAirlineInfo('I5')?.iata === 'IX', 'AIX Connect "I5" lookup resolves to merged parent Air India Express');
  assert(getAirlineInfo('I5744')?.iata === 'IX', 'AIX Connect flight "I5744" resolves to Air India Express');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
