# Nomadly API Documentation for Mobile Developers

## 📱 Overview

This is a comprehensive guide for mobile developers integrating with the Nomadly backend API. Nomadly is a location-based social platform for digital nomads with trajectory-based matching, activities, marketplace, and real-time chat.

**Base URL**: `http://localhost:3000` (Development) | `https://api.nomadly.com` (Production)

**API Version**: 1.0.0

---

## 🔐 Authentication & Authorization

### How Authentication Works

Nomadly uses **JWT (JSON Web Tokens)** for authentication. There are two types of tokens:

1. **Access Token** (`token`) - Used for API requests, expires in 7 days
2. **Refresh Token** (`refreshToken`) - Used to get new access tokens, expires in 30 days

### Authentication Flow

```
1. Register → Get userId (NO token yet)
2. Verify OTP → Get tokens (token + refreshToken)
3. Use token in Authorization header for protected routes
4. When token expires → Use refreshToken to get new token
```

### Using JWT Tokens

For **protected endpoints**, include the token in the request header:

```http
Authorization: Bearer <your_access_token>
```

**Example:**
```javascript
fetch('http://localhost:3000/api/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Token Storage Best Practices

- ✅ Store tokens securely (Keychain on iOS, Keystore on Android)
- ✅ Refresh token before it expires
- ✅ Handle 401 errors by redirecting to login
- ❌ Never store tokens in UserDefaults/SharedPreferences (unencrypted)
- ❌ Never log tokens to console

---

## 📋 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 🚀 API Endpoints

### 🔓 Public Endpoints (No Authentication)

#### 1. Register User
**POST** `/api/auth/register`

Create a new user account. An OTP will be sent to the email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",      // Optional
  "age": 30,                    // Optional
  "gender": "male"              // Optional
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "isActive": false
  }
}
```

**Note:** No JWT token is returned. User must verify OTP first.

---

#### 2. Verify OTP
**POST** `/api/auth/verify-otp`

Verify the OTP code sent to email and activate account. **Returns JWT tokens.**

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isActive": true
    }
  }
}
```

**⚠️ Important:** Save both tokens. Use `token` for API requests, `refreshToken` to get new tokens.

---

#### 3. Login
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isActive": true
    }
  }
}
```

---

#### 4. Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 5. Resend OTP
**POST** `/api/auth/resend-otp`

Resend OTP code to email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent successfully"
}
```

---

### 🔒 Protected Endpoints (Authentication Required)

All endpoints below require `Authorization: Bearer <token>` header.

---

## 👤 User Management

### Get Current User Profile
**GET** `/api/users/me`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "+1234567890",
    "profile": {
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "photo_url": "https://cloudinary.com/image.jpg",
      "hobbies": ["Hiking", "Solar", "Photography"],
      "intent": "friends",
      "bio": "Digital nomad exploring the world"
    },
    "rig": {
      "type": "sprinter",
      "crew_type": "solo",
      "pet_friendly": false
    },
    "travel_route": {
      "origin": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "destination": {
        "type": "Point",
        "coordinates": [-118.2437, 34.0522]
      },
      "start_date": "2024-06-01T00:00:00Z",
      "duration_days": 30
    },
    "is_builder": false,
    "nomad_id": {
      "verified": true,
      "member_since": "2024-01-01T00:00:00Z",
      "vouch_count": 5
    },
    "subscription": {
      "status": "active",
      "plan": "vantage_pro",
      "expires_at": "2024-07-01T00:00:00Z"
    }
  }
}
```

---

### Update Profile
**PATCH** `/api/users/me`

Update user profile. All fields are optional.

**Request Body:**
```json
{
  "profile": {
    "name": "John Doe",
    "age": 30,
    "gender": "male",
    "photo_url": "https://cloudinary.com/image.jpg",
    "hobbies": ["Hiking", "Solar"],
    "intent": "friends",
    "bio": "Updated bio"
  },
  "rig": {
    "type": "sprinter",
    "crew_type": "couple",
    "pet_friendly": true
  },
  "is_builder": true,
  "builder_profile": {
    "specialty_tags": ["Electrical", "Plumbing"],
    "hourly_rate": 50,
    "availability_status": "available",
    "bio": "Expert van builder"
  }
}
```

**Response (200):** Same as GET `/api/users/me`

---

### Complete Profile
**POST** `/api/users/complete-profile`

Complete profile with additional details (hobbies, rig info, etc.). All fields are optional since basic info is collected during registration.

**Request Body:**
```json
{
  "profile": {
    "hobbies": ["Hiking", "Solar", "Photography"],
    "intent": "friends",
    "bio": "Digital nomad",
    "photo_url": "https://cloudinary.com/image.jpg"
  },
  "rig": {
    "type": "sprinter",
    "crew_type": "solo",
    "pet_friendly": false
  }
}
```

---

### Update Travel Route
**PATCH** `/api/users/route`

Update user's travel route with origin, destination, and dates.

**Request Body:**
```json
{
  "origin": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "destination": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "start_date": "2024-06-01T00:00:00Z",
  "duration_days": 30
}
```

---

### Search Users
**GET** `/api/users/search`

Search users with filters.

**Query Parameters:**
- `intent` (optional): Comma-separated - `friends,dating,both`
- `rig_type` (optional): `sprinter`, `skoolie`, `suv`, `truck_camper`
- `crew_type` (optional): `solo`, `couple`, `with_pets`
- `verified_only` (optional): `true` or `false`
- `page` (optional): Default `1`
- `limit` (optional): Default `20`

**Example:**
```
GET /api/users/search?intent=friends,dating&rig_type=sprinter&verified_only=true&page=1&limit=20
```

**Response (200):**
```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### Toggle Builder Status
**PATCH** `/api/users/toggle-builder`

Toggle user's builder status on/off.

**Response (200):** Updated user object

---

## 💑 Matching & Discovery

### Get Discovery Feed
**GET** `/api/matches/discovery`

Get potential matches based on trajectory intersection and filters.

**Query Parameters:**
- `intent` (optional): Comma-separated - `friends,dating,both`
- `rig_type` (optional): `sprinter`, `skoolie`, `suv`, `truck_camper`
- `verified_only` (optional): `true` or `false`
- `max_distance` (optional): Maximum distance in meters (default: 50000)

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "profile": { ... },
        "rig": { ... },
        "nomad_id": {
          "verified": true,
          "vouch_count": 5
        }
      },
      "intersection": {
        "type": "Point",
        "coordinates": [-120.0, 36.0]
      },
      "distance": 150,
      "score": 85,
      "commonHobbies": ["Hiking", "Solar"]
    }
  ]
}
```

---

### Swipe on User
**POST** `/api/matches/swipe`

Record a swipe action (left, right, or star for caravan request).

**Request Body:**
```json
{
  "matched_user_id": "507f1f77bcf86cd799439012",
  "action": "right"  // "left", "right", or "star"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Swipe recorded",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "user_id": "507f1f77bcf86cd799439011",
    "matched_user_id": "507f1f77bcf86cd799439012",
    "swipe_action": "right",
    "is_mutual": false
  }
}
```

**Note:** If both users swipe right/star, `is_mutual` becomes `true`.

---

### Get Mutual Matches
**GET** `/api/matches/mutual`

Get all users with mutual matches.

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "matchId": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "profile": { ... },
        "rig": { ... }
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🎯 Activities (Beacons)

### Create Activity Beacon
**POST** `/api/activities`

Create a new activity beacon (campfire, yoga, hiking, etc.).

**Request Body:**
```json
{
  "activity_type": "campfire",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "max_participants": 10,
  "event_time": "2024-06-15T18:00:00Z",
  "description": "Join us for a campfire and stargazing",
  "verified_only": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Activity created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "host_id": "507f1f77bcf86cd799439011",
    "activity_type": "campfire",
    "location": {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749]
    },
    "max_participants": 10,
    "current_participants": [],
    "pending_requests": [],
    "event_time": "2024-06-15T18:00:00Z",
    "description": "Join us for a campfire and stargazing",
    "verified_only": false,
    "status": "open",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Nearby Activities
**GET** `/api/activities/nearby`

Get activities near a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `max_distance` (optional): Maximum distance in meters (default: 50000)

**Example:**
```
GET /api/activities/nearby?lat=37.7749&lng=-122.4194&max_distance=10000
```

**Response (200):** Array of activities

---

### Request to Join Activity
**POST** `/api/activities/:id/join`

Request to join an activity (requires host approval).

**Response (200):** Updated activity object

---

### Approve Participant
**PATCH** `/api/activities/:id/approve/:userId`

Approve a participant's join request (host only).

**Response (200):** Updated activity object

---

### Reject Participant
**PATCH** `/api/activities/:id/reject/:userId`

Reject a participant's join request (host only).

**Response (200):** Updated activity object

---

## 🛠️ Marketplace (Builder's Bench)

### Search Builders
**GET** `/api/marketplace/builders`

Search for builders by specialty and filters.

**Query Parameters:**
- `specialty` (optional): Comma-separated - `Electrical,Plumbing`
- `max_rate` (optional): Maximum hourly rate
- `page` (optional): Default `1`
- `limit` (optional): Default `20`

**Response (200):**
```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Request Consultation
**POST** `/api/marketplace/consult`

Request a consultation with a builder.

**Request Body:**
```json
{
  "builder_id": "507f1f77bcf86cd799439015",
  "specialty": "Electrical"
}
```

**Response (201):** Consultation object

---

### Accept Consultation
**PATCH** `/api/marketplace/consult/:id/accept`

Accept a consultation request (builder only).

**Response (200):** Updated consultation

---

### Create Review
**POST** `/api/marketplace/review`

Leave a review for a completed consultation.

**Request Body:**
```json
{
  "consultation_id": "507f1f77bcf86cd799439016",
  "rating": 5,
  "comment": "Great service, very professional!"
}
```

**Response (201):** Review object

---

## 💬 Chat

### Get Conversations
**GET** `/api/chat/conversations`

Get all conversations for the authenticated user.

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "participants": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "profile": { ... }
        },
        {
          "_id": "507f1f77bcf86cd799439012",
          "profile": { ... }
        }
      ],
      "type": "direct",
      "last_message": "Hello!",
      "last_message_time": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### Get Messages
**GET** `/api/chat/:conversationId/messages`

Get messages for a conversation.

**Query Parameters:**
- `page` (optional): Default `1`
- `limit` (optional): Default `50`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "conversation_id": "507f1f77bcf86cd799439017",
      "sender_id": {
        "_id": "507f1f77bcf86cd799439011",
        "profile": { ... }
      },
      "message": "Hello!",
      "message_type": "text",
      "read_by": ["507f1f77bcf86cd799439012"],
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### Send Message
**POST** `/api/chat/:conversationId/messages`

Send a message in a conversation.

**Request Body:**
```json
{
  "message": "Hello! How are you?",
  "message_type": "text"  // "text", "image", or "location"
}
```

**Response (201):** Message object

---

### Get or Create Conversation
**GET** `/api/chat/conversation/:userId`

Get existing conversation or create a new one with a user.

**Response (200):** Conversation object

---

### Mark Messages as Read
**PATCH** `/api/chat/:conversationId/read`

Mark all messages in a conversation as read.

**Response (200):**
```json
{
  "status": "success",
  "message": "Messages marked as read"
}
```

---

## 🔌 Real-Time Chat (Socket.IO)

Connect to WebSocket for real-time messaging.

**Connection URL:** `ws://localhost:3000` (Development) | `wss://api.nomadly.com` (Production)

**Authentication:** Include token in connection:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken
  }
});
```

### Client → Server Events

#### Join Chat
```javascript
socket.emit('join_chat', conversationId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  conversationId: '507f1f77bcf86cd799439017',
  message: 'Hello!',
  messageType: 'text'  // Optional: 'text', 'image', 'location'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  conversationId: '507f1f77bcf86cd799439017',
  isTyping: true
});
```

#### Mark as Read
```javascript
socket.emit('mark_read', conversationId);
```

### Server → Client Events

#### Receive Message
```javascript
socket.on('receive_message', (message) => {
  console.log('New message:', message);
});
```

#### Typing Indicator
```javascript
socket.on('typing', (data) => {
  console.log('User typing:', data.userId, data.isTyping);
});
```

#### Read Receipt
```javascript
socket.on('read_receipt', (data) => {
  console.log('Message read by:', data.userId);
});
```

#### Error
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

---

## ✅ Vouching

### Vouch for User
**POST** `/api/vouch/:userId`

Vouch for a user (requires previous conversation).

**Response (201):**
```json
{
  "status": "success",
  "message": "Vouch created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439019",
    "voucher_id": {
      "_id": "507f1f77bcf86cd799439011",
      "profile": { ... }
    },
    "vouchee_id": "507f1f77bcf86cd799439012",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Note:** Users need 3+ vouches to get verified status.

---

### Get Received Vouches
**GET** `/api/vouch/received`

Get all vouches received by the authenticated user.

**Response (200):** Array of vouch objects

---

## 💳 Payments

### Get Subscription Status
**GET** `/api/payments/status`

Get the authenticated user's subscription status.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "status": "active",
    "plan": "vantage_pro",
    "expires_at": "2024-07-01T00:00:00Z",
    "revenue_cat_id": "product_id"
  }
}
```

---

## 📤 Image Upload

### Upload Image
**POST** `/api/upload/image`

Upload an image to Cloudinary and get back the URL. **Use this URL in other APIs.**

**Content-Type:** `multipart/form-data`

**Query Parameters:**
- `type` (optional): `profile`, `activity`, `rig`, `chat`, or `default`

**Request Body:**
- `image` (file): Image file (JPEG, PNG, GIF, WebP - max 10MB)

**Response (201):**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "public_id": "nomadly/profile-images/abc123",
    "format": "jpeg",
    "folder": "nomadly/profile-images"
  }
}
```

**Usage Example:**
```javascript
// 1. Upload image
const formData = new FormData();
formData.append('image', imageFile);

const uploadResponse = await fetch(
  'http://localhost:3000/api/upload/image?type=profile',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

const { data } = await uploadResponse.json();
const imageUrl = data.url;

// 2. Use URL in profile update
await fetch('http://localhost:3000/api/users/me', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profile: {
      photo_url: imageUrl
    }
  })
});
```

---

### Delete Image
**DELETE** `/api/upload/image/:publicId`

Delete an image from Cloudinary using its public_id.

**Response (200):**
```json
{
  "status": "success",
  "message": "Image deleted successfully"
}
```

---

## 🔔 Notifications

### Send Test Notification
**POST** `/api/notifications/test`

Send a test push notification (for testing purposes).

**Request Body:**
```json
{
  "title": "Test Notification",
  "body": "This is a test notification"
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Handling 401 Errors

When you receive a 401 error:

1. Try refreshing the token using `/api/auth/refresh`
2. If refresh fails, redirect user to login
3. Clear stored tokens

**Example:**
```javascript
async function makeRequest(url, options) {
  let response = await fetch(url, options);
  
  if (response.status === 401) {
    // Try to refresh token
    const refreshResponse = await refreshToken();
    if (refreshResponse.ok) {
      const { data } = await refreshResponse.json();
      // Update stored token
      await saveToken(data.token);
      // Retry original request with new token
      options.headers.Authorization = `Bearer ${data.token}`;
      response = await fetch(url, options);
    } else {
      // Redirect to login
      redirectToLogin();
      return;
    }
  }
  
  return response;
}
```

---

## 📝 Common Patterns

### Complete User Onboarding Flow

```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+1234567890'
  })
});

// 2. Verify OTP
const verifyResponse = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
});

const { data } = await verifyResponse.json();
const { token, refreshToken } = data;

// 3. Save tokens
await saveTokens(token, refreshToken);

// 4. Upload profile photo (optional)
const photoUrl = await uploadImage('profile', imageFile, token);

// 5. Complete profile
await fetch('/api/users/complete-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profile: {
      hobbies: ['Hiking', 'Solar'],
      intent: 'friends',
      bio: 'Digital nomad',
      photo_url: photoUrl
    },
    rig: {
      type: 'sprinter',
      crew_type: 'solo',
      pet_friendly: false
    }
  })
});
```

---

### Image Upload Pattern

```javascript
async function uploadImage(type, imageFile, token) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageFile.uri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  });

  const response = await fetch(
    `http://localhost:3000/api/upload/image?type=${type}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    }
  );

  const { data } = await response.json();
  return data.url;
}
```

---

### Real-Time Chat Setup

```javascript
import io from 'socket.io-client';

// Connect with authentication
const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken
  }
});

// Join conversation
socket.emit('join_chat', conversationId);

// Listen for messages
socket.on('receive_message', (message) => {
  // Update UI with new message
  updateChatUI(message);
});

// Send message
function sendMessage(conversationId, text) {
  socket.emit('send_message', {
    conversationId,
    message: text,
    messageType: 'text'
  });
}

// Typing indicator
let typingTimeout;
function handleTyping(conversationId) {
  socket.emit('typing', {
    conversationId,
    isTyping: true
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', {
      conversationId,
      isTyping: false
    });
  }, 1000);
}
```

---

## 🎯 Rate Limiting

The API implements rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **OTP endpoints**: 3 requests per 15 minutes per IP

If you exceed the limit, you'll receive a 429 status code. Wait before retrying.

---

## 📚 Additional Resources

- **Swagger UI**: `http://localhost:3000/api-docs` - Interactive API documentation
- **Health Check**: `GET /health` - Check if server is running

---

## 🚨 Important Notes

1. **Always use HTTPS in production**
2. **Store tokens securely** (Keychain/Keystore)
3. **Handle token expiration** gracefully
4. **Validate inputs** on client side before sending
5. **Handle network errors** and show appropriate messages
6. **Implement retry logic** for failed requests
7. **Cache user profile** to reduce API calls
8. **Use pagination** for lists (don't load all data at once)

---

## 📞 Support

For API support or questions:
- Email: support@nomadly.com
- Check Swagger docs: `/api-docs`
- Review error messages for debugging

---

**Last Updated:** January 2024
**API Version:** 1.0.0
