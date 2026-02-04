/**
 * Comprehensive Seed Script for Nomadly Database
 * 
 * Seeds ALL modules with INTERCONNECTED test data:
 * - Users (curated + generated) with relationships between them
 * - Posts (authored by various users, with likes from others)
 * - Stories (ephemeral content from active users)
 * - Activities (hosted by users, with participants)
 * - Jobs (posted by users seeking help)
 * - Conversations & Messages (between matched users)
 * - Matches & Swipes (mutual connections)
 * - Follows (social graph)
 * - Consultations & Reviews (builder marketplace)
 * - Vouches (community verification)
 * - Invite Codes (referral system)
 *
 * Usage:
 *   npm run seed          - Create test data
 *   npm run seed:clear    - Clean up test data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// --- MODEL IMPORTS ---
import { User } from "../../src/modules/users/models/user.model";
import { Post } from "../../src/modules/feed/models/post.model";
import { Comment } from "../../src/modules/feed/models/comment.model";
import { Story } from "../../src/modules/stories/models/story.model";
import { Activity } from "../../src/modules/activities/models/activity.model";
import { Follow } from "../../src/modules/users/models/follow.model";
import { Conversation } from "../../src/modules/chat/models/conversation.model";
import { Message } from "../../src/modules/chat/models/message.model";
import { InviteCode, generateInviteCode } from "../../src/modules/invite/models/invite-code.model";
import { Block } from "../../src/modules/safety/models/block.model";
import { Report } from "../../src/modules/safety/models/report.model";
import { Match } from "../../src/modules/matching/models/match.model";
import { Swipe } from "../../src/modules/matching/models/swipe.model";
import { Job } from "../../src/modules/marketplace/models/job.model";
import { Consultation } from "../../src/modules/marketplace/models/consultation.model";
import { Review } from "../../src/modules/marketplace/models/review.model";
import { Vouch } from "../../src/modules/vouching/models/vouch.model";

dotenv.config();

const SEED_PREFIX = "seed_";

// ============================================================================
// HELPERS
// ============================================================================

function createVerification(level: number): any {
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

function futureDate(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function pastDate(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// ============================================================================
// USER DATA - 10 Curated users with clear roles
// ============================================================================

// User Index Reference:
// 0: John Nomad - MAIN USER (You login as this)
// 1: Sarah Explorer - Friend, Yoga teacher, matched with John
// 2: Mike Fixit - Builder (mechanic), reviewed by John
// 3: Luna Sky - Astrophotographer, matched with Sarah
// 4: Alex Waves - Surfer in Baja, has job posted
// 5: Nomad Family - Family account, hosts activities
// 6: Dave Coder - Developer, sent message to John
// 7: Solar Sam - Builder (solar), has consultations
// 8: Diana Designs - Builder (interior), reviewed
// 9: Pete Pixels - Photographer, posted jobs

const usersData = [
    {
        username: `${SEED_PREFIX}john_nomad`,
        email: `${SEED_PREFIX}john@example.com`,
        name: "John Nomad",
        password: "Password123!",
        bio: "Exploring the PNW in my Sprinter. Always looking for good coffee and better climbing spots. 🏔️☕",
        hobbies: ["Climbing", "Coffee", "Photography"],
        intent: "friends" as const,
        rig_type: "sprinter" as const,
        coordinates: [-122.391675, 40.586540],
        verificationLevel: 4,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}sarah_skoolie`,
        email: `${SEED_PREFIX}sarah@example.com`,
        name: "Sarah Explorer",
        password: "Password123!",
        bio: "Converted a 2004 school bus into a tiny home. Yoga teacher and freelance writer. 🚌🧘‍♀️",
        hobbies: ["Yoga", "Writing", "Cooking"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        coordinates: [-122.395000, 40.588000],
        verificationLevel: 3,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}mike_mechanic`,
        email: `${SEED_PREFIX}mike@example.com`,
        name: "Mike Fixit",
        password: "Password123!",
        bio: "Mobile mechanic specializing in diesel engines. Solar installs and electrical work too! 🔧⚡",
        hobbies: ["Mechanics", "Offroading", "BBQ"],
        intent: "friends" as const,
        rig_type: "truck_camper" as const,
        coordinates: [-122.380000, 40.580000],
        verificationLevel: 5,
        is_builder: true,
        specialty_tags: ["Diesel", "Solar", "Electrical"],
        hourly_rate: 85
    },
    {
        username: `${SEED_PREFIX}luna_star`,
        email: `${SEED_PREFIX}luna@example.com`,
        name: "Luna Sky",
        password: "Password123!",
        bio: "Chasing dark skies for astrophotography. Currently parked in JTree. 🌌📷",
        hobbies: ["Stargazing", "Photography", "Meditation"],
        intent: "both" as const,
        rig_type: "suv" as const,
        coordinates: [-116.313066, 34.134728],
        verificationLevel: 2,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}alex_surf`,
        email: `${SEED_PREFIX}alex@example.com`,
        name: "Alex Waves",
        password: "Password123!",
        bio: "Working remotely from the beach in Baja. Starlink is life. 🏄‍♂️💻",
        hobbies: ["Surfing", "Coding", "Tacos"],
        intent: "dating" as const,
        rig_type: "sprinter" as const,
        coordinates: [-110.226500, 23.450000],
        verificationLevel: 3,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}nomad_family`,
        email: `${SEED_PREFIX}fam@example.com`,
        name: "The Wandering 4",
        password: "Password123!",
        bio: "Family of 4 roadschooling across America. Love meeting other families! 👨‍👩‍👧‍👦🚐",
        hobbies: ["Hiking", "Education", "Board Games"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        coordinates: [-122.400000, 40.590000],
        verificationLevel: 4,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}dev_dave`,
        email: `${SEED_PREFIX}dave@example.com`,
        name: "Dave Coder",
        password: "Password123!",
        bio: "Building apps from the road. Currently in the Bay Area for a tech conference. 👨‍💻🚗",
        hobbies: ["Tech", "Gaming", "Coffee"],
        intent: "friends" as const,
        rig_type: "suv" as const,
        coordinates: [-122.419416, 37.774929],
        verificationLevel: 1,
        is_builder: false
    },
    {
        username: `${SEED_PREFIX}solar_sam`,
        email: `${SEED_PREFIX}sam@example.com`,
        name: "Solar Sam",
        password: "Password123!",
        bio: "15 years in solar installations. I'll get your van off-grid ready! ☀️🔋",
        hobbies: ["Solar", "Electronics", "Hiking"],
        intent: "friends" as const,
        rig_type: "sprinter" as const,
        coordinates: [-122.388000, 40.582000],
        verificationLevel: 5,
        is_builder: true,
        specialty_tags: ["Solar", "Battery", "Off-Grid Systems"],
        hourly_rate: 75
    },
    {
        username: `${SEED_PREFIX}design_diana`,
        email: `${SEED_PREFIX}diana@example.com`,
        name: "Diana Designs",
        password: "Password123!",
        bio: "Van interior specialist. Custom cabinetry and layout optimization. ✨🛠️",
        hobbies: ["Design", "Woodworking", "Yoga"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        coordinates: [-122.392000, 40.585000],
        verificationLevel: 4,
        is_builder: true,
        specialty_tags: ["Interior Design", "Cabinetry", "Layout"],
        hourly_rate: 65
    },
    {
        username: `${SEED_PREFIX}photo_pete`,
        email: `${SEED_PREFIX}pete@example.com`,
        name: "Pete Pixels",
        password: "Password123!",
        bio: "Adventure photographer documenting vanlife. Let's shoot together! 📸🏕️",
        hobbies: ["Photography", "Hiking", "Drones"],
        intent: "friends" as const,
        rig_type: "truck_camper" as const,
        coordinates: [-122.385000, 40.590000],
        verificationLevel: 3,
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

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(mongoUri);
    console.log("  ✓ Connected to MongoDB");
}

async function seedUsers(): Promise<string[]> {
    const userIds: string[] = [];
    let inviterUserId: string | undefined;

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
                current_location: { type: "Point", coordinates: data.coordinates },
                origin: { type: "Point", coordinates: data.coordinates },
                destination: { type: "Point", coordinates: [data.coordinates[0] + 2, data.coordinates[1] - 2] },
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
                member_since: pastDate(Math.floor(Math.random() * 365)),
                vouch_count: data.verificationLevel * 2,
            },
            subscription: { status: "active", plan: data.verificationLevel >= 4 ? "vantage_pro" : "free" },
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
        console.log(`    Created user: ${data.name}`);
    }

    // Generated users
    const baseLat = 40.58;
    const baseLng = -122.39;

    for (const [index, p] of generatedProfiles.entries()) {
        const username = `${SEED_PREFIX}gen_${index}`;
        const passwordHash = await bcrypt.hash("Password123!", 12);
        const lat = baseLat + (Math.random() - 0.5) * 0.2;
        const lng = baseLng + (Math.random() - 0.5) * 0.2;

        const user = await User.create({
            username,
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
            rig: { type: p.type, crew_type: "solo", pet_friendly: Math.random() > 0.5 },
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

    console.log(`  ✓ Created ${usersData.length + generatedProfiles.length} users`);
    return userIds;
}

async function seedPosts(userIds: string[]) {
    // Posts from various users, with likes from OTHERS
    const posts = [
        { author: 0, caption: "Found this incredible dispersed campsite just outside Redding. Total silence. #vanlife", photo: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80", likedBy: [1, 2, 3, 5] },
        { author: 0, caption: "Morning coffee view. Doesn't get better than this. ☕🌲", photo: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80", likedBy: [1, 4, 9] },
        { author: 1, caption: "Yoga by the lake. 🧘‍♀️ The skoolie handled the dirt road surprisingly well!", photo: "https://images.unsplash.com/photo-1510022079733-8b58aca7c4a9?w=800&q=80", likedBy: [0, 3, 5, 8] },
        { author: 2, caption: "Just finished a 400W solar install on a Sprinter. Ready for off-grid living! ⚡", photo: "https://images.unsplash.com/photo-1525287612733-4cc66c6de8f7?w=800&q=80", likedBy: [0, 7, 8] },
        { author: 3, caption: "Milky Way above Joshua Tree. 3 hours of exposure time, totally worth it! 🌌", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", likedBy: [0, 1, 4, 9] },
        { author: 4, caption: "Baja sunsets never disappoint. Tacos + Surf + Work = Dream Life. 🌅🌊", photo: "https://images.unsplash.com/photo-1542407635-c8bfd7df8831?w=800&q=80", likedBy: [0, 3, 6] },
        { author: 5, caption: "Roadschooling day! Today we learned about geology at Lassen Volcanic NP. 🌋📚", photo: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80", likedBy: [0, 1] },
        { author: 6, caption: "Coding from a parking lot in SF with a view of the Golden Gate. Living the dream! 👨‍💻🌉", photo: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", likedBy: [0, 4] },
        { author: 7, caption: "Just installed 600W of solar. This rig is now 100% off-grid! ☀️🔋", photo: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80", likedBy: [0, 2, 8] },
        { author: 9, caption: "Golden hour at the coast. Sometimes you just need to stop and shoot. 📸", photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", likedBy: [0, 1, 3] },
    ];

    for (const p of posts) {
        await Post.create({
            author_id: userIds[p.author],
            photos: [p.photo],
            caption: p.caption,
            tags: ["vanlife", "nomadly"],
            likes: p.likedBy.map(i => userIds[i]),
            comments_count: 0
        });
    }
    console.log(`  ✓ Created ${posts.length} posts with cross-user likes`);
}

async function seedComments(userIds: string[]) {
    const posts = await Post.find({});
    let totalComments = 0;

    const commentsData = [
        "Great shot! 📸", "Looks amazing!", "Where is this?", "Goals! 🙌",
        "Need to visit here soon.", "Love the setup!", "Safe travels!",
        "How's the weather there?", "Can't wait to see more!", "Nice rig!"
    ];

    for (const post of posts) {
        // Add 0-3 random comments to each post
        const numComments = Math.floor(Math.random() * 4);

        for (let i = 0; i < numComments; i++) {
            // Pick a random user (not the author preferably)
            let authorIdx = Math.floor(Math.random() * userIds.length);
            // Simple retry to avoid self-comment (not strict)
            if (userIds[authorIdx] === post.author_id.toString()) {
                authorIdx = (authorIdx + 1) % userIds.length;
            }

            await (Comment as any).create({
                post_id: post._id,
                author_id: userIds[authorIdx],
                text: commentsData[Math.floor(Math.random() * commentsData.length)],
                created_at: new Date()
            });
        }

        post.comments_count = numComments;
        await post.save();
        totalComments += numComments;
    }
    console.log(`  ✓ Created ${totalComments} comments on posts`);
}

async function seedStories(userIds: string[]) {
    const stories = [
        { user: 1, asset: "https://images.unsplash.com/photo-1510022079733-8b58aca7c4a9?w=800&q=80" },
        { user: 0, asset: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80" },
        { user: 4, asset: "https://images.unsplash.com/photo-1542407635-c8bfd7df8831?w=800&q=80" },
        { user: 9, asset: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
    ];

    for (const s of stories) {
        await Story.create({
            author_id: userIds[s.user],
            asset_url: s.asset,
            asset_type: "image",
            views: [],
            expires_at: futureDate(1)
        });
    }
    console.log(`  ✓ Created ${stories.length} stories`);
}

async function seedActivities(userIds: string[]) {
    // Activities with participants who requested to join
    const activities = [
        { host: 0, title: "Redding Coffee Meetup", type: "social", desc: "Let's grab coffee at Theory! ☕", lat: 40.584, lng: -122.390, participants: [1, 2], pending: [6] },
        { host: 2, title: "Van Build Q&A Workshop", type: "cowork", desc: "Electrical and solar questions welcome. 🔧", lat: 40.582, lng: -122.385, participants: [0, 7], pending: [4] },
        { host: 1, title: "Morning Yoga by the River", type: "fitness", desc: "Gentle flow yoga. Bring your mat! 🧘‍♀️", lat: 40.585, lng: -122.388, participants: [0, 8], pending: [] },
        { host: 5, title: "Family Potluck Dinner", type: "social", desc: "Bring a dish! Kids welcome. 🔥", lat: 40.590, lng: -122.395, participants: [0, 1], pending: [3] },
        { host: 9, title: "Photography Walk", type: "adventure", desc: "Golden hour photo walk. All levels! 📸", lat: 40.580, lng: -122.392, participants: [3], pending: [0, 4] },
        { host: 3, title: "Stargazing Night", type: "adventure", desc: "New moon tonight! Perfect for astrophotography. 🌌", lat: 34.134, lng: -116.313, participants: [4], pending: [] },
    ];

    for (const a of activities) {
        await Activity.create({
            host_id: userIds[a.host],
            title: a.title,
            activity_type: a.type,
            description: a.desc,
            location: { type: "Point", coordinates: [a.lng, a.lat] },
            max_participants: 10,
            current_participants: a.participants.map(i => userIds[i]),
            pending_requests: a.pending.map(i => userIds[i]),
            event_time: futureDate(Math.floor(Math.random() * 5) + 1),
            status: "open",
            verified_only: false
        });
    }
    console.log(`  ✓ Created ${activities.length} activities with participants`);
}

async function seedJobs(userIds: string[]) {
    const jobs = [
        { author: 0, title: "Need help with van electrical system", desc: "Intermittent electrical issue in my Sprinter. Aux battery not charging properly.", category: "electrical", budget: 150, type: "fixed" as const, isRemote: false, lat: 40.586, lng: -122.391 },
        { author: 1, title: "Freelance Writer for Travel Blog", desc: "Need 2-3 articles per month. Experience with SEO preferred.", category: "writing", budget: 25, type: "hourly" as const, isRemote: true, lat: 40.588, lng: -122.395 },
        { author: 5, title: "Math Tutor for Roadschooling Kids", desc: "Tutor for 12-year-old via Zoom. 2-3 sessions/week.", category: "education", budget: 40, type: "hourly" as const, isRemote: true, lat: 40.590, lng: -122.400 },
        { author: 4, title: "Website Developer for Surf School", desc: "Simple WordPress site with booking functionality.", category: "tech", budget: 800, type: "fixed" as const, isRemote: true, lat: 23.450, lng: -110.226 },
        { author: 6, title: "React Native Developer for Side Project", desc: "Help build a simple mobile app. Expo experience preferred.", category: "tech", budget: 75, type: "hourly" as const, isRemote: true, lat: 37.774, lng: -122.419 },
        { author: 9, title: "Second Shooter for Wedding", desc: "Wedding gig in Napa. Full day, 8 hours. Must have own equipment.", category: "photography", budget: 350, type: "fixed" as const, isRemote: false, lat: 38.297, lng: -122.287 },
        { author: 3, title: "Help Setting Up Starlink", desc: "Need help mounting Starlink on SUV roof and wiring.", category: "technical", budget: 100, type: "fixed" as const, isRemote: false, lat: 34.134, lng: -116.313 },
        { author: 2, title: "Looking for Apprentice Mechanic", desc: "Seeking apprentice to help with mobile mechanic jobs.", category: "mechanical", budget: 18, type: "hourly" as const, isRemote: false, lat: 40.580, lng: -122.380 },
    ];

    for (const j of jobs) {
        await Job.create({
            author_id: userIds[j.author],
            title: j.title,
            description: j.desc,
            category: j.category,
            budget: j.budget,
            budget_type: j.type,
            location: { type: "Point", coordinates: [j.lng, j.lat] },
            is_remote: j.isRemote,
            status: "open"
        });
    }
    console.log(`  ✓ Created ${jobs.length} jobs`);
}

async function seedFollows(userIds: string[]) {
    // Create a social graph - mutual follows between connected users
    const mutualFollows = [
        [0, 1], [0, 2], [0, 3], [0, 5], [0, 9], // John's circle
        [1, 3], [1, 5], [1, 8],                  // Sarah's additional
        [2, 7], [2, 8],                          // Mike with other builders
        [3, 4], [3, 9],                          // Luna's connections
        [4, 6],                                   // Alex and Dave
        [7, 8],                                   // Builder network
    ];

    // One-way follows (people following without follow-back)
    // Note: Don't include pairs that already exist in mutualFollows
    const oneWayFollows = [
        [6, 0],  // Dave follows John (no follow-back from John)
        [10, 0], [11, 0], [12, 1], // Generated users follow curated
    ];

    for (const [a, b] of mutualFollows) {
        if (userIds[a] && userIds[b]) {
            await Follow.create({ follower_id: userIds[a], following_id: userIds[b], status: "active" });
            await Follow.create({ follower_id: userIds[b], following_id: userIds[a], status: "active" });
        }
    }

    for (const [a, b] of oneWayFollows) {
        if (userIds[a] && userIds[b]) {
            await Follow.create({ follower_id: userIds[a], following_id: userIds[b], status: "active" });
        }
    }

    console.log(`  ✓ Created ${mutualFollows.length * 2 + oneWayFollows.length} follow connections`);
}

async function seedSwipes(userIds: string[]) {
    // Swipe data showing matching behavior
    const swipes = [
        // John's swipes
        { actor: 0, target: 1, action: "like" },
        { actor: 0, target: 2, action: "like" },
        { actor: 0, target: 3, action: "super_like" },
        { actor: 0, target: 4, action: "like" },
        { actor: 0, target: 10, action: "pass" },

        // Swipes back at John (creates matches)
        { actor: 1, target: 0, action: "like" },     // MATCH with John
        { actor: 2, target: 0, action: "like" },     // Liked John but no match yet (need convo)

        // Sarah's swipes
        { actor: 1, target: 3, action: "like" },
        { actor: 3, target: 1, action: "like" },     // MATCH with Luna

        // Others
        { actor: 4, target: 0, action: "like" },     // Alex likes John
        { actor: 5, target: 0, action: "like" },     // Family likes John
        { actor: 6, target: 4, action: "super_like" }, // Dave super-likes Alex
    ];

    for (const s of swipes) {
        if (userIds[s.actor] && userIds[s.target]) {
            await Swipe.create({
                actor_id: userIds[s.actor],
                target_id: userIds[s.target],
                action: s.action
            });
        }
    }
    console.log(`  ✓ Created ${swipes.length} swipes`);
}

// Store conversation IDs for matches
interface ConvoResult {
    convoId: string;
    users: [number, number];
}

async function seedConversationsAndMessages(userIds: string[]): Promise<ConvoResult[]> {
    const results: ConvoResult[] = [];

    // Conversation threads between matched/connected users
    const conversations = [
        {
            users: [0, 1] as [number, number],
            messages: [
                { sender: 0, text: "Hey Sarah! Are you parked near the lake?" },
                { sender: 1, text: "Yes! It's beautiful here. You should come by." },
                { sender: 0, text: "I saw your story! Mind if I join for yoga tomorrow?" },
                { sender: 1, text: "Of course! 10am at the north shore. See you there! 🧘‍♀️" },
            ]
        },
        {
            users: [0, 2] as [number, number],
            messages: [
                { sender: 0, text: "Hey Mike! My aux battery isn't charging right. Can you help?" },
                { sender: 2, text: "Yeah I can take a look! What kind of van?" },
                { sender: 0, text: "2019 Sprinter 144. B2B charger seems to be the issue." },
                { sender: 2, text: "I'm free Thursday afternoon if that works?" },
                { sender: 0, text: "Perfect, I'll see you then! Thanks!" },
            ]
        },
        {
            users: [1, 3] as [number, number],
            messages: [
                { sender: 1, text: "Your astrophotos are amazing! How did you get started?" },
                { sender: 3, text: "Thanks! Started 3 years ago in Joshua Tree. Dark skies here are incredible." },
                { sender: 1, text: "I'm planning to head down there next month!" },
                { sender: 3, text: "Nice! Let me know when you're here, I'll show you the best spots. 🌌" },
            ]
        },
        {
            users: [0, 6] as [number, number],
            messages: [
                { sender: 6, text: "Hey! I noticed we're both into tech. Are you a developer?" },
                { sender: 6, text: "Want to grab coffee and talk shop sometime?" },
                // John hasn't replied yet - unread messages scenario
            ]
        },
    ];

    for (const c of conversations) {
        const convo = await Conversation.create({
            participants: c.users.map(i => userIds[i]),
            type: "direct",
            last_message: c.messages[c.messages.length - 1].text,
            last_message_time: new Date()
        });

        for (const msg of c.messages) {
            // If John (0) is participant and didn't send the last message, mark unread
            const readBy = msg === c.messages[c.messages.length - 1] && msg.sender !== 0 && c.users.includes(0)
                ? [userIds[msg.sender]]
                : c.users.map(i => userIds[i]);

            await Message.create({
                conversation_id: convo._id,
                sender_id: userIds[msg.sender],
                message: msg.text,
                message_type: "text",
                read_by: readBy
            });
        }

        results.push({ convoId: convo._id.toString(), users: c.users });
    }

    console.log(`  ✓ Created ${conversations.length} conversations with messages`);
    return results;
}

async function seedMatches(userIds: string[], convos: ConvoResult[]) {
    // Create matches for users who have mutual likes and a conversation
    // Now uses user1/user2 compound index (allows users to have multiple matches)
    const matchPairs: [number, number][] = [
        [0, 1], // John & Sarah matched (both liked each other)
        [1, 3], // Sarah & Luna matched
    ];

    for (const [a, b] of matchPairs) {
        // Find the conversation for this pair
        const convo = convos.find(c =>
            (c.users[0] === a && c.users[1] === b) ||
            (c.users[0] === b && c.users[1] === a)
        );

        if (convo) {
            // Sort user IDs to ensure consistent ordering for unique constraint
            const sortedUsers = [userIds[a], userIds[b]].sort();

            await Match.create({
                users: sortedUsers,
                user1: sortedUsers[0],  // First in sorted order
                user2: sortedUsers[1],  // Second in sorted order
                initiated_by: userIds[a],
                conversation_id: convo.convoId
            });
        }
    }
    console.log(`  ✓ Created ${matchPairs.length} matches`);
}

async function seedConsultationsAndReviews(userIds: string[]) {
    // Builders are: 2 (Mike), 7 (Sam), 8 (Diana)
    const consultations = [
        { requester: 0, builder: 2, specialty: "Diesel", status: "completed" as const, rating: 5, comment: "Mike fixed my electrical issue in under an hour. Very professional!" },
        { requester: 1, builder: 7, specialty: "Solar", status: "completed" as const, rating: 5, comment: "Sam's solar install was perfect. System performing great!" },
        { requester: 5, builder: 8, specialty: "Interior Design", status: "completed" as const, rating: 4, comment: "Diana designed a great layout for our family skoolie." },
        { requester: 4, builder: 2, specialty: "Electrical", status: "accepted" as const },
        { requester: 6, builder: 7, specialty: "Off-Grid Systems", status: "pending" as const },
    ];

    for (const c of consultations) {
        const consultation = await Consultation.create({
            requester_id: userIds[c.requester],
            builder_id: userIds[c.builder],
            specialty: c.specialty,
            status: c.status,
            scheduled_time: c.status === "accepted" ? futureDate(3) : undefined,
            payment_status: c.status === "completed" ? "paid" : "unpaid"
        });

        if (c.rating && c.comment) {
            await Review.create({
                consultation_id: consultation._id,
                reviewer_id: userIds[c.requester],
                builder_id: userIds[c.builder],
                rating: c.rating,
                comment: c.comment
            });
        }
    }
    console.log(`  ✓ Created ${consultations.length} consultations (3 with reviews)`);
}

async function seedVouches(userIds: string[]) {
    // Community vouching - users vouch for each other (one direction only per pair)
    const vouches = [
        { voucher: 1, vouchee: 0 },
        { voucher: 2, vouchee: 0 },
        { voucher: 5, vouchee: 0 },
        { voucher: 0, vouchee: 1 },
        { voucher: 3, vouchee: 1 },
        { voucher: 0, vouchee: 2 },
        { voucher: 7, vouchee: 2 },
        { voucher: 8, vouchee: 2 },
        { voucher: 0, vouchee: 5 },
        { voucher: 1, vouchee: 5 },
        { voucher: 2, vouchee: 7 },
        { voucher: 8, vouchee: 7 },
    ];

    for (const v of vouches) {
        await Vouch.create({
            voucher_id: userIds[v.voucher],
            vouchee_id: userIds[v.vouchee]
        });
    }
    console.log(`  ✓ Created ${vouches.length} vouches`);
}

async function seedInviteCodes(userIds: string[]) {
    await Promise.all([
        InviteCode.create({ code: "NOMAD-WELCOME", created_by: userIds[0], max_uses: 999, use_count: 0, is_active: true }),
        InviteCode.create({ code: generateInviteCode(), created_by: userIds[0], max_uses: 5, use_count: 2, is_active: true }),
        InviteCode.create({ code: "VANLIFE-2026", created_by: userIds[2], max_uses: 100, use_count: 15, is_active: true }),
    ]);
    console.log(`  ✓ Created 3 invite codes`);
}

// ============================================================================
// MAIN
// ============================================================================

async function clearAllData() {
    // Clear each collection individually to avoid TypeScript union type issues
    await Post.deleteMany({});
    await Story.deleteMany({});
    await Activity.deleteMany({});
    await Job.deleteMany({});
    await Follow.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Match.deleteMany({});
    await Swipe.deleteMany({});
    await Consultation.deleteMany({});
    await Review.deleteMany({});
    await Vouch.deleteMany({});
    await InviteCode.deleteMany({});
    await Block.deleteMany({});
    await Report.deleteMany({});
    await User.deleteMany({});
    console.log("  ✓ Cleaned up all existing data");
}

async function seed() {
    try {
        await connectDB();
        console.log("\n🌱 Seeding Nomadly Database (Comprehensive & Interconnected)...\n");

        await clearAllData();

        // 1. Users first (everything depends on them)
        const userIds = await seedUsers();

        // 2. Content created by users
        await seedPosts(userIds);
        await seedComments(userIds);
        await seedStories(userIds);
        await seedActivities(userIds);
        await seedJobs(userIds);

        // 3. Social connections
        await seedFollows(userIds);
        await seedSwipes(userIds);

        // 4. Conversations (needed for matches)
        const convos = await seedConversationsAndMessages(userIds);

        // 5. Matches (require conversations)
        await seedMatches(userIds, convos);

        // 6. Marketplace
        await seedConsultationsAndReviews(userIds);

        // 7. Verification
        await seedVouches(userIds);
        await seedInviteCodes(userIds);

        console.log("\n" + "═".repeat(50));
        console.log("✅ SEEDING COMPLETE!");
        console.log("═".repeat(50));
        console.log("\n📱 LOGIN CREDENTIALS:");
        console.log("   Username: seed_john_nomad");
        console.log("   Email:    seed_john@example.com");
        console.log("   Password: Password123!");
        console.log("\n   (Any seed_* user works with Password123!)\n");

        console.log("📊 DATA SUMMARY:");
        console.log("   ├─ 20 Users (10 curated + 10 generated)");
        console.log("   ├─ 10 Posts (with cross-user likes)");
        console.log("   ├─ 4 Stories");
        console.log("   ├─ 6 Activities (with participants & requests)");
        console.log("   ├─ 8 Jobs");
        console.log("   ├─ Social graph (follows, 2 matches, 12 swipes)");
        console.log("   ├─ 4 Conversations with message threads");
        console.log("   ├─ 5 Consultations (3 with reviews)");
        console.log("   ├─ 12 Vouches");
        console.log("   └─ 3 Invite codes\n");

        console.log("🔗 KEY RELATIONSHIPS:");
        console.log("   • John ↔ Sarah: Matched, chatting, mutual follows");
        console.log("   • John → Mike: Consulted (reviewed), follows");
        console.log("   • Sarah ↔ Luna: Matched, chatting");
        console.log("   • John joined Sarah's yoga activity");
        console.log("   • John has unread message from Dave");
        console.log("   • Mike, Sam, Diana are builders with reviews");
        console.log("   • Multiple users vouched for each other\n");

    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

async function clear() {
    try {
        await connectDB();
        console.log("\n🧹 Clearing all data...");
        await clearAllData();
        console.log("\n✅ Clear complete!\n");
    } catch (error) {
        console.error("\n❌ Clear failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

const command = process.argv[2];
if (command === "clear") {
    clear();
} else {
    seed();
}
