# FlightDeck 2.0 — UI/UX Master Redesign & Architecture Plan

This document outlines the complete redesign strategy for **FlightDeck**, incorporating the design inspiration from `public/inspo/`, modern glassmorphism, authentic real-time ADS-B telemetry, split-flap airport departure board animations, and real-location road distance airport routing.

---

## 1. Visual Identity & Brand Alignment

* **Brand Logo:** Use `/logo.png` (the official white minimalist airplane silhouette on deep aviation navy) across:
  * Application header brand badge
  * Browser favicon and Apple touch icon
  * Split-flap loading screen & hero branding
  * Bottom dock center accent
* **Color Palette & Glassmorphism:**
  * Backgrounds: Deep Midnight Aviation Blue (`#060B18` to `#0B1426`) with ambient radial glows (`rgba(59, 130, 246, 0.08)` and `rgba(16, 185, 129, 0.06)`).
  * Surfaces: Frosted multi-layer glass (`backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`).
  * Accent Colors: Electric Blue (`#3B82F6`), Flight Emerald (`#10B981` for on-time/early/arrived), Aviation Amber (`#F59E0B` for delays), Crimson (`#EF4444` for cancellations/major alerts).
* **Typography:**
  * Headers: `Space Grotesk` & Modern Editorial Serif for featured route titles (inspired by `public/inspo/ss7.jpeg`).
  * Body: `Plus Jakarta Sans`.
  * Telemetry & Flight Codes: `IBM Plex Mono` (monospace for IATA, ICAO, flight times, and coordinates).

---

## 2. Inspos-Driven Architecture & Feature Upgrades

Based on the 20 inspiration screens in `public/inspo/`:

### A. Split-Flap Departure Board Loading Animation (`searchingloding1.jpeg` – `searchingloding4.jpeg`)
* **Interactive Departure Matrix:** When a route or airport search is executed, display a cinematic retro-modern mechanical split-flap board animation.
* **Flipping Letters & Numbers:** City names (`DELHI`, `MUMBAI`, `BENGALURU`, `JAIPUR`, `KOCHI`, `KOLKATA`) and flight codes cycle through characters with authentic flapper micro-transitions.
* **Bottom Sheet Progress Indicator:** Frosted glass pill with live status text: `"Connecting to ADS-B Community Receivers..."`, `"Filtering scheduled routes..."`, and `"Retrieving radar transponder feeds..."`.
* **Skeleton Loading Shimmer (`skeletan loding 1.jpeg`):** Seamless transition from split-flap to card skeletons before final render.

### B. Airport Search by Place & "Nearby Airport by Road"
* **Search by Place / Region:** Allow users to type not only IATA codes, but any Indian city, tourist destination, district, or landmark:
  * E.g. *"Noida"* ➔ Maps to Hindon (`HDO`) / Jewar / Delhi (`DEL`)
  * E.g. *"Alleppey"* ➔ Maps to Cochin (`COK`)
  * E.g. *"Manali / Kullu"* ➔ Maps to Bhuntar (`KUU`)
  * E.g. *"Gurugram"* ➔ Maps to Delhi (`DEL`)
  * E.g. *"Taj Mahal / Agra"* ➔ Maps to Agra (`AGR`)
  * E.g. *"Bikaner"* ➔ Maps to Nal (`BKB`)
* **Real Location & Road Distance Detection:**
  * Add a **"📍 Find Nearest Airport (By Road)"** button.
  * Prompts for browser geolocation (`navigator.geolocation.getCurrentPosition`).
  * Computes **actual driving road distance (km)** and **road travel time (hours/mins)** (using OSRM routing engine with highway winding model, not simple straight-line aerial distance).
  * Displays a dedicated card showing:
    * Nearest 3 public airports with road driving distance: E.g., *"Indira Gandhi Intl (DEL) — 38 km • 55 mins via NH48"*
    * 1-tap button to view all live departures and arrivals from that airport.

### C. Clean Authentic Boarding Pass & Sleek Trajectory
* **Removal of Demo / Fake Data:**
  * ❌ Removed simulated demo data like fake assigned seats (`09A`, `22D`) and simulated barcodes (`ETKT-98...`).
  * ❌ Removed redundant labels and duplicate text.
* **Addition of Real Flight Duration:**
  * Compute exact elapsed / scheduled flight duration: E.g. `"2h 20m Non-stop"` between departure and arrival.
  * Highlighted in the central flight corridor (`DEL 05:00 PM` ➔ `2h 20m • En route` ➔ `BOM 07:20 PM`).
* **Sleek Aerodynamic Trajectory Curve:**
  * Compact ~80px height profile (no cavernous dome).
  * Smooth SVG stroke with glowing animated plane moving along the curve according to real-time progress.
  * Real-time altitude and speed pill floating above aircraft.
* **Dual Departure & Destination Visuals:**
  * Departure landmark thumbnail on the left (`DEP`).
  * Destination landmark thumbnail on the right (`ARR`).
  * Dual split soft-fade watermark in the background.

### D. Airport Live Board & Flight Details (`tracking1.jpeg` – `tracking4.jpeg`)
* Airport board layout with live status pill:
  * Green for on-time / early (`16m early`).
  * Red/Amber for delays (`24m delay`, with strike-through original time).
* Quick airline filter chips (`IndiGo`, `Air India Express`, `Air India`, `SpiceJet`, `Akasa Air`).
* Expandable drawer showing:
  * Live aircraft registration, ADS-B squawk code, cruising altitude, ground speed.
  * Live METAR weather (temperature, wind speed, visibility).
  * Terminal, gate, and baggage carousel.

### E. Floating Glassmorphism Bottom Navigation Dock
* Sleek floating pill at the bottom of the screen with `backdrop-filter: blur(24px)`.
* Tabs:
  * 📡 **Radar / Search (`/`)**: Direct live flight and route tracker.
  * 🛫 **Airports (`/airports`)**: 144 Indian airports explorer, place search & road distance finder.
  * ✈️ **Fleet (`/airlines`)**: Official Indian carriers, vector logos, active routes.
  * ⚙️ **Settings (`/settings`)**: Units (Kts/Km-h, Ft/M), time preferences, watermark controls.
* Visual glow indicator for active tab and responsive mobile positioning.

---

## 3. Step-by-Step Implementation Roadmap

1. **Step 1: Branding & `.gitignore`**
   * Ensure `public/inspo/` is ignored in `.gitignore`.
   * Update `app/layout.js` and header with `/logo.png`.
2. **Step 2: Airport GPS Coordinates & Road Distance Routing Engine**
   * Enrich airport database with GPS coordinates (`lat`, `lon`) for all 144 Indian airports.
   * Implement smart place-to-airport mapping (`data/placeMapping.js`).
   * Create `lib/roadDistance.js` to calculate driving road distance & time from user's live coordinates.
3. **Step 3: Split-Flap Departure Board Loading Screen**
   * Build `components/SplitFlapLoader.js` recreating the mechanical flipping letter matrix from `searchingloding1.jpeg`.
   * Connect to `SearchInterface.js` so it triggers on search.
4. **Step 4: Clean Boarding Pass & Real Flight Duration**
   * Calculate flight duration (`h` and `m`) in `FlightResults.js`.
   * Remove fake demo data ("ASSIGNED SEAT", simulated ticket number).
   * Refine the right stub into an authentic aviation telemetry pass with flight time, aircraft model, and status.
5. **Step 5: Glassmorphism Bottom Navigation Dock & Multi-page Polish**
   * Refactor `components/BottomNav.js` with iOS-style frosted glass and glow indicators.
   * Ensure mobile and desktop layouts are responsive across all 4 pages.
6. **Step 6: Testing & Visual Validation**
   * Run automated test suite (`npm test`).
   * Browser test on desktop (1440px) and mobile (390px) to verify the new experience.
