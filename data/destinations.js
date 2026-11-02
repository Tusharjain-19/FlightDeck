export const iconicDestinations = [
  {
    id: 'delhi',
    city: 'New Delhi',
    state: 'Delhi NCR',
    iata: 'DEL',
    airport: 'Indira Gandhi International',
    landmark: 'India Gate & Rajpath',
    image: '/destinations/delhi_india_gate.jpg',
    tag: 'National Capital',
    popularRoutes: ['BOM', 'BLR', 'GOI', 'DXB']
  },
  {
    id: 'mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    iata: 'BOM',
    airport: 'Chhatrapati Shivaji Maharaj Intl',
    landmark: 'Gateway of India & Arabian Sea',
    image: '/destinations/mumbai_gateway.jpg',
    tag: 'Financial Capital',
    popularRoutes: ['DEL', 'BLR', 'GOI', 'DXB']
  },
  {
    id: 'bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    iata: 'BLR',
    airport: 'Kempegowda International',
    landmark: 'Vidhana Soudha & Tech Parks',
    image: '/destinations/bengaluru_vidhana_soudha.jpg',
    tag: 'Silicon Valley of India',
    popularRoutes: ['DEL', 'BOM', 'HYD', 'SIN']
  },
  {
    id: 'jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    iata: 'JAI',
    airport: 'Jaipur International',
    landmark: 'Hawa Mahal & Amber Palace',
    image: '/destinations/jaipur_hawa_mahal.jpg',
    tag: 'The Pink City',
    popularRoutes: ['DEL', 'BOM', 'BLR']
  },
  {
    id: 'kashmir',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    iata: 'SXR',
    airport: 'Sheikh ul-Alam International',
    landmark: 'Dal Lake Shikaras & Himalayas',
    image: '/destinations/kashmir_dal_lake.jpg',
    tag: 'Paradise on Earth',
    popularRoutes: ['DEL', 'BOM', 'IXC']
  },
  {
    id: 'goa',
    city: 'Goa',
    state: 'Goa',
    iata: 'GOI',
    altIata: 'GOX',
    airport: 'Dabolim & Manohar Intl',
    landmark: 'Palolem Beach & Tropical Sunsets',
    image: '/destinations/goa_beach.jpg',
    tag: 'Sun, Sand & Coastal Breeze',
    popularRoutes: ['BOM', 'DEL', 'BLR']
  },
  {
    id: 'kerala',
    city: 'Kochi',
    state: 'Kerala',
    iata: 'COK',
    airport: 'Cochin Solar-Powered Intl',
    landmark: 'Alleppey Backwaters & Houseboats',
    image: '/destinations/kerala_backwaters.jpg',
    tag: "God's Own Country",
    popularRoutes: ['DEL', 'BOM', 'BLR', 'DXB']
  },
  {
    id: 'kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    iata: 'CCU',
    airport: 'Netaji Subhash Chandra Bose Intl',
    landmark: 'Victoria Memorial & Howrah Bridge',
    image: '/destinations/kolkata_victoria_memorial.jpg',
    tag: 'City of Joy & Culture',
    popularRoutes: ['DEL', 'BOM', 'BLR', 'BKK']
  },
  {
    id: 'agra',
    city: 'Agra',
    state: 'Uttar Pradesh',
    iata: 'AGR',
    nearIata: 'DEL',
    airport: 'Agra Airport / Kheria Air Force',
    landmark: 'Taj Mahal (Wonder of the World)',
    image: '/destinations/taj_mahal_agra.jpg',
    tag: 'Monument of Eternal Love',
    popularRoutes: ['DEL', 'BOM', 'JAI']
  }
];

const airportPhotoFallbackMap = {
  'DEL': '/destinations/delhi_india_gate.jpg',
  'BOM': '/destinations/mumbai_gateway.jpg',
  'BLR': '/destinations/bengaluru_vidhana_soudha.jpg',
  'JAI': '/destinations/jaipur_hawa_mahal.jpg',
  'SXR': '/destinations/kashmir_dal_lake.jpg',
  'IXL': '/destinations/kashmir_dal_lake.jpg',
  'IXJ': '/destinations/kashmir_dal_lake.jpg',
  'GOI': '/destinations/goa_beach.jpg',
  'GOX': '/destinations/goa_beach.jpg',
  'COK': '/destinations/kerala_backwaters.jpg',
  'TRV': '/destinations/kerala_backwaters.jpg',
  'CCJ': '/destinations/kerala_backwaters.jpg',
  'CNN': '/destinations/kerala_backwaters.jpg',
  'CCU': '/destinations/kolkata_victoria_memorial.jpg',
  'IXB': '/destinations/kolkata_victoria_memorial.jpg',
  'AGR': '/destinations/taj_mahal_agra.jpg',
  'LKO': '/destinations/taj_mahal_agra.jpg',
  'VNS': '/destinations/taj_mahal_agra.jpg',
  'HYD': '/destinations/bengaluru_vidhana_soudha.jpg',
  'MAA': '/destinations/kerala_backwaters.jpg',
  'AMD': '/destinations/jaipur_hawa_mahal.jpg',
  'ATQ': '/destinations/delhi_india_gate.jpg',
  'IXC': '/destinations/delhi_india_gate.jpg',
  'PNQ': '/destinations/mumbai_gateway.jpg',
  'NAG': '/destinations/bengaluru_vidhana_soudha.jpg',
  'IXZ': '/destinations/goa_beach.jpg',
  // International Hubs
  'AUH': '/destinations/delhi_india_gate.jpg',
  'DXB': '/destinations/mumbai_gateway.jpg',
  'DOH': '/destinations/delhi_india_gate.jpg',
  'SIN': '/destinations/bengaluru_vidhana_soudha.jpg',
  'LHR': '/destinations/kolkata_victoria_memorial.jpg',
  'BKK': '/destinations/goa_beach.jpg',
  'KUL': '/destinations/bengaluru_vidhana_soudha.jpg',
  'JFK': '/destinations/mumbai_gateway.jpg',
  'FRA': '/destinations/kolkata_victoria_memorial.jpg',
  'CDG': '/destinations/kolkata_victoria_memorial.jpg',
  'NRT': '/destinations/jaipur_hawa_mahal.jpg',
  'HND': '/destinations/jaipur_hawa_mahal.jpg'
};

import { indianPublicAirports } from './airports.js';

export function getAirportPhoto(iata, defaultImage = '/destinations/mumbai_gateway.jpg') {
  if (!iata) return defaultImage;
  const code = iata.toUpperCase().trim();
  const match = iconicDestinations.find(d => d.iata === code || d.altIata === code || d.nearIata === code);
  if (match?.image) return match.image;
  const apMatch = indianPublicAirports.find(a => a.iata === code);
  if (apMatch?.image) return apMatch.image;
  if (airportPhotoFallbackMap[code]) return airportPhotoFallbackMap[code];
  return defaultImage;
}

const internationalLandmarks = {
  'AUH': 'Sheikh Zayed Grand Mosque & Corniche',
  'DXB': 'Burj Khalifa & Palm Jumeirah',
  'DOH': 'Hamad Oasis & Museum of Islamic Art',
  'SIN': 'Marina Bay Sands & Jewel Changi',
  'LHR': 'Big Ben & Tower Bridge',
  'BKK': 'Wat Arun & Grand Palace',
  'KUL': 'Petronas Twin Towers',
  'JFK': 'Manhattan Skyline & Central Park',
  'FRA': 'Römerberg & Main River',
  'CDG': 'Eiffel Tower & Seine River',
  'NRT': 'Mount Fuji & Senso-ji',
  'HND': 'Tokyo Tower & Imperial Palace'
};

export function getAirportLandmarkName(iata) {
  if (!iata) return 'Aviation Hub';
  const code = iata.toUpperCase().trim();
  const match = iconicDestinations.find(d => d.iata === code || d.altIata === code || d.nearIata === code);
  if (match?.landmark) return match.landmark;
  const apMatch = indianPublicAirports.find(a => a.iata === code);
  if (apMatch?.landmark) return apMatch.landmark;
  if (internationalLandmarks[code]) return internationalLandmarks[code];
  return 'International Airport';
}

