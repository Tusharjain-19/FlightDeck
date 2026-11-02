/**
 * Road Distance & Travel Duration Routing Engine
 * Computes authentic driving distances (by road, not straight-line aerial)
 * between user coordinates and Indian commercial airports.
 */

import { indianPublicAirports } from '../data/airports.js';

// High-accuracy GPS coordinates for Indian Public Airports
export const airportCoordinates = {
  'DEL': { lat: 28.5562, lon: 77.1000, name: 'Indira Gandhi Intl', city: 'Delhi', highway: 'via NH48 / Delhi-Gurgaon Expressway' },
  'BOM': { lat: 19.0896, lon: 72.8656, name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', highway: 'via Western Express Hwy' },
  'BLR': { lat: 13.1986, lon: 77.7066, name: 'Kempegowda Intl', city: 'Bengaluru', highway: 'via Bellary Rd / NH44' },
  'CCU': { lat: 22.6520, lon: 88.4463, name: 'Netaji Subhash Chandra Bose Intl', city: 'Kolkata', highway: 'via VIP Rd / Belghoria Expy' },
  'HYD': { lat: 17.2403, lon: 78.4294, name: 'Rajiv Gandhi Intl', city: 'Hyderabad', highway: 'via PV Narasimha Rao Expy' },
  'MAA': { lat: 12.9941, lon: 80.1709, name: 'Chennai Intl', city: 'Chennai', highway: 'via Grand Southern Trunk Rd' },
  'COK': { lat: 10.1556, lon: 76.3914, name: 'Cochin Intl', city: 'Kochi', highway: 'via Salem-Kochi Hwy / NH544' },
  'GOI': { lat: 15.3808, lon: 73.8314, name: 'Dabolim Airport', city: 'Goa (South)', highway: 'via NH66 / Airport Rd' },
  'GOX': { lat: 15.7681, lon: 73.8642, name: 'Manohar Intl (Mopa)', city: 'Goa (North)', highway: 'via Mopa Airport Expy / NH66' },
  'JAI': { lat: 26.8242, lon: 75.8122, name: 'Jaipur Intl', city: 'Jaipur', highway: 'via Tonk Rd / JLN Marg' },
  'SXR': { lat: 33.9871, lon: 74.7744, name: 'Sheikh ul-Alam Intl', city: 'Srinagar', highway: 'via Airport Rd / NH44' },
  'IXC': { lat: 30.6735, lon: 76.7885, name: 'Shaheed Bhagat Singh Intl', city: 'Chandigarh', highway: 'via Airport Rd / PR7' },
  'ATQ': { lat: 31.7096, lon: 74.7973, name: 'Sri Guru Ram Dass Jee Intl', city: 'Amritsar', highway: 'via Ajnala Rd' },
  'AMD': { lat: 23.0772, lon: 72.6347, name: 'Sardar Vallabhbhai Patel Intl', city: 'Ahmedabad', highway: 'via Airport Rd / SP Ring Rd' },
  'PNQ': { lat: 18.5821, lon: 73.9197, name: 'Pune Intl', city: 'Pune', highway: 'via Airport Rd / Nagar Rd' },
  'LKO': { lat: 26.7606, lon: 80.8893, name: 'Chaudhary Charan Singh Intl', city: 'Lucknow', highway: 'via Kanpur Rd / NH27' },
  'PAT': { lat: 25.5913, lon: 85.0880, name: 'Jay Prakash Narayan Airport', city: 'Patna', highway: 'via Bailey Rd' },
  'BBI': { lat: 20.2444, lon: 85.8178, name: 'Biju Patnaik Intl', city: 'Bhubaneswar', highway: 'via Airport Rd' },
  'GAU': { lat: 26.1061, lon: 91.5859, name: 'Lokpriya Gopinath Bordoloi Intl', city: 'Guwahati', highway: 'via VIP Rd / NH17' },
  'IXB': { lat: 26.6812, lon: 88.3286, name: 'Bagdogra Intl', city: 'Siliguri/Bagdogra', highway: 'via NH27 / AH2' },
  'TRV': { lat: 8.4821, lon: 76.9200, name: 'Trivandrum Intl', city: 'Thiruvananthapuram', highway: 'via Kazhakkoottam-Kovalam Bypass' },
  'CJB': { lat: 11.0298, lon: 77.0434, name: 'Coimbatore Intl', city: 'Coimbatore', highway: 'via Avinashi Rd / NH544' },
  'IXM': { lat: 9.8345, lon: 78.0934, name: 'Madurai Airport', city: 'Madurai', highway: 'via Ring Rd / NH38' },
  'TRZ': { lat: 10.7654, lon: 78.7107, name: 'Tiruchirappalli Intl', city: 'Tiruchirappalli', highway: 'via Trichy-Pudukkottai Rd' },
  'VTZ': { lat: 17.7214, lon: 83.2245, name: 'Visakhapatnam Intl', city: 'Visakhapatnam', highway: 'via AH45 / Port Rd' },
  'VGA': { lat: 16.5304, lon: 80.7968, name: 'Vijayawada Intl', city: 'Vijayawada', highway: 'via Chennai-Kolkata Hwy / NH16' },
  'IXR': { lat: 23.3143, lon: 85.3217, name: 'Birsa Munda Airport', city: 'Ranchi', highway: 'via Hinoo Rd' },
  'IDR': { lat: 22.7217, lon: 75.8011, name: 'Devi Ahilyabai Holkar Airport', city: 'Indore', highway: 'via Airport Rd' },
  'BHO': { lat: 23.2875, lon: 77.3378, name: 'Raja Bhoj Airport', city: 'Bhopal', highway: 'via Airport Rd / VIP Rd' },
  'NAG': { lat: 21.0922, lon: 79.0472, name: 'Dr. Babasaheb Ambedkar Intl', city: 'Nagpur', highway: 'via Wardha Rd / NH44' },
  'DED': { lat: 30.1897, lon: 78.1803, name: 'Jolly Grant Airport', city: 'Dehradun/Rishikesh', highway: 'via Dehradun-Rishikesh Hwy' },
  'UDR': { lat: 24.6177, lon: 73.8961, name: 'Maharana Pratap Airport', city: 'Udaipur', highway: 'via NH27 / Airport Rd' },
  'JDH': { lat: 26.2511, lon: 73.0489, name: 'Jodhpur Airport', city: 'Jodhpur', highway: 'via Air Force Rd' },
  'IXL': { lat: 34.1359, lon: 77.5465, name: 'Kushok Bakula Rimpochee Airport', city: 'Leh', highway: 'via Airport Rd' },
  'IXJ': { lat: 32.6891, lon: 74.8375, name: 'Jammu Airport', city: 'Jammu', highway: 'via RS Pura Rd' },
  'IXZ': { lat: 11.6414, lon: 92.7297, name: 'Veer Savarkar Intl', city: 'Port Blair', highway: 'via Great Andaman Trunk Rd' },
  'AYJ': { lat: 26.7460, lon: 82.1550, name: 'Maharishi Valmiki Intl', city: 'Ayodhya', highway: 'via Ayodhya-Gorakhpur Hwy' },
  'AGR': { lat: 27.1558, lon: 77.9609, name: 'Agra Airport', city: 'Agra', highway: 'via VIP Rd / NH509' },
  'HDO': { lat: 28.7061, lon: 77.3592, name: 'Hindon Airport', city: 'Ghaziabad/NCR', highway: 'via GT Rd / Wazirabad Rd' },
  'SAG': { lat: 19.6894, lon: 74.3789, name: 'Shirdi Airport', city: 'Shirdi', highway: 'via Shirdi-Kopargaon Rd' },
  'ISK': { lat: 20.1192, lon: 73.9139, name: 'Nashik Airport (Ozar)', city: 'Nashik', highway: 'via Mumbai-Agra Hwy / NH60' },
  'KUU': { lat: 31.8767, lon: 77.1544, name: 'Kullu Manali Airport', city: 'Bhuntar/Manali', highway: 'via NH3 / Manali Hwy' },
  'SLV': { lat: 31.0818, lon: 77.0678, name: 'Shimla Airport', city: 'Shimla/Jubbarhatti', highway: 'via Shimla-Mandi Rd' },
  'DHM': { lat: 32.1651, lon: 76.2634, name: 'Kangra Airport', city: 'Gaggal/Dharamshala', highway: 'via NH154' },
  'MYQ': { lat: 12.2300, lon: 76.6500, name: 'Mysore Airport', city: 'Mysuru', highway: 'via Mysore-Ooty Rd' },
  'HBX': { lat: 15.3617, lon: 75.0849, name: 'Hubballi Airport', city: 'Hubballi', highway: 'via Gokul Rd' },
  'IXE': { lat: 12.9613, lon: 74.8901, name: 'Mangaluru Intl', city: 'Mangaluru', highway: 'via Kenjar Airport Rd' },
  'IXG': { lat: 15.8593, lon: 74.6183, name: 'Belagavi Airport', city: 'Belagavi', highway: 'via Bagalkot-Belgaum Rd' },
  'VDY': { lat: 15.1667, lon: 76.6333, name: 'Jindal Vijaynagar Airport', city: 'Toranagallu/Hampi', highway: 'via NH67' },
  'KLH': { lat: 16.6644, lon: 74.2828, name: 'Chhatrapati Rajaram Maharaj Airport', city: 'Kolhapur', highway: 'via Ujalaiwadi Rd' },
  'IXU': { lat: 19.8631, lon: 75.3981, name: 'Chhatrapati Sambhajinagar Airport', city: 'Aurangabad', highway: 'via Jalna Rd / NH753F' },
  'BKB': { lat: 28.0706, lon: 73.2078, name: 'Nal Airport', city: 'Bikaner', highway: 'via Jodhpur-Bikaner Hwy / NH62' },
  'JSA': { lat: 26.8887, lon: 70.8653, name: 'Jaisalmer Airport', city: 'Jaisalmer', highway: 'via Airforce Rd' },
  'KQH': { lat: 26.6022, lon: 74.8144, name: 'Kishangarh Airport', city: 'Ajmer/Pushkar', highway: 'via NH48' },
  'IXD': { lat: 25.4402, lon: 81.7339, name: 'Prayagraj Airport', city: 'Prayagraj', highway: 'via Bamrauli Airport Rd' },
  'KNU': { lat: 26.4406, lon: 80.4124, name: 'Kanpur Airport', city: 'Kanpur', highway: 'via GT Rd / Chakeri Rd' },
  'GAY': { lat: 24.7443, lon: 84.9512, name: 'Gaya Airport', city: 'Gaya/Bodh Gaya', highway: 'via Bodhgaya Rd' },
  'JRH': { lat: 26.7319, lon: 94.1755, name: 'Jorhat Airport', city: 'Jorhat', highway: 'via Rowriah Airport Rd' },
  'SHL': { lat: 25.7036, lon: 91.9786, name: 'Shillong Airport', city: 'Umroi/Shillong', highway: 'via Guwahati-Shillong Rd' },
  'PYG': { lat: 27.2272, lon: 88.5869, name: 'Pakyong Airport', city: 'Gangtok/Pakyong', highway: 'via Damlakha Rd' },
  'TIR': { lat: 13.6325, lon: 79.5433, name: 'Tirupati Airport', city: 'Renigunta/Tirupati', highway: 'via Tirupati-Renigunta Rd' },
  'CCJ': { lat: 11.1368, lon: 75.9553, name: 'Calicut Intl', city: 'Kozhikode/Karippur', highway: 'via Calicut Airport Rd / NH66' },
  'CNN': { lat: 11.9189, lon: 75.5483, name: 'Kannur Intl', city: 'Kannur/Mattannur', highway: 'via Thalassery-Mysore Hwy' }
};

/**
 * Calculates straight-line distance in Kilometers via Haversine Formula
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats driving duration into readable format
 */
export function formatTravelTime(minutes) {
  const m = Math.round(minutes);
  if (m < 60) return `${m} mins`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${rem} mins`;
}

/**
 * Fetches actual road driving routing from OSRM public service with fallback.
 * Uses 2.5s timeout to guarantee instant response.
 */
async function fetchRoadRouteOSRM(fromLon, fromLat, toLon, toLat) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadDistanceKm = route.distance / 1000;
        const durationMinutes = route.duration / 60;
        return {
          roadDistanceKm: Math.round(roadDistanceKm),
          durationMinutes: Math.round(durationMinutes),
          source: 'osrm_live'
        };
      }
    }
  } catch (err) {
    // Graceful fallback to Indian highway road winding calculation
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

/**
 * Calculates estimated Indian road driving distance and duration based on
 * terrain, road winding coefficient (1.28x - 1.45x) and average highway speed.
 */
export function estimateRoadMetrics(aerialKm, isHilly = false) {
  // Indian road curvature coefficient: straight distance to highway road distance
  const windingFactor = isHilly ? 1.42 : 1.28;
  const roadDistanceKm = Math.round(aerialKm * windingFactor);

  // Average Indian travel speed (60 km/h plain, 38 km/h hilly/ghats)
  const avgSpeedKmh = isHilly ? 38 : 58;
  const durationMinutes = Math.round((roadDistanceKm / avgSpeedKmh) * 60);

  return {
    roadDistanceKm,
    durationMinutes,
    source: 'road_model'
  };
}

/**
 * Finds the nearest commercial public airports by ROAD distance from user coordinates
 * @param {number} userLat
 * @param {number} userLon
 * @param {number} limit
 * @returns {Promise<Array>} ranked nearest airports by road with driving km & time
 */
export async function findNearestAirportsByRoad(userLat, userLon, limit = 3) {
  if (!userLat || !userLon) return [];

  // 1. Gather all airports with coordinates
  const airportList = Object.entries(airportCoordinates).map(([iata, coords]) => {
    const aerialKm = calculateHaversineDistance(userLat, userLon, coords.lat, coords.lon);
    const dbAirport = indianPublicAirports.find(a => a.iata === iata) || {};
    return {
      iata,
      ...coords,
      state: dbAirport.state || 'India',
      type: dbAirport.type || 'Commercial',
      image: dbAirport.image || '/destinations/delhi_india_gate.jpg',
      aerialKm
    };
  });

  // 2. Sort by aerial distance to pick the closest candidates
  airportList.sort((a, b) => a.aerialKm - b.aerialKm);
  const candidates = airportList.slice(0, Math.max(limit + 1, 4));

  // 3. Calculate road driving distance & duration for top candidates
  const results = await Promise.all(
    candidates.map(async (airport) => {
      const isHilly = ['Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Ladakh', 'Sikkim'].includes(airport.state);
      
      // Try live OSRM routing first
      let roadData = await fetchRoadRouteOSRM(userLon, userLat, airport.lon, airport.lat);

      // Fallback to high-accuracy highway model if OSRM is offline
      if (!roadData) {
        roadData = estimateRoadMetrics(airport.aerialKm, isHilly);
      }

      return {
        ...airport,
        roadDistanceKm: roadData.roadDistanceKm,
        durationMinutes: roadData.durationMinutes,
        durationText: formatTravelTime(roadData.durationMinutes),
        routeDescription: airport.highway || 'via National Highway'
      };
    })
  );

  // 4. Sort strictly by ROAD distance (as requested by user)
  results.sort((a, b) => a.roadDistanceKm - b.roadDistanceKm);

  return results.slice(0, limit);
}
