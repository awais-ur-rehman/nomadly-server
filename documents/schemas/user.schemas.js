"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = void 0;
exports.userSchemas = {
    UserProfile: {
        type: "object",
        properties: {
            name: { type: "string", example: "John Doe" },
            age: { type: "number", example: 30 },
            gender: { type: "string", example: "male" },
            photo_url: { type: "string", example: "https://cloudinary.com/image.jpg" },
            hobbies: {
                type: "array",
                items: { type: "string" },
                example: ["Hiking", "Solar", "Photography"],
            },
            intent: {
                type: "string",
                enum: ["friends", "dating", "both"],
                example: "friends",
            },
            bio: { type: "string", example: "Digital nomad exploring the world" },
        },
    },
    RigInfo: {
        type: "object",
        properties: {
            type: {
                type: "string",
                enum: ["sprinter", "skoolie", "suv", "truck_camper"],
                example: "sprinter",
            },
            crew_type: {
                type: "string",
                enum: ["solo", "couple", "with_pets"],
                example: "solo",
            },
            pet_friendly: { type: "boolean", example: false },
        },
    },
    BuilderProfile: {
        type: "object",
        properties: {
            specialty_tags: {
                type: "array",
                items: { type: "string" },
                example: ["Electrical", "Plumbing", "Solar"],
            },
            hourly_rate: { type: "number", example: 50 },
            availability_status: {
                type: "string",
                enum: ["available", "busy"],
                example: "available",
            },
            bio: { type: "string", example: "Expert van builder with 10 years experience" },
        },
    },
    TravelRoute: {
        type: "object",
        properties: {
            origin: {
                type: "object",
                properties: {
                    lat: { type: "number", example: 37.7749 },
                    lng: { type: "number", example: -122.4194 },
                },
            },
            destination: {
                type: "object",
                properties: {
                    lat: { type: "number", example: 34.0522 },
                    lng: { type: "number", example: -118.2437 },
                },
            },
            start_date: { type: "string", format: "date-time", example: "2024-06-01T00:00:00Z" },
            duration_days: { type: "number", example: 30 },
        },
    },
    UpdateProfileRequest: {
        type: "object",
        properties: {
            profile: { $ref: "#/components/schemas/UserProfile" },
            rig: { $ref: "#/components/schemas/RigInfo" },
            is_builder: { type: "boolean", example: false },
            builder_profile: { $ref: "#/components/schemas/BuilderProfile" },
        },
    },
    CompleteProfileRequest: {
        type: "object",
        description: "Complete profile with additional details. Most fields are optional since basic info is collected during registration.",
        properties: {
            profile: {
                type: "object",
                description: "Profile updates (name, age, gender already collected during registration)",
                properties: {
                    hobbies: {
                        type: "array",
                        items: { type: "string" },
                        example: ["Hiking", "Solar", "Photography"],
                        description: "User hobbies/interests",
                    },
                    intent: {
                        type: "string",
                        enum: ["friends", "dating", "both"],
                        example: "friends",
                        description: "What user is looking for",
                    },
                    bio: {
                        type: "string",
                        example: "Digital nomad exploring the world",
                        description: "User bio",
                    },
                    photo_url: {
                        type: "string",
                        example: "https://cloudinary.com/image.jpg",
                        description: "Profile photo URL",
                    },
                },
            },
            rig: {
                type: "object",
                description: "Vehicle/rig information",
                properties: {
                    type: {
                        type: "string",
                        enum: ["sprinter", "skoolie", "suv", "truck_camper"],
                        example: "sprinter",
                    },
                    crew_type: {
                        type: "string",
                        enum: ["solo", "couple", "with_pets"],
                        example: "solo",
                    },
                    pet_friendly: {
                        type: "boolean",
                        example: false,
                    },
                },
            },
        },
    },
    UpdateRouteRequest: {
        type: "object",
        required: ["origin", "destination", "start_date", "duration_days"],
        properties: {
            origin: {
                type: "object",
                required: ["lat", "lng"],
                properties: {
                    lat: { type: "number", example: 37.7749 },
                    lng: { type: "number", example: -122.4194 },
                },
            },
            destination: {
                type: "object",
                required: ["lat", "lng"],
                properties: {
                    lat: { type: "number", example: 34.0522 },
                    lng: { type: "number", example: -118.2437 },
                },
            },
            start_date: { type: "string", format: "date-time", example: "2024-06-01T00:00:00Z" },
            duration_days: { type: "number", example: 30 },
        },
    },
    UserResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            data: {
                type: "object",
                properties: {
                    _id: { type: "string", example: "507f1f77bcf86cd799439011" },
                    email: { type: "string", example: "user@example.com" },
                    profile: { $ref: "#/components/schemas/UserProfile" },
                    rig: { $ref: "#/components/schemas/RigInfo" },
                    travel_route: { $ref: "#/components/schemas/TravelRoute" },
                    is_builder: { type: "boolean", example: false },
                    builder_profile: { $ref: "#/components/schemas/BuilderProfile" },
                    nomad_id: {
                        type: "object",
                        properties: {
                            verified: { type: "boolean", example: true },
                            member_since: { type: "string", format: "date-time" },
                            vouch_count: { type: "number", example: 5 },
                        },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=user.schemas.js.map