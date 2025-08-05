# Workout Tracker App

A comprehensive web-based workout tracking application that helps you log exercises, track progress, and analyze your fitness journey.

## Features

- **Exercise Logging**: Record workouts with detailed exercise data, sets, reps, and weights (metric system)
- **Built-in Timers**: Track workout duration and rest periods with customizable presets
- **Progress Analytics**: View statistics, charts, and body part distribution
- **Workout History**: Browse and filter past workout sessions
- **Data Export**: Export workout data in CSV or JSON format for external analysis
- **Modern UI**: Clean, responsive design with orange (#FF6B35) and blue (#2E86AB) theme

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite for development and production builds
- **State Management**: TanStack Query for server state

## Quick Start

For detailed setup instructions, see [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend API
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage interface
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema and types
└── LOCAL_SETUP_GUIDE.md   # Non-technical setup guide
```

## Key Components

- **Workout Logger**: Main interface for logging exercises and sets
- **Timer System**: Session and rest timers with preset options
- **Statistics Dashboard**: Progress charts and workout analytics
- **History Viewer**: Filterable list of past workouts with pagination
- **Exercise Database**: Pre-loaded exercises with custom exercise support

## Data Model

- **Workouts**: Session metadata with timestamps and volume tracking
- **Exercises**: Exercise definitions with body part categorization
- **Sets**: Individual set records with weight (kg), reps, and rest time
- **Body Part Classification**: Automatic upper/lower body categorization

## Development Features

- Hot module replacement for fast development
- TypeScript for type safety
- Responsive design for desktop and mobile
- Modern CSS with Tailwind utilities
- Component-based architecture with shadcn/ui

## Export Capabilities

- **CSV Export**: Structured data for spreadsheet analysis
- **JSON Export**: Complete data dump for backup or migration
- **Progress Tracking**: Historical data for trend analysis

---

Built with modern web technologies for a seamless workout tracking experience.