import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { User, IUser } from "../../users/models/user.model";
import { Activity } from "../../activities/models/activity.model";
import { Review } from "../../marketplace/models/review.model";

export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        console.log("Nomadly AI Service Initializing...");
        console.log(`API Key Provided: ${apiKey ? "YES (" + apiKey.substring(0, 5) + "...)" : "NO"}`);

        if (!apiKey) {
            console.error("CRITICAL: GOOGLE_AI_API_KEY is missing from environment variables.");
        }

        this.genAI = new GoogleGenerativeAI(apiKey || "");
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ]
        });
    }

    /**
     * Returns the current AI usage quota for a user without consuming a credit.
     */
    async getQuota(userId: string): Promise<{ remaining: number, limit: number, isPremium: boolean }> {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const isPremium = user.subscription?.plan === 'vantage_pro' && user.subscription?.status === 'active';
        const limit = isPremium ? 100 : 5;

        const now = new Date();
        const lastReset = user.ai_usage?.last_reset || new Date(0);
        const msSinceReset = now.getTime() - lastReset.getTime();

        let count = user.ai_usage?.count ?? 0;

        // If 24h has passed, the count is effectively 0 (will be reset on next chat)
        if (msSinceReset > 24 * 60 * 60 * 1000) {
            count = 0;
        }

        return {
            remaining: Math.max(0, limit - count),
            limit,
            isPremium
        };
    }

    async chat(
        userId: string,
        message: string,
        conversationHistory?: { role: string; text: string }[]
    ): Promise<{ text: string, usage: { remaining: number, limit: number, isPremium: boolean } }> {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const usage = await this.checkRateLimit(user);

        const userLat = user.travel_route?.origin?.coordinates?.[1];
        const userLng = user.travel_route?.origin?.coordinates?.[0];
        const locationStr = (userLat && userLng)
            ? `[Lat: ${userLat.toFixed(2)}, Lng: ${userLng.toFixed(2)}]`
            : "Unknown";

        const isPremium = user.subscription?.plan === 'vantage_pro' && user.subscription?.status === 'active';

        const systemPrompt = `
You are Nomi, the Nomadly Co-Pilot — a friendly, knowledgeable travel companion for nomads.

=== CURRENT USER CONTEXT ===
- Name: ${user.profile.name || "Fellow Nomad"}
- Rig: ${user.rig.type || "Unknown"} (Crew: ${user.rig.crew_type || "solo"}, Pet Friendly: ${user.rig.pet_friendly})
- Hobbies: ${user.profile.hobbies?.length ? user.profile.hobbies.join(", ") : "Not set"}
- Intent: ${user.profile.intent || "friends"}
- Approx Location: ${locationStr}
- Verification Badge: ${user.verification?.badge || "none"}
- Subscription: ${isPremium ? "Vantage Pro (Premium)" : "Free"}
- Is Builder: ${user.is_builder}${user.is_builder && user.builder_profile ? ` (${user.builder_profile.specialty_tags?.join(", ")})` : ""}

=== CRITICAL PRIVACY & SAFETY RULES ===
Rule 1: NEVER reveal another user's exact location, coordinates, name, username, phone number, or any personally identifiable information.
Rule 2: When asked about people nearby, ALWAYS respond with aggregated summaries only (e.g., "I found 3 nomads nearby who love Hiking"). NEVER list individual users.
Rule 3: If asked about a specific person by name, REFUSE and explain you protect user privacy. Say: "I can't share details about specific users, but I can help you discover nomads with similar interests through the app's Discovery tab!"
Rule 4: For people searches, include a suggestion to "open the Discovery tab" or "check Nomad Discovery" in your response.
Rule 5: Act as a MATCHMAKER, not a DIRECTORY. Summarize vibes and interests, never expose raw user data.

=== RIG-AWARE SAFETY RULES ===
Rule 6: Always consider the user's rig type when recommending places. For large rigs (bus, skoolie, rv, truck_camper), warn about tight turns, low clearance, or narrow roads.
Rule 7: If the user has pet_friendly: true, prioritize pet-friendly locations and warn about places that don't allow pets.

=== WHEN TO USE TOOLS vs YOUR OWN KNOWLEDGE ===
- Use search_community, search_builders, search_places ONLY when the user asks about Nomadly community data (nearby nomads, builders on the platform, activities posted by users).
- For GENERAL travel advice (e.g., "best places to visit in Islamabad", "what to do in Colorado", "road trip tips"), use YOUR OWN KNOWLEDGE. Do NOT call search tools for general travel/tourism questions.
- If a search tool returns no results, DO NOT return an empty message. Instead, use your own knowledge to give helpful recommendations, and mention that there are no Nomadly community activities posted in that area yet.
- ALWAYS provide a helpful, substantive response. NEVER return an empty or blank message.

=== RESPONSE GUIDELINES ===
1. BE PROACTIVE: Do not ask for search radius if you can guess a reasonable default (50km for local, 5000km for broad, 20000km for global/anywhere).
2. BE WARM & HELPFUL: You're a travel buddy, not a robot. Use a friendly, encouraging tone.
3. PROMOTE BUILDERS: If a user describes a repair issue, suggest searching for Verified Builders who can help.
4. PERSONALIZE: Use the user's hobbies, rig type, and intent to tailor recommendations. For example, if they like hiking, suggest trails. If they have a large rig, warn about parking.
5. JSON OUTPUT: When returning structured results (builders, places), output a JSON block at the very end inside \`\`\`json ... \`\`\`.
   Structure: [{ "type": "builder" | "place" | "nomad", "id": "...", "name": "...", "rating": number, "description": "...", "image": "..." }]
6. For community/people results, do NOT include individual user JSON. Instead, provide a text summary and suggest they use the Discovery tab.
${!isPremium ? "7. UPSELL GENTLY: If the user asks for premium-style queries (trip planning, detailed breakdowns), mention that Vantage Pro unlocks more features." : ""}
`;

        const tools = {
            functionDeclarations: [
                {
                    name: "search_community",
                    description: "Search for nearby nomads by interest, intent, or role. Returns aggregated privacy-safe summaries, never individual user data. Default radius: 50km. Global: 20000km.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            radius: { type: "NUMBER", description: "Search radius in km" },
                            interest: { type: "STRING", description: "Hobby or interest to filter by" },
                            intent: { type: "STRING", description: "Social intent filter: friends, dating, or both" },
                            role: { type: "STRING", description: "Filter by role: builder, nomad, or any" }
                        },
                        required: ["radius"]
                    }
                },
                {
                    name: "search_builders",
                    description: "Find verified builders/service providers near the user. Use when the user has a repair issue, needs help building, or is looking for services.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            issue: { type: "STRING", description: "Repair issue or service needed (e.g., 'solar', 'electrical', 'plumbing')" },
                            radius: { type: "NUMBER", description: "Search radius in km" }
                        },
                        required: ["issue"]
                    }
                },
                {
                    name: "search_places",
                    description: "Find campsites, stops, activities, or events near the user. Consider the user's rig type for suitability.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            query: { type: "STRING", description: "Search keywords (e.g., 'campsite', 'hiking event', 'BLM land')" },
                            radius: { type: "NUMBER", description: "Search radius in km" }
                        },
                        required: ["query"]
                    }
                }
            ]
        };

        // Build conversation history for multi-turn context
        const history: Array<{ role: string; parts: Array<{ text: string }> }> = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Hey there! I'm Nomi, your Nomadly Co-Pilot. I know your rig, your interests, and I'm ready to help you find great spots, cool people, and anything else you need on the road. What can I help you with? 🚐" }] }
        ];

        // Append previous conversation messages for multi-turn context
        if (conversationHistory && conversationHistory.length > 0) {
            // Limit to last 20 messages to avoid token overflow
            const recentHistory = conversationHistory.slice(-20);
            for (const msg of recentHistory) {
                history.push({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.text }]
                });
            }
        }

        const chatSession = this.model.startChat({
            history,
            tools: [tools],
        });

        try {
            const result = await chatSession.sendMessage(message);
            const response = await result.response;
            let finalResponseText = response.text();

            const calls = response.functionCalls();
            if (calls && calls.length > 0) {
                const call = calls[0];
                let toolResult;
                let toolName = call.name;

                if (toolName === "search_community") {
                    const { radius, interest, intent, role } = call.args as any;
                    toolResult = await this.searchCommunity(user, radius || 50, interest, intent, role);
                } else if (toolName === "search_builders") {
                    const { issue, radius } = call.args as any;
                    toolResult = await this.searchBuilders(user, issue, radius || 100);
                } else if (toolName === "search_places") {
                    const { query, radius } = call.args as any;
                    toolResult = await this.searchPlaces(user, query, radius || 50);
                }

                const result2 = await chatSession.sendMessage([
                    {
                        functionResponse: {
                            name: toolName,
                            response: { name: toolName, content: toolResult }
                        }
                    }
                ]);
                finalResponseText = result2.response.text();
            }

            // Safety: never return an empty response
            if (!finalResponseText || finalResponseText.trim().length === 0) {
                finalResponseText = "I couldn't find specific results in the Nomadly community for that, but I'm happy to help! Could you rephrase your question or ask me something else? I can give you travel tips, help you find nomads nearby, or recommend builders! 🚐";
            }

            return { text: finalResponseText, usage };
        } catch (error) {
            console.error("AI Chat Error:", error);
            return { text: "I'm having trouble connecting to my navigation systems. Give me a moment and try again! 🔧", usage };
        }
    }

    private async checkRateLimit(user: IUser): Promise<{ remaining: number, limit: number, isPremium: boolean }> {
        const isPremium = user.subscription?.plan === 'vantage_pro' && user.subscription?.status === 'active';
        const limit = isPremium ? 100 : 5;

        const now = new Date();
        const lastReset = user.ai_usage?.last_reset || new Date(0);
        const msSinceReset = now.getTime() - lastReset.getTime();

        if (msSinceReset > 24 * 60 * 60 * 1000) {
            if (!user.ai_usage) user.ai_usage = { count: 0, last_reset: now };
            user.ai_usage.count = 0;
            user.ai_usage.last_reset = now;
            await user.save();
        } else if (!user.ai_usage) {
            user.ai_usage = { count: 0, last_reset: now };
            await user.save();
        }

        if (user.ai_usage.count >= limit) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }

        user.ai_usage.count += 1;
        await user.save();

        return {
            remaining: limit - user.ai_usage.count,
            limit,
            isPremium
        };
    }

    /**
     * Privacy-safe community search: returns aggregated summaries, not individual user data.
     */
    private async searchCommunity(currentUser: IUser, radius: number, interest?: string, intent?: string, role?: string): Promise<any> {
        if (!currentUser.travel_route?.origin?.coordinates) return { message: "I don't have your current location. Please update your travel route in your profile to enable nearby searches." };
        const [lng, lat] = currentUser.travel_route.origin.coordinates;

        const query: any = {
            "travel_route.origin": {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius * 1000
                }
            },
            _id: { $ne: currentUser._id },
            "matching_profile.is_discoverable": true // Only show discoverable users
        };

        if (role === 'builder') query.is_builder = true;
        if (interest) query["profile.hobbies"] = { $in: [new RegExp(interest, "i")] };
        if (intent && intent !== 'any') query["matching_profile.intent"] = { $in: [intent, "both"] };

        const users = await User.find(query).limit(20).select(
            "profile.hobbies profile.intent is_builder builder_profile.specialty_tags rig.type rig.crew_type verification.badge matching_profile.intent"
        );

        if (users.length === 0) {
            return { count: 0, message: "No nomads found in this area. Try expanding your search radius!" };
        }

        // Aggregate data — NEVER return individual user details
        const hobbyMap: Record<string, number> = {};
        let builderCount = 0;
        const builderSpecialties: string[] = [];
        const rigTypes: Record<string, number> = {};
        const badgeCounts: Record<string, number> = {};
        const intentCounts: Record<string, number> = {};

        for (const u of users) {
            // Hobbies
            for (const hobby of (u.profile.hobbies || [])) {
                hobbyMap[hobby] = (hobbyMap[hobby] || 0) + 1;
            }
            // Builders
            if (u.is_builder) {
                builderCount++;
                for (const tag of (u.builder_profile?.specialty_tags || [])) {
                    if (!builderSpecialties.includes(tag)) builderSpecialties.push(tag);
                }
            }
            // Rig types
            if (u.rig?.type) {
                rigTypes[u.rig.type] = (rigTypes[u.rig.type] || 0) + 1;
            }
            // Verification badges
            const badge = (u.verification as any)?.badge || "none";
            if (badge !== "none") {
                badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
            }
            // Intent
            const userIntent = (u.matching_profile as any)?.intent || "friends";
            intentCounts[userIntent] = (intentCounts[userIntent] || 0) + 1;
        }

        // Top hobbies sorted by frequency
        const topHobbies = Object.entries(hobbyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hobby, count]) => `${hobby} (${count})`);

        return {
            count: users.length,
            summary: {
                top_hobbies: topHobbies,
                builders_nearby: builderCount,
                builder_specialties: builderSpecialties.slice(0, 5),
                rig_breakdown: rigTypes,
                verified_count: Object.values(badgeCounts).reduce((a, b) => a + b, 0),
                intent_breakdown: intentCounts
            },
            action: "Suggest the user open the Discovery tab in the app to browse and connect with these nomads.",
            privacy_note: "Individual user details are not available. Direct the user to the Discovery tab to find and connect with people."
        };
    }

    private async searchBuilders(currentUser: IUser, issue: string, radius: number): Promise<any> {
        if (!currentUser.travel_route?.origin?.coordinates) return { message: "I don't have your current location. Please update your travel route in your profile." };
        const [lng, lat] = currentUser.travel_route.origin.coordinates;

        const query: any = {
            "travel_route.origin": {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius * 1000
                }
            },
            is_builder: true,
            "nomad_id.verified": true, // Only recommend verified builders
            "builder_profile.specialty_tags": { $in: [new RegExp(issue, "i")] }
        };

        const builders = await User.find(query).limit(5).select("builder_profile profile.photo_url is_builder username");

        // Fetch average ratings from reviews for each builder
        const buildersWithRatings = await Promise.all(
            builders.map(async (b) => {
                let avgRating = 0;
                try {
                    const reviews = await Review.aggregate([
                        { $match: { builder_id: b._id } },
                        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
                    ]);
                    if (reviews.length > 0) {
                        avgRating = Math.round(reviews[0].avg * 10) / 10;
                    }
                } catch (e) {
                    // Reviews model might not have data yet
                    avgRating = 0;
                }

                return {
                    id: b._id,
                    type: "builder" as const,
                    name: b.builder_profile?.business_name || b.username,
                    rating: avgRating,
                    description: `Specializes in: ${b.builder_profile?.specialty_tags?.join(", ") || "General"}. Rate: $${b.builder_profile?.hourly_rate || "N/A"}/hr`,
                    specialty: b.builder_profile?.specialty_tags,
                    hourly_rate: b.builder_profile?.hourly_rate,
                    image: b.builder_profile?.portfolio_images?.[0] || b.profile.photo_url
                };
            })
        );

        if (buildersWithRatings.length === 0) {
            return { message: `No verified builders specializing in "${issue}" found nearby. Try expanding your search radius or check the Marketplace tab.` };
        }

        return buildersWithRatings;
    }

    private async searchPlaces(currentUser: IUser, searchQuery: string, radius: number): Promise<any> {
        if (!currentUser.travel_route?.origin?.coordinates) return { message: "I don't have your current location. Please update your travel route in your profile." };
        const [lng, lat] = currentUser.travel_route.origin.coordinates;

        const query: any = {
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius * 1000
                }
            },
            status: "open",
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { activity_type: { $regex: searchQuery, $options: "i" } }
            ]
        };

        const activities = await Activity.find(query).limit(5);

        if (activities.length === 0) {
            return { message: `No activities or places matching "${searchQuery}" found nearby. Try a broader search term or expand your radius.` };
        }

        return activities.map(a => ({
            id: a._id,
            type: "place" as const,
            name: a.title,
            description: a.description || a.activity_type,
            rating: 0, // No mock ratings — real data only
            rig_note: this.getRigNote(currentUser, a),
        }));
    }

    /**
     * Generate rig-specific notes for places/activities.
     */
    private getRigNote(user: IUser, activity: any): string | undefined {
        const largeRigs = ["bus", "skoolie", "rv", "truck_camper"];
        const isLargeRig = largeRigs.includes(user.rig?.type);

        const notes: string[] = [];

        if (isLargeRig) {
            notes.push(`Note: You're driving a ${user.rig.type}. Verify this location has adequate space and road access for large rigs.`);
        }

        if (user.rig?.pet_friendly) {
            notes.push("Check if this location is pet-friendly before heading out.");
        }

        return notes.length > 0 ? notes.join(" ") : undefined;
    }
}
