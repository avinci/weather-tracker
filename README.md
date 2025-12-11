# Weather Tracker

A web-based weather tracking application providing current conditions, 24-hour hourly forecasts, and 7-day daily forecasts.

Built with Vue 3, Vite, Tailwind CSS, and Pinia.

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- WeatherAPI.com account and API key (sign up at https://www.weatherapi.com/signup.aspx)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your WeatherAPI.com API key:
   ```
   VITE_WEATHER_API_KEY=your_api_key_here
   ```

## Development

**Start dev server:**
```bash
npm run dev
```
The app will be available at http://localhost:3000

**Run tests:**
```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

**Lint code:**
```bash
npm run lint
```

**Format code:**
```bash
npm run format
```

## Build

**Create production build:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Project Structure

- `components/` - Vue components
- `stores/` - Pinia state management stores
- `services/` - API service layer
- `utils/` - Helper functions and utilities
- `assets/` - Static assets (styles, images)
- `tests/` - Unit tests
- `public/` - Public static files
- `docs/` - Epic specifications, plans, and implementation documentation
