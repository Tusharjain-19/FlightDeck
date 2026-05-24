import Image from 'next/image';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import LiveClock from '../components/LiveClock';
import './globals.css';

export const metadata = {
  title: 'FlightDeck | Live Flight Tracker',
  description: 'Real-time flight tracking with SpaceX-style trajectory visualization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <header className="main-header container">
            <div className="logo-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
              <span className="logo-text">FlightDeck</span>
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
