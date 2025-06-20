# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm start

# Create production build
npm run build

# Vercel-specific build command
npm run vercel-build
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with React Router DOM for routing
- **Backend**: Supabase (PostgreSQL database with real-time features)
- **Styling**: Styled Components with CSS-in-JS
- **Build**: Webpack with Babel for transpilation
- **Deployment**: Vercel (configured with vercel.json)

### Key Architectural Patterns

#### Authentication Flow
- Centralized auth state management via `AuthContext` (`src/context/AuthContext.js`)
- Route protection with `ProtectedRoute` and `AdminRoute` wrappers
- Complex auth state handling for email confirmations and password resets
- Admin role checking based on `profiles.role` field in database
- Auth utilities in `src/services/authUtils.js` for cross-component auth operations

#### Data Layer
- Single Supabase client instance in `src/services/supabase.js`
- Service layer pattern: dedicated services for auctions, deposits, payments
- Caching strategy for auction data with background refresh (5-minute cache, 30-second background updates)
- Real-time features using Supabase subscriptions

#### Component Architecture
- Layout wrapper (`src/components/layout/Layout.js`) for consistent page structure
- Reusable UI components in `src/components/ui/`
- Page components in `src/pages/` organized by feature
- Auth-specific pages in `src/pages/auth/`

#### State Management
- React Context for global auth state
- Local component state for UI interactions
- Service-level caching for performance optimization

### Environment Variables Required
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous API key

### Database Schema Notes
- `profiles` table: Contains user profiles with `role` field for admin access
- Auth relies on Supabase built-in user management
- Real-time auction data with background refresh capabilities

### Deployment
- Configured for Vercel deployment
- SPA routing handled via `vercel.json` catch-all route
- Production builds use content hashing for cache busting

### Key Service Files
- `src/services/auctionService.js`: Auction data management with caching and real-time updates
- `src/services/supabase.js`: Centralized Supabase client configuration
- `src/context/AuthContext.js`: Complete authentication state management
- `src/services/authUtils.js`: Auth utility functions for session management