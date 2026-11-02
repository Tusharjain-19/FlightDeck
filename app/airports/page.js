import DestinationsShowcase from '../../components/DestinationsShowcase';

export const metadata = {
  title: 'All Indian Public Airports & Landmarks | FlightDeck',
  description: 'Explore all 144 operational commercial airports across India and iconic destination landmarks with live ADS-B radar tracking.',
};

export default function AirportsPage() {
  return (
    <div className="page-container" style={{ padding: '24px 16px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      <DestinationsShowcase />
    </div>
  );
}
