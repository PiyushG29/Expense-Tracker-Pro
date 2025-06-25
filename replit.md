# ExpenseTracker Pro

## Overview

ExpenseTracker Pro is a full-stack expense management application built with React (frontend), Express.js (backend), and PostgreSQL (database). The application allows users to track their expenses, categorize them, generate reports, and create printable receipts. It features a modern, responsive UI built with shadcn/ui components and Tailwind CSS.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and building
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js (ES modules)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Simple header-based authentication (x-user-id)
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: 
  - `users` - User account information
  - `expenses` - Expense records with categories and amounts

## Key Components

### Frontend Components
- **Authentication**: Simple login/registration flow
- **Dashboard**: Main expense management interface
- **Expense Form**: Add/edit expense entries
- **Expense List**: View and manage expenses with filtering
- **Stats Cards**: Monthly expense statistics
- **Receipt Modal**: Printable expense receipts
- **UI Components**: Comprehensive set of reusable components from shadcn/ui

### Backend Services
- **Auth Service**: User authentication and session management
- **Expense Service**: CRUD operations for expenses
- **Stats Service**: Monthly expense aggregations
- **Storage Layer**: Abstracted storage interface with memory-based implementation

### Database Schema
```sql
users {
  id: serial primary key
  email: text unique not null
  name: text not null
  created_at: timestamp default now()
}

expenses {
  id: serial primary key
  user_id: integer references users(id)
  amount: decimal(10,2) not null
  description: text not null
  category: varchar(100) not null
  date: timestamp not null
  created_at: timestamp default now()
}
```

## Data Flow

1. **Authentication Flow**: User provides email/name → Server creates/finds user → Client stores user data
2. **Expense Management**: Client sends expense data → Server validates and stores → Database persists → Client updates UI
3. **Statistics**: Server aggregates expense data by month → Client displays in dashboard cards
4. **Receipt Generation**: Client requests expenses for specific period → Server returns filtered data → Client renders printable receipt

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities
- **lucide-react**: Icon library

### Backend Dependencies
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **express**: Web framework
- **tsx**: TypeScript execution for development

### Development Dependencies
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type checking and compilation
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **Database**: PostgreSQL (configurable via DATABASE_URL)
- **Port**: Application runs on port 5000
- **Environment**: NODE_ENV=development

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Uses PostgreSQL connection string from environment
- **Deployment**: Configured for autoscale deployment on Replit

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

## Changelog

Changelog:
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.