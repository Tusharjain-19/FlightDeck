import Image from 'next/image';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import LiveClock from '../components/LiveClock';
import './globals.css';

export const metadata = {
  title: 'FlightDeck — Live Flight Tracker',
  description: 'Real-time flight tracking with SpaceX-style trajectory visualization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <header className="main-header container">
            <div className="header-left">
              <LiveClock />
            </div>
            <div className="logo-group">
              <Image src="/logo.png" alt="FlightDeck Logo" width={32} height={32} style={{ borderRadius: '6px' }} />
              <span className="logo-text">FlightDeck<span className="logo-dot">.</span></span>
            </div>
            <div className="header-right">
              <ThemeToggle />
            </div>
          </header>
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
