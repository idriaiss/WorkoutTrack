# Overview

This is a full-stack workout tracking application built with React, Express, TypeScript, and PostgreSQL. The application allows users to log workouts, track exercises and sets, view workout history, analyze statistics, and use built-in timers. It features a modern UI built with shadcn/ui components and Tailwind CSS, with a REST API backend that uses Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.
Units: Metric system (kilograms for weight measurements instead of pounds).

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library based on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints following conventional patterns
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

## Database Schema
The application uses PostgreSQL with the following core entities:
- **Workouts**: Main workout sessions with metadata (name, timestamps, duration, volume)
- **Exercises**: Exercise definitions with body part categorization
- **Workout Exercises**: Junction table linking workouts to exercises with ordering
- **Sets**: Individual set records with weight, reps, and rest time data

## Data Storage Strategy
- **In-Memory Storage**: Development/demo implementation using Maps for data persistence
- **Interface-Based Design**: IStorage interface allows for easy database implementation swapping
- **UUID Generation**: Uses crypto.randomUUID() for primary keys
- **Relational Structure**: Proper foreign key relationships between entities

## Development Workflow
- **Hot Reload**: Vite HMR for instant frontend updates
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Path Mapping**: Configured aliases for clean imports (@/, @shared/)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver optimized for serverless environments
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### UI & Styling
- **@radix-ui/***: Unstyled, accessible UI primitives (30+ components)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx**: Conditional CSS class composition utility

### Data Fetching & Forms
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolver for React Hook Form
- **zod**: TypeScript-first schema validation

### Development Tools
- **tsx**: TypeScript execution engine for Node.js
- **vite**: Next-generation frontend build tool
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **recharts**: Composable charting library for React
- **cmdk**: Command palette component
- **wouter**: Minimalist routing for React