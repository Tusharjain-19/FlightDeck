import AirlineFleet from '../../components/AirlineFleet';

export const metadata = {
  title: 'Indian Airlines Fleet Directory | FlightDeck',
  description: 'Official scheduled airline carriers operating in India with genuine vector logos, callsigns, hubs, and live flight radar tracking.',
};

export default function AirlinesPage() {
  return (
    <div className="page-container" style={{ padding: '24px 16px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      <AirlineFleet />
    </div>
  );
}
