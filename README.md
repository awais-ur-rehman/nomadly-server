# Nomadly Backend

A production-ready Node.js backend for Nomadly - a location-based social platform for digital nomads.

## Architecture

This backend follows a **layered architecture pattern** with clear separation of concerns:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic layer
- **Models**: MongoDB/Mongoose data models
- **Routes**: Route definitions with validation
- **Middleware**: Authentication, validation, error handling, rate limiting

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Pino

## Project Structure

```
src/
├── config/              # Configuration files
│   └── database.ts      # MongoDB connection
├── middleware/          # Global middleware
│   ├── auth.ts         # JWT authentication
│   ├── validation.ts   # Request validation
│   ├── rate-limit.ts   # Rate limiting
│   ├── error-handler.ts # Error handling
│   └── logger.ts       # Request logging
├── utils/              # Shared utilities
│   ├── errors.ts       # Custom error classes
│   ├── response.ts     # API response helpers
│   └── logger.ts       # Logger instance
├── types/              # TypeScript types
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── matching/       # Trajectory matching
│   ├── activities/     # Activity beacons
│   ├── marketplace/    # Builder's Bench
│   ├── chat/           # Real-time messaging
│   ├── vouching/       # Vouching system
│   ├── payments/       # RevenueCat integration
│   └── notifications/  # Push notifications
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Setup

### Prerequisites

- Node.js v18 or higher
- MongoDB instance (local or cloud)
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nomadly
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d
SENDGRID_API_KEY=your_sendgrid_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/resend-otp` - Resend OTP

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/complete-profile` - Complete onboarding
- `PATCH /api/users/route` - Update travel route
- `GET /api/users/search` - Search users
- `PATCH /api/users/toggle-builder` - Toggle builder status

### Matching
- `GET /api/matches/discovery` - Get discovery feed
- `POST /api/matches/swipe` - Swipe action (left/right/star)
- `GET /api/matches/mutual` - Get mutual matches

### Activities
- `POST /api/activities` - Create activity beacon
- `GET /api/activities/nearby` - Get nearby activities
- `POST /api/activities/:id/join` - Request to join
- `PATCH /api/activities/:id/approve/:userId` - Approve participant
- `PATCH /api/activities/:id/reject/:userId` - Reject participant

### Marketplace
- `GET /api/marketplace/builders` - Search builders
- `POST /api/marketplace/consult` - Request consultation
- `PATCH /api/marketplace/consult/:id/accept` - Accept consultation
- `POST /api/marketplace/review` - Leave review

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/:conversationId/messages` - Get messages
- `POST /api/chat/:conversationId/messages` - Send message
- `GET /api/chat/conversation/:userId` - Get or create conversation
- `PATCH /api/chat/:conversationId/read` - Mark as read

### Vouching
- `POST /api/vouch/:userId` - Vouch for user
- `GET /api/vouch/received` - Get received vouches

### Payments
- `POST /api/payments/webhook` - RevenueCat webhook
- `GET /api/payments/status` - Check subscription status

## Socket.IO Events

### Client → Server
- `join_chat` - Join a conversation room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_read` - Mark messages as read

### Server → Client
- `receive_message` - Receive new message
- `typing` - Receive typing indicator
- `read_receipt` - Read receipt update
- `error` - Error message

## Database Indexes

The following indexes are automatically created:

- **Users**: email (unique), travel_route.origin (2dsphere), travel_route.destination (2dsphere)
- **Activities**: location (2dsphere), event_time, status
- **Matches**: user_id + matched_user_id (unique)
- **Messages**: conversation_id + timestamp
- **Conversations**: participants

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API endpoints
- OTP rate limiting (3 requests per 15 minutes)
- Input validation with Zod
- Helmet for HTTP headers
- CORS configuration
- Environment variable validation

## Error Handling

The backend uses custom error classes:
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `AppError` (500)

All errors are handled by a global error handler middleware.

## Logging

Structured logging with Pino:
- Request/response logging
- Error logging with stack traces
- Development: Pretty printed logs
- Production: JSON logs

## Geospatial Features

- MongoDB 2dsphere indexes for location queries
- Turf.js for route intersection calculations
- Proximity-based matching and activity discovery

## Best Practices

- TypeScript for type safety
- Layered architecture for maintainability
- Dependency injection pattern
- Consistent API response format
- Comprehensive error handling
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Structured logging
- Environment-based configuration

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Build the project: `npm run build`
4. Start the server: `npm start`
5. Use a process manager like PM2
6. Set up MongoDB connection pooling
7. Configure reverse proxy (nginx)
8. Enable HTTPS
9. Set up monitoring and logging

## License

ISC
