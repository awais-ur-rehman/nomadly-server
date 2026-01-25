# Nomadly: Definitive Backend Specification (MVP)

This document serves as the technical blueprint for the Nomadly backend developer. 

## 1. Architectural Strategy
- **Framework**: Node.js with TypeScript.
- **Database**: MongoDB (Primary) + Redis (OTP, Caching, Rate Limiting).
- **Communication**: Socket.IO for real-time messaging and notifications.
- **Media**: Cloudinary for image/video storage and transformations.
- **Structure**: Modular Monolith (each feature in its own directory).
- **Best Practices**: 
  - All paginated GET requests MUST support `?page=n&limit=m`.
  - All list requests MUST support relevant filtering via query parameters.
  - Consistent response envelope: `{ status: "success", data: {}, message: "" }`.

---

## 2. Authentication & Vetting Module (Redis-Backed)

### Core Flow:
- **Registration**: User provides details + Profile Image. System sends OTP to email.
- **Verification**: OTP stored in Redis ({email: code}) with 5-minute TTL.
- **Login**: Returns `accessToken` (JWT 15m) and `refreshToken` (JWT 7d). Supports `username` or `email` as identifier.

### Endpoints:
| Method | Route | Payload (Example) | Response |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | `{ email, password, username, name, phone, age, gender }` | `{ userId, requiresVerification: true }` |
| POST | `/api/v1/auth/verify-otp` | `{ email, code }` | `{ user, token, refreshToken }` |
| POST | `/api/v1/auth/login` | `{ identifier (email/username), password }` | `{ user, token, refreshToken }` |
| POST | `/api/v1/auth/forgot-password` | `{ email }` | `{ message: "OTP sent" }` |
| POST | `/api/v1/auth/reset-password` | `{ email, otp, newPassword }` | `{ message: "Success" }` |

**Security**: 
- Implement Redis-based rate limiting on Auth routes.
- **Nomad ID**: Logic to track `vouch_count`. Increment vouch via meeting/connection loop.

---

## 3. Profile & Relationship Module

### Requirements:
- **Unique Handle**: `username` must be validated during registration.
- **Privacy**: `is_private` boolean. 
- **Follow System**: 
  - User A follows User B. If B is private -> Create `FollowRequest`.
  - User search via `?query=string` (matches username or email).

### Endpoints:
| Method | Route | Description | Query Params |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/users/me` | Self profile + rig details. | N/A |
| PATCH | `/api/v1/users/me` | Update profile/rig/privacy. | N/A |
| GET | `/api/v1/users/:username` | Public profile view. | N/A |
| POST | `/api/v1/users/:id/follow` | Follow or send request. | N/A |
| GET | `/api/v1/users/search` | Global user search. | `query`, `page`, `limit` |
| GET | `/api/v1/users/requests` | List pending follow reqs. | `page`, `limit` |

---

## 4. Nomadic Discovery (The Trajectory Match)

### The Logic (Trajectory-Based):
- Users input their **Future Route** (Start City -> End City + Dates).
- **Matching Rule**: Show users whose paths/time-frames intersection. 
- **DB Strategy**: Use MongoDB `2dsphere` index. Store routes as GeoJSON `LineString`.

### Endpoints:
| Method | Route | Payload / Description |
| :--- | :--- | :--- |
| POST | `/api/v1/discovery/route` | `{ origin: {lat, lng}, destination: {lat, lng}, start_date, duration }` |
| GET | `/api/v1/discovery/cards` | Returns swipe-able user cards based on path intersection. |
| POST | `/api/v1/discovery/swipe` | `{ targetUserId, action: 'like' | 'pass' | 'caravan' }` |

---

## 5. Social Feed & 24h Stories

### Requirements:
- **Feed**: Aggregated posts from followed users + own posts.
- **Stories**: Disappear exactly 24 hours after upload.
- **Story Strategy**: Backend uses MongoDB TTL index `expireAfterSeconds: 86400`.

### Endpoints:
| Method | Route | Description | Filters |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/feed` | Home screen timeline. | `page`, `limit`, `type: posts|stories` |
| POST | `/api/v1/posts` | `{ photos[], caption, tags[] }` | N/A |
| POST | `/api/v1/stories` | `{ asset_url, type: 'image'|'video' }` | N/A |
| GET | `/api/v1/stories/active` | Active stories of followed users. | N/A |

---

## 6. Map Activity (Beacons)

### The Logic:
- Users drop a "Beacon" (campfire, tool help, meeting point).
- Others see icons on map. Exact location is hidden until "Request to Join" is approved by the host.

### Endpoints:
| Method | Route | Payload |
| :--- | :--- | :--- |
| POST | `/api/v1/beacons` | `{ title, type (icon), description, coordinates, max_spots, verified_only: bool }` |
| GET | `/api/v1/beacons/nearby` | Query: `?lat=&lng=&radius=`. Returns list of icons. |
| POST | `/api/v1/beacons/:id/join` | Request to join the activity. |
| PATCH | `/api/v1/beacons/requests/:reqId` | `{ status: 'approved' | 'rejected' }`. If approved, reveals precise lat/lng. |

---

## 7. Marketplace (Builder's Bench)

### Monetization (RevenueCat):
- Use webhooks to listen for subscription/purchase events.
- **Listing**: Users can enable "I am a builder".
- **Fields**: `specialty_tags`, `hourly_rate`, `availability_status`.

### Endpoints:
| Method | Route | Description | Filters |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/marketplace` | Find experts. | `tags[]`, `location`, `page` |
| POST | `/api/v1/marketplace/unlock` | `{ builderId, transactionId }`. Validates via RevenueCat to open chat. |

---

## 8. Real-time Messaging (Socket.IO)

### Structure:
- **Conversation ID**: Unique hash of sorted participant IDs.
- **Persistence**: Every message stored in MongoDB.
- **Attachments**: Cloudinary URL for image messages.

### Socket Events:
- `join_room(convId)`
- `message_send`: `{ to, text, type }`
- `typing_start` / `typing_stop`
- `notification_received`: For follow requests or badge rewards.

---

## 9. Performance & Redis Strategies
1. **OTP Storage**: Never store in DB. Keep in Redis for auto-expiry.
2. **Feed Caching**: Cache the first 10 posts of the main feed in Redis for 5 minutes.
3. **Session Management**: Store `blacklisted_tokens` in Redis for immediate logout functionality.
