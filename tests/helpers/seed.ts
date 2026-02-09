/**
 * Production-Ready Seed Script for Nomadly Database
 *
 * Seeds ALL modules with realistic, interconnected test data:
 * - Users with real vanlife personas
 * - Trips with interest system
 * - Activities with participants
 * - Posts, Stories, Conversations
 * - Marketplace (Jobs, Consultations, Reviews)
 * - Social graph (Follows, Matches, Vouches)
 *
 * Usage:
 *   npx ts-node tests/helpers/seed.ts          - Create test data
 *   npx ts-node tests/helpers/seed.ts clear    - Clean up all data
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
import { Trip } from "../../src/modules/trips/models/trip.model";
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
            number: level >= 2 ? "+1555" + Math.floor(Math.random() * 10000000).toString().padStart(7, '0') : undefined,
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
// REALISTIC USER DATA - 15 Curated vanlife personas
// ============================================================================

const usersData = [
    // User 0: MAIN TEST USER - You login as this
    {
        username: "marcus_vanlife",
        email: "marcus@nomadly.app",
        name: "Marcus Chen",
        password: "Test123!",
        bio: "Full-time vanlife since 2022. Software engineer working remotely from my 2019 Sprinter. Currently chasing good weather and better wifi. 🚐💻",
        hobbies: ["Coding", "Hiking", "Photography", "Coffee"],
        intent: "friends" as const,
        rig_type: "sprinter" as const,
        crew_type: "solo" as const,
        coordinates: [-122.4194, 37.7749], // San Francisco
        verificationLevel: 4,
        is_builder: false,
        age: 32,
        gender: "male"
    },
    // User 1: Matched friend - yoga instructor
    {
        username: "elena_roadyogi",
        email: "elena@gmail.com",
        name: "Elena Rodriguez",
        password: "Test123!",
        bio: "Yoga instructor living in a converted Skoolie. Teaching virtual classes and hosting pop-up sessions wherever I park. Peace, love, and open roads. 🧘‍♀️🚌",
        hobbies: ["Yoga", "Meditation", "Cooking", "Journaling"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        crew_type: "solo" as const,
        coordinates: [-122.4294, 37.7849], // Near SF
        verificationLevel: 3,
        is_builder: false,
        age: 29,
        gender: "female"
    },
    // User 2: Builder - mechanic
    {
        username: "jake_mobilemech",
        email: "jake.mechanics@outlook.com",
        name: "Jake Thompson",
        password: "Test123!",
        bio: "20 years as a diesel mechanic, 5 on the road. I fix rigs from my rig. Specializing in Sprinters, Transits, and Promasters. DM for mobile repairs! 🔧",
        hobbies: ["Mechanics", "Fishing", "BBQ", "Woodworking"],
        intent: "friends" as const,
        rig_type: "truck_camper" as const,
        crew_type: "solo" as const,
        coordinates: [-121.8863, 37.3382], // San Jose
        verificationLevel: 5,
        is_builder: true,
        specialty_tags: ["Diesel Repair", "Electrical", "Solar Installation", "Engine Diagnostics"],
        hourly_rate: 95,
        age: 45,
        gender: "male"
    },
    // User 3: Photographer - matched with Elena
    {
        username: "sky_captures",
        email: "skyler.photo@icloud.com",
        name: "Skyler Morgan",
        password: "Test123!",
        bio: "Astrophotographer & landscape artist. Chasing dark skies and golden hours. Currently in Joshua Tree. My Tacoma goes where tripods fear to tread. 📷🌌",
        hobbies: ["Photography", "Stargazing", "Hiking", "Camping"],
        intent: "both" as const,
        rig_type: "suv" as const,
        crew_type: "solo" as const,
        coordinates: [-116.3131, 34.1347], // Joshua Tree
        verificationLevel: 3,
        is_builder: false,
        age: 27,
        gender: "non-binary"
    },
    // User 4: Surfer in Baja
    {
        username: "wave_rider_alex",
        email: "alex.waves@proton.me",
        name: "Alex Nakamura",
        password: "Test123!",
        bio: "Surf, code, repeat. Building apps from the beaches of Baja. Starlink changed my life. If the waves are good, I'm probably offline. 🏄‍♂️💻🌊",
        hobbies: ["Surfing", "Web Development", "Spearfishing", "Spanish"],
        intent: "dating" as const,
        rig_type: "sprinter" as const,
        crew_type: "solo" as const,
        coordinates: [-110.9779, 23.6345], // Los Cabos, Baja
        verificationLevel: 4,
        is_builder: false,
        age: 31,
        gender: "male"
    },
    // User 5: Family - roadschooling
    {
        username: "wandering_williams",
        email: "williams.family@gmail.com",
        name: "The Williams Family",
        password: "Test123!",
        bio: "Family of 5 roadschooling across America! Dad (Tom), Mom (Sarah), and 3 adventurous kids. Love meeting other nomad families. 👨‍👩‍👧‍👦🚐📚",
        hobbies: ["Homeschooling", "National Parks", "Board Games", "Geocaching"],
        intent: "friends" as const,
        rig_type: "rv" as const,
        crew_type: "family" as const,
        coordinates: [-111.0937, 38.7331], // Moab, Utah
        verificationLevel: 4,
        is_builder: false,
        age: 38,
        gender: "other"
    },
    // User 6: Remote worker - tech
    {
        username: "nomad_dev_ryan",
        email: "ryan.codes@hey.com",
        name: "Ryan O'Brien",
        password: "Test123!",
        bio: "DevOps engineer by day, campfire enthusiast by night. 3 years full-time in my RAM Promaster. Always looking for coworking buddies. ☕👨‍💻🔥",
        hobbies: ["Programming", "Mountain Biking", "Craft Beer", "Board Games"],
        intent: "friends" as const,
        rig_type: "van" as const,
        crew_type: "solo" as const,
        coordinates: [-105.2705, 40.0150], // Boulder, CO
        verificationLevel: 2,
        is_builder: false,
        age: 34,
        gender: "male"
    },
    // User 7: Builder - solar specialist
    {
        username: "sunpower_sam",
        email: "sam.solar@gmail.com",
        name: "Samantha Wright",
        password: "Test123!",
        bio: "15 years in solar, 3 on the road. I've installed 200+ van systems. Let me help you go off-grid! Free consultations for the nomad community. ☀️🔋",
        hobbies: ["Renewable Energy", "Electronics", "Rock Climbing", "Podcasts"],
        intent: "friends" as const,
        rig_type: "van" as const,
        crew_type: "solo" as const,
        coordinates: [-117.1611, 32.7157], // San Diego
        verificationLevel: 5,
        is_builder: true,
        specialty_tags: ["Solar Systems", "Battery Banks", "Electrical Design", "Off-Grid Solutions"],
        hourly_rate: 85,
        age: 40,
        gender: "female"
    },
    // User 8: Builder - interior designer
    {
        username: "vanteriors_nina",
        email: "nina.designs@studio.com",
        name: "Nina Patel",
        password: "Test123!",
        bio: "Van interior specialist. Custom cabinetry, space optimization, and aesthetic upgrades. Turning vans into homes since 2019. DM for portfolio! ✨🛠️",
        hobbies: ["Interior Design", "Woodworking", "Thrifting", "Yoga"],
        intent: "friends" as const,
        rig_type: "skoolie" as const,
        crew_type: "couple" as const,
        coordinates: [-122.6750, 45.5152], // Portland, OR
        verificationLevel: 4,
        is_builder: true,
        specialty_tags: ["Interior Design", "Custom Cabinetry", "Space Optimization", "Upholstery"],
        hourly_rate: 75,
        age: 33,
        gender: "female"
    },
    // User 9: Content creator
    {
        username: "vanlife_vlogs_mike",
        email: "mike.content@youtube.com",
        name: "Mike Santos",
        password: "Test123!",
        bio: "Documenting vanlife since 2020. 150K subscribers and counting! Always looking for interesting nomads to feature. Let's create something together! 🎬📱",
        hobbies: ["Videography", "Storytelling", "Drone Flying", "Interviewing"],
        intent: "friends" as const,
        rig_type: "sprinter" as const,
        crew_type: "solo" as const,
        coordinates: [-118.2437, 34.0522], // Los Angeles
        verificationLevel: 4,
        is_builder: false,
        age: 28,
        gender: "male"
    },
    // User 10: Retired couple
    {
        username: "silver_nomads",
        email: "bob.and.carol@aol.com",
        name: "Bob & Carol Henderson",
        password: "Test123!",
        bio: "Retired and living our best life! Sold the house in 2021, bought an Airstream. 48 states down, Alaska next summer. Age is just a number! 🚐💕",
        hobbies: ["Birdwatching", "Golf", "Wine Tasting", "Genealogy"],
        intent: "friends" as const,
        rig_type: "rv" as const,
        crew_type: "couple" as const,
        coordinates: [-110.9265, 32.2540], // Tucson, AZ
        verificationLevel: 3,
        is_builder: false,
        age: 65,
        gender: "other"
    },
    // User 11: Adventure sports
    {
        username: "climb_and_camp",
        email: "jordan.climbs@gmail.com",
        name: "Jordan Lee",
        password: "Test123!",
        bio: "Pro climber, amateur van builder. Living in a 4x4 Sprinter to access the best crags. Red Rock to Yosemite to Indian Creek. Always down to belay! 🧗‍♂️",
        hobbies: ["Rock Climbing", "Bouldering", "Slacklining", "Trail Running"],
        intent: "both" as const,
        rig_type: "sprinter" as const,
        crew_type: "solo" as const,
        coordinates: [-115.1398, 36.1699], // Las Vegas (near Red Rock)
        verificationLevel: 3,
        is_builder: false,
        age: 26,
        gender: "male"
    },
    // User 12: Nurse traveler
    {
        username: "traveling_nurse_amy",
        email: "amy.rn@healthcare.com",
        name: "Amy Foster",
        password: "Test123!",
        bio: "Travel nurse living van life between assignments. 13 weeks on, 2 weeks exploring. Best of both worlds! Healthcare nomads unite! 🏥🚐",
        hobbies: ["Hiking", "Kayaking", "Reading", "Cooking"],
        intent: "friends" as const,
        rig_type: "van" as const,
        crew_type: "solo" as const,
        coordinates: [-122.3321, 47.6062], // Seattle
        verificationLevel: 4,
        is_builder: false,
        age: 35,
        gender: "female"
    },
    // User 13: Musician
    {
        username: "acoustic_nomad",
        email: "chris.guitar@musicmail.com",
        name: "Chris Daniels",
        password: "Test123!",
        bio: "Singer-songwriter touring in a vintage VW bus. Booking house concerts and campfire sessions. Music is the journey, not the destination. 🎸🎵",
        hobbies: ["Music", "Songwriting", "Open Mics", "Vinyl Collecting"],
        intent: "both" as const,
        rig_type: "bus" as const,
        crew_type: "solo" as const,
        coordinates: [-104.9903, 39.7392], // Denver
        verificationLevel: 2,
        is_builder: false,
        age: 30,
        gender: "male"
    },
    // User 14: Pet parent
    {
        username: "luna_and_me",
        email: "ashley.luna@petmail.com",
        name: "Ashley Kim",
        password: "Test123!",
        bio: "Traveling with my golden retriever Luna 🐕. Finding dog-friendly spots across the US. She's the real navigator. Where Luna goes, I follow! 🐾",
        hobbies: ["Dog Training", "Hiking", "Beach Days", "Pet Photography"],
        intent: "friends" as const,
        rig_type: "van" as const,
        crew_type: "solo" as const,
        coordinates: [-80.1918, 25.7617], // Miami
        verificationLevel: 3,
        is_builder: false,
        age: 28,
        gender: "female"
    },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined in .env file");
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
                age: data.age,
                gender: data.gender,
                photo_url: `https://i.pravatar.cc/400?u=${data.username}`,
                hobbies: data.hobbies,
                intent: data.intent,
                bio: data.bio,
            },
            rig: {
                type: data.rig_type,
                crew_type: data.crew_type,
                pet_friendly: Math.random() > 0.3,
            },
            travel_route: {
                current_location: { type: "Point", coordinates: data.coordinates },
                origin: { type: "Point", coordinates: data.coordinates },
                destination: { type: "Point", coordinates: [data.coordinates[0] + (Math.random() - 0.5) * 10, data.coordinates[1] + (Math.random() - 0.5) * 5] },
                start_date: new Date(),
                duration_days: 14 + Math.floor(Math.random() * 60),
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
                member_since: pastDate(Math.floor(Math.random() * 730) + 30),
                vouch_count: data.verificationLevel * 2 + Math.floor(Math.random() * 3),
            },
            subscription: { status: "active", plan: data.verificationLevel >= 4 ? "vantage_pro" : "free" },
            verification: createVerification(data.verificationLevel),
            invited_by: inviterUserId,
            invite_count: 3 + Math.floor(Math.random() * 5),
            is_active: true,
            matching_profile: {
                intent: data.intent,
                preferences: { gender_interest: ["all"], min_age: 21, max_age: 65, max_distance_km: 500 },
                is_discoverable: true
            }
        });

        if (!inviterUserId) inviterUserId = user._id.toString();
        userIds.push(user._id.toString());
        console.log(`    Created user: ${data.name} (@${data.username})`);
    }

    console.log(`  ✓ Created ${usersData.length} users`);
    return userIds;
}

async function seedTrips(userIds: string[]) {
    const trips = [
        {
            creator: 0, // Marcus
            title: "Pacific Coast Highway Adventure",
            description: "Cruising PCH from SF to San Diego over 2 weeks. Looking for travel buddies who want to explore coastal towns, catch sunsets, and find hidden beaches. Flexible schedule - good vibes only!",
            origin: { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
            destination: { lat: 32.7157, lng: -117.1611, name: "San Diego, CA" },
            startDate: futureDate(7),
            durationDays: 14,
            lookingForCompanions: true,
            maxCompanions: 2,
            interests: [
                { user: 1, message: "This sounds amazing! I'm heading south anyway and would love company. I can lead morning yoga sessions at our stops!", status: "pending" as const },
                { user: 3, message: "I know all the best photo spots along PCH! Would love to join for the first week at least.", status: "pending" as const },
            ],
            companions: []
        },
        {
            creator: 5, // Williams Family
            title: "National Parks Family Tour",
            description: "Hitting Zion, Bryce, Grand Canyon, and Arches with the kids. Love to caravan with other families! We roadschool so schedule is flexible. Kids aged 8, 11, and 14.",
            origin: { lat: 38.7331, lng: -111.0937, name: "Moab, UT" },
            destination: { lat: 36.0544, lng: -112.1401, name: "Grand Canyon, AZ" },
            startDate: futureDate(14),
            durationDays: 21,
            lookingForCompanions: true,
            maxCompanions: 3,
            interests: [
                { user: 10, message: "We'd love to join! No kids but we love family-friendly activities. Carol was a teacher - happy to help with roadschooling!", status: "accepted" as const },
            ],
            companions: [10]
        },
        {
            creator: 4, // Alex - surfer
            title: "Baja Surf Safari",
            description: "Exploring the best surf breaks from Ensenada to Cabo. Need someone comfortable with border crossings and boondocking. Spanish skills a plus but not required!",
            origin: { lat: 31.8667, lng: -116.5964, name: "Ensenada, Mexico" },
            destination: { lat: 22.8905, lng: -109.9167, name: "Cabo San Lucas, Mexico" },
            startDate: futureDate(21),
            durationDays: 30,
            lookingForCompanions: true,
            maxCompanions: 2,
            interests: [
                { user: 11, message: "Always wanted to surf Baja! I'm an experienced climber but intermediate surfer. Would love to learn from you!", status: "pending" as const },
            ],
            companions: []
        },
        {
            creator: 3, // Skyler - photographer
            title: "Dark Sky Photography Tour",
            description: "Chasing the darkest skies from Joshua Tree to Great Basin. Planning to hit several Dark Sky Parks. Looking for night owls who don't mind late nights and early mornings!",
            origin: { lat: 34.1347, lng: -116.3131, name: "Joshua Tree, CA" },
            destination: { lat: 39.0050, lng: -114.2200, name: "Great Basin NP, NV" },
            startDate: futureDate(10),
            durationDays: 12,
            lookingForCompanions: true,
            maxCompanions: 3,
            interests: [
                { user: 0, message: "I've been wanting to learn astrophotography! I have a decent camera but zero night sky experience. Would love to tag along and learn.", status: "pending" as const },
            ],
            companions: []
        },
        {
            creator: 9, // Mike - content creator
            title: "Vanlife Documentary Road Trip",
            description: "Filming a documentary about the vanlife community. Driving from LA to Austin. Looking for interesting nomads to interview and feature. Will provide edited clips for your own content!",
            origin: { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
            destination: { lat: 30.2672, lng: -97.7431, name: "Austin, TX" },
            startDate: futureDate(5),
            durationDays: 10,
            lookingForCompanions: true,
            maxCompanions: 2,
            interests: [],
            companions: []
        },
        {
            creator: 12, // Amy - nurse
            title: "Pacific Northwest Exploration",
            description: "2 weeks off between assignments! Exploring Olympic NP, Mt. Rainier, and the San Juans. Love hiking and kayaking. Looking for adventure buddies!",
            origin: { lat: 47.6062, lng: -122.3321, name: "Seattle, WA" },
            destination: { lat: 48.8604, lng: -121.6806, name: "North Cascades, WA" },
            startDate: futureDate(3),
            durationDays: 14,
            lookingForCompanions: true,
            maxCompanions: 2,
            interests: [
                { user: 6, message: "I'm based in the PNW right now! Great hiking partner and know some secret spots. Let's explore!", status: "accepted" as const },
            ],
            companions: [6]
        },
    ];

    for (const trip of trips) {
        const interested_users = trip.interests.map(i => ({
            user_id: userIds[i.user],
            message: i.message,
            status: i.status,
            created_at: pastDate(Math.floor(Math.random() * 5) + 1)
        }));

        await Trip.create({
            creator_id: userIds[trip.creator],
            title: trip.title,
            description: trip.description,
            origin: {
                type: "Point",
                coordinates: [trip.origin.lng, trip.origin.lat],
                place_name: trip.origin.name
            },
            destination: {
                type: "Point",
                coordinates: [trip.destination.lng, trip.destination.lat],
                place_name: trip.destination.name
            },
            start_date: trip.startDate,
            duration_days: trip.durationDays,
            looking_for_companions: trip.lookingForCompanions,
            max_companions: trip.maxCompanions,
            interested_users,
            companions: trip.companions.map(c => userIds[c]),
            status: "planning",
            visibility: "public"
        });
    }
    console.log(`  ✓ Created ${trips.length} trips with interest system`);
}

async function seedActivities(userIds: string[]) {
    const activities = [
        {
            host: 0, // Marcus
            title: "Morning Coffee & Coworking",
            type: "cowork",
            desc: "Let's grab coffee at Sightglass and work together! I'll be there 8am-12pm. Good wifi, great espresso. All remote workers welcome!",
            lat: 37.7694,
            lng: -122.4098,
            participants: [6],
            pending: [1],
            maxParticipants: 6,
            hours: 4
        },
        {
            host: 1, // Elena
            title: "Sunset Beach Yoga Session",
            type: "yoga",
            desc: "Free yoga class at Baker Beach! Bring your own mat. All levels welcome. We'll flow for an hour then stay for sunset. 🧘‍♀️🌅",
            lat: 37.7936,
            lng: -122.4834,
            participants: [0, 8],
            pending: [14],
            maxParticipants: 15,
            hours: 2
        },
        {
            host: 2, // Jake - mechanic
            title: "DIY Van Maintenance Workshop",
            type: "cowork",
            desc: "Teaching basic van maintenance: oil changes, brake checks, electrical diagnostics. Bring your rig and learn hands-on! Free for the community.",
            lat: 37.3382,
            lng: -121.8863,
            participants: [0, 6, 7],
            pending: [11],
            maxParticipants: 8,
            hours: 3
        },
        {
            host: 5, // Williams Family
            title: "Family Potluck & Game Night",
            type: "social",
            desc: "Bring a dish to share! We'll have board games, card games, and s'mores by the fire. Kids especially welcome. Let's build community! 🎲🔥",
            lat: 38.7331,
            lng: -111.0937,
            participants: [10],
            pending: [12],
            maxParticipants: 20,
            hours: 4
        },
        {
            host: 3, // Skyler
            title: "Astrophotography Night",
            type: "hike",
            desc: "New moon tonight! Perfect conditions for Milky Way shots. Meeting at the trailhead at 8pm. Bring camera, tripod, and warm layers. I'll teach the basics!",
            lat: 34.0734,
            lng: -116.3862,
            participants: [9],
            pending: [0, 4],
            maxParticipants: 6,
            hours: 5
        },
        {
            host: 4, // Alex - surfer
            title: "Dawn Patrol Surf Session",
            type: "surf",
            desc: "Catching waves at Cerritos Beach! Intermediate friendly, but know how to paddle out. I have an extra board if you need one. See you at sunrise! 🏄‍♂️",
            lat: 23.3400,
            lng: -110.1700,
            participants: [],
            pending: [11],
            maxParticipants: 4,
            hours: 3
        },
        {
            host: 11, // Jordan - climber
            title: "Red Rock Climbing Day",
            type: "hike",
            desc: "Sport climbing at Red Rock! Looking for belay partners. Routes from 5.8 to 5.12. Bring your gear and plenty of water. Meeting at Calico Basin 7am.",
            lat: 36.1699,
            lng: -115.4277,
            participants: [],
            pending: [0],
            maxParticipants: 4,
            hours: 6
        },
        {
            host: 9, // Mike - content creator
            title: "Vanlife Meetup & BBQ",
            type: "social",
            desc: "Bringing nomads together for a beach BBQ! I'll be filming for my channel (optional to be on camera). Bring something to grill and good stories!",
            lat: 34.0195,
            lng: -118.4912,
            participants: [0, 1, 8],
            pending: [3, 4],
            maxParticipants: 25,
            hours: 5
        },
        {
            host: 7, // Sam - solar builder
            title: "Solar System Q&A Session",
            type: "cowork",
            desc: "Got solar questions? Bring 'em! Free consultation session about sizing, installation, and troubleshooting. No sales pitch - just helping the community.",
            lat: 32.7157,
            lng: -117.1611,
            participants: [2],
            pending: [6, 11],
            maxParticipants: 10,
            hours: 2
        },
        {
            host: 14, // Ashley - pet parent
            title: "Dog-Friendly Beach Day",
            type: "social",
            desc: "Taking Luna to the dog beach! All well-behaved pups welcome. We'll have treats and toys. Let's tire out our furry travel companions! 🐕🏖️",
            lat: 25.7617,
            lng: -80.1918,
            participants: [],
            pending: [5],
            maxParticipants: 10,
            hours: 3
        },
    ];

    for (const a of activities) {
        await Activity.create({
            host_id: userIds[a.host],
            title: a.title,
            activity_type: a.type,
            description: a.desc,
            location: { type: "Point", coordinates: [a.lng, a.lat] },
            max_participants: a.maxParticipants,
            current_participants: a.participants.map(i => userIds[i]),
            pending_requests: a.pending.map(i => userIds[i]),
            event_time: futureDate(Math.floor(Math.random() * 7) + 1),
            status: "open",
            verified_only: false
        });
    }
    console.log(`  ✓ Created ${activities.length} activities`);
}

async function seedPosts(userIds: string[]) {
    const posts = [
        {
            author: 0,
            caption: "Woke up to this view outside Stinson Beach. This is why I chose vanlife. No alarm clock, just the sound of waves. ☕🌊",
            photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
            likedBy: [1, 2, 3, 5, 6, 9]
        },
        {
            author: 0,
            caption: "Coffee setup is finally dialed. AeroPress + hand grinder + good beans = happiness anywhere. What's your road coffee routine?",
            photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
            likedBy: [1, 6, 8, 12]
        },
        {
            author: 1,
            caption: "Morning yoga overlooking the Pacific. No studio needed when nature provides the perfect space. Join me tomorrow? 🧘‍♀️",
            photo: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            likedBy: [0, 3, 5, 8, 14]
        },
        {
            author: 2,
            caption: "Just finished a full electrical system rebuild. 400ah lithium, 3000w inverter, and proper shore power. This rig is ready for anything! 🔧⚡",
            photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
            likedBy: [0, 6, 7, 11]
        },
        {
            author: 3,
            caption: "Last night's Milky Way session at Joshua Tree. 3 hours of shooting, totally worth freezing. This community is teaching me so much about night photography!",
            photo: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
            likedBy: [0, 1, 4, 9, 10]
        },
        {
            author: 4,
            caption: "Sunset session at Cerritos. The water was glass, the crowd was zero, and the tacos after were perfect. Baja never disappoints. 🏄‍♂️🌅",
            photo: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
            likedBy: [0, 3, 11, 13]
        },
        {
            author: 5,
            caption: "Roadschool graduation! Our oldest just finished her 8th grade curriculum while we crossed 15 states. Education doesn't need walls. 📚🎓",
            photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
            likedBy: [1, 2, 10, 12]
        },
        {
            author: 6,
            caption: "Found the perfect coworking setup in Boulder. Coffee shop by day, hot springs by night. This is the work-life balance they talk about.",
            photo: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&q=80",
            likedBy: [0, 4, 7, 9]
        },
        {
            author: 7,
            caption: "Just installed 800W of solar on this Transit. Victron everything, parallel panels, and a 48V system. Client is set for off-grid living! ☀️",
            photo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
            likedBy: [0, 2, 6, 11]
        },
        {
            author: 8,
            caption: "Finished this custom build interior. Reclaimed wood, hidden storage everywhere, and a murphy bed that actually works. Home is where you park it. 🏠",
            photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
            likedBy: [0, 1, 5, 9, 10]
        },
        {
            author: 9,
            caption: "Just dropped a new video featuring 5 incredible nomads I met this month. Link in bio! The stories in this community never get old. 🎬",
            photo: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
            likedBy: [0, 1, 3, 4, 8]
        },
        {
            author: 11,
            caption: "Sent my first 5.12 today! Red Rock is magic. Living out of the van means I can climb every day. The dirtbag dream is real. 🧗‍♂️",
            photo: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
            likedBy: [0, 4, 6, 13]
        },
        {
            author: 13,
            caption: "Campfire concert last night. 15 strangers became friends over songs and stories. This is what the road is really about. 🎸🔥",
            photo: "https://images.unsplash.com/photo-1510925758641-869d353cecc7?w=800&q=80",
            likedBy: [0, 1, 5, 10, 14]
        },
        {
            author: 14,
            caption: "Luna found her new favorite beach. Zoomies for days! Finding dog-friendly spots is getting easier with this community's help. 🐕💕",
            photo: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&q=80",
            likedBy: [1, 5, 10, 12]
        },
    ];

    for (const p of posts) {
        await Post.create({
            author_id: userIds[p.author],
            photos: [p.photo],
            caption: p.caption,
            tags: ["vanlife", "nomadly", "roadlife"],
            likes: p.likedBy.map(i => userIds[i]),
            comments_count: 0
        });
    }
    console.log(`  ✓ Created ${posts.length} posts`);
}

async function seedComments(userIds: string[]) {
    const posts = await Post.find({});
    let totalComments = 0;

    const commentsData = [
        "This is amazing! 🔥",
        "Where is this exactly?",
        "Goals right there!",
        "Love your setup!",
        "Need to visit this spot!",
        "Safe travels! 🚐",
        "So inspiring!",
        "How long have you been on the road?",
        "This view is unreal!",
        "Living the dream!",
        "What camera do you use?",
        "Adding this to my list!",
        "See you out there! 👋",
        "Thanks for sharing!",
        "This makes me want to hit the road right now."
    ];

    for (const post of posts) {
        const numComments = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numComments; i++) {
            let authorIdx = Math.floor(Math.random() * userIds.length);
            if (userIds[authorIdx] === post.author_id.toString()) {
                authorIdx = (authorIdx + 1) % userIds.length;
            }
            await (Comment as any).create({
                post_id: post._id,
                author_id: userIds[authorIdx],
                text: commentsData[Math.floor(Math.random() * commentsData.length)],
                created_at: pastDate(Math.random() * 7)
            });
        }
        post.comments_count = numComments;
        await post.save();
        totalComments += numComments;
    }
    console.log(`  ✓ Created ${totalComments} comments`);
}

async function seedStories(userIds: string[]) {
    const stories = [
        { user: 0, asset: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80" },
        { user: 1, asset: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" },
        { user: 3, asset: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80" },
        { user: 4, asset: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80" },
        { user: 9, asset: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80" },
        { user: 11, asset: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80" },
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

async function seedJobs(userIds: string[]) {
    const jobs = [
        {
            author: 0,
            title: "React Developer for Nomad App",
            desc: "Building a companion app for nomads. Need help with React Native components. Remote, flexible hours. 10-15 hours/week.",
            category: "tech",
            budget: 65,
            type: "hourly" as const,
            isRemote: true,
            lat: 37.7749,
            lng: -122.4194
        },
        {
            author: 1,
            title: "Yoga Video Editing Help",
            desc: "Need someone to edit my virtual yoga class recordings. 2-3 videos per week, 60 minutes each, simple cuts and transitions.",
            category: "media",
            budget: 30,
            type: "hourly" as const,
            isRemote: true,
            lat: 37.7849,
            lng: -122.4294
        },
        {
            author: 5,
            title: "Roadschool Curriculum Consultant",
            desc: "Looking for a former teacher to help design our 6th grade curriculum. Focus on history and writing. 10 hours total.",
            category: "education",
            budget: 500,
            type: "fixed" as const,
            isRemote: true,
            lat: 38.7331,
            lng: -111.0937
        },
        {
            author: 6,
            title: "AWS DevOps Assistance",
            desc: "Need help setting up CI/CD pipeline for a small startup. Must know AWS, Docker, and GitHub Actions.",
            category: "tech",
            budget: 85,
            type: "hourly" as const,
            isRemote: true,
            lat: 40.0150,
            lng: -105.2705
        },
        {
            author: 9,
            title: "Thumbnail Designer for YouTube",
            desc: "Creating thumbnails for my vanlife channel. Need 8 thumbnails per month, consistent style. Portfolio required.",
            category: "design",
            budget: 200,
            type: "fixed" as const,
            isRemote: true,
            lat: 34.0522,
            lng: -118.2437
        },
        {
            author: 11,
            title: "Climbing Photography Session",
            desc: "Looking for a photographer to shoot me climbing at Red Rock. 2-3 hour session, need action shots for sponsorship portfolio.",
            category: "photography",
            budget: 250,
            type: "fixed" as const,
            isRemote: false,
            lat: 36.1699,
            lng: -115.4277
        },
        {
            author: 13,
            title: "Guitarist for Recording Session",
            desc: "Recording my first EP! Need a lead guitarist for 4 tracks. Folk/Americana style. Nashville or mobile recording setup.",
            category: "music",
            budget: 400,
            type: "fixed" as const,
            isRemote: false,
            lat: 39.7392,
            lng: -104.9903
        },
        {
            author: 2,
            title: "Apprentice Mobile Mechanic",
            desc: "Looking for someone to learn the trade. Help with basic repairs while I teach you diesel mechanics. Paid learning opportunity.",
            category: "trade",
            budget: 20,
            type: "hourly" as const,
            isRemote: false,
            lat: 37.3382,
            lng: -121.8863
        },
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
    const mutualFollows: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [0, 6], [0, 9],
        [1, 3], [1, 5], [1, 8],
        [2, 7], [2, 11],
        [3, 4], [3, 9],
        [4, 11],
        [5, 10],
        [6, 7],
        [7, 8],
        [9, 13],
        [12, 14],
    ];

    const oneWayFollows: [number, number][] = [
        [4, 0], [5, 0], [8, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0],
        [6, 1],
    ];

    for (const [a, b] of mutualFollows) {
        await Follow.create({ follower_id: userIds[a], following_id: userIds[b], status: "active" });
        await Follow.create({ follower_id: userIds[b], following_id: userIds[a], status: "active" });
    }

    for (const [a, b] of oneWayFollows) {
        await Follow.create({ follower_id: userIds[a], following_id: userIds[b], status: "active" });
    }

    console.log(`  ✓ Created ${mutualFollows.length * 2 + oneWayFollows.length} follow connections`);
}

async function seedSwipes(userIds: string[]) {
    const swipes = [
        { actor: 0, target: 1, action: "like" },
        { actor: 0, target: 3, action: "super_like" },
        { actor: 0, target: 4, action: "like" },
        { actor: 1, target: 0, action: "like" },
        { actor: 1, target: 3, action: "like" },
        { actor: 3, target: 1, action: "like" },
        { actor: 3, target: 0, action: "like" },
        { actor: 4, target: 11, action: "like" },
        { actor: 11, target: 4, action: "like" },
        { actor: 6, target: 12, action: "like" },
        { actor: 13, target: 1, action: "super_like" },
    ];

    for (const s of swipes) {
        await Swipe.create({
            actor_id: userIds[s.actor],
            target_id: userIds[s.target],
            action: s.action
        });
    }
    console.log(`  ✓ Created ${swipes.length} swipes`);
}

interface ConvoResult { convoId: string; users: [number, number]; }

async function seedConversationsAndMessages(userIds: string[]): Promise<ConvoResult[]> {
    const results: ConvoResult[] = [];

    const conversations = [
        {
            users: [0, 1] as [number, number],
            messages: [
                { sender: 0, text: "Hey Elena! Saw you're near SF too. Your yoga session looks amazing!" },
                { sender: 1, text: "Hey Marcus! Yes, I'm at Baker Beach this week. You should come to tomorrow's sunset class!" },
                { sender: 0, text: "I'd love that! What time does it start?" },
                { sender: 1, text: "6pm at the north end near the rocks. Bring a mat if you have one, or I have extras. See you there! 🧘‍♀️" },
            ]
        },
        {
            users: [0, 2] as [number, number],
            messages: [
                { sender: 0, text: "Hey Jake, I've been having some electrical issues with my Sprinter. The aux battery doesn't seem to be charging from the alternator." },
                { sender: 2, text: "Classic issue! Usually the B2B charger or the connections. What year is your Sprinter?" },
                { sender: 0, text: "2019. I've got the factory alternator and a Renogy B2B charger." },
                { sender: 2, text: "I know that setup well. I'm in San Jose right now, could swing by this week. I'll bring my diagnostic tools." },
                { sender: 0, text: "That would be amazing! Thanks so much." },
            ]
        },
        {
            users: [0, 3] as [number, number],
            messages: [
                { sender: 3, text: "Saw you're interested in astrophotography! Your shot from Big Sur was great." },
                { sender: 0, text: "Thanks! I'm still learning though. Your Milky Way shots are incredible!" },
                { sender: 3, text: "It just takes practice and dark skies. I'm heading to Great Basin NP next week - want to join?" },
                { sender: 0, text: "I'd love to learn from you! Let me check my schedule." },
            ]
        },
        {
            users: [1, 3] as [number, number],
            messages: [
                { sender: 1, text: "Your photos are so calming! Would you be interested in shooting some content for my yoga platform?" },
                { sender: 3, text: "Absolutely! I've always wanted to do yoga photography. What do you have in mind?" },
                { sender: 1, text: "Sunrise sessions on the beach - golden hour lighting with yoga poses. Could be magic! ✨" },
                { sender: 3, text: "I love this idea! Let's find a time when we're in the same area." },
            ]
        },
        {
            users: [0, 6] as [number, number],
            messages: [
                { sender: 6, text: "Hey! Another dev on the road! What stack are you working with?" },
                { sender: 0, text: "Mostly TypeScript and React these days. You?" },
                { sender: 6, text: "DevOps mainly - k8s, AWS, all the cloud stuff. We should cowork sometime!" },
            ]
        },
        {
            users: [5, 10] as [number, number],
            messages: [
                { sender: 10, text: "We saw your post about roadschooling! Carol was a teacher for 30 years and would love to share resources." },
                { sender: 5, text: "That would be wonderful! We're always looking for curriculum ideas, especially for our middle schooler." },
                { sender: 10, text: "Carol has tons of hands-on history projects. Should we meet up? We're heading toward Moab." },
                { sender: 5, text: "Perfect! We'll be at Arches next week. Let's caravan!" },
            ]
        },
        {
            users: [4, 11] as [number, number],
            messages: [
                { sender: 4, text: "Yo! Saw you're crushing it at Red Rock. I'm heading there after my Baja trip - any must-do routes?" },
                { sender: 11, text: "Dude yes! Calico Basin has amazing sport routes. What grade do you climb?" },
                { sender: 4, text: "Solid 5.10, projecting 5.11. Mostly sport but learning trad." },
                { sender: 11, text: "Perfect! I can show you some classic 5.10s. When are you thinking of coming through?" },
                { sender: 4, text: "Probably late March after the Baja swell dies down. Let's link up!" },
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

        for (const [idx, msg] of c.messages.entries()) {
            const isLastMessage = idx === c.messages.length - 1;
            const readBy = isLastMessage && msg.sender !== c.users[0]
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

    console.log(`  ✓ Created ${conversations.length} conversations`);
    return results;
}

async function seedMatches(userIds: string[], convos: ConvoResult[]) {
    const matchPairs: [number, number][] = [
        [0, 1], // Marcus & Elena
        [1, 3], // Elena & Skyler
        [4, 11], // Alex & Jordan (both adventurous)
    ];

    for (const [a, b] of matchPairs) {
        const convo = convos.find(c =>
            (c.users[0] === a && c.users[1] === b) ||
            (c.users[0] === b && c.users[1] === a)
        );

        const sortedUsers = [userIds[a], userIds[b]].sort();

        await Match.create({
            users: sortedUsers,
            user1: sortedUsers[0],
            user2: sortedUsers[1],
            initiated_by: userIds[a],
            conversation_id: convo?.convoId || null
        });
    }
    console.log(`  ✓ Created ${matchPairs.length} matches`);
}

async function seedConsultationsAndReviews(userIds: string[]) {
    const consultations = [
        {
            requester: 0, builder: 2, specialty: "Electrical Diagnostics", status: "completed" as const,
            rating: 5, comment: "Jake is incredible! Found my electrical issue in 20 minutes and taught me how to prevent it. Highly recommend!"
        },
        {
            requester: 0, builder: 7, specialty: "Solar Design", status: "completed" as const,
            rating: 5, comment: "Sam designed a perfect solar system for my needs. Clear explanations and fair pricing."
        },
        {
            requester: 6, builder: 7, specialty: "Off-Grid Systems", status: "completed" as const,
            rating: 5, comment: "Fantastic consultation! Sam helped me understand my power needs and designed a bulletproof system."
        },
        {
            requester: 11, builder: 2, specialty: "Engine Diagnostics", status: "completed" as const,
            rating: 4, comment: "Great work on my Sprinter. Jake knows his stuff and is super patient explaining everything."
        },
        {
            requester: 1, builder: 8, specialty: "Interior Layout", status: "completed" as const,
            rating: 5, comment: "Nina transformed my skoolie! Her eye for space optimization is amazing. Worth every penny."
        },
        { requester: 4, builder: 2, specialty: "Diesel Maintenance", status: "accepted" as const },
        { requester: 6, builder: 8, specialty: "Custom Cabinetry", status: "pending" as const },
    ];

    for (const c of consultations) {
        const consultation = await Consultation.create({
            requester_id: userIds[c.requester],
            builder_id: userIds[c.builder],
            specialty: c.specialty,
            status: c.status,
            scheduled_time: c.status === "accepted" ? futureDate(5) : undefined,
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
    console.log(`  ✓ Created ${consultations.length} consultations (5 with reviews)`);
}

async function seedVouches(userIds: string[]) {
    const vouches = [
        { voucher: 1, vouchee: 0 },
        { voucher: 2, vouchee: 0 },
        { voucher: 3, vouchee: 0 },
        { voucher: 6, vouchee: 0 },
        { voucher: 0, vouchee: 1 },
        { voucher: 3, vouchee: 1 },
        { voucher: 8, vouchee: 1 },
        { voucher: 0, vouchee: 2 },
        { voucher: 7, vouchee: 2 },
        { voucher: 11, vouchee: 2 },
        { voucher: 0, vouchee: 3 },
        { voucher: 1, vouchee: 3 },
        { voucher: 2, vouchee: 7 },
        { voucher: 8, vouchee: 7 },
        { voucher: 7, vouchee: 8 },
        { voucher: 1, vouchee: 8 },
        { voucher: 5, vouchee: 10 },
        { voucher: 10, vouchee: 5 },
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
        InviteCode.create({ code: "NOMADLY2026", created_by: userIds[0], max_uses: 999, use_count: 0, is_active: true }),
        InviteCode.create({ code: generateInviteCode(), created_by: userIds[0], max_uses: 5, use_count: 2, is_active: true }),
        InviteCode.create({ code: "VANLIFE-WELCOME", created_by: userIds[2], max_uses: 100, use_count: 23, is_active: true }),
        InviteCode.create({ code: "ROADFAM", created_by: userIds[5], max_uses: 50, use_count: 8, is_active: true }),
    ]);
    console.log(`  ✓ Created 4 invite codes`);
}

// ============================================================================
// MAIN
// ============================================================================

async function clearAllData() {
    await Trip.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
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
    console.log("  ✓ Cleared all existing data");
}

async function seed() {
    try {
        await connectDB();
        console.log("\n🌱 Seeding Nomadly Database with Realistic Data...\n");

        await clearAllData();

        const userIds = await seedUsers();
        await seedTrips(userIds);
        await seedActivities(userIds);
        await seedPosts(userIds);
        await seedComments(userIds);
        await seedStories(userIds);
        await seedJobs(userIds);
        await seedFollows(userIds);
        await seedSwipes(userIds);
        const convos = await seedConversationsAndMessages(userIds);
        await seedMatches(userIds, convos);
        await seedConsultationsAndReviews(userIds);
        await seedVouches(userIds);
        await seedInviteCodes(userIds);

        console.log("\n" + "═".repeat(60));
        console.log("✅ SEEDING COMPLETE!");
        console.log("═".repeat(60));
        console.log("\n📱 LOGIN CREDENTIALS:");
        console.log("   ┌─────────────────────────────────────────────┐");
        console.log("   │  Email:    marcus@nomadly.app               │");
        console.log("   │  Password: Test123!                         │");
        console.log("   └─────────────────────────────────────────────┘");
        console.log("\n   (All users use password: Test123!)\n");

        console.log("📊 DATA CREATED:");
        console.log("   ├─ 15 Users with realistic vanlife personas");
        console.log("   ├─ 6 Trips with interest/companion system");
        console.log("   ├─ 10 Activities with participants & requests");
        console.log("   ├─ 14 Posts with comments");
        console.log("   ├─ 6 Stories");
        console.log("   ├─ 8 Jobs (marketplace)");
        console.log("   ├─ Social graph (follows, 3 matches)");
        console.log("   ├─ 6 Conversations with message threads");
        console.log("   ├─ 7 Consultations (5 with reviews)");
        console.log("   ├─ 18 Vouches");
        console.log("   └─ 4 Invite codes\n");

        console.log("🔗 KEY TEST SCENARIOS:");
        console.log("   • Marcus has pending trip interests to review");
        console.log("   • Marcus has pending activity requests");
        console.log("   • Marcus is matched with Elena (yoga instructor)");
        console.log("   • Marcus has unread messages from Ryan");
        console.log("   • Jake, Sam, Nina are builders with reviews");
        console.log("   • Williams Family trip has accepted companions");
        console.log("   • Multiple activities happening soon\n");

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
        console.log("\n✅ Database cleared!\n");
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
