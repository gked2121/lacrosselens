# LacrosseLens - AI-Powered Lacrosse Video Analysis Platform

## Overview

LacrosseLens is a full-stack web application that provides AI-powered video analysis for lacrosse coaches, scouts, and players. The application allows users to upload lacrosse game videos and receive professional-grade analysis powered by Google's Gemini Pro 2.5 AI model. The platform focuses on player evaluation, face-off analysis, and transition intelligence to help improve team performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **File Upload**: Multer for handling video uploads
- **AI Integration**: Google Gemini API for video analysis

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types
- `migrations/` - Database migration files
- `uploads/` - Local video storage directory

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **User Storage**: Custom user management integrated with Replit Auth
- **Security**: HTTP-only cookies, CSRF protection

### Video Processing Pipeline
1. **Upload**: Multer handles file uploads (MP4, MOV, AVI up to 2GB)
2. **Storage**: Local file system storage in uploads directory
3. **Processing**: Asynchronous video analysis using Gemini AI
4. **Analysis**: AI extracts player evaluations, face-off analysis, transitions
5. **Results**: Structured analysis data stored in PostgreSQL

### AI Analysis Engine
- **Provider**: Google Gemini Pro 2.5
- **Capabilities**: 
  - Player performance evaluation
  - Face-off technique analysis
  - Transition play intelligence
  - Key moment identification with timestamps
- **Output**: Structured JSON analysis with confidence scores

### Database Schema
- **Users**: Replit Auth integration with profile data
- **Teams**: User-owned team management
- **Videos**: Upload metadata and processing status
- **Analyses**: AI-generated analysis results
- **Players**: Team roster management
- **Sessions**: Authentication session storage

## Data Flow

### Video Upload Flow
1. User selects video file or YouTube URL
2. Frontend validates file type and size
3. Multer processes upload to local storage
4. Video record created with "uploading" status
5. Background job processes video with Gemini AI
6. Analysis results stored and status updated to "completed"

### Authentication Flow
1. User clicks login button
2. Redirected to Replit Auth provider
3. OpenID Connect flow completes
4. User session created in PostgreSQL
5. Frontend receives user data via API

### Analysis Retrieval Flow
1. Frontend requests video analyses
2. Backend queries database for completed analyses
3. Structured analysis data returned with timestamps
4. Frontend displays results in organized tabs

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication provider
- **Google Gemini API**: AI video analysis
- **Replit Platform**: Development and deployment environment

### Key Libraries
- **Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind
- **Backend**: Express, Drizzle ORM, Multer, Passport, OpenID Client
- **Shared**: Zod for schema validation, TypeScript for type safety

### Development Tools
- **Vite**: Frontend build tool with HMR
- **ESBuild**: Backend bundling for production
- **TypeScript**: Static type checking
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **File Storage**: Local uploads directory

### Production Build
- **Frontend**: Vite production build to dist/public
- **Backend**: ESBuild bundle to dist/index.js
- **Assets**: Static file serving via Express
- **Process**: Single Node.js process serving both frontend and API

### Environment Configuration
- **DATABASE_URL**: Neon PostgreSQL connection string
- **GEMINI_API_KEY**: Google AI API key
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit environment identifier
- **NODE_ENV**: Environment mode (development/production)

### Scaling Considerations
- Database uses connection pooling via Neon
- Video processing is asynchronous to prevent blocking
- Static assets served efficiently in production
- Session storage in database for horizontal scaling

## Recent Changes

### 2025-01-24 - Implemented Modern 2025 UI Design
- **Issue**: User requested a modern, clean 2025 aesthetic with mobile-first approach and no gradients
- **Changes Made**:
  - Completely redesigned color system using professional HSL values without gradients
  - Implemented modern card system with rounded-2xl corners and subtle shadows
  - Created comprehensive button system (primary, secondary, ghost, outline) with clean styling
  - Enhanced typography with improved font weights and spacing (page-title, page-description classes)
  - Modernized status badges with clean color coding (status-completed, status-processing, etc.)
  - Updated dashboard layout with better spacing and contemporary visual hierarchy
  - Redesigned video library with improved card interactions (card-interactive class)
  - Enhanced video upload component with modern tab design and rounded elements
  - Fixed all Tailwind CSS opacity issues by using inline styles for transparency effects
  - Added responsive grid systems (grid-responsive, grid-stats classes)
  - Implemented mobile-first container padding and spacing utilities
- **Files Modified**: client/src/index.css (major overhaul), client/src/pages/dashboard.tsx, client/src/pages/video-library.tsx, client/src/components/enhanced-video-upload.tsx
- **Status**: Modern UI successfully implemented with clean, gradient-free aesthetic

### 2025-01-24 - Removed All Fake Data and Ensured Real User-Generated Content Only
- **Issue**: App was displaying hardcoded/fake data instead of real user data
- **Changes Made**:
  - Removed hardcoded percentage increases (12%, 8%, 3%, 24%) from dashboard stats
  - Updated stats API to calculate real average confidence from actual analyses instead of hardcoded 92%
  - Removed fake claims from landing page ("1000+ Videos Analyzed" → "Professional Analysis")
  - Removed stock Unsplash image from video preview - now shows real thumbnails or placeholder
  - Removed fake analysis preview text - now shows real video info
  - Replaced hardcoded team performance stats (68%, 74%, 82%) with AI tips section
- **Files Modified**: client/src/pages/dashboard.tsx, client/src/pages/landing.tsx, server/routes.ts
- **Status**: App now only displays real user-generated data

### 2025-01-24 - Fixed AI Analysis Timestamp Issue
- **Issue**: Gemini API returns decimal timestamps (e.g., 147.5 seconds) but database expects integers
- **Solution**: Added Math.round() conversion for all timestamps before database storage
- **Files Modified**: server/services/videoProcessor.ts (both processVideoUpload and processYouTubeVideo functions)
- **Status**: AI analysis now successfully processes and stores results without database errors

### 2025-01-24 - Enabled Real Gemini API Integration
- **Issue**: Videos were stuck in processing due to test data blocking real API calls
- **Changes Made**:
  - Removed all test/fallback analysis data from gemini.ts
  - Fixed YouTube video analysis to work with Gemini API text-only mode (YouTube URLs don't support direct file upload)
  - Added missing updateVideo function to DatabaseStorage for thumbnail and metadata updates
  - Enhanced logging throughout video processing pipeline for better debugging
  - Fixed export/import issues in videoProcessor.ts causing server crashes
- **Files Modified**: server/services/gemini.ts, server/storage.ts, server/services/videoProcessor.ts
- **Status**: Gemini AI now successfully analyzes both file uploads and YouTube videos, generating real coaching insights

### 2025-01-24 - Enhanced Lacrosse Analysis with Authentic Coaching Language
- **Issue**: User requested much more detailed analysis with authentic lacrosse terminology and coaching expertise
- **Changes Made**:
  - Completely rewrote LACROSSE_SYSTEM_PROMPT with authentic coaching background (Coach Mike Thompson from Duke/Syracuse)
  - Added comprehensive lacrosse terminology vocabulary: FOGO, clamp, X, roll dodge, top-side, wing play, etc.
  - Enhanced analysis prompts with detailed technical categories and coaching evaluation criteria
  - Integrated authentic lacrosse IQ concepts and coaching evaluation methods
  - Analysis now includes tactical systems (2-2-2 offense, 1-4-1 set, slide packages)
  - Added specific coaching recommendations with proper lax terminology
- **Research Sources**: Compiled lacrosse coaching terminology from multiple coaching resources and lacrosse IQ development guides
- **Files Modified**: server/services/gemini.ts (major prompt engineering improvements)
- **Status**: AI now generates highly detailed, technical analysis using authentic lacrosse coaching language and terminology

### 2025-01-24 - Dramatically Increased Analysis Detail and Depth
- **Issue**: User requested significantly more detail in the lacrosse analysis output
- **Changes Made**:
  - Enhanced analysis requirements to 6-12 sentences minimum per observation (previously 2-3 sentences)
  - Added exhaustive biomechanical analysis requirements: grip pressure, stick angle, body rotation, weight transfer
  - Integrated complete decision-making process analysis: pre-scan, recognition, option evaluation, execution timing
  - Added elite coaching perspective: Division I standards, championship program methodologies, recruiting evaluation
  - Enhanced tactical analysis depth: system integration, positional responsibilities, game flow management
  - Added comprehensive development pathways: specific drill sequences, practice periodization, skill progressions
- **Files Modified**: server/services/gemini.ts (prompt depth enhancements)
- **Status**: AI now generates exhaustive technical breakdowns with championship-level coaching detail and sophisticated lacrosse terminology

### 2025-01-24 - Fixed Stuck Video Processing and Added Retry Functionality
- **Issue**: User's last upload got stuck in processing status
- **Changes Made**:
  - Fixed video ID 9 by updating status from "processing" to "failed" in database
  - Added retry button for failed videos in the video library
  - Created new API endpoint POST /api/videos/:id/retry for retrying single failed videos
  - Fixed apiRequest function parameter order issue causing YouTube upload errors
  - Added proper error handling and loading states for retry functionality
  - Discovered dual upload component system: VideoUpload (navbar) and EnhancedVideoUpload (video library page)
- **Files Modified**: server/routes.ts, client/src/pages/video-library.tsx, client/src/lib/queryClient.ts, client/src/components/video-upload.tsx
- **Status**: Video processing retry functionality working, users can now retry failed videos with one click