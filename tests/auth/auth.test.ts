import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { createApp } from "../../src/app";
import { User } from "../../src/modules/users/models/user.model";
import { storeOtp, deleteOtp } from "../../src/config/redis";

describe("Auth API", () => {
    let app: Express;

    // Test user data
    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: "Password123!",
        username: `testuser_${Date.now()}`,
        name: "Test User",
        phone: "+1234567890",
        age: 25,
        gender: "male",
    };

    let userId: string;
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
        app = createApp();
    });

    afterAll(async () => {
        // Clean up test user
        if (testUser.email) {
            await User.deleteOne({ email: testUser.email.toLowerCase() });
        }
        // Clean up OTP
        await deleteOtp(testUser.email).catch(() => { });
    });

    describe("POST /api/v1/auth/register", () => {
        it("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(testUser)
                .expect(201);

            expect(response.body.status).toBe("success");
            expect(response.body.data.email).toBe(testUser.email.toLowerCase());
            expect(response.body.data.username).toBe(testUser.username.toLowerCase());
            expect(response.body.data.requiresVerification).toBe(true);

            userId = response.body.data.userId;
        });

        it("should fail with duplicate email", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(testUser)
                .expect(409);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("already exists");
        });

        it("should fail with invalid email format", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    ...testUser,
                    email: "invalid-email",
                    username: "uniqueuser123",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });

        it("should fail with short password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    ...testUser,
                    email: "new@example.com",
                    username: "uniqueuser124",
                    password: "short",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });

        it("should fail with invalid username format", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    ...testUser,
                    email: "unique@example.com",
                    username: "user@name!",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });
    });

    describe("POST /api/v1/auth/verify-otp", () => {
        it("should fail with invalid OTP", async () => {
            const response = await request(app)
                .post("/api/v1/auth/verify-otp")
                .send({
                    email: testUser.email,
                    code: "000000",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("Invalid or expired OTP");
        });

        it("should verify OTP and return tokens", async () => {
            // Store a test OTP directly in Redis
            const testOtp = "123456";
            await storeOtp(testUser.email, testOtp);

            const response = await request(app)
                .post("/api/v1/auth/verify-otp")
                .send({
                    email: testUser.email,
                    code: testOtp,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.user.isActive).toBe(true);

            accessToken = response.body.data.token;
            refreshToken = response.body.data.refreshToken;
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login with email successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    identifier: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });

        it("should login with username successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    identifier: testUser.username,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.token).toBeDefined();
        });

        it("should fail with wrong password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    identifier: testUser.email,
                    password: "wrongpassword",
                })
                .expect(401);

            expect(response.body.status).toBe("error");
            expect(response.body.message).toContain("Invalid credentials");
        });

        it("should fail with non-existent user", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    identifier: "nonexistent@example.com",
                    password: "password123",
                })
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("POST /api/v1/auth/refresh", () => {
        it("should refresh token successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    refreshToken: refreshToken,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.token).toBeDefined();
        });

        it("should fail with invalid refresh token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    refreshToken: "invalid-token",
                })
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("POST /api/v1/auth/forgot-password", () => {
        it("should send OTP for password reset", async () => {
            const response = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({
                    email: testUser.email,
                })
                .expect(200);

            expect(response.body.status).toBe("success");
        });

        it("should not reveal if email does not exist", async () => {
            const response = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({
                    email: "nonexistent@example.com",
                })
                .expect(200);

            expect(response.body.status).toBe("success");
        });
    });

    describe("POST /api/v1/auth/reset-password", () => {
        it("should reset password with valid OTP", async () => {
            // Store a test OTP
            const testOtp = "654321";
            await storeOtp(testUser.email, testOtp);

            const response = await request(app)
                .post("/api/v1/auth/reset-password")
                .send({
                    email: testUser.email,
                    otp: testOtp,
                    newPassword: "NewPassword123!",
                })
                .expect(200);

            expect(response.body.status).toBe("success");

            // Verify can login with new password
            const loginResponse = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    identifier: testUser.email,
                    password: "NewPassword123!",
                })
                .expect(200);

            expect(loginResponse.body.data.token).toBeDefined();
        });

        it("should fail with invalid OTP", async () => {
            const response = await request(app)
                .post("/api/v1/auth/reset-password")
                .send({
                    email: testUser.email,
                    otp: "000000",
                    newPassword: "NewPassword123!",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });
    });
});
