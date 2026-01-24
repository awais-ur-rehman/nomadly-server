# API Endpoints Summary

## Public Endpoints (No Authentication Required)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/resend-otp` - Resend OTP code

### Payments
- `POST /api/payments/webhook` - RevenueCat webhook (called by external service)

## Protected Endpoints (Authentication Required)

All endpoints below require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/complete-profile` - Complete onboarding
- `PATCH /api/users/route` - Update travel route
- `GET /api/users/search` - Search users
- `PATCH /api/users/toggle-builder` - Toggle builder status

### Matching
- `GET /api/matches/discovery` - Get discovery feed
- `POST /api/matches/swipe` - Swipe on a user
- `GET /api/matches/mutual` - Get mutual matches

### Activities
- `POST /api/activities` - Create activity beacon
- `GET /api/activities/nearby` - Get nearby activities
- `POST /api/activities/:id/join` - Request to join activity
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
- `GET /api/payments/status` - Get subscription status

### Notifications
- `POST /api/notifications/test` - Send test notification

## Authentication Flow

1. **Register**: `POST /api/auth/register` - Creates account, sends OTP
2. **Verify OTP**: `POST /api/auth/verify-otp` - Verifies email, returns JWT tokens
3. **Login**: `POST /api/auth/login` - Returns JWT tokens
4. **Use Token**: Include `Authorization: Bearer <token>` header for protected endpoints
5. **Refresh**: `POST /api/auth/refresh` - Get new access token when expired

## Notes

- Registration does NOT return JWT tokens - user must verify OTP first
- OTP verification returns JWT tokens and activates the account
- All protected endpoints require valid JWT token
- Token expires after 7 days (configurable via JWT_EXPIRES_IN)
- Refresh token expires after 30 days (configurable via REFRESH_TOKEN_EXPIRES_IN)
