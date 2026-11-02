/**
 * Smart Place-to-Airport Mapping Database for India
 * Maps popular districts, towns, tourist destinations, hill stations, and heritage sites
 * to their primary operational commercial airport(s).
 */

export const placeToAirportMap = [
  // Delhi NCR & Haryana / UP
  { place: 'Noida', state: 'Uttar Pradesh', airportIata: 'DEL', airportName: 'Indira Gandhi Intl', altAirportIata: 'HDO' },
  { place: 'Greater Noida', state: 'Uttar Pradesh', airportIata: 'DEL', airportName: 'Indira Gandhi Intl', altAirportIata: 'HDO' },
  { place: 'Gurugram', state: 'Haryana', airportIata: 'DEL', airportName: 'Indira Gandhi Intl' },
  { place: 'Gurgaon', state: 'Haryana', airportIata: 'DEL', airportName: 'Indira Gandhi Intl' },
  { place: 'Faridabad', state: 'Haryana', airportIata: 'DEL', airportName: 'Indira Gandhi Intl' },
  { place: 'Ghaziabad', state: 'Uttar Pradesh', airportIata: 'HDO', airportName: 'Hindon Airport', altAirportIata: 'DEL' },
  { place: 'Jewar', state: 'Uttar Pradesh', airportIata: 'DEL', airportName: 'Indira Gandhi Intl' },

  // Uttar Pradesh & Taj Heritage
  { place: 'Agra', state: 'Uttar Pradesh', airportIata: 'AGR', airportName: 'Agra Airport' },
  { place: 'Taj Mahal', state: 'Uttar Pradesh', airportIata: 'AGR', airportName: 'Agra Airport' },
  { place: 'Mathura', state: 'Uttar Pradesh', airportIata: 'AGR', airportName: 'Agra Airport', altAirportIata: 'DEL' },
  { place: 'Vrindavan', state: 'Uttar Pradesh', airportIata: 'AGR', airportName: 'Agra Airport', altAirportIata: 'DEL' },
  { place: 'Varanasi', state: 'Uttar Pradesh', airportIata: 'VNS', airportName: 'Lal Bahadur Shastri Intl' },
  { place: 'Kashi', state: 'Uttar Pradesh', airportIata: 'VNS', airportName: 'Lal Bahadur Shastri Intl' },
  { place: 'Ayodhya', state: 'Uttar Pradesh', airportIata: 'AYJ', airportName: 'Maharishi Valmiki Intl' },
  { place: 'Prayagraj', state: 'Uttar Pradesh', airportIata: 'IXD', airportName: 'Prayagraj Airport' },
  { place: 'Allahabad', state: 'Uttar Pradesh', airportIata: 'IXD', airportName: 'Prayagraj Airport' },
  { place: 'Kanpur', state: 'Uttar Pradesh', airportIata: 'KNU', airportName: 'Kanpur Airport' },

  // Rajasthan Heritage & Desert
  { place: 'Jaipur', state: 'Rajasthan', airportIata: 'JAI', airportName: 'Jaipur International' },
  { place: 'Hawa Mahal', state: 'Rajasthan', airportIata: 'JAI', airportName: 'Jaipur International' },
  { place: 'Udaipur', state: 'Rajasthan', airportIata: 'UDR', airportName: 'Maharana Pratap Airport' },
  { place: 'Mount Abu', state: 'Rajasthan', airportIata: 'UDR', airportName: 'Maharana Pratap Airport' },
  { place: 'Jodhpur', state: 'Rajasthan', airportIata: 'JDH', airportName: 'Jodhpur Airport' },
  { place: 'Jaisalmer', state: 'Rajasthan', airportIata: 'JSA', airportName: 'Jaisalmer Airport' },
  { place: 'Bikaner', state: 'Rajasthan', airportIata: 'BKB', airportName: 'Nal Airport' },
  { place: 'Ajmer', state: 'Rajasthan', airportIata: 'KQH', airportName: 'Kishangarh Airport' },
  { place: 'Pushkar', state: 'Rajasthan', airportIata: 'KQH', airportName: 'Kishangarh Airport' },

  // Himachal Pradesh & Uttarakhand (Hills & Spiritual)
  { place: 'Manali', state: 'Himachal Pradesh', airportIata: 'KUU', airportName: 'Kullu Manali Airport', altAirportIata: 'IXC' },
  { place: 'Kullu', state: 'Himachal Pradesh', airportIata: 'KUU', airportName: 'Kullu Manali Airport' },
  { place: 'Shimla', state: 'Himachal Pradesh', airportIata: 'SLV', airportName: 'Shimla Airport', altAirportIata: 'IXC' },
  { place: 'Dharamshala', state: 'Himachal Pradesh', airportIata: 'DHM', airportName: 'Kangra Gaggal Airport' },
  { place: 'Mcleodganj', state: 'Himachal Pradesh', airportIata: 'DHM', airportName: 'Kangra Gaggal Airport' },
  { place: 'Dehradun', state: 'Uttarakhand', airportIata: 'DED', airportName: 'Jolly Grant Airport' },
  { place: 'Rishikesh', state: 'Uttarakhand', airportIata: 'DED', airportName: 'Jolly Grant Airport' },
  { place: 'Haridwar', state: 'Uttarakhand', airportIata: 'DED', airportName: 'Jolly Grant Airport' },
  { place: 'Mussoorie', state: 'Uttarakhand', airportIata: 'DED', airportName: 'Jolly Grant Airport' },
  { place: 'Nainital', state: 'Uttarakhand', airportIata: 'PGH', airportName: 'Pantnagar Airport' },

  // Jammu, Kashmir & Ladakh
  { place: 'Srinagar', state: 'Jammu & Kashmir', airportIata: 'SXR', airportName: 'Sheikh ul-Alam Intl' },
  { place: 'Gulmarg', state: 'Jammu & Kashmir', airportIata: 'SXR', airportName: 'Sheikh ul-Alam Intl' },
  { place: 'Pahalgam', state: 'Jammu & Kashmir', airportIata: 'SXR', airportName: 'Sheikh ul-Alam Intl' },
  { place: 'Dal Lake', state: 'Jammu & Kashmir', airportIata: 'SXR', airportName: 'Sheikh ul-Alam Intl' },
  { place: 'Jammu', state: 'Jammu & Kashmir', airportIata: 'IXJ', airportName: 'Jammu Airport' },
  { place: 'Katra', state: 'Jammu & Kashmir', airportIata: 'IXJ', airportName: 'Jammu Airport' },
  { place: 'Vaishno Devi', state: 'Jammu & Kashmir', airportIata: 'IXJ', airportName: 'Jammu Airport' },
  { place: 'Leh', state: 'Ladakh', airportIata: 'IXL', airportName: 'Kushok Bakula Rimpochee Airport' },
  { place: 'Ladakh', state: 'Ladakh', airportIata: 'IXL', airportName: 'Kushok Bakula Rimpochee Airport' },
  { place: 'Pangong', state: 'Ladakh', airportIata: 'IXL', airportName: 'Kushok Bakula Rimpochee Airport' },

  // Maharashtra & Western India
  { place: 'Mumbai', state: 'Maharashtra', airportIata: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj Intl' },
  { place: 'Navi Mumbai', state: 'Maharashtra', airportIata: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj Intl' },
  { place: 'Thane', state: 'Maharashtra', airportIata: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj Intl' },
  { place: 'Lonavala', state: 'Maharashtra', airportIata: 'PNQ', airportName: 'Pune International', altAirportIata: 'BOM' },
  { place: 'Pune', state: 'Maharashtra', airportIata: 'PNQ', airportName: 'Pune International' },
  { place: 'Shirdi', state: 'Maharashtra', airportIata: 'SAG', airportName: 'Shirdi Airport' },
  { place: 'Nashik', state: 'Maharashtra', airportIata: 'ISK', airportName: 'Nashik Airport' },
  { place: 'Nagpur', state: 'Maharashtra', airportIata: 'NAG', airportName: 'Dr. Babasaheb Ambedkar Intl' },
  { place: 'Aurangabad', state: 'Maharashtra', airportIata: 'IXU', airportName: 'Chhatrapati Sambhajinagar Airport' },
  { place: 'Kolhapur', state: 'Maharashtra', airportIata: 'KLH', airportName: 'Chhatrapati Rajaram Maharaj Airport' },

  // Goa & Coastal Beaches
  { place: 'Goa', state: 'Goa', airportIata: 'GOI', airportName: 'Dabolim Airport', altAirportIata: 'GOX' },
  { place: 'North Goa', state: 'Goa', airportIata: 'GOX', airportName: 'Manohar International (Mopa)' },
  { place: 'South Goa', state: 'Goa', airportIata: 'GOI', airportName: 'Dabolim Airport' },
  { place: 'Panaji', state: 'Goa', airportIata: 'GOI', airportName: 'Dabolim Airport', altAirportIata: 'GOX' },
  { place: 'Calangute', state: 'Goa', airportIata: 'GOX', airportName: 'Manohar International (Mopa)' },

  // Kerala & Backwaters
  { place: 'Kochi', state: 'Kerala', airportIata: 'COK', airportName: 'Cochin International' },
  { place: 'Cochin', state: 'Kerala', airportIata: 'COK', airportName: 'Cochin International' },
  { place: 'Alleppey', state: 'Kerala', airportIata: 'COK', airportName: 'Cochin International' },
  { place: 'Alappuzha', state: 'Kerala', airportIata: 'COK', airportName: 'Cochin International' },
  { place: 'Munnar', state: 'Kerala', airportIata: 'COK', airportName: 'Cochin International', altAirportIata: 'CJB' },
  { place: 'Thiruvananthapuram', state: 'Kerala', airportIata: 'TRV', airportName: 'Trivandrum International' },
  { place: 'Kovalam', state: 'Kerala', airportIata: 'TRV', airportName: 'Trivandrum International' },
  { place: 'Kozhikode', state: 'Kerala', airportIata: 'CCJ', airportName: 'Calicut International' },
  { place: 'Kannur', state: 'Kerala', airportIata: 'CNN', airportName: 'Kannur International' },

  // Karnataka & South
  { place: 'Bengaluru', state: 'Karnataka', airportIata: 'BLR', airportName: 'Kempegowda International' },
  { place: 'Bangalore', state: 'Karnataka', airportIata: 'BLR', airportName: 'Kempegowda International' },
  { place: 'Mysore', state: 'Karnataka', airportIata: 'MYQ', airportName: 'Mysore Airport', altAirportIata: 'BLR' },
  { place: 'Mysuru', state: 'Karnataka', airportIata: 'MYQ', airportName: 'Mysore Airport', altAirportIata: 'BLR' },
  { place: 'Hampi', state: 'Karnataka', airportIata: 'VDY', airportName: 'Jindal Vijaynagar Airport', altAirportIata: 'HBX' },
  { place: 'Hubballi', state: 'Karnataka', airportIata: 'HBX', airportName: 'Hubballi Airport' },
  { place: 'Mangaluru', state: 'Karnataka', airportIata: 'IXE', airportName: 'Mangaluru International' },
  { place: 'Coorg', state: 'Karnataka', airportIata: 'CNN', airportName: 'Kannur International', altAirportIata: 'MYQ' },
  { place: 'Belagavi', state: 'Karnataka', airportIata: 'IXG', airportName: 'Belagavi Airport' },

  // Tamil Nadu & Andhra / Telangana
  { place: 'Chennai', state: 'Tamil Nadu', airportIata: 'MAA', airportName: 'Chennai International' },
  { place: 'Madurai', state: 'Tamil Nadu', airportIata: 'IXM', airportName: 'Madurai Airport' },
  { place: 'Rameswaram', state: 'Tamil Nadu', airportIata: 'IXM', airportName: 'Madurai Airport' },
  { place: 'Coimbatore', state: 'Tamil Nadu', airportIata: 'CJB', airportName: 'Coimbatore International' },
  { place: 'Ooty', state: 'Tamil Nadu', airportIata: 'CJB', airportName: 'Coimbatore International' },
  { place: 'Tiruchirappalli', state: 'Tamil Nadu', airportIata: 'TRZ', airportName: 'Tiruchirappalli Intl' },
  { place: 'Hyderabad', state: 'Telangana', airportIata: 'HYD', airportName: 'Rajiv Gandhi International' },
  { place: 'Tirupati', state: 'Andhra Pradesh', airportIata: 'TIR', airportName: 'Tirupati Airport' },
  { place: 'Visakhapatnam', state: 'Andhra Pradesh', airportIata: 'VTZ', airportName: 'Visakhapatnam International' },
  { place: 'Vijayawada', state: 'Andhra Pradesh', airportIata: 'VGA', airportName: 'Vijayawada International' },

  // East & North East
  { place: 'Kolkata', state: 'West Bengal', airportIata: 'CCU', airportName: 'Netaji Subhash Chandra Bose Intl' },
  { place: 'Darjeeling', state: 'West Bengal', airportIata: 'IXB', airportName: 'Bagdogra International' },
  { place: 'Siliguri', state: 'West Bengal', airportIata: 'IXB', airportName: 'Bagdogra International' },
  { place: 'Gangtok', state: 'Sikkim', airportIata: 'PYG', airportName: 'Pakyong Airport', altAirportIata: 'IXB' },
  { place: 'Guwahati', state: 'Assam', airportIata: 'GAU', airportName: 'Lokpriya Gopinath Bordoloi Intl' },
  { place: 'Kaziranga', state: 'Assam', airportIata: 'JRH', airportName: 'Jorhat Airport', altAirportIata: 'GAU' },
  { place: 'Shillong', state: 'Meghalaya', airportIata: 'SHL', airportName: 'Shillong Airport', altAirportIata: 'GAU' },
  { place: 'Bhubaneswar', state: 'Odisha', airportIata: 'BBI', airportName: 'Biju Patnaik International' },
  { place: 'Puri', state: 'Odisha', airportIata: 'BBI', airportName: 'Biju Patnaik International' },
  { place: 'Patna', state: 'Bihar', airportIata: 'PAT', airportName: 'Jay Prakash Narayan Airport' },
  { place: 'Gaya', state: 'Bihar', airportIata: 'GAY', airportName: 'Gaya Airport' },
  { place: 'Bodh Gaya', state: 'Bihar', airportIata: 'GAY', airportName: 'Gaya Airport' },
  { place: 'Ranchi', state: 'Jharkhand', airportIata: 'IXR', airportName: 'Birsa Munda Airport' },

  // Andaman & Nicobar
  { place: 'Port Blair', state: 'Andaman & Nicobar', airportIata: 'IXZ', airportName: 'Veer Savarkar International' },
  { place: 'Havelock Island', state: 'Andaman & Nicobar', airportIata: 'IXZ', airportName: 'Veer Savarkar International' }
];

/**
 * Searches the place mapping for matching cities/landmarks
 * @param {string} query
 * @returns {Array} matches
 */
export function findAirportsByPlace(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  
  return placeToAirportMap.filter(item => {
    return item.place.toLowerCase().includes(q) ||
           item.state.toLowerCase().includes(q) ||
           item.airportName.toLowerCase().includes(q) ||
           item.airportIata.toLowerCase() === q;
  });
}
