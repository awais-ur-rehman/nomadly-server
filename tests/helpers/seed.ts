/**
 * Seed script for generating test data in the database
 *
 * Usage:
 *   npm run seed          - Create test data
 *   npm run seed:clear    - Clean up test data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../../src/modules/users/models/user.model";
import { Post } from "../../src/modules/feed/models/post.model";
import { Story } from "../../src/modules/stories/models/story.model";
import { Activity } from "../../src/modules/activities/models/activity.model";
import { Follow } from "../../src/modules/users/models/follow.model";
import { Conversation } from "../../src/modules/chat/models/conversation.model";
import { Message } from "../../src/modules/chat/models/message.model";
import { InviteCode, generateInviteCode } from "../../src/modules/invite/models/invite-code.model";
import { Block } from "../../src/modules/safety/models/block.model";
import { Report } from "../../src/modules/safety/models/report.model";
import { Match } from "../../src/modules/matching/models/match.model";

dotenv.config();

const SEED_PREFIX = "seed_";

// Helper to create verification objects at different levels
function createVerification(level: number): any {
    const now = new Date();
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const badges = ["none", "basic", "trusted", "verified", "super_verified", "nomad_elite"];

    return {
        email: {
            status: level >= 1 ? "verified" : "none",
            verified_at: level >= 1 ? pastDate : undefined,
        },
        phone: {
            status: level >= 2 ? "verified" : "none",
            number: level >= 2 ? "+1555123" + Math.floor(Math.random() * 10000).toString().padStart(4, '0') : undefined,
            verified_at: level >= 2 ? pastDate : undefined,
        },
        photo: {
            status: level >= 3 ? "verified" : "none",
            selfie_url: level >= 3 ? `https://i.pravatar.cc/300?u=selfie_${Date.now()}` : undefined,
            submitted_at: level >= 3 ? pastDate : undefined,
            verified_at: level >= 3 ? pastDate : undefined,
        },
        id_document: {
            status: level >= 5 ? "verified" : (level >= 4 ? "pending" : "none"),
            document_url: level >= 4 ? `https://example.com/docs/id_${Date.now()}.jpg` : undefined,
            document_type: level >= 4 ? "drivers_license" : undefined,
            submitted_at: level >= 4 ? pastDate : undefined,
            verified_at: level >= 5 ? pastDate : undefined,
        },
        community: {
            status: level >= 4 ? "verified" : "none",
            vouch_count: level >= 4 ? 3 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 2),
            verified_at: level >= 4 ? pastDate : undefined,
        },
        level: level,
        badge: badges[Math.min(level, 5)] as any,
    };
}

// Sample test users with varying verification levels
const testUsers = [
    {
        username: `${SEED_PREFIX}john_nomad`,
        email: `${SEED_PREFIX}john@example.com`,
        name: "John Nomad",
        password: "Password123!",
        hobbies: ["Hiking", "Photography", "Solar"],
        intent: "friends" as const,
        bio: "Full-time van lifer exploring the west coast",
        rig_type: "sprinter" as const,
        verificationLevel: 4, // Super Verified
        matching_profile: {
            intent: "friends",
            preferences: { gender_interest: ["all"], min_age: 18, max_age: 50, max_distance_km: 100 },
            is_discoverable: true
        }
    },
    {
        username: `${SEED_PREFIX}jane_explorer`,
        email: `${SEED_PREFIX}jane@example.com`,
        name: "Jane Explorer",
        password: "Password123!",
        hobbies: ["Yoga", "Cooking", "Stargazing"],
        intent: "both" as const,
        bio: "Adventure seeking fitness enthusiast",
        rig_type: "skoolie" as const,
        verificationLevel: 3, // Verified
        matching_profile: {
            intent: "both",
            preferences: { gender_interest: ["all"], min_age: 18, max_age: 50, max_distance_km: 100 },
            is_discoverable: true
        }
    },
    {
        username: `${SEED_PREFIX}mike_builder`,
        email: `${SEED_PREFIX}mike@example.com`,
        name: "Mike Builder",
        password: "Password123!",
        hobbies: ["Woodworking", "Electrical", "DIY"],
        intent: "friends" as const,
        bio: "Professional van builder with 5 years experience",
        rig_type: "truck_camper" as const,
        is_builder: true,
        specialty_tags: ["Electrical", "Plumbing", "Carpentry"],
        hourly_rate: 75,
        verificationLevel: 5, // Nomad Elite
        matching_profile: {
            intent: "friends",
            preferences: { gender_interest: ["all"], min_age: 25, max_age: 60, max_distance_km: 200 },
            is_discoverable: true
        }
    },
    {
        username: `${SEED_PREFIX}sarah_artist`,
        email: `${SEED_PREFIX}sarah@example.com`,
        name: "Sarah Artist",
        password: "Password123!",
        hobbies: ["Painting", "Music", "Writing"],
        intent: "dating" as const,
        bio: "Digital nomad artist creating from the road",
        rig_type: "suv" as const,
        verificationLevel: 2, // Trusted
        matching_profile: {
            intent: "dating",
            preferences: { gender_interest: ["all"], min_age: 20, max_age: 35, max_distance_km: 50 },
            is_discoverable: true
        }
    },
    {
        username: `${SEED_PREFIX}alex_tech`,
        email: `${SEED_PREFIX}alex@example.com`,
        name: "Alex Tech",
        password: "Password123!",
        hobbies: ["Coding", "Gaming", "Hiking"],
        intent: "friends" as const,
        bio: "Remote software developer living the nomad dream",
        rig_type: "sprinter" as const,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        verificationLevel: 1, // Basic
        matching_profile: {
            intent: "friends",
            preferences: { gender_interest: ["all"], min_age: 18, max_age: 40, max_distance_km: 500 },
            is_discoverable: true
        }
    },
    {
        username: `${SEED_PREFIX}blocked_user`,
        email: `${SEED_PREFIX}blocked@example.com`,
        name: "Blocked User",
        password: "Password123!",
        hobbies: ["Testing"],
        intent: "friends" as const,
        bio: "This user will be blocked for testing",
        rig_type: "suv" as const,
        verificationLevel: 0, // No verification
        matching_profile: {
            intent: "friends",
            preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 100 },
            is_discoverable: true
        }
    },
];

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("  Connected to MongoDB");
}

async function seedUsers(): Promise<string[]> {
    const userIds: string[] = [];
    let inviterUserId: string | undefined;

    for (const userData of testUsers) {
        const passwordHash = await bcrypt.hash(userData.password, 12);

        const user = await User.create({
            username: userData.username,
            email: userData.email,
            password_hash: passwordHash,
            is_private: false,
            profile: {
                name: userData.name,
                age: 25 + Math.floor(Math.random() * 15),
                gender: Math.random() > 0.5 ? "male" : "female",
                photo_url: userData.photo || `https://i.pravatar.cc/150?u=${userData.username}`,
                hobbies: userData.hobbies,
                intent: userData.intent,
                bio: userData.bio,
            },
            rig: {
                type: userData.rig_type,
                crew_type: "solo",
                pet_friendly: Math.random() > 0.5,
            },
            travel_route: {
                origin: {
                    type: "Point",
                    coordinates: [-122.4194 + Math.random() * 10, 37.7749 + Math.random() * 10],
                },
                destination: {
                    type: "Point",
                    coordinates: [-118.2437 + Math.random() * 10, 34.0522 + Math.random() * 10],
                },
                start_date: new Date(),
                duration_days: 30 + Math.floor(Math.random() * 60),
            },
            is_builder: userData.is_builder || false,
            builder_profile: userData.is_builder
                ? {
                    specialty_tags: userData.specialty_tags,
                    hourly_rate: userData.hourly_rate,
                    availability_status: "available",
                    bio: "Expert builder ready to help",
                }
                : undefined,
            nomad_id: {
                verified: (userData.verificationLevel ?? 0) >= 3,
                member_since: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                vouch_count: Math.floor(Math.random() * 10),
            },
            subscription: {
                status: "active",
                plan: Math.random() > 0.5 ? "vantage_pro" : "free",
            },
            verification: createVerification(userData.verificationLevel ?? 0),
            invited_by: inviterUserId,
            invite_count: userData.verificationLevel >= 3 ? 5 : 3, // Higher verified users get more invites
            is_active: true,
            matching_profile: (userData as any).matching_profile || {
                intent: "friends",
                preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 100 },
                is_discoverable: true
            }
        });

        // First user becomes the inviter for subsequent users
        if (!inviterUserId) {
            inviterUserId = user._id.toString();
        }

        userIds.push(user._id.toString());
        console.log(`  Created user: ${userData.username} (Level ${userData.verificationLevel})`);
    }

    // Generate 15 discoverable users for Matching Feature
    const matchingProfiles = [
        { name: "Alice Climber", bio: "Looking for climbing partners", intent: "friends", hobby: "Climbing", level: 3 },
        { name: "Bob Vanlife", bio: "Solo traveler in a Sprinter", intent: "dating", hobby: "Vanlife", level: 2 },
        { name: "Charlie Hiker", bio: "Love long distance trails", intent: "friends", hobby: "Hiking", level: 4 },
        { name: "Diana Yoga", bio: "Teaching yoga on the road", intent: "both", hobby: "Yoga", level: 3 },
        { name: "Evan Surfer", bio: "Chasing waves along the coast", intent: "friends", hobby: "Surfing", level: 2 },
        { name: "Fiona Foodie", bio: "Cooking local ingredients", intent: "dating", hobby: "Cooking", level: 1 },
        { name: "George Guitar", bio: "Campfire songs every night", intent: "friends", hobby: "Music", level: 2 },
        { name: "Hannah Photo", bio: "Capturing the journey", intent: "both", hobby: "Photography", level: 5 },
        { name: "Ian Tech", bio: "Digital nomad setup expert", intent: "friends", hobby: "Tech", level: 3 },
        { name: "Julia Art", bio: "Painting landscapes", intent: "dating", hobby: "Art", level: 2 },
        { name: "Kevin Biker", bio: "Mountain biking trails only", intent: "friends", hobby: "Biking", level: 1 },
        { name: "Luna Star", bio: "Astrophotography enthusiast", intent: "both", hobby: "Stargazing", level: 4 },
        { name: "Max Dog", bio: "Traveling with my husky", intent: "friends", hobby: "Pets", level: 3 },
        { name: "Nina Read", bio: "Books and hammocks", intent: "dating", hobby: "Reading", level: 2 },
        { name: "Oscar Dive", bio: "Scuba diving whenever near ocean", intent: "friends", hobby: "Diving", level: 1 },
    ];

    for (const profile of matchingProfiles) {
        const username = `${SEED_PREFIX}match_${profile.name.split(" ")[0].toLowerCase()}`;
        const email = `${username}@example.com`;
        const passwordHash = await bcrypt.hash("Password123!", 12);

        // Coordinates near Redding, CA (where the test user currently is)
        const lat = 40.3510 + (Math.random() - 0.5) * 0.1; // Within ~10km
        const lng = -122.2375 + (Math.random() - 0.5) * 0.1;

        const user = await User.create({
            username,
            email,
            password_hash: passwordHash,
            is_private: false,
            profile: {
                name: profile.name,
                age: 20 + Math.floor(Math.random() * 15),
                gender: Math.random() > 0.5 ? "male" : "female",
                photo_url: `https://i.pravatar.cc/300?u=${username}`,
                hobbies: [profile.hobby, "Travel", "Nomad"],
                intent: profile.intent as any,
                bio: profile.bio,
            },
            rig: {
                type: "sprinter",
                crew_type: "solo",
                pet_friendly: true,
            },
            travel_route: {
                origin: { type: "Point", coordinates: [lng, lat] },
                destination: { type: "Point", coordinates: [lng + 1, lat + 1] },
                start_date: new Date(),
                duration_days: 90,
            },
            is_builder: false,
            nomad_id: { verified: profile.level >= 3, member_since: new Date(), vouch_count: profile.level },
            subscription: { status: "active", plan: "free" },
            verification: createVerification(profile.level),
            invited_by: inviterUserId,
            invite_count: 3,
            is_active: true,
            matching_profile: {
                intent: profile.intent as any,
                preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 100 },
                is_discoverable: true
            }
        });

        userIds.push(user._id.toString());
        console.log(`  Created matching user: ${profile.name} (Level ${profile.level})`);
    }

    return userIds;
}

async function seedInviteCodes(userIds: string[]) {
    // Create invite codes for the first few users
    const codes = [];

    for (let i = 0; i < Math.min(3, userIds.length); i++) {
        // Create 2-3 codes per user
        const numCodes = 2 + Math.floor(Math.random() * 2);

        for (let j = 0; j < numCodes; j++) {
            const isUsed = Math.random() > 0.5;
            const code = await InviteCode.create({
                code: generateInviteCode(),
                created_by: userIds[i],
                used_by: isUsed && userIds[i + 1] ? [userIds[i + 1]] : [],
                used_at: isUsed ? new Date() : undefined,
                max_uses: 1,
                use_count: isUsed ? 1 : 0,
                is_active: !isUsed,
            });
            codes.push(code);
        }
    }

    // Create some shareable multi-use codes
    const multiUseCode = await InviteCode.create({
        code: "NOMAD-WELCOME",
        created_by: userIds[0],
        used_by: [],
        max_uses: 100,
        use_count: 5,
        is_active: true,
    });
    codes.push(multiUseCode);

    console.log(`  Created ${codes.length} invite codes (including NOMAD-WELCOME)`);
    return codes;
}

async function seedPosts(userIds: string[]) {
    const samplePhotos = [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/girl-urban-view.jpg",
    ];

    const regularCaptions = [
        "Beautiful sunset from our campsite!",
        "Found this amazing spot today!",
        "Van life is the best life",
        "Another day, another adventure!",
        "Coffee with a view",
    ];

    const tripCaptions = [
        "Starting our journey from Denver to Moab! Join us along the way.",
        "Road trip alert: SF to Portland over the next 2 weeks!",
        "Heading down the Pacific Coast Highway - who else is around?",
    ];

    const activityCaptions = [
        "Hosting a sunset yoga session at Joshua Tree tomorrow at 5pm!",
        "Campfire jam session tonight at mile marker 42!",
        "Group hike to the waterfall - meeting at 8am at the trailhead.",
    ];

    for (const userId of userIds.slice(0, 8)) {
        const numPosts = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numPosts; i++) {
            await Post.create({
                author_id: userId,
                photos: [samplePhotos[Math.floor(Math.random() * samplePhotos.length)]],
                caption: regularCaptions[Math.floor(Math.random() * regularCaptions.length)],
                tags: ["vanlife", "nomad", "adventure"].slice(0, Math.floor(Math.random() * 3) + 1),
                likes: [],
                comments_count: 0,
            });
        }
    }

    // Create some trip-type posts (using tags to identify type since model doesn't have type field)
    for (let i = 0; i < 3; i++) {
        await Post.create({
            author_id: userIds[i],
            photos: [samplePhotos[Math.floor(Math.random() * samplePhotos.length)]],
            caption: tripCaptions[i],
            tags: ["trip", "travel", "roadtrip"],
            likes: [],
            comments_count: 0,
        });
    }

    // Create some activity-type posts
    for (let i = 0; i < 3; i++) {
        await Post.create({
            author_id: userIds[i + 3],
            photos: [samplePhotos[Math.floor(Math.random() * samplePhotos.length)]],
            caption: activityCaptions[i],
            tags: ["activity", "meetup", "event"],
            likes: [],
            comments_count: 0,
        });
    }

    console.log("  Created sample posts (regular, trip, and activity types)");
}

async function seedStories(userIds: string[]) {
    const sampleAssets = [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
    ];

    for (const userId of userIds.slice(0, 5)) {
        await Story.create({
            author_id: userId,
            asset_url: sampleAssets[Math.floor(Math.random() * sampleAssets.length)],
            asset_type: "image",
            views: [],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    }

    console.log("  Created sample stories");
}

async function seedActivities(userIds: string[]) {
    const activityTypes = ["hike", "surf", "yoga", "meal", "social", "cowork", "other"];
    const activityDescriptions = [
        "Join us for a morning hike to the summit!",
        "Catching waves at sunrise - all levels welcome",
        "Beach yoga session to start the day right",
        "Potluck dinner at our campsite - bring a dish to share!",
        "Campfire hangout with acoustic music",
        "Co-working session at the local coffee shop with reliable wifi",
        "Stargazing night - bringing my telescope!",
    ];

    for (let i = 0; i < Math.min(5, userIds.length); i++) {
        await Activity.create({
            host_id: userIds[i],
            title: `${activityTypes[i % activityTypes.length].charAt(0).toUpperCase() + activityTypes[i % activityTypes.length].slice(1)} Meetup`,
            activity_type: activityTypes[i % activityTypes.length],
            location: {
                type: "Point",
                coordinates: [-122.4194 + Math.random() * 10, 37.7749 + Math.random() * 10],
            },
            max_participants: 5 + Math.floor(Math.random() * 10),
            current_participants: [],
            pending_requests: [],
            event_time: new Date(Date.now() + (1 + Math.random() * 7) * 24 * 60 * 60 * 1000),
            description: activityDescriptions[i % activityDescriptions.length],
            verified_only: Math.random() > 0.7,
            status: "open",
        });
    }

    console.log("  Created sample activities/beacons");
}

async function seedFollows(userIds: string[]) {
    // Explicitly make the first two users (John and Jane) follow each other
    if (userIds.length >= 2) {
        await Follow.create({ follower_id: userIds[0], following_id: userIds[1], status: "active" });
        await Follow.create({ follower_id: userIds[1], following_id: userIds[0], status: "active" });
    }

    for (const followerId of userIds.slice(0, 10)) {
        // Follow 1-2 random other users
        const others = userIds.filter((id) => id !== followerId);
        const targets = others.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);

        for (const followingId of targets) {
            const exists = await Follow.findOne({ follower_id: followerId, following_id: followingId });
            if (!exists) {
                await Follow.create({
                    follower_id: followerId,
                    following_id: followingId,
                    status: "active",
                });
            }
        }
    }
    console.log("  Created sample social connections (follows)");
}

async function seedConversations(userIds: string[]) {
    const convos = [];

    // Ensure John and Jane have a conversation
    if (userIds.length >= 2) {
        const convo = await Conversation.create({
            participants: [userIds[0], userIds[1]],
            type: "direct",
            last_message: "Hey Jane! How is the nomad life going?",
            last_message_time: new Date(),
        });
        convos.push(convo);
    }

    // Create a few more conversations
    for (let i = 1; i < Math.min(4, userIds.length - 1); i++) {
        const u1 = userIds[i];
        const u2 = userIds[(i + 1) % userIds.length];

        const convo = await Conversation.create({
            participants: [u1, u2],
            type: "direct",
            last_message: "Hey! Just saw your post about Utah.",
            last_message_time: new Date(),
        });
        convos.push(convo);
    }
    console.log("  Created sample conversations");
    return convos;
}

async function seedMessages(conversations: any[]) {
    const sampleTexts = [
        "Hey! How is the nomad life going?",
        "It is amazing! Currently in Utah.",
        "Wow, can't wait to visit there.",
        "The sunsets are incredible.",
        "Do you have a solar setup yet?"
    ];

    for (const convo of conversations) {
        for (let i = 0; i < sampleTexts.length; i++) {
            await Message.create({
                conversation_id: convo._id,
                sender_id: convo.participants[i % 2],
                message: sampleTexts[i],
                message_type: "text",
                read_by: [convo.participants[i % 2]],
            });
        }
    }
    console.log("  Created sample messages");
}

async function seedMatches(userIds: string[], conversations: any[]) {
    // Create matches between users who have conversations
    // The Match model has a unique index on users, so we need to avoid duplicates
    const matches = [];
    const matchedPairs = new Set<string>();

    for (const convo of conversations) {
        if (convo.participants.length < 2) continue;

        // Create a sorted key to check for duplicates
        const sortedIds = [convo.participants[0].toString(), convo.participants[1].toString()].sort();
        const pairKey = sortedIds.join('-');

        if (matchedPairs.has(pairKey)) continue;
        matchedPairs.add(pairKey);

        try {
            const match = await Match.create({
                users: convo.participants,
                initiated_by: convo.participants[0],
                conversation_id: convo._id,
            });
            matches.push(match);
        } catch (err: any) {
            // Skip if duplicate key error
            if (err.code !== 11000) throw err;
        }
    }

    console.log(`  Created ${matches.length} matches`);
    return matches;
}

async function seedSafetyRecords(userIds: string[]) {
    // Find the blocked user (last in testUsers array)
    const blockedUserIndex = testUsers.findIndex(u => u.username.includes('blocked_user'));
    const blockedUserId = userIds[blockedUserIndex >= 0 ? blockedUserIndex : userIds.length - 1];

    // Create some block records
    if (userIds.length >= 2) {
        // First user blocks the "blocked_user"
        await Block.create({
            blocker_id: userIds[0],
            blocked_id: blockedUserId,
        });

        // Second user also blocks them
        await Block.create({
            blocker_id: userIds[1],
            blocked_id: blockedUserId,
        });
    }

    // Create some report records
    const reportReasons = ["harassment", "fake_profile", "spam", "inappropriate_content"];

    if (blockedUserId && userIds[0]) {
        await Report.create({
            reporter_id: userIds[0],
            reported_id: blockedUserId,
            reason: reportReasons[0],
            description: "Test report for seed data - harassing messages",
            status: "pending",
        });
    }

    if (userIds.length >= 3 && blockedUserId) {
        await Report.create({
            reporter_id: userIds[2],
            reported_id: blockedUserId,
            reason: reportReasons[1],
            description: "Test report for seed data - suspicious profile",
            status: "reviewed",
        });
    }

    console.log("  Created sample blocks and reports");
}

async function seed() {
    try {
        await connectDB();

        console.log("\n Seeding database...\n");

        // First clean up existing seed data
        await clearSeedData();

        console.log("\n Creating test users...");
        const userIds = await seedUsers();

        console.log("\n Creating invite codes...");
        await seedInviteCodes(userIds);

        console.log("\n Creating test posts...");
        await seedPosts(userIds);

        console.log("\n Creating test stories...");
        await seedStories(userIds);

        console.log("\n Creating test activities/beacons...");
        await seedActivities(userIds);

        console.log("\n Creating test follows...");
        await seedFollows(userIds);

        console.log("\n Creating test chats...");
        const conversations = await seedConversations(userIds);
        await seedMessages(conversations);

        console.log("\n Creating test matches...");
        await seedMatches(userIds, conversations);

        console.log("\n Creating safety records (blocks/reports)...");
        await seedSafetyRecords(userIds);

        console.log("\n Seeding complete!\n");
        console.log("Test users created:");
        testUsers.forEach((u) => {
            console.log(`  - Username: ${u.username}`);
            console.log(`    Email: ${u.email}`);
            console.log(`    Password: ${u.password}`);
            console.log(`    Verification Level: ${u.verificationLevel}\n`);
        });
        console.log("\nSpecial codes:");
        console.log("  - NOMAD-WELCOME (multi-use invite code for testing registration)\n");
    } catch (error) {
        console.error(" Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

async function clearSeedData() {
    console.log(" Cleaning up ALL existing data...");

    // Delete ALL data from these collections to ensure a clean slate
    await Post.deleteMany({});
    await Story.deleteMany({});
    await Activity.deleteMany({});
    await Follow.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await InviteCode.deleteMany({});
    await Block.deleteMany({});
    await Report.deleteMany({});
    await Match.deleteMany({});
    await User.deleteMany({});

    console.log("  Cleaned up all data");
}

async function clear() {
    try {
        await connectDB();
        console.log("\n Clearing seed data...");
        await clearSeedData();
        console.log("\n Clear complete!\n");
    } catch (error) {
        console.error(" Clear failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

// Run based on command line argument
const command = process.argv[2];
if (command === "clear") {
    clear();
} else {
    seed();
}
