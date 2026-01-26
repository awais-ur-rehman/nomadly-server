# User Profile & Following System - API Documentation

Complete guide for implementing Instagram-like user profiles with privacy controls and relationship tracking.

---

## 🔍 Search Users with Relationship Status

### **GET `/api/v1/users/search`**
Search for users by username, email, or name with relationship metadata.

**Auth**: Required

**Query Parameters**:
- `search` or `q`: Search term (partial match supported)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `verified_only`: Filter verified users only (optional)

**Response**:
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "...",
        "username": "seed_john_nomad",
        "email": "seed_john@example.com",
        "profile": {
          "name": "John Nomad",
          "photo_url": "https://...",
          "bio": "Full-time van lifer..."
        },
        "nomad_id": {
          "verified": true,
          "vouch_count": 5
        },
        "isFollowing": true,        // ✨ NEW: Are you following this user?
        "followsMe": false,          // ✨ NEW: Does this user follow you?
        "isFollowingPending": false  // ✨ NEW: Is your follow request pending?
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

## 👤 Get User Profile with Relationship Status

### **GET `/api/v1/users/:userId`**
Fetch a user's full profile with relationship metadata.

**Auth**: Required

**Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "username": "seed_john_nomad",
    "email": "seed_john@example.com",
    "is_private": false,
    "profile": {
      "name": "John Nomad",
      "age": 28,
      "gender": "male",
      "photo_url": "https://...",
      "hobbies": ["Hiking", "Photography"],
      "intent": "friends",
      "bio": "Full-time van lifer exploring the west coast"
    },
    "rig": {
      "type": "sprinter",
      "crew_type": "solo",
      "pet_friendly": true
    },
    "nomad_id": {
      "verified": true,
      "member_since": "2025-01-15T...",
      "vouch_count": 5
    },
    "isFollowing": true,        // ✨ Your relationship to this user
    "followsMe": false,
    "isFollowingPending": false
  }
}
```

---

## 📸 Get User's Posts (Privacy-Aware)

### **GET `/api/v1/feed/users/:userId/posts`**
Fetch posts from a specific user with Instagram-like privacy rules.

**Auth**: Required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 20)

**Privacy Rules**:
- ✅ **Public Account**: Anyone can see posts
- ✅ **Private Account + Following**: You can see posts
- ❌ **Private Account + Not Following**: Empty posts array
- ✅ **Own Profile**: Always see all posts

**Response (Can View)**:
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "_id": "...",
        "author_id": { ... },
        "photos": ["https://..."],
        "caption": "Amazing sunset!",
        "likes": [],
        "comments_count": 5,
        "created_at": "2026-01-26T..."
      }
    ],
    "canViewPosts": true,    // ✨ Permission flag
    "isPrivate": false,      // ✨ Account privacy status
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": true,
      "total": 12
    }
  }
}
```

**Response (Private Account - Cannot View)**:
```json
{
  "status": "success",
  "data": {
    "posts": [],              // Empty array
    "canViewPosts": false,    // ✨ Cannot view
    "isPrivate": true,        // ✨ Account is private
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false,
      "total": 0
    }
  }
}
```

---

## 🤝 Follow System

### **POST `/api/v1/users/:userId/follow`**
Follow a user (instant for public accounts, pending for private).

**Auth**: Required

**Response**:
```json
{
  "status": "success",
  "data": {
    "status": "active"  // or "pending" for private accounts
  }
}
```

### **DELETE `/api/v1/users/:userId/follow`**
Unfollow a user.

**Auth**: Required

**Response**:
```json
{
  "status": "success",
  "message": "User unfollowed successfully"
}
```

---

## 📊 Followers & Following Lists

### **GET `/api/v1/users/:userId/followers`**
Get list of users who follow this user.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response**:
```json
{
  "status": "success",
  "data": {
    "followers": [
      {
        "username": "seed_jane_explorer",
        "profile": { ... },
        "nomad_id": { ... }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

### **GET `/api/v1/users/:userId/following`**
Get list of users this user follows.

**Response**: Same format as followers endpoint.

---

## 🎯 Implementation Flow for App Developer

### **1. Search Flow**
```
User types "john" → GET /api/v1/users/search?search=john
→ Display results with "Follow" button (check isFollowing flag)
```

### **2. Profile View Flow**
```
User clicks on profile → GET /api/v1/users/:userId
→ Display profile info + relationship status
→ GET /api/v1/feed/users/:userId/posts
→ If canViewPosts=true: Show posts
→ If canViewPosts=false: Show "This account is private" message
```

### **3. Follow/Unfollow Flow**
```
User clicks "Follow" → POST /api/v1/users/:userId/follow
→ If status="active": Update UI to "Following"
→ If status="pending": Update UI to "Requested"

User clicks "Unfollow" → DELETE /api/v1/users/:userId/follow
→ Update UI to "Follow"
```

---

## 🚨 Important Notes

1. **Relationship Metadata**: Only included when the requesting user is authenticated. If viewing as a guest, these fields won't be present.

2. **Privacy Enforcement**: The backend automatically handles privacy. The app should check `canViewPosts` before displaying posts.

3. **Self-Profile**: When viewing your own profile, relationship metadata is not included (no need to know if you follow yourself).

4. **Performance**: Relationship checks are optimized with database queries. Search results include relationship status for all users in a single request.
