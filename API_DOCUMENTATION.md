# Nomadly Backend API Documentation

**Base URL:** `http://localhost:3000`
**API Version:** v1 (`/api/v1/...`) | Legacy (`/api/...`)

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Matching & Discovery](#3-matching--discovery)
4. [Chat](#4-chat)
5. [Feed](#5-feed)
6. [Stories](#6-stories)
7. [Activities / Beacons](#7-activities--beacons)
8. [Marketplace](#8-marketplace)
9. [Vouching](#9-vouching)
10. [Safety (Block & Report)](#10-safety-block--report)
11. [Invite System](#11-invite-system)
12. [Verification](#12-verification)
13. [Upload](#13-upload)
14. [Payments](#14-payments)
15. [Notifications](#15-notifications)
16. [Utility](#16-utility)

---

## 1. Auth

Base: `/api/v1/auth`

### POST `/register`
Register a new user (invite-only).

**Rate Limit:** 5 failed attempts / 15 min

**Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "name": "Jane Doe",
  "invite_code": "NOMAD-A3B5K",
  "username": "jane_doe",       // optional, auto-generated if omitted
  "phone": "+1234567890",       // optional
  "age": 28,                    // optional
  "gender": "female"            // optional
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "username": "jane_doe",
    "isActive": false,
    "requiresVerification": true,
    "invited_by": "inviterUserId"
  }
}
```

---

### POST `/verify-otp`
Verify email with 6-digit OTP. Activates account and returns tokens.

**Rate Limit:** 5 failed attempts / 15 min

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": { ...userObject }
  }
}
```

---

### POST `/login`
Login with email or username.

**Rate Limit:** 5 failed attempts / 15 min

**Body:**
```json
{
  "identifier": "jane_doe",
  "password": "minimum8chars"
}
```
Also accepts `email` or `username` field instead of `identifier`.

**Response:**
```json
{
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": { ...userObject }
  }
}
```

---

### POST `/refresh`
Refresh an expired access token.

**Body:**
```json
{ "refreshToken": "jwt_refresh_token" }
```

**Response:**
```json
{ "data": { "token": "new_jwt_access_token" } }
```

---

### POST `/resend-otp`
Resend OTP to email.

**Rate Limit:** 3 requests / 15 min

**Body:**
```json
{ "email": "user@example.com" }
```

---

### POST `/forgot-password`
Send password reset OTP.

**Rate Limit:** 3 requests / 15 min

**Body:**
```json
{ "email": "user@example.com" }
```

---

### POST `/reset-password`
Reset password with OTP.

**Rate Limit:** 5 attempts / 15 min

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newminimum8"
}
```

---

## 2. Users

Base: `/api/v1/users` | Requires auth on all endpoints

### GET `/me`
Get current user's full profile.

### PATCH `/me`
Update profile fields.

**Body (all optional):**
```json
{
  "profile": {
    "name": "Jane Doe",
    "age": 28,
    "gender": "female",
    "photo_url": "https://...",
    "hobbies": ["climbing", "hiking", "surfing"],
    "intent": "both",
    "bio": "Living the van life since 2021"
  },
  "rig": {
    "type": "sprinter",
    "crew_type": "solo",
    "pet_friendly": true
  },
  "is_builder": true,
  "builder_profile": {
    "specialty_tags": ["electrical", "solar"],
    "hourly_rate": 50,
    "availability_status": "available",
    "bio": "5 years of van builds"
  }
}
```

### POST `/complete-profile`
Complete profile after registration (hobbies, intent, rig).

**Body (all optional):**
```json
{
  "profile": {
    "hobbies": ["climbing", "surfing"],
    "intent": "both",
    "bio": "...",
    "photo_url": "https://..."
  },
  "rig": {
    "type": "sprinter",
    "crew_type": "solo",
    "pet_friendly": false
  }
}
```

### PATCH `/route`
Set or update travel route (origin, destination, dates).

**Body:**
```json
{
  "origin": { "lat": 34.0522, "lng": -118.2437 },
  "destination": { "lat": 36.7783, "lng": -119.4179 },
  "start_date": "2026-03-15T00:00:00Z",
  "duration_days": 14
}
```

### GET `/search`
Search users by name/username.

**Query:** `?q=jane&page=1&limit=20`

### PATCH `/toggle-builder`
Toggle builder status on/off.

### GET `/:userId`
Get another user's public profile.

### POST `/:userId/follow`
Follow a user.

### DELETE `/:userId/follow`
Unfollow a user.

### GET `/:userId/followers`
List user's followers (public).

### GET `/:userId/following`
List who user is following (public).

---

## 3. Matching & Discovery

Base: `/api/v1/discovery` or `/api/v1/matching` | Requires auth

### PATCH `/preferences`
Update matching preferences.

**Body (all optional):**
```json
{
  "intent": "dating",
  "preferences": {
    "gender_interest": ["female", "non-binary"],
    "min_age": 25,
    "max_age": 40,
    "max_distance_km": 200
  },
  "is_discoverable": true
}
```

### GET `/recommendations`
Get smart-matched recommendations ranked by compatibility score.

**Query:** `?page=1&limit=10&mode=friends`

- `mode`: `friends` | `dating` | `both` (defaults to user's intent)

**Response:**
```json
{
  "data": {
    "users": [
      {
        "_id": "...",
        "username": "vanlife_sarah",
        "profile": { "name": "Sarah", "hobbies": ["climbing", "hiking"], ... },
        "rig": { "type": "sprinter", "crew_type": "solo", ... },
        "nomad_id": { "verified": true, "vouch_count": 5 },
        "travel_route": {
          "destination": { "type": "Point", "coordinates": [-119.4, 36.7] },
          "start_date": "2026-03-20",
          "duration_days": 10
        },
        "distance_km": 45,
        "compatibility": {
          "route_overlap": 85,
          "temporal_overlap": 70,
          "hobby_match": 60,
          "proximity": 90,
          "trust": 50,
          "rig_compatibility": 70,
          "total": 73
        }
      }
    ]
  }
}
```

**Scoring Algorithm (6 dimensions, weighted by mode):**

| Dimension | What | Friends Weight | Dating Weight |
|---|---|---|---|
| route_overlap | Same destination? | 0.20 | 0.25 |
| temporal_overlap | Overlapping travel dates? | 0.20 | 0.25 |
| hobby_match | Shared hobbies (Jaccard) | 0.30 | 0.15 |
| proximity | Current distance | 0.10 | 0.15 |
| trust | Verification level + vouches | 0.10 | 0.15 |
| rig_compatibility | Rig/crew match | 0.10 | 0.05 |

### GET `/discovery`
Alias for `/recommendations`.

### POST `/swipe`
Swipe on a user.

**Rate Limit:** 100 swipes / 15 min

**Body:**
```json
{
  "targetUserId": "userId_here",
  "action": "like"
}
```
`action`: `like` | `pass` | `super_like`

**Response (match):**
```json
{
  "data": {
    "isMatch": true,
    "match": {
      "_id": "matchId",
      "conversation_id": "convId",
      "user": { "username": "...", "profile": { ... } }
    }
  }
}
```

### GET `/matches`
List all mutual matches.

### GET `/mutual`
Alias for `/matches`.

---

## 4. Chat

Base: `/api/v1/chat` | Requires auth

### GET `/conversations`
List all conversations, sorted by last message time.

### POST `/conversations`
Create a new conversation.

### GET `/:conversationId/messages`
Get messages in a conversation (paginated).

**Query:** `?page=1&limit=50`

### POST `/:conversationId/messages`
Send a message.

**Rate Limit:** 60 messages / minute

**Body:**
```json
{
  "message": "Hey, heading to Yosemite next week?",
  "message_type": "text"
}
```
`message_type`: `text` | `image` | `location` (default: `text`)

**Note:** Blocked users cannot send messages to each other.

### GET `/conversation/:userId`
Get or create a direct conversation with a user.

**Note:** Returns 403 if either user has blocked the other.

### PATCH `/:conversationId/read`
Mark all messages in conversation as read.

**Aliases:** All the above also work under `/conversations/:conversationId/...` prefix.

---

## 5. Feed

Base: `/api/v1/feed` | Requires auth

### GET `/`
Get timeline (paginated feed of posts).

**Query:** `?page=1&limit=20`

### POST `/posts`
Create a new post.

**Body:**
```json
{
  "photos": ["https://cloudinary.com/photo1.jpg"],
  "caption": "Sunset at Joshua Tree",
  "tags": ["joshuatree", "sunset", "vanlife"]
}
```
- `photos`: 1-10 URLs (required)
- `caption`: max 2200 chars (optional)
- `tags`: string array (optional)

### GET `/posts/:postId`
Get a single post.

### DELETE `/posts/:postId`
Delete your own post.

### POST `/posts/:postId/like`
Toggle like on a post.

### GET `/posts/:postId/comments`
Get comments on a post.

### POST `/posts/:postId/comments`
Add a comment.

**Body:**
```json
{ "text": "Amazing view!" }
```
`text`: 1-1000 chars

### GET `/users/:userId/posts`
Get all posts by a user.

---

## 6. Stories

Base: `/api/v1/stories` | Requires auth

### GET `/active`
Get active (non-expired) stories from followed users.

### GET `/me`
Get my own stories.

### POST `/`
Create a story (expires in 24h).

**Body:**
```json
{
  "asset_url": "https://cloudinary.com/story.jpg",
  "asset_type": "image"
}
```
`asset_type`: `image` | `video`

### GET `/:storyId`
View a story (records view).

### DELETE `/:storyId`
Delete your own story.

### GET `/:storyId/viewers`
Get list of users who viewed your story.

---

## 7. Activities / Beacons

Base: `/api/v1/beacons` | Requires auth

### POST `/`
Create a local activity/beacon.

**Body:**
```json
{
  "activity_type": "hiking",
  "location": { "lat": 34.0522, "lng": -118.2437 },
  "max_participants": 5,
  "event_time": "2026-03-20T14:00:00Z",
  "title": "Morning hike at Runyon Canyon",
  "description": "Easy 3-mile loop. Dogs welcome!",
  "verified_only": false
}
```

### GET `/nearby`
Find activities near you.

**Query:** `?lat=34.0522&lng=-118.2437&radius=50`

### POST `/:id/join`
Request to join an activity.

### PATCH `/:id/approve/:userId`
Approve a join request (host only).

### PATCH `/:id/reject/:userId`
Reject a join request (host only).

---

## 8. Marketplace

Base: `/api/v1/marketplace` | Requires auth

### GET `/builders`
Search for van builders.

**Query:** `?specialty=electrical&page=1&limit=20`

### POST `/consult`
Request a consultation with a builder.

**Body:**
```json
{
  "builder_id": "builderId",
  "specialty": "electrical"
}
```

### PATCH `/consult/:id/accept`
Accept a consultation request (builder only).

### POST `/review`
Review a completed consultation.

**Body:**
```json
{
  "consultation_id": "consultId",
  "rating": 5,
  "comment": "Super helpful with my solar setup!"
}
```
`rating`: 1-5

---

## 9. Vouching

Base: `/api/v1/vouch` | Requires auth

### POST `/:userId`
Vouch for a user (one vouch per pair).

### GET `/received`
Get vouches received by current user.

---

## 10. Safety (Block & Report)

Base: `/api/v1/safety` | Requires auth

### POST `/block/:userId`
Block a user. Removes existing matches and swipes between you.

**Response (201):**
```json
{ "data": { "blocked": true, "blocked_user_id": "..." } }
```

### DELETE `/block/:userId`
Unblock a user.

### GET `/blocked`
List all users you've blocked.

### POST `/report/:userId`
Report a user. **Auto-blocks the reported user** for safety.

**Body:**
```json
{
  "reason": "harassment",
  "description": "Sent threatening messages after I said I wasn't interested"
}
```
`reason`: `harassment` | `fake_profile` | `inappropriate_content` | `spam` | `threatening_behavior` | `underage` | `scam` | `other`
`description`: max 1000 chars (optional)

**Response (201):**
```json
{
  "data": {
    "report_id": "...",
    "status": "pending",
    "auto_blocked": true
  }
}
```

### Admin Endpoints

### GET `/admin/reports`
List reports (filterable).

**Query:** `?status=pending&page=1&limit=20`

### PATCH `/admin/reports/:reportId`
Resolve or dismiss a report.

**Body:**
```json
{
  "action": "resolved",
  "admin_notes": "User has been warned"
}
```
`action`: `resolved` | `dismissed`

### POST `/admin/suspend/:userId`
Suspend a user (deactivates account, auto-resolves all pending reports).

---

## 11. Invite System

Base: `/api/v1/invite`

### POST `/generate` (auth required)
Generate an invite code.

**Body:**
```json
{ "max_uses": 3 }
```
`max_uses`: 1-5 (default 1). Free users: 3 active codes max. Pro: 10.

**Response (201):**
```json
{
  "data": {
    "code": "NOMAD-A3B5K",
    "max_uses": 3,
    "expires_at": null
  }
}
```

### GET `/my-codes` (auth required)
List all your invite codes with usage info.

### DELETE `/:codeId` (auth required)
Revoke an active invite code.

### GET `/validate/:code` (public)
Check if an invite code is valid (for registration form).

**Response:**
```json
{ "data": { "valid": true } }
```

### GET `/tree` (auth required)
View your invitation tree (who invited you, who you invited).

**Response:**
```json
{
  "data": {
    "invited_by": { "username": "og_nomad", "profile": { ... } },
    "people_invited": [ ... ],
    "total_invited": 5
  }
}
```

---

## 12. Verification

Base: `/api/v1/verification`

**5-Level Verification System (all free, admin-reviewed):**

| Level | Requirement | Badge |
|---|---|---|
| 0 | Nothing | `none` |
| 1 | Email verified | `basic` |
| 2 | + Phone submitted & verified | `trusted` |
| 3 | + Photo selfie verified | `verified` |
| 4 | + Community vouched (3+ vouches) | `super_verified` |
| 5 | + ID document verified | `nomad_elite` |

### User Endpoints (auth required)

### GET `/status`
Get your current verification status and level.

**Response:**
```json
{
  "data": {
    "verification": {
      "email": { "status": "verified", "verified_at": "..." },
      "phone": { "status": "none" },
      "photo": { "status": "none" },
      "id_document": { "status": "none" },
      "community": { "status": "none", "vouch_count": 0 },
      "level": 1,
      "badge": "basic"
    }
  }
}
```

### POST `/phone`
Submit phone number for admin verification.

**Body:**
```json
{ "phone_number": "+1-555-123-4567" }
```
Regex: `^\+?[0-9\s\-()]+$`, 7-20 chars

### POST `/photo`
Submit a selfie for photo verification. Upload image first via `/api/v1/upload/image`, then submit the URL.

**Body:**
```json
{ "selfie_url": "https://res.cloudinary.com/..." }
```

### POST `/id-document`
Submit an ID document for verification. Upload image first via `/api/v1/upload/image`, then submit the URL.

**Body:**
```json
{
  "document_url": "https://res.cloudinary.com/...",
  "document_type": "drivers_license"
}
```
`document_type`: `drivers_license` | `passport` | `national_id`

### POST `/community/refresh`
Recalculate community verification status based on current vouch count. Automatically marks as verified if you have 3+ vouches.

### Admin Endpoints (auth required)

### GET `/admin/pending`
List users with pending verification submissions.

**Query:** `?type=photo&page=1&limit=20`
`type`: `phone` | `photo` | `id_document` (omit for all pending)

### PATCH `/admin/phone/:userId`
Approve or reject a phone verification.

**Body:**
```json
{ "action": "approve" }
```
`action`: `approve` | `reject`

### PATCH `/admin/photo/:userId`
Approve or reject a photo verification.

**Body:**
```json
{
  "action": "reject",
  "rejection_reason": "Face not clearly visible"
}
```

### PATCH `/admin/id-document/:userId`
Approve or reject an ID document verification.

**Body:**
```json
{
  "action": "approve"
}
```

---

## 13. Upload

Base: `/api/v1/upload` | Requires auth

### POST `/image`
Upload an image to Cloudinary.

**Rate Limit:** 20 uploads / 15 min

**Content-Type:** `multipart/form-data`

**Field:** `image` (file)
- Max size: 10MB
- Allowed types: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "nomadly/abc123"
  }
}
```

### DELETE `/image/:publicId`
Delete an uploaded image.

---

## 14. Payments

Base: `/api/v1/payments`

### POST `/webhook`
RevenueCat webhook receiver (no auth — webhook secret validated internally).

### GET `/status` (auth required)
Get current subscription status.

---

## 15. Notifications

Base: `/api/v1/notifications` | Requires auth

### POST `/test`
Send a test notification (development).

---

## 16. Utility

### GET `/health`
Health check endpoint (no auth).

**Response:**
```json
{ "status": "ok", "timestamp": "2026-02-02T12:00:00.000Z" }
```

### GET `/api-docs`
Swagger UI documentation (no auth).

---

## WebSocket Events (Socket.IO)

**Connection:** `ws://localhost:3000`

**Auth:** Pass JWT token in handshake:
```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "jwt_access_token" }
});
```

### Events Emitted by Server

| Event | Payload | When |
|---|---|---|
| `match_new` | `{ match_id, conversation_id, partner }` | New mutual match |
| `message_new` | `{ message }` | New chat message received |
| `message_read` | `{ conversationId, userId }` | Messages marked as read |

### Events Sent by Client

| Event | Payload | Purpose |
|---|---|---|
| `join_conversation` | `{ conversationId }` | Join a chat room |
| `send_message` | `{ conversationId, message, message_type }` | Send message via socket |
| `typing` | `{ conversationId }` | Typing indicator |
| `mark_read` | `{ conversationId }` | Mark messages as read |

---

## Global Middleware Stack

Applied to **all** requests in order:

1. **Helmet** — Security headers (CSP, HSTS)
2. **CORS** — Configured origins from `ALLOWED_ORIGINS` env
3. **Compression** — Response compression
4. **Body Parser** — JSON + URL-encoded, 10MB limit
5. **NoSQL Sanitize** — Strips `$` and `.` operators from keys
6. **XSS Sanitize** — Strips malicious HTML/JS from all inputs
7. **Request Logger** — Structured logging (method, URL, status, duration)
8. **API Rate Limiter** — 100 requests / 15 min per IP

## Error Response Format

All errors follow this format:
```json
{
  "status": "error",
  "message": "Description of what went wrong",
  "errors": []
}
```

**Status Codes:**
- `400` — Validation error
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (blocked user, insufficient permissions)
- `404` — Resource not found
- `409` — Conflict (duplicate email, already blocked, etc.)
- `429` — Rate limit exceeded
- `500` — Internal server error
