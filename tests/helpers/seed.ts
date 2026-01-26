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

dotenv.config();

const SEED_PREFIX = "seed_";

// Sample test users
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
        matching_profile: {
            intent: "friends",
            preferences: { gender_interest: ["all"], min_age: 18, max_age: 40, max_distance_km: 500 },
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
    console.log("✅ Connected to MongoDB");
}

async function seedUsers(): Promise<string[]> {
    const userIds: string[] = [];

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
                verified: Math.random() > 0.3,
                member_since: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                vouch_count: Math.floor(Math.random() * 10),
            },
            subscription: {
                status: "active",
                plan: Math.random() > 0.5 ? "vantage_pro" : "free",
            },
            is_active: true,
            matching_profile: (userData as any).matching_profile || {
                intent: "friends",
                preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 100 },
                is_discoverable: true
            }
        });

        userIds.push(user._id.toString());
        console.log(`  Created user: ${userData.username}`);
    }

    return userIds;
}

async function seedPosts(userIds: string[]) {
    const samplePhotos = [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/girl-urban-view.jpg",
    ];

    const captions = [
        "Beautiful sunset from our campsite! 🌅",
        "Found this amazing spot today!",
        "Van life is the best life ❤️",
        "Another day, another adventure!",
        "Coffee with a view ☕",
    ];

    for (const userId of userIds) {
        const numPosts = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numPosts; i++) {
            await Post.create({
                author_id: userId,
                photos: [samplePhotos[Math.floor(Math.random() * samplePhotos.length)]],
                caption: captions[Math.floor(Math.random() * captions.length)],
                tags: ["vanlife", "nomad", "adventure"].slice(0, Math.floor(Math.random() * 3) + 1),
                likes: [],
                comments_count: 0,
            });
        }
    }

    console.log("  Created sample posts");
}

async function seedStories(userIds: string[]) {
    const sampleAssets = [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
    ];

    for (const userId of userIds.slice(0, 3)) {
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
    const activityTypes = ["campfire", "hiking", "yoga", "potluck", "stargazing"];

    for (const userId of userIds.slice(0, 3)) {
        await Activity.create({
            host_id: userId,
            activity_type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
            location: {
                type: "Point",
                coordinates: [-122.4194 + Math.random() * 10, 37.7749 + Math.random() * 10],
            },
            max_participants: 5 + Math.floor(Math.random() * 10),
            current_participants: [],
            pending_requests: [],
            event_time: new Date(Date.now() + (1 + Math.random() * 7) * 24 * 60 * 60 * 1000),
            description: "Join us for a great time!",
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

    for (const followerId of userIds) {
        // Follow 1-2 random other users
        const others = userIds.filter((id) => id !== followerId);
        const targets = others.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);

        for (const followingId of targets) {
            // Avoid duplicate with the explicit follow above
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
    // Ensure John and Jane have a conversation
    const convos = [];
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
    for (let i = 1; i < 3; i++) {
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

async function seed() {
    try {
        await connectDB();

        console.log("\n🌱 Seeding database...\n");

        // First clean up existing seed data
        await clearSeedData();

        console.log("\n📝 Creating test users...");
        const userIds = await seedUsers();

        console.log("\n📸 Creating test posts...");
        await seedPosts(userIds);

        console.log("\n📖 Creating test stories...");
        await seedStories(userIds);

        console.log("\n🔥 Creating test activities/beacons...");
        await seedActivities(userIds);

        console.log("\n🤝 Creating test follows...");
        await seedFollows(userIds);

        console.log("\n💬 Creating test chats...");
        const conversations = await seedConversations(userIds);
        await seedMessages(conversations);

        console.log("\n✅ Seeding complete!\n");
        console.log("Test users created:");
        testUsers.forEach((u) => {
            console.log(`  - Username: ${u.username}`);
            console.log(`    Email: ${u.email}`);
            console.log(`    Password: ${u.password}\n`);
        });
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

async function clearSeedData() {
    console.log("🧹 Cleaning up ALL existing data...");

    // Delete ALL data from these collections to ensure a clean slate
    await Post.deleteMany({});
    await Story.deleteMany({});
    await Activity.deleteMany({});
    await Follow.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({});

    console.log("  Cleaned up all data");
}

async function clear() {
    try {
        await connectDB();
        console.log("\n🧹 Clearing seed data...");
        await clearSeedData();
        console.log("\n✅ Clear complete!\n");
    } catch (error) {
        console.error("❌ Clear failed:", error);
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
