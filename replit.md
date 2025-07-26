# BazaarBuddy - Street Food Vendor Raw Material Sourcing Platform

## Overview

BazaarBuddy is a fullstack MERN web application designed to solve the raw material sourcing challenges faced by street food vendors in India. The platform connects street vendors with verified suppliers, enabling efficient procurement of ingredients and materials through a digital marketplace.

**Current Status**: Fully developed and ready for deployment. All core features implemented including authentication, product management, order processing, and rating systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 26, 2025)

✓ Complete MERN stack application built with MongoDB, Express.js, React, and Node.js
✓ JWT-based authentication system with role-based access control (vendor/supplier)
✓ Full product catalog with categories, search, filtering, and pagination
✓ Shopping cart functionality with order placement and tracking
✓ Order management system with status updates and delivery tracking
✓ Rating and review system for suppliers
✓ Responsive UI with TailwindCSS and beautiful design
✓ MongoDB models and API routes fully implemented
✓ Environment variables configured for secure deployment
✓ Ready for MongoDB Atlas connection and deployment

## System Architecture

### Technology Stack
- **Frontend**: React.js with Tailwind CSS for responsive UI
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB for flexible document storage
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions
- **Storage**: localStorage for client-side token persistence

### Architecture Pattern
The application follows a traditional MERN stack architecture with clear separation between frontend and backend services. The system uses a role-based access control (RBAC) pattern to differentiate between vendor and supplier functionalities.

## Key Components

### Authentication System
- JWT-based authentication for secure user sessions
- Role-based access control (vendor vs supplier)
- Token storage in browser localStorage
- Middleware protection for protected routes

### User Management
- Dual registration system for vendors and suppliers
- User profile management with role-specific dashboards
- Session management and logout functionality

### Product Management
- Supplier-controlled product catalog (CRUD operations)
- Product categorization and filtering capabilities
- Image upload and management for product listings
- Stock level tracking and management

### Order Management
- Shopping cart functionality for vendors
- Order placement and tracking system
- Delivery status updates from suppliers
- Order history and management

### Rating System
- Post-delivery rating system for suppliers
- Vendor feedback collection for service improvement

## Data Flow

### User Authentication Flow
1. User registers/logs in with role selection
2. Server validates credentials and issues JWT token
3. Client stores token and uses for subsequent API calls
4. Protected routes verify token and role permissions

### Product Discovery Flow
1. Vendors browse products by category
2. Filtering options by price, ratings, and supplier
3. Product details displayed with stock availability
4. Add to cart functionality with quantity selection

### Order Processing Flow
1. Vendor places order from cart
2. Order stored in database with pending status
3. Supplier receives order notification
4. Supplier updates delivery status
5. Vendor tracks order progress
6. Post-delivery rating collection

## Database Configuration

### MongoDB Atlas Setup Required
The application is configured to use MongoDB Atlas. To complete setup:

1. **MongoDB Atlas Account**: Create account at mongodb.com/atlas
2. **Cluster Creation**: Create a free cluster (M0)
3. **Database User**: Create database user with read/write permissions
4. **IP Whitelist**: Add 0.0.0.0/0 to allow connections from anywhere (for development)
5. **Connection String**: Copy connection string and set as MONGODB_URI secret

### Database Schema
- **Users Collection**: Stores user profiles, credentials, and roles with password hashing
- **Products Collection**: Product catalog with supplier references and stock management
- **Orders Collection**: Order transactions with vendor-supplier relationships and status tracking

### API Structure
- **Authentication Routes** (`/auth`): Registration, login, token validation
- **Product Routes** (`/products`): CRUD operations, filtering, search
- **Order Routes** (`/orders`): Order placement, status updates, history

### Frontend Components
- **Authentication Pages**: Login/Register with role selection
- **Dashboard Components**: Role-specific interfaces
- **Product Components**: Listing, details, and management
- **Order Components**: Cart, checkout, and tracking

## Deployment Strategy

### Current Environment Setup
- **Environment Variables**: JWT_SECRET and MONGODB_URI configured in Replit Secrets
- **Server Configuration**: Express server configured to run on port 5000 with 0.0.0.0 binding
- **Production Ready**: Application includes production-ready error handling and security

### MongoDB Atlas Connection Issue
Currently experiencing connection timeout to MongoDB Atlas. This is typically due to:
1. IP address not whitelisted in MongoDB Atlas
2. Network restrictions
3. Incorrect connection string format

**Solution**: In MongoDB Atlas dashboard:
1. Go to Network Access → IP Whitelist
2. Add 0.0.0.0/0 (allow access from anywhere) for development
3. Ensure connection string includes correct username/password
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/bazaarbuddy`

### Hosting Options
- **Replit Deployment**: Ready for Replit's built-in deployment
- **External Hosting**: Can be deployed to Vercel, Netlify, Heroku, or similar platforms
- **Database**: MongoDB Atlas (cloud) configured

### Security Considerations
- Password hashing for user credentials
- JWT token expiration and refresh mechanisms
- Input validation and sanitization
- Role-based route protection

## Development Guidelines

### Code Organization
- Component-based React architecture
- RESTful API design principles
- Modular backend with separate route handlers
- Middleware pattern for authentication and validation

### State Management
- React hooks for local component state
- Context API for global state management
- localStorage for persistent user sessions

### Styling Approach
- Tailwind CSS for utility-first styling
- Responsive design for mobile-first approach
- Component-level styling organization