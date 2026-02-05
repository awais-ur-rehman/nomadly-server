import * as turf from "@turf/turf";
import { type IUser } from "../../users/models/user.model";

// ─── SCORE BREAKDOWN ──────────────────────────────────────────────────
export interface ScoreBreakdown {
  route_overlap: number;     // 0-100: How close are their destinations?
  temporal_overlap: number;  // 0-100: Do their travel dates overlap?
  hobby_match: number;       // 0-100: How many hobbies in common?
  proximity: number;         // 0-100: How close are their current origins?
  trust: number;             // 0-100: Verification + vouches
  rig_compatibility: number; // 0-100: Compatible rig/crew setup
  total: number;             // 0-100: Weighted composite
}

// ─── WEIGHT PROFILES ──────────────────────────────────────────────────
// Weights must sum to 1.0 for each mode
export interface WeightProfile {
  route_overlap: number;
  temporal_overlap: number;
  hobby_match: number;
  proximity: number;
  trust: number;
  rig_compatibility: number;
}

const WEIGHT_PROFILES: Record<string, WeightProfile> = {
  dating: {
    route_overlap: 0.20,
    temporal_overlap: 0.20,
    hobby_match: 0.15,
    proximity: 0.15,
    trust: 0.25, // Increased trust weight
    rig_compatibility: 0.05,
  },
  friends: {
    route_overlap: 0.15,
    temporal_overlap: 0.15,
    hobby_match: 0.30,
    proximity: 0.10,
    trust: 0.20, // Increased trust weight
    rig_compatibility: 0.10,
  },
  both: {
    route_overlap: 0.18,
    temporal_overlap: 0.18,
    hobby_match: 0.22,
    proximity: 0.12,
    trust: 0.20, // Increased trust weight
    rig_compatibility: 0.10,
  },
};

// ─── INDIVIDUAL SCORING FUNCTIONS ─────────────────────────────────────

/**
 * Score based on how close two users' DESTINATIONS are.
 * This is the core differentiator: "Are we heading to the same place?"
 * Returns 0-100. Within 50km = 100, degrades linearly to 0 at 1000km+.
 */
function scoreRouteOverlap(userA: IUser, userB: IUser): number {
  const destA = userA.travel_route?.destination;
  const destB = userB.travel_route?.destination;

  if (!destA?.coordinates || !destB?.coordinates) {
    // Fallback: compare origins if no destination set
    const originA = userA.travel_route?.origin;
    const originB = userB.travel_route?.origin;
    if (!originA?.coordinates || !originB?.coordinates) return 0;

    try {
      const dist = turf.distance(
        turf.point(originA.coordinates),
        turf.point(originB.coordinates),
        { units: "kilometers" }
      );
      return Math.max(0, 100 - (dist / 10)); // More lenient for origin-only
    } catch (e) {
      return 0; // Fallback if coordinates are invalid
    }
  }

  const distance = turf.distance(
    turf.point(destA.coordinates),
    turf.point(destB.coordinates),
    { units: "kilometers" }
  );

  // Within 50km of same destination = perfect score
  if (distance <= 50) return 100;
  // Linear decay from 50km to 1000km
  if (distance >= 1000) return 0;
  return Math.round(100 * (1 - (distance - 50) / 950));
}

/**
 * Score based on overlapping travel dates.
 * "Will we be traveling at the same time?"
 * Returns 0-100 based on how many days overlap.
 */
function scoreTemporalOverlap(userA: IUser, userB: IUser): number {
  const routeA = userA.travel_route;
  const routeB = userB.travel_route;

  if (!routeA?.start_date || !routeB?.start_date) return 0;
  if (!routeA.duration_days || !routeB.duration_days) return 0;

  const startA = new Date(routeA.start_date).getTime();
  const endA = startA + routeA.duration_days * 86400000;
  const startB = new Date(routeB.start_date).getTime();
  const endB = startB + routeB.duration_days * 86400000;

  // Calculate overlap in days
  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  const overlapDays = Math.max(0, (overlapEnd - overlapStart) / 86400000);

  if (overlapDays <= 0) {
    // No overlap — score based on how close the dates are
    const gap = Math.min(
      Math.abs(startA - endB),
      Math.abs(startB - endA)
    ) / 86400000;

    // Within 7 days of each other = still decent score
    if (gap <= 7) return Math.round(40 * (1 - gap / 7));
    return 0;
  }

  // Score based on proportion of overlap relative to shorter trip
  const shorterTrip = Math.min(routeA.duration_days, routeB.duration_days);
  const overlapRatio = overlapDays / shorterTrip;

  return Math.round(Math.min(100, overlapRatio * 100));
}

/**
 * Hobby matching using Jaccard similarity.
 * "Do we like the same things?"
 * Returns 0-100.
 */
function scoreHobbyMatch(userA: IUser, userB: IUser): number {
  const hobbiesA = userA.profile.hobbies || [];
  const hobbiesB = userB.profile.hobbies || [];

  if (hobbiesA.length === 0 || hobbiesB.length === 0) return 0;

  const setA = new Set(hobbiesA.map((h) => h.toLowerCase().trim()));
  const setB = new Set(hobbiesB.map((h) => h.toLowerCase().trim()));

  let intersection = 0;
  for (const hobby of setA) {
    if (setB.has(hobby)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;

  // Jaccard similarity * 100
  const jaccard = intersection / union;

  // Boost: having 3+ shared hobbies is very strong signal
  const sharedBonus = Math.min(intersection * 10, 30);

  return Math.round(Math.min(100, jaccard * 70 + sharedBonus));
}

/**
 * Proximity score based on current origin distance.
 * "How close are we right now?"
 * Returns 0-100.
 */
function scoreProximity(userA: IUser, userB: IUser): number {
  const originA = userA.travel_route?.origin;
  const originB = userB.travel_route?.origin;

  if (!originA?.coordinates || !originB?.coordinates) return 0;

  try {
    const distance = turf.distance(
      turf.point(originA.coordinates),
      turf.point(originB.coordinates),
      { units: "kilometers" }
    );

    // Within 10km = perfect
    if (distance <= 10) return 100;
    // Linear decay to 0 at max_distance (default 500km for scoring)
    if (distance >= 500) return 0;
    return Math.round(100 * (1 - (distance - 10) / 490));
  } catch (e) {
    return 0;
  }
}

/**
 * Trust score based on multi-level verification system and community vouches.
 * Uses the new 5-level verification (email, phone, photo, community, ID).
 * Returns 0-100.
 */
function scoreTrust(candidate: IUser): number {
  let score = 0;

  // New verification system: 20 points per verified level (max 5 levels = 100)
  const verificationLevel = (candidate as any).verification?.level || 0;
  if (verificationLevel > 0) {
    score += verificationLevel * 20;
  } else {
    // Fallback to legacy nomad_id for users who haven't migrated yet
    if (candidate.nomad_id?.verified) score += 40;

    // Vouches via legacy field
    const vouchPoints = Math.min((candidate.nomad_id?.vouch_count || 0) * 10, 40);
    score += vouchPoints;
  }

  // Account age: older accounts are more trusted (1pt per month, max 10)
  const memberSince = candidate.nomad_id?.member_since;
  if (memberSince) {
    const months = (Date.now() - new Date(memberSince).getTime()) / (30 * 86400000);
    score += Math.min(Math.floor(months), 10);
  }

  return Math.min(100, score);
}

/**
 * Rig compatibility score.
 * Solo travelers match with solo, pet-friendly with pet-friendly, etc.
 * Returns 0-100.
 */
function scoreRigCompatibility(userA: IUser, userB: IUser): number {
  let score = 50; // Base compatibility

  // Same rig type = bonus
  if (userA.rig?.type && userB.rig?.type && userA.rig.type === userB.rig.type) {
    score += 20;
  }

  // Same crew type = strong compatibility
  if (userA.rig?.crew_type && userB.rig?.crew_type) {
    if (userA.rig.crew_type === userB.rig.crew_type) {
      score += 20;
    }
  }

  // Pet compatibility
  if (userA.rig?.pet_friendly && userB.rig?.pet_friendly) {
    score += 10;
  } else if (userA.rig?.pet_friendly !== userB.rig?.pet_friendly) {
    // One has pets, other doesn't — slight penalty
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

// ─── MAIN SCORING FUNCTION ───────────────────────────────────────────

/**
 * Compute a full compatibility score between two users.
 */
export function computeCompatibilityScore(
  currentUser: IUser,
  candidate: IUser,
  mode: "friends" | "dating" | "both" = "both"
): ScoreBreakdown {
  const weights = WEIGHT_PROFILES[mode] || WEIGHT_PROFILES.both;

  const route_overlap = scoreRouteOverlap(currentUser, candidate);
  const temporal_overlap = scoreTemporalOverlap(currentUser, candidate);
  const hobby_match = scoreHobbyMatch(currentUser, candidate);
  const proximity = scoreProximity(currentUser, candidate);
  const trust = scoreTrust(candidate);
  const rig_compatibility = scoreRigCompatibility(currentUser, candidate);

  const total = Math.round(
    route_overlap * weights.route_overlap +
    temporal_overlap * weights.temporal_overlap +
    hobby_match * weights.hobby_match +
    proximity * weights.proximity +
    trust * weights.trust +
    rig_compatibility * weights.rig_compatibility
  );

  return {
    route_overlap,
    temporal_overlap,
    hobby_match,
    proximity,
    trust,
    rig_compatibility,
    total,
  };
}

/**
 * Sort candidates by their total compatibility score (descending).
 */
export function rankCandidates(
  currentUser: IUser,
  candidates: IUser[],
  mode: "friends" | "dating" | "both" = "both"
): Array<{ user: IUser; score: ScoreBreakdown; distance_km: number | null }> {
  return candidates
    .map((candidate) => {
      const score = computeCompatibilityScore(currentUser, candidate, mode);

      // Calculate raw distance for display
      let distance_km: number | null = null;
      if (currentUser.travel_route?.origin?.coordinates && candidate.travel_route?.origin?.coordinates) {
        try {
          distance_km = Math.round(
            turf.distance(
              turf.point(currentUser.travel_route.origin.coordinates),
              turf.point(candidate.travel_route.origin.coordinates),
              { units: "kilometers" }
            )
          );
        } catch (e) {
          distance_km = null;
        }
      }

      return { user: candidate, score, distance_km };
    })
    .sort((a, b) => b.score.total - a.score.total);
}
