# LacrosseLens - AI-Powered Lacrosse Video Analysis Platform

## Overview
LacrosseLens is a full-stack web application designed for lacrosse coaches, scouts, and players. It provides AI-powered video analysis using Google's Gemini Pro 2.5 AI model. The platform enables users to upload lacrosse game videos and receive professional-grade analysis focusing on player evaluation, face-off analysis, and transition intelligence to enhance team performance and individual skill development. The project aims to deliver detailed insights and robust analytics for the lacrosse community.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Design Principles
The system emphasizes a clean, modern aesthetic with a mobile-first approach. UI components are designed for clarity and usability, with strategic use of color psychology and a focus on high contrast and readability. The application prioritizes displaying real, user-generated data over hardcoded or fake statistics.

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Framework**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite
- **Key Features**:
    - Modern 2025 UI design with gradient-free aesthetics and updated color system.
    - Simplified navigation with a horizontal top bar and mobile-responsive hamburger menu.
    - Redesigned video upload component for extreme simplicity and ease of use, including video type context selection for AI analysis flexibility.
    - Enhanced button styling with consistent variants and improved visibility.
    - Adaptive analysis detail pages with collapsible sections and dynamic content based on video type (Full Game, Practice, Highlight, Drill, Scrimmage, Recruiting).
    - Player evaluation pages with automatic team grouping and support for multiple clips per player, including comprehensive player stat sheets.
    - Dedicated analysis pages for Face-offs and Transitions.
    - Robust video library with fully functional filters for status and text search, and a card-based layout.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM (PostgreSQL dialect)
- **Authentication**: Replit Auth with OpenID Connect
- **File Upload**: Multer
- **AI Integration**: Google Gemini API
- **Key Features**:
    - Asynchronous video processing pipeline for AI analysis.
    - Robust authentication system with PostgreSQL-backed sessions.
    - Advanced Multi-Pass AI Analysis System for maximizing information extraction, supporting both standard and advanced analysis modes.
    - Two-Phase Gemini Analysis System: Extracts comprehensive structured data into JSON first, then formats for specific outputs.
    - Extensible Analysis Architecture with modular components for future growth (e.g., PlayerAnalysisModule, TacticalAnalysisModule).
    - Comprehensive Enhanced Database Schema for granular lacrosse analytics, including specialized tables for player profiles, play events, face-off details, and tactical formations.
    - Automatic video processing retry mechanism with timeout detection for reliability.
    - AI analysis adheres to a 60% confidence threshold filter, ensuring only reliable insights are displayed.
    - AI is specifically prompted to use authentic lacrosse terminology, in-game communication, and NCAA-level metrics (e.g., Caused Turnover definition, Slides Drawn).
    - **CRITICAL**: AI now strictly analyzes only visible content - no fake team names (Syracuse, Johns Hopkins) unless actually shown in video. Uses descriptive identifiers like "player in white #7" when names aren't visible.
    - **KNOWN ISSUE**: Gemini AI sometimes analyzes incorrect YouTube videos - the URL provided may result in analysis of a different video entirely. This appears to be a Gemini API limitation with YouTube URL processing.
    - PDF Export functionality using jspdf and html2canvas to generate clean, formatted PDFs matching the web UI design for both individual player stat sheets and full video analysis reports.

### Project Structure
- `client/`: React frontend
- `server/`: Express.js backend
- `shared/`: Shared TypeScript schemas and types
- `migrations/`: Database migration files
- `uploads/`: Local video storage

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Replit Auth**: Authentication provider.
- **Google Gemini API**: AI video analysis (Pro 2.5 model for video and text analysis, including native YouTube URL support).
- **Replit Platform**: Development and deployment environment.

### Key Libraries
- **Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS.
- **Backend**: Express, Drizzle ORM, Multer, Passport, OpenID Client.
- **Shared**: Zod (for schema validation), TypeScript (for type safety).

### Development Tools
- **Vite**: Frontend build tool.
- **ESBuild**: Backend bundling.
- **TypeScript**: Static type checking.
- **Drizzle Kit**: Database migrations and schema management.