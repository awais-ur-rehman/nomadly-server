import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { User } from "../../src/modules/users/models/user.model";
import { Story } from "../../src/modules/stories/models/story.model";
import { createAndAuthenticateUser, authRequest, AuthenticatedUser } from "../helpers/test-utils";

describe("Stories API", () => {
    let app: Express;
    let user1: AuthenticatedUser;
    let user2: AuthenticatedUser;
    let testStoryId: string;

    beforeAll(async () => {
        app = createApp();

        // Create two test users
        user1 = await createAndAuthenticateUser(app, { name: "Story User 1" });
        user2 = await createAndAuthenticateUser(app, { name: "Story User 2" });
    });

    afterAll(async () => {
        // Clean up test data
        await Story.deleteMany({ author_id: { $in: [user1.id, user2.id] } });
        await User.deleteMany({ _id: { $in: [user1.id, user2.id] } });
    });

    describe("POST /api/v1/stories", () => {
        it("should create a new story successfully", async () => {
            const response = await authRequest(app, user1.accessToken)
                .post("/api/v1/stories")
                .send({
                    asset_url: "https://example.com/story-image.jpg",
                    type: "image",
                })
                .expect(201);

            expect(response.body.status).toBe("success");
            expect(response.body.data.asset_url).toBe("https://example.com/story-image.jpg");
            expect(response.body.data.asset_type).toBe("image");
            expect(response.body.data.expires_at).toBeDefined();

            testStoryId = response.body.data._id;
        });

        it("should fail with invalid asset type", async () => {
            const response = await authRequest(app, user1.accessToken)
                .post("/api/v1/stories")
                .send({
                    asset_url: "https://example.com/story.jpg",
                    type: "audio",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post("/api/v1/stories")
                .send({
                    asset_url: "https://example.com/story.jpg",
                    type: "image",
                })
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/stories/active", () => {
        it("should get active stories from followed users", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get("/api/v1/stories/active")
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .get("/api/v1/stories/active")
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/stories/me", () => {
        it("should get my own stories", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get("/api/v1/stories/me")
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe("GET /api/v1/stories/:storyId", () => {
        it("should get a single story and mark as viewed", async () => {
            const response = await authRequest(app, user2.accessToken)
                .get(`/api/v1/stories/${testStoryId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data._id).toBe(testStoryId);
        });

        it("should return 404 for non-existent story", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get("/api/v1/stories/507f1f77bcf86cd799439011")
                .expect(404);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/stories/:storyId/viewers", () => {
        it("should get story viewers for own story", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get(`/api/v1/stories/${testStoryId}/viewers`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.viewers).toBeDefined();
            expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        });

        it("should not allow viewing others story viewers", async () => {
            const response = await authRequest(app, user2.accessToken)
                .get(`/api/v1/stories/${testStoryId}/viewers`)
                .expect(403);

            expect(response.body.status).toBe("error");
        });
    });

    describe("DELETE /api/v1/stories/:storyId", () => {
        it("should not allow deleting another user's story", async () => {
            const response = await authRequest(app, user2.accessToken)
                .delete(`/api/v1/stories/${testStoryId}`)
                .expect(403);

            expect(response.body.status).toBe("error");
        });

        it("should delete own story", async () => {
            const response = await authRequest(app, user1.accessToken)
                .delete(`/api/v1/stories/${testStoryId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
        });
    });
});
