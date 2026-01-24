# Registration & Profile Completion Flow

## Updated Registration Flow

### Step 1: Registration (`POST /api/auth/register`)

**Required Fields:**
- `email` (string, email format)
- `password` (string, min 8 characters)
- `name` (string, min 1 character)

**Optional Fields:**
- `phone` (string)
- `age` (number)
- `gender` (string)

**Example Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "age": 30,
  "gender": "male"
}
```

**Response:**
- Creates user account with basic information
- Sends OTP to email
- Returns `userId` and `email` (no JWT token yet)

### Step 2: Verify OTP (`POST /api/auth/verify-otp`)

**Required Fields:**
- `email` (string)
- `code` (string, 6 digits)

**Response:**
- Activates account
- Returns JWT tokens (`token` + `refreshToken`)
- User can now access protected endpoints

### Step 3: Complete Profile (`POST /api/users/complete-profile`) - Optional

**All fields are optional** since basic info is already collected during registration.

**Optional Fields:**
- `profile.hobbies` (array of strings)
- `profile.intent` ("friends" | "dating" | "both")
- `profile.bio` (string)
- `profile.photo_url` (string)
- `rig.type` ("sprinter" | "skoolie" | "suv" | "truck_camper")
- `rig.crew_type` ("solo" | "couple" | "with_pets")
- `rig.pet_friendly` (boolean)

**Example Request:**
```json
{
  "profile": {
    "hobbies": ["Hiking", "Solar", "Photography"],
    "intent": "friends",
    "bio": "Digital nomad exploring the world",
    "photo_url": "https://cloudinary.com/image.jpg"
  },
  "rig": {
    "type": "sprinter",
    "crew_type": "solo",
    "pet_friendly": false
  }
}
```

## Benefits

1. **Better UX**: Collect essential info upfront during registration
2. **Faster Onboarding**: Users can start using the app after OTP verification
3. **Flexible Profile**: Profile completion is optional and can be done later
4. **Less Friction**: Users don't need to fill everything at once

## Data Collected

### During Registration:
- ✅ Email
- ✅ Password
- ✅ Name
- ✅ Phone (optional)
- ✅ Age (optional)
- ✅ Gender (optional)

### During Profile Completion (Optional):
- Hobbies
- Intent (friends/dating/both)
- Bio
- Photo URL
- Rig type
- Crew type
- Pet friendly status

## Mobile App Integration

For your mobile app:

1. **Registration Screen**: Collect email, password, name, phone (optional), age (optional), gender (optional)
2. **OTP Verification Screen**: Enter 6-digit code
3. **Home/Dashboard**: User can start using the app
4. **Profile Completion Screen**: Optional screen to add hobbies, rig info, bio, photo (can be accessed from settings later)
