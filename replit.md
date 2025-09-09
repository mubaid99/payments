# Overview

This is a Payfunds Backend CRON service built with Node.js and TypeScript. The application serves as a cryptocurrency payment processing backend with QR payment functionality, user management, and recently added Holobank integration for banking services. It operates as both a REST API server and includes scheduled CRON jobs for payment monitoring. The system is designed to handle blockchain transactions, user authentication, and real-time payment notifications through WebSocket connections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **Express.js** with TypeScript for type safety and better development experience
- **Modular architecture** using path aliases (@modules, @models, @core, etc.) for clean imports
- **Custom response handler system** with standardized API responses (success, error, unauthorized, etc.)
- **Global dependency injection** pattern for configuration, models, and utilities

## Database Layer
- **MongoDB** with Mongoose ODM for data persistence
- **User model** with wallet address management and token information
- **Extended user schema** for Holobank banking details (accounts, cards, KYC status)
- **FCM model** for push notification management

## Authentication & Security
- **JWT-based authentication** using RSA256 asymmetric encryption
- **Custom authorization middleware** for protected routes
- **Helmet.js** for security headers and CORS configuration
- **File upload capabilities** with express-fileupload middleware

## Real-time Communication
- **Socket.IO integration** for real-time payment notifications
- **Custom socket handlers** for Holobank-specific events
- **WebSocket-based payment listeners** that monitor blockchain transactions

## External Service Integrations
- **Holobank API wrapper** for banking operations (KYC, accounts, cards, transfers)
- **Blockchain connectivity** supporting multiple networks (Ethereum, Polygon, Solana, Tron)
- **AWS services** including S3 for file storage and Secrets Manager for secure credential management
- **Firebase Admin SDK** for push notifications

## Job Scheduling
- **Node-cron** for automated payment monitoring
- **Payment listener system** that runs on scheduled intervals
- **Blockchain transaction monitoring** for payment verification

## Development Tools
- **TypeScript compilation** with custom build process
- **Module aliasing** for clean import paths
- **Environment-based configuration** supporting development/production modes
- **Logging system** using Winston with file and console outputs

# External Dependencies

## Core Infrastructure
- **MongoDB** - Primary database for user data, payments, and application state
- **AWS S3** - File storage for user uploads and documents
- **AWS Secrets Manager** - Secure storage of API keys and sensitive configuration

## Blockchain Networks
- **Ethereum** - Smart contract interactions and token transfers
- **Polygon** - Lower-cost transactions and DeFi operations
- **Solana** - Fast blockchain transactions
- **Tron** - Additional blockchain network support

## Third-Party APIs
- **Holobank API** - Banking services integration for KYC, account management, and card services
- **CoinGecko API** - Cryptocurrency price data and market information
- **Alchemy** - Blockchain infrastructure and webhook services for transaction monitoring

## Communication Services
- **Firebase Cloud Messaging** - Push notifications to mobile devices
- **Socket.IO** - Real-time bidirectional communication for payment updates

## Development & Monitoring
- **Winston** - Application logging and error tracking
- **Morgan** - HTTP request logging middleware