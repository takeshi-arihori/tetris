# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Japanese Tetris game rebuilt with Next.js 15 + TypeScript. The project features:
- Complete Tetris gameplay with 9 levels
- Progressive difficulty with speed increases
- Sound effects and background music
- Responsive design with touch controls
- User authentication (Supabase)
- Score tracking and rankings
- Personal dashboard and statistics

## Project Structure

```
tetris/
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles (Tailwind CSS)
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
│   ├── img/                   # Game images and icons
│   └── sounds/                # Audio files for BGM and sound effects
├── firebase.json              # Firebase hosting configuration (legacy)
├── .firebaserc               # Firebase project configuration (legacy)
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Project dependencies and scripts
```

## Development Commands

This project uses Next.js 15 with modern development tooling:

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting with ESLint
npm run lint

# Type checking
npm run type-check
```

## Code Architecture

### Modern Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom Tetris color palette
- **State Management**: React hooks + Context API
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (planned)

### Core Game Components

- **Game State**: React state management with custom hooks
- **Tetromino System**: TypeScript interfaces for type safety
- **Game Loop**: React useEffect with cleanup
- **Collision Detection**: Pure functions with TypeScript typing
- **Canvas Rendering**: HTML5 Canvas with React refs
- **Audio System**: Web Audio API with React context

### Key Features

- **Guest Play**: No login required for basic gameplay
- **Progressive Registration**: Save scores after playing as guest
- **Real-time Rankings**: Live leaderboard updates
- **Personal Dashboard**: Statistics and play history
- **Responsive Design**: Mobile-first approach with touch controls

### Development Guidelines

- Use TypeScript strict mode for all new code
- Follow React 19 patterns and Server Components when possible
- Implement proper error boundaries and loading states
- Use Tailwind CSS utility classes for styling
- Write unit tests for game logic functions
- Document all public APIs and complex game algorithms

### Project Status

**Current Phase**: Phase 1 - Project Setup ✅
- Next.js 15 + TypeScript environment configured
- Tailwind CSS with custom Tetris color palette
- ESLint and development tooling setup
- Basic project structure established

**Next Phase**: Phase 1 - Supabase Authentication Setup
- Database schema design
- Authentication flow implementation
- User management system

## Technical Notes

- Uses Next.js 15 App Router for optimal performance
- TypeScript provides compile-time safety for game logic
- Tailwind CSS with custom Tetris color palette
- Turbopack for fast development builds
- ESLint 9 for code quality
- Responsive design with mobile touch controls
- Japanese language interface maintained