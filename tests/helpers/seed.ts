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

// --- HELPERS ---

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


// --- CURATED DATA ---

const usersData = [
    // 1. MAIN TEST USER (You)
    {
        username: `${SEED_PREFIX}john_nomad`,
        email: `${SEED_PREFIX}john@example.com`,
        name: "John Nomad",
        password: "Password123!",
        bio: "Exploring the PNW in my Sprinter. Always looking for good coffee and better climbing spots.",
        hobbies: ["Climbing", "Coffee", "Photography"],
        intent: "friends" as const,
        rig_type: "sprinter" as const,
        coordinates: [-122.391675, 40.586540], // Redding, CA
        verificationLevel: 4,
        is_builder: false
    },
    // 2. NEARBY USER (Redding) - Potential Match
    {
        username: `${SEED_PREFIX}sarah_skoolie`,
        email: `${SEED_PREFIX}sarah@example.com`,
        name: "Sarah Explorer",
        password: "Password123!",
        bio: "Converted a 2004 school bus into a tiny home. Yoga teacher and freelance writer.",
        hobbies: ["Yoga", "Writing", "Cooking"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        coordinates: [-122.395000, 40.588000], // Nearby Redding
        verificationLevel: 3,
        is_builder: false
    },
    // 3. NEARBY USER (Redding) - Builder/Expert
    {
        username: `${SEED_PREFIX}mike_mechanic`,
        email: `${SEED_PREFIX}mike@example.com`,
        name: "Mike Fixit",
        password: "Password123!",
        bio: "Mobile mechanic specializing in diesel engines. I can help with solar installs too!",
        hobbies: ["Mechanics", "Offroading", "BBQ"],
        intent: "friends" as const,
        rig_type: "truck_camper" as const,
        coordinates: [-122.380000, 40.580000], // Nearby Redding
        verificationLevel: 5,
        is_builder: true,
        specialty_tags: ["Diesel", "Solar", "Electrical"],
        hourly_rate: 85
    },
    // 4. DESTINATION USER (Joshua Tree)
    {
        username: `${SEED_PREFIX}luna_star`,
        email: `${SEED_PREFIX}luna@example.com`,
        name: "Luna Sky",
        password: "Password123!",
        bio: "Chasing dark skies for astrophotography. Currently parked in JTree.",
        hobbies: ["Stargazing", "Photography", "Meditation"],
        intent: "both" as const,
        rig_type: "suv" as const,
        coordinates: [-116.313066, 34.134728], // Joshua Tree
        verificationLevel: 2,
        is_builder: false
    },
    // 5. DESTINATION USER (Baja)
    {
        username: `${SEED_PREFIX}alex_surf`,
        email: `${SEED_PREFIX}alex@example.com`,
        name: "Alex Waves",
        password: "Password123!",
        bio: "Working remotely from the beach in Baja. Starlink is life.",
        hobbies: ["Surfing", "Coding", "Tacos"],
        intent: "dating" as const,
        rig_type: "sprinter" as const,
        coordinates: [-110.226500, 23.450000], // Todo Santos, Baja
        verificationLevel: 3,
        is_builder: false
    },
    // 6. FAMILY (Redding)
    {
        username: `${SEED_PREFIX}nomad_family`,
        email: `${SEED_PREFIX}fam@example.com`,
        name: "The Wandering 4",
        password: "Password123!",
        bio: "Family of 4 roadschooling across America. Love meeting other families!",
        hobbies: ["Hiking", "Education", "Board Games"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        coordinates: [-122.400000, 40.590000], // Redding
        verificationLevel: 4,
        is_builder: false
    },
    // 7. DEVELOPER (SF)
    {
        username: `${SEED_PREFIX}dev_dave`,
        email: `${SEED_PREFIX}dave@example.com`,
        name: "Dave Coder",
        password: "Password123!",
        bio: "Building apps from the road. Currently in the Bay Area for a conference.",
        hobbies: ["Tech", "Gaming", "Coffee"],
        intent: "friends" as const,
        rig_type: "suv" as const,
        coordinates: [-122.419416, 37.774929], // SF
        verificationLevel: 1,
        is_builder: false
    }
];

const generatedProfiles = [
    { name: "Emma Hiker", hobby: "Hiking", type: "sprinter" },
    { name: "Liam Climber", hobby: "Climbing", type: "sprinter" },
    { name: "Olivia Artist", hobby: "Art", type: "skoolie" },
    { name: "Noah Music", hobby: "Music", type: "skoolie" },
    { name: "Ava Yoga", hobby: "Yoga", type: "sprinter" },
    { name: "William Cook", hobby: "Cooking", type: "truck_camper" },
    { name: "Sophia Read", hobby: "Reading", type: "suv" },
    { name: "James Bike", hobby: "Biking", type: "sprinter" },
    { name: "Isabella Photo", hobby: "Photography", type: "sprinter" },
    { name: "Benjamin Code", hobby: "Coding", type: "skoolie" }
];


// --- SEED FUNCTIONS ---

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(mongoUri);
    console.log("  Connected to MongoDB");
}

async function seedUsers(): Promise<string[]> {
    const userIds: string[] = [];
    let inviterUserId: string | undefined;

    // 1. Create Curated Users
    for (const data of usersData) {
        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await User.create({
            username: data.username,
            email: data.email,
            password_hash: passwordHash,
            is_private: false,
            profile: {
                name: data.name,
                age: 24 + Math.floor(Math.random() * 15),
                gender: Math.random() > 0.5 ? "male" : "female",
                photo_url: `https://i.pravatar.cc/300?u=${data.username}`,
                hobbies: data.hobbies,
                intent: data.intent,
                bio: data.bio,
            },
            rig: {
                type: data.rig_type,
                crew_type: "solo",
                pet_friendly: Math.random() > 0.5,
            },
            travel_route: {
                current_location: {
                    type: "Point",
                    coordinates: data.coordinates,
                },
                // Add a forward route for some
                origin: { type: "Point", coordinates: data.coordinates },
                destination: {
                    type: "Point",
                    coordinates: [data.coordinates[0] + 2, data.coordinates[1] - 2]
                },
                start_date: new Date(),
                duration_days: 30,
            },
            is_builder: data.is_builder,
            builder_profile: data.is_builder ? {
                specialty_tags: (data as any).specialty_tags,
                hourly_rate: (data as any).hourly_rate,
                availability_status: "available",
                bio: data.bio
            } : undefined,
            nomad_id: {
                verified: data.verificationLevel >= 3,
                member_since: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                vouch_count: data.verificationLevel * 2,
            },
            subscription: {
                status: "active",
                plan: data.verificationLevel >= 4 ? "vantage_pro" : "free",
            },
            verification: createVerification(data.verificationLevel),
            invited_by: inviterUserId,
            invite_count: 5,
            is_active: true,
            matching_profile: {
                intent: data.intent,
                preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 500 },
                is_discoverable: true
            }
        });

        if (!inviterUserId) inviterUserId = user._id.toString();
        userIds.push(user._id.toString());
        console.log(`  Created curated user: ${data.name}`);
    }

    // 2. Create Generated Users (Cluster mostly around Redding for matching density)
    const baseLat = 40.58;
    const baseLng = -122.39;

    for (const [index, p] of generatedProfiles.entries()) {
        const username = `${SEED_PREFIX}gen_${index}`;
        const passwordHash = await bcrypt.hash("Password123!", 12);

        // Random spread within ~20km of Redding
        const lat = baseLat + (Math.random() - 0.5) * 0.2;
        const lng = baseLng + (Math.random() - 0.5) * 0.2;

        const user = await User.create({
            username: username,
            email: `${username}@example.com`,
            password_hash: passwordHash,
            is_private: false,
            profile: {
                name: p.name,
                age: 20 + Math.floor(Math.random() * 20),
                gender: Math.random() > 0.5 ? "male" : "female",
                photo_url: `https://i.pravatar.cc/300?u=${username}`,
                hobbies: [p.hobby, "Travel"],
                intent: index % 3 === 0 ? "dating" : "friends",
                bio: `Just a nomad loving ${p.hobby} and the open road.`,
            },
            rig: {
                type: p.type,
                crew_type: "solo",
                pet_friendly: Math.random() > 0.5,
            },
            travel_route: {
                current_location: { type: "Point", coordinates: [lng, lat] },
                origin: { type: "Point", coordinates: [lng, lat] },
                destination: { type: "Point", coordinates: [lng + 1, lat - 1] },
                start_date: new Date(),
                duration_days: 60,
            },
            is_builder: false,
            nomad_id: { verified: false, member_since: new Date(), vouch_count: 1 },
            subscription: { status: "active", plan: "free" },
            verification: createVerification(1),
            invited_by: inviterUserId,
            invite_count: 0,
            is_active: true,
            matching_profile: {
                intent: index % 3 === 0 ? "dating" : "friends",
                preferences: { gender_interest: ["all"], min_age: 18, max_age: 100, max_distance_km: 100 },
                is_discoverable: true
            }
        });
        userIds.push(user._id.toString());
    }

    console.log(`  Created ${generatedProfiles.length} generated users`);
    return userIds;
}

async function seedInviteCodes(userIds: string[]) {
    await InviteCode.create({
        code: "NOMAD-WELCOME",
        created_by: userIds[0],
        max_uses: 999,
        use_count: 0,
        is_active: true,
    });
    console.log("  Created NOMAD-WELCOME invite code");
}

async function seedContent(userIds: string[]) {
    // 1. Posts
    const postConfigs = [
        {
            user: 0, // John
            caption: "Found this incredible dispersed campsite just outside Redding. Total silence. #vanlife #camping",
            photo: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80"
        },
        {
            user: 0,
            caption: "Morning coffee view. Doesn't get better than this.",
            photo: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80"
        },
        {
            user: 1, // Sarah
            caption: "Yoga by the lake. 🧘‍♀️ The skoolie handled the dirt road surprisingly well!",
            photo: "https://images.unsplash.com/photo-1510022079733-8b58aca7c4a9?w=800&q=80"
        },
        {
            user: 2, // Mike
            caption: "Just finished a 400W solar install on a Sprinter. Ready for off-grid living! #solar #vanbuild",
            photo: "https://images.unsplash.com/photo-1525287612733-4cc66c6de8f7?w=800&q=80"
        },
        {
            user: 4, // Alex (Baja)
            caption: "Baja sunsets never disappoint. Tacos + Surf + Work = Dream Life.",
            photo: "https://images.unsplash.com/photo-1542407635-c8bfd7df8831?w=800&q=80"
        }
    ];

    for (const conf of postConfigs) {
        if (userIds[conf.user]) {
            await Post.create({
                author_id: userIds[conf.user],
                photos: [conf.photo],
                caption: conf.caption,
                tags: ["vanlife", "nomadly"],
                likes: [],
                comments_count: 0
            });
        }
    }
    console.log("  Created curated posts");

    // 2. Activities (Beacons)
    const now = new Date();
    const activities = [
        {
            host: 0, // John
            title: "Redding Coffee Meetup",
            type: "social",
            desc: "Let's grab coffee at Theory near the Sundial!",
            lat: 40.584, lng: -122.390,
            time: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        },
        {
            host: 2, // Mike
            title: "Van Build Q&A / Workshop",
            type: "cowork",
            desc: "I'll be working on my rig, stop by if you have electrical questions.",
            lat: 40.582, lng: -122.385,
            time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
    ];

    for (const act of activities) {
        if (userIds[act.host]) {
            await Activity.create({
                host_id: userIds[act.host],
                title: act.title,
                activity_type: act.type,
                description: act.desc,
                location: { type: "Point", coordinates: [act.lng, act.lat] },
                max_participants: 10,
                current_participants: [],
                event_time: act.time,
                status: "open",
                verified_only: false
            });
        }
    }
    console.log("  Created curated activities");
}

async function seedConnections(userIds: string[]) {
    // 1. Follows
    // Everyone follows John
    for (let i = 1; i < 5; i++) {
        await Follow.create({ follower_id: userIds[i], following_id: userIds[0], status: "active" });
        await Follow.create({ follower_id: userIds[0], following_id: userIds[i], status: "active" });
    }

    // 2. Chat between John and Sarah
    const john = userIds[0];
    const sarah = userIds[1];

    const convo = await Conversation.create({
        participants: [john, sarah],
        type: "direct",
        last_message: "That sounds awesome, see you there!",
        last_message_time: new Date()
    });

    await Message.create({
        conversation_id: convo._id,
        sender_id: john,
        message: "Hey Sarah! Are you parked near the lake?",
        message_type: "text",
        read_by: [john, sarah]
    });

    await Message.create({
        conversation_id: convo._id,
        sender_id: sarah,
        message: "Yes! It's beautiful. You should come by.",
        message_type: "text",
        read_by: [john, sarah]
    });

    // Create match for them too
    await Match.create({
        users: [john, sarah],
        initiated_by: john,
        conversation_id: convo._id
    });

    console.log("  Created connections (Follows, Chat, Match)");
}

// --- MAIN ---

async function seed() {
    try {
        await connectDB();
        console.log("\n Seeding database (REVAMPED NOMADLY DATA)...\n");

        await clearSeedData();

        const userIds = await seedUsers();
        await seedInviteCodes(userIds);
        await seedContent(userIds);
        await seedConnections(userIds); // Includes follows, chats, matches

        console.log("\n Seeding complete!");
        console.log("  Log in with:");
        console.log("  - Username: seed_john_nomad");
        console.log("  - Password: Password123!");
    } catch (error) {
        console.error(" Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

async function clearSeedData() {
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
    console.log("  Cleaned up existing data");
}

// Run based on command line argument
const command = process.argv[2];

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

if (command === "clear") {
    clear();
} else {
    seed();
}
