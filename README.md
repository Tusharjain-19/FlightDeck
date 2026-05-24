# FlightDeck ✈️

A modern, responsive Flight Tracker application built with Next.js, React, and Tailwind CSS. Track real-time flight statuses, explore schedules, and monitor arrivals and departures with ease.

## 🌟 Features

- **Real-Time Flight Data**: Get up-to-date information on flight statuses.
- **Search & Filter**: Easily search for specific flights by flight number, airline, or route.
- **Responsive Design**: Beautiful and functional UI across all devices (Desktop, Tablet, Mobile).
- **Fast Performance**: Optimized with Next.js App Router for lightning-fast page loads.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [ESLint](https://eslint.org/)

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm (or yarn/pnpm/bun) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "flighter tracker"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add your API keys and configuration here. 
   *(Note: Never commit your `.env.local` or any file containing real API keys to version control!)*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 🛡️ Security Best Practices

- All API keys and sensitive credentials must be stored in `.env` files (e.g., `.env.local`).
- The `.gitignore` is comprehensively configured to exclude sensitive files, certificates, and API key JSON/txt files from version control to prevent accidental leaks.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-source and licensed under the [MIT License](LICENSE).
