import Link from 'next/link';
import Image from 'next/image';
import { ThemeProvider } from '../components/ThemeProvider';
import { SettingsProvider } from '../lib/settingsContext';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import './globals.css';

export const metadata = {
  title: 'FlightDeck | Live Flight Tracker & Aviation Radar',
  description: 'Real-time flight tracking, 144 Indian public airports, authentic boarding passes, and ADS-B telemetry',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            {/* Glassmorphic App Header */}
            <header className="main-header glass-header">
              <div className="header-inner container">
                <Link href="/" className="logo-group">
                  <div className="logo-badge">
                    <Image
                      src="/logo.png"
                      alt="FlightDeck Logo"
                      width={30}
                      height={30}
                      className="logo-img"
                      priority
                    />
                  </div>
                  <div className="brand-titles">
                    <span className="logo-text">FlightDeck</span>
                    <span className="brand-subtitle">LIVE RADAR</span>
                  </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="desktop-nav" aria-label="Main Navigation">
                  <Link href="/" className="nav-link">
                    Radar
                  </Link>
                  <Link href="/airports" className="nav-link">
                    Airports
                  </Link>
                  <Link href="/airlines" className="nav-link">
                    Fleet
                  </Link>
                  <Link href="/settings" className="nav-link">
                    Settings
                  </Link>
                </nav>

                <div className="header-right">
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Main Page Content */}
            <main className="main-content">
              {children}
            </main>

            {/* Floating Glassmorphic Mobile / Bottom Dock */}
            <BottomNav />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
