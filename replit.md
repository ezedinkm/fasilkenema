# Ethiopian Bunna FC Fan Club Platform

## Overview

This is a full-stack web application for the Ethiopian Coffee Sport Club (The Browns) fan community. The platform serves as the official fan club management system, enabling membership registration, payment processing, donation management, content publishing, and fan engagement through SMS communications. The application provides both a public-facing website for fans and an administrative dashboard for club management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend Architecture**
- React with TypeScript for the UI layer
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS with custom theming for styling
- Form handling with React Hook Form and Zod validation

**Backend Architecture**
- Express.js server handling API routes and serving static assets
- Dual-mode operation: development mode with Vite middleware integration, production mode serving pre-built static files
- JWT-based authentication for admin users using jsonwebtoken and bcryptjs for password hashing
- RESTful API design with route registration pattern

**Database Layer**
- PostgreSQL as the primary database (configured for Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- WebSocket-based connection pooling via Neon serverless adapter
- Schema-first design with Zod validation schemas generated from Drizzle tables

**Project Structure**
- Monorepo structure with shared code between client and server
- `client/` - Frontend React application
- `server/` - Express backend with API routes and database logic
- `shared/` - Shared TypeScript types and database schema definitions
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

### Core Features & Data Models

**Member Management**
- Member registration with personal details (name, email, phone, DOB, location)
- Unique membership number generation
- Membership tier system (Silver, Gold, Platinum)
- Member status tracking (active/inactive)
- Membership expiry date management
- Photo upload capability for member profiles
- Digital membership card generation with QR codes

**Payment Processing**
- Membership payment tracking with transaction IDs
- Support for multiple currencies (ETB and USD)
- Payment status management (pending, completed, failed)
- Payment history per member
- Integration points for payment gateways (structure in place)

**Donation System**
- Voluntary donation acceptance
- Configurable donation amounts
- Transaction tracking similar to membership payments

**Content Management**
- Blog post creation and publishing
- Dynamic page management for static content
- Slug-based routing for SEO-friendly URLs
- Rich content support with images and excerpts
- Category tagging for posts

**SMS Communication**
- Template-based SMS system for bulk messaging
- Predefined templates (Welcome, Renewal Reminder)
- SMS log tracking for audit trails
- Variable substitution in templates ({{name}}, {{membershipNumber}}, etc.)

**Settings & Configuration**
- Key-value settings storage using JSONB
- Membership tier configuration stored as settings
- Flexible configuration system for runtime adjustments
- Admin dashboard allows editing header, footer, and home page content

### Authentication & Authorization

**Admin Authentication Flow**
- Email/password login for administrators
- JWT token generation with 24-hour expiry
- Token stored in localStorage on client
- Authorization middleware protecting API routes
- Bearer token authentication for all protected endpoints
- 401/403 responses trigger automatic logout and redirect

**Security Considerations**
- Password hashing using bcryptjs
- Environment-based JWT secret configuration
- Raw request body capture for webhook verification
- CORS and allowed hosts configuration for production

### State Management Strategy

**Client-Side State**
- React Context API for global app state (language, user session, admin session)
- TanStack Query for server state with infinite stale time (manual invalidation)
- Local component state for UI interactions
- localStorage for token persistence

**Server-Side State**
- Storage abstraction layer (`IStorage` interface) for database operations
- Session management prepared for future implementation
- In-memory caching potential through query client

### API Design Patterns

**Route Organization**
- Centralized route registration in `server/routes.ts`
- RESTful endpoint structure (`/api/auth/*`, `/api/members/*`, etc.)
- Authentication middleware applied selectively to protected routes
- Consistent error response format
- Request/response logging middleware

**Data Validation**
- Zod schemas generated from Drizzle table definitions
- Insert schemas exclude auto-generated fields (id, timestamps)
- Type safety from database to API to frontend
- Validation error formatting using zod-validation-error

### Internationalization

**Multi-Language Support**
- Support for 5 languages: English, Amharic, Tigrinya, Oromo, Somali
- Translation function (`t()`) in app context
- Language selector in navigation
- Translation keys structured hierarchically

### Development & Build Pipeline

**Development Mode**
- Vite dev server integrated as Express middleware
- Hot module replacement (HMR) for fast development
- Runtime error overlay
- Replit-specific plugins (cartographer, dev banner) when running on Replit
- TSX for TypeScript execution without compilation

**Production Build**
- Client bundled with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.js`
- ESM module format throughout
- Single-file server bundle with external packages
- Static file serving from Express

**Database Migrations**
- Drizzle Kit for schema migrations
- Migration files in `migrations/` directory
- Push-based deployment (`db:push` script)
- Seed script for initial data population

## External Dependencies

**Database Service**
- Neon Serverless PostgreSQL (via `@neondatabase/serverless` and WebSocket connection)
- DATABASE_URL environment variable required for connection

**UI Component Libraries**
- Radix UI primitives (30+ components for accessible UI patterns)
- Lucide React for iconography
- Shadcn UI component patterns (New York variant)

**Third-Party Integrations (Prepared)**
- Payment gateway integration points (structure exists, needs implementation)
- SMS service provider integration (template system ready)
- QR code generation for digital membership cards (using `react-qr-code`)

**Development Tools**
- Replit-specific tooling (vite plugins for error handling, banner, cartographer)
- TypeScript for type safety
- ESLint/Prettier configuration implied by project structure

**Asset Management**
- Generated images stored in `attached_assets/generated_images/`
- Google Fonts integration (Chakra Petch, Inter)
- App store badges for mobile app downloads

**Environment Configuration**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Authentication token secret (defaults provided for development)
- `NODE_ENV` - Environment mode (development/production)
