import Redis from "ioredis";
import { logger } from "../utils/logger";

// Redis client singleton
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 10) {
                    logger.error("Redis connection failed after 10 retries");
                    return null;
                }
                const delay = Math.min(times * 100, 3000);
                return delay;
            },
            lazyConnect: true,
        });

        redisClient.on("connect", () => {
            logger.info("Redis connected successfully");
        });

        redisClient.on("error", (err) => {
            logger.error({ error: err.message }, "Redis connection error");
        });

        redisClient.on("close", () => {
            logger.warn("Redis connection closed");
        });
    }

    return redisClient;
};

// OTP Storage Helpers
const OTP_PREFIX = "otp:";
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes

export const storeOtp = async (email: string, code: string): Promise<void> => {
    const redis = getRedisClient();
    const key = `${OTP_PREFIX}${email.toLowerCase()}`;
    await redis.setex(key, OTP_TTL_SECONDS, code);
};

export const getOtp = async (email: string): Promise<string | null> => {
    const redis = getRedisClient();
    const key = `${OTP_PREFIX}${email.toLowerCase()}`;
    return redis.get(key);
};

export const deleteOtp = async (email: string): Promise<void> => {
    const redis = getRedisClient();
    const key = `${OTP_PREFIX}${email.toLowerCase()}`;
    await redis.del(key);
};

// Token Blacklist Helpers (for logout functionality)
const BLACKLIST_PREFIX = "blacklist:";
const TOKEN_BLACKLIST_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const blacklistToken = async (token: string): Promise<void> => {
    const redis = getRedisClient();
    const key = `${BLACKLIST_PREFIX}${token}`;
    await redis.setex(key, TOKEN_BLACKLIST_TTL_SECONDS, "1");
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const redis = getRedisClient();
    const key = `${BLACKLIST_PREFIX}${token}`;
    const result = await redis.get(key);
    return result !== null;
};

// Feed Cache Helpers
const FEED_CACHE_PREFIX = "feed:";
const FEED_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export const cacheFeed = async (
    userId: string,
    feed: any[]
): Promise<void> => {
    const redis = getRedisClient();
    const key = `${FEED_CACHE_PREFIX}${userId}`;
    await redis.setex(key, FEED_CACHE_TTL_SECONDS, JSON.stringify(feed));
};

export const getCachedFeed = async (userId: string): Promise<any[] | null> => {
    const redis = getRedisClient();
    const key = `${FEED_CACHE_PREFIX}${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

export const invalidateFeedCache = async (userId: string): Promise<void> => {
    const redis = getRedisClient();
    const key = `${FEED_CACHE_PREFIX}${userId}`;
    await redis.del(key);
};

// Rate Limiting Helpers
const RATE_LIMIT_PREFIX = "ratelimit:";

export const checkRateLimit = async (
    identifier: string,
    windowSeconds: number,
    maxRequests: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> => {
    const redis = getRedisClient();
    const key = `${RATE_LIMIT_PREFIX}${identifier}`;

    const multi = redis.multi();
    multi.incr(key);
    multi.ttl(key);

    const results = await multi.exec();
    const count = (results?.[0]?.[1] as number) || 0;
    const ttl = (results?.[1]?.[1] as number) || -1;

    if (ttl === -1) {
        await redis.expire(key, windowSeconds);
    }

    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);
    const resetIn = ttl === -1 ? windowSeconds : ttl;

    return { allowed, remaining, resetIn };
};

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info("Redis connection closed gracefully");
    }
};

// Connect to Redis (call during app startup)
export const connectRedis = async (): Promise<void> => {
    const redis = getRedisClient();
    try {
        await redis.connect();
    } catch (error) {
        // If already connected, ignore the error
        if ((error as Error).message !== "Redis is already connecting/connected") {
            throw error;
        }
    }
};
