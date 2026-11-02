const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('C:/Users/tusha/.gemini/antigravity-ide/brain/f8274fd4-02cf-450d-a724-8653b841cb54/.system_generated/steps/259/content.md', 'utf8');

// Famous landmark mapping per city/district in India
const cityLandmarks = {
  'Delhi': { landmark: 'India Gate & Red Fort', image: '/destinations/delhi_india_gate.jpg' },
  'New Delhi': { landmark: 'India Gate & Rashtrapati Bhavan', image: '/destinations/delhi_india_gate.jpg' },
  'Mumbai': { landmark: 'Gateway of India & Marine Drive', image: '/destinations/mumbai_gateway.jpg' },
  'Bengaluru': { landmark: 'Vidhana Soudha & Lalbagh', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Bangalore': { landmark: 'Vidhana Soudha & Tech Parks', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Jaipur': { landmark: 'Hawa Mahal & Amber Fort', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Srinagar': { landmark: 'Dal Lake & Mughal Gardens', image: '/destinations/kashmir_dal_lake.jpg' },
  'Kochi': { landmark: 'Alleppey Backwaters & Chinese Fishing Nets', image: '/destinations/kerala_backwaters.jpg' },
  'Cochin': { landmark: 'Alleppey Backwaters & Fort Kochi', image: '/destinations/kerala_backwaters.jpg' },
  'Goa': { landmark: 'Palolem Beach & Basilica of Bom Jesus', image: '/destinations/goa_beach.jpg' },
  'Dabolim': { landmark: 'Vagator Beach & Aguada Fort', image: '/destinations/goa_beach.jpg' },
  'Mopa': { landmark: 'Arambol Beach & Chapora Fort', image: '/destinations/goa_beach.jpg' },
  'Kolkata': { landmark: 'Victoria Memorial & Howrah Bridge', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Agra': { landmark: 'Taj Mahal & Agra Fort', image: '/destinations/taj_mahal_agra.jpg' },
  'Amritsar': { landmark: 'Golden Temple & Wagah Border', image: '/destinations/delhi_india_gate.jpg' },
  'Varanasi': { landmark: 'Kashi Vishwanath & Ganga Aarti Ghats', image: '/destinations/delhi_india_gate.jpg' },
  'Hyderabad': { landmark: 'Charminar & Golconda Fort', image: '/destinations/mumbai_gateway.jpg' },
  'Chennai': { landmark: 'Marina Beach & Kapaleeshwarar Temple', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Ahmedabad': { landmark: 'Sabarmati Ashram & Atal Bridge', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Lucknow': { landmark: 'Bara Imambara & Rumi Darwaza', image: '/destinations/delhi_india_gate.jpg' },
  'Pune': { landmark: 'Shaniwar Wada & Sinhagad Fort', image: '/destinations/mumbai_gateway.jpg' },
  'Chandigarh': { landmark: 'Rock Garden & Sukhna Lake', image: '/destinations/delhi_india_gate.jpg' },
  'Guwahati': { landmark: 'Kamakhya Temple & Brahmaputra River', image: '/destinations/kashmir_dal_lake.jpg' },
  'Bhubaneswar': { landmark: 'Lingaraj Temple & Konark Sun Temple', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Indore': { landmark: 'Rajwada Palace & Sarafa Bazaar', image: '/destinations/mumbai_gateway.jpg' },
  'Leh': { landmark: 'Pangong Lake & Thiksey Monastery', image: '/destinations/kashmir_dal_lake.jpg' },
  'Port Blair': { landmark: 'Cellular Jail & Radhanagar Beach', image: '/destinations/goa_beach.jpg' },
  'Shimla': { landmark: 'The Ridge & Mall Road', image: '/destinations/kashmir_dal_lake.jpg' },
  'Dehradun': { landmark: 'Robber’s Cave & Rishikesh River Rafting', image: '/destinations/kashmir_dal_lake.jpg' },
  'Patna': { landmark: 'Golghar & Takht Sri Patna Sahib', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Ranchi': { landmark: 'Hundru Falls & Jagannath Temple', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Raipur': { landmark: 'Ghatarani Waterfalls & Swami Vivekananda Sarovar', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Bhopal': { landmark: 'Upper Lake (Bhojtal) & Sanchi Stupa', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Thiruvananthapuram': { landmark: 'Padmanabhaswamy Temple & Kovalam Beach', image: '/destinations/kerala_backwaters.jpg' },
  'Kozhikode': { landmark: 'Kappad Beach & Beypore Port', image: '/destinations/kerala_backwaters.jpg' },
  'Kannur': { landmark: 'Muzhappilangad Drive-in Beach & St. Angelo Fort', image: '/destinations/kerala_backwaters.jpg' },
  'Coimbatore': { landmark: 'Adiyogi Shiva Statue & Marudhamalai', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Madurai': { landmark: 'Meenakshi Amman Temple & Thirumalai Nayakkar Palace', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Tiruchirappalli': { landmark: 'Rockfort Temple & Ranganathaswamy Temple', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Mangaluru': { landmark: 'Panambur Beach & Kudroli Gokarnath Temple', image: '/destinations/goa_beach.jpg' },
  'Hubballi': { landmark: 'Unkal Lake & Chandramouleshwara Temple', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Belagavi': { landmark: 'Gokak Falls & Belgaum Fort', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Tirupati': { landmark: 'Tirumala Venkateswara Temple', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Visakhapatnam': { landmark: 'R.K. Beach & Submarine Museum', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Vijayawada': { landmark: 'Kanaka Durga Temple & Prakasam Barrage', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Rajahmundry': { landmark: 'Godavari Arch Bridge & Pushkar Ghat', image: '/destinations/bengaluru_vidhana_soudha.jpg' },
  'Udaipur': { landmark: 'City Palace & Lake Pichola', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Jodhpur': { landmark: 'Mehrangarh Fort & Umaid Bhawan', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Jaisalmer': { landmark: 'Golden Fort & Sam Sand Dunes', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Bikaner': { landmark: 'Junagarh Fort & Karni Mata Temple', image: '/destinations/jaipur_hawa_mahal.jpg' },
  'Ayodhya': { landmark: 'Ram Mandir & Saryu River Ghats', image: '/destinations/delhi_india_gate.jpg' },
  'Prayagraj': { landmark: 'Triveni Sangam & Allahabad Fort', image: '/destinations/delhi_india_gate.jpg' },
  'Gaya': { landmark: 'Mahabodhi Temple (Bodh Gaya)', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Bagdogra': { landmark: 'Darjeeling Himalayan Toy Train & Tea Estates', image: '/destinations/kashmir_dal_lake.jpg' },
  'Shillong': { landmark: 'Umiam Lake & Living Root Bridges', image: '/destinations/kashmir_dal_lake.jpg' },
  'Imphal': { landmark: 'Loktak Floating Lake & Kangla Fort', image: '/destinations/kashmir_dal_lake.jpg' },
  'Agartala': { landmark: 'Ujjayanta Palace & Neermahal', image: '/destinations/kolkata_victoria_memorial.jpg' },
  'Aizawl': { landmark: 'Durtlang Hills & Solomon’s Temple', image: '/destinations/kashmir_dal_lake.jpg' },
  'Dimapur': { landmark: 'Kachari Ruins & Dzukou Valley', image: '/destinations/kashmir_dal_lake.jpg' },
  'Itanagar': { landmark: 'Ganga Lake & Ita Fort', image: '/destinations/kashmir_dal_lake.jpg' }
};

// Split by h3 tags to isolate states
const sections = content.split(/<h3[^>]*>/gi);
const airports = [];
const seenIata = new Set();

sections.forEach((sec, idx) => {
  if (idx === 0) return;
  const stateMatch = sec.match(/^([^<]+)<\/h3>/i);
  const state = stateMatch ? stateMatch[1].trim() : 'India';

  let currentCity = '';
  const rows = sec.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

  rows.forEach(row => {
    // Check if row has rowspan on first td
    const firstTd = row.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
    const hasRowspan = /rowspan=/i.test(firstTd ? firstTd[0] : '');

    const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(c => c.replace(/<[^>]+>/g, '').trim());

    if (cells.length >= 5) {
      let city, name, iata, icao, type, op;

      // Check if cells[2] looks like IATA (length 3, uppercase) or cells[1] looks like IATA
      if (cells[2] && cells[2].length === 3 && /^[A-Z]{3}$/.test(cells[2])) {
        // Standard row with city
        city = cells[0];
        currentCity = city;
        name = cells[1];
        iata = cells[2];
        icao = cells[3];
        type = cells[4];
        op = cells[5];
      } else if (cells[1] && cells[1].length === 3 && /^[A-Z]{3}$/.test(cells[1])) {
        // Row continuation with inherited city
        city = currentCity || cells[0];
        name = cells[0];
        iata = cells[1];
        icao = cells[2];
        type = cells[3];
        op = cells[4];
      } else if (cells[0] && hasRowspan) {
        currentCity = cells[0];
      }

      if (iata && /^[A-Z]{3}$/.test(iata) && op && op.toLowerCase().includes('yes') && !seenIata.has(iata)) {
        seenIata.add(iata);

        // Find matching landmark or default
        const landmarkInfo = cityLandmarks[city] || {
          landmark: `${city} Cultural Heritage & City Center`,
          image: state.includes('Kerala') ? '/destinations/kerala_backwaters.jpg' :
                 state.includes('Goa') ? '/destinations/goa_beach.jpg' :
                 state.includes('Kashmir') || state.includes('Himachal') || state.includes('Uttarakhand') || state.includes('Ladakh') ? '/destinations/kashmir_dal_lake.jpg' :
                 state.includes('Rajasthan') ? '/destinations/jaipur_hawa_mahal.jpg' :
                 state.includes('Karnataka') || state.includes('Tamil') || state.includes('Andhra') || state.includes('Telangana') ? '/destinations/bengaluru_vidhana_soudha.jpg' :
                 state.includes('Bengal') || state.includes('Odisha') || state.includes('Assam') || state.includes('Tripura') || state.includes('Manipur') || state.includes('Meghalaya') ? '/destinations/kolkata_victoria_memorial.jpg' :
                 state.includes('Maharashtra') || state.includes('Gujarat') || state.includes('Madhya') ? '/destinations/mumbai_gateway.jpg' :
                 '/destinations/delhi_india_gate.jpg'
        };

        airports.push({
          iata,
          icao: icao || '',
          city,
          name,
          state,
          type: type || 'Domestic',
          landmark: landmarkInfo.landmark,
          image: landmarkInfo.image,
          country: 'India'
        });
      }
    }
  });
});

console.log(`Successfully curated ${airports.length} operational public airports in India.`);

// Create directory data/ if not exists
fs.mkdirSync('d:/flighter tracker/data', { recursive: true });

const fileContent = `/**
 * Complete Database of Operational Public Airports in India
 * Sourced directly from Official Wikipedia Records (List of airports in India)
 * Total Operational Public Airports: ${airports.length}
 */

export const indianPublicAirports = ${JSON.stringify(airports, null, 2)};

export function getAllAirports() {
  return indianPublicAirports;
}

export function getAirportByIata(iata) {
  if (!iata) return null;
  const code = iata.trim().toUpperCase();
  return indianPublicAirports.find(a => a.iata === code) || null;
}

export function searchAirports(query) {
  if (!query) return [];
  const q = query.trim().toUpperCase();
  return indianPublicAirports.filter(a =>
    a.iata.includes(q) ||
    a.city.toUpperCase().includes(q) ||
    a.name.toUpperCase().includes(q) ||
    a.state.toUpperCase().includes(q)
  );
}

export function getAirportsByState(state) {
  if (!state) return [];
  const s = state.trim().toLowerCase();
  return indianPublicAirports.filter(a => a.state.toLowerCase() === s);
}

export function getAirportsByType(type) {
  if (!type) return [];
  const t = type.trim().toLowerCase();
  return indianPublicAirports.filter(a => a.type.toLowerCase().includes(t));
}
`;

fs.writeFileSync('d:/flighter tracker/data/airports.js', fileContent);
console.log('Saved d:/flighter tracker/data/airports.js');
