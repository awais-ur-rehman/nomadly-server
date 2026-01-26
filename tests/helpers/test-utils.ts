import request from "supertest";
import { Express } from "express";
import { storeOtp } from "../../src/config/redis";

export interface TestUser {
    email: string;
    password: string;
    username: string;
    name: string;
    phone?: string;
    age?: number;
    gender?: string;
}

export interface AuthenticatedUser extends TestUser {
    id: string;
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate a unique test user
 */
export function generateTestUser(prefix: string = "test"): TestUser {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    return {
        email: `${prefix}_${timestamp}_${random}@test.com`,
        password: "TestPassword123!",
        username: `${prefix}_${timestamp}_${random}`.replace(/[^a-z0-9_]/gi, "_").substring(0, 30),
        name: `Test User ${prefix}`,
        phone: `+1${Math.floor(Math.random() * 10000000000).toString().padStart(10, "0")}`,
        age: Math.floor(Math.random() * 40) + 20,
        gender: Math.random() > 0.5 ? "male" : "female",
    };
}

/**
 * Register and verify a test user, returning tokens
 */
export async function createAndAuthenticateUser(
    app: Express,
    userOverrides: Partial<TestUser> = {}
): Promise<AuthenticatedUser> {
    const testUser = { ...generateTestUser(), ...userOverrides };

    // Register user
    const registerResponse = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

    if (registerResponse.status !== 201) {
        throw new Error(`Failed to register user: ${JSON.stringify(registerResponse.body)}`);
    }

    // Store OTP in Redis directly for verification
    const otp = "123456";
    await storeOtp(testUser.email, otp);

    // Verify OTP
    const verifyResponse = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({
            email: testUser.email,
            code: otp,
        });

    if (verifyResponse.status !== 200) {
        throw new Error(`Failed to verify OTP: ${JSON.stringify(verifyResponse.body)}`);
    }

    return {
        ...testUser,
        id: registerResponse.body.data.userId,
        accessToken: verifyResponse.body.data.token,
        refreshToken: verifyResponse.body.data.refreshToken,
    };
}

/**
 * Create authenticated request helper
 */
export function authRequest(app: Express, token: string) {
    return {
        get: (url: string) => request(app).get(url).set("Authorization", `Bearer ${token}`),
        post: (url: string) => request(app).post(url).set("Authorization", `Bearer ${token}`),
        patch: (url: string) => request(app).patch(url).set("Authorization", `Bearer ${token}`),
        put: (url: string) => request(app).put(url).set("Authorization", `Bearer ${token}`),
        delete: (url: string) => request(app).delete(url).set("Authorization", `Bearer ${token}`),
    };
}

/**
 * Generate random coordinates
 */
export function randomCoordinates() {
    return {
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
    };
}

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
