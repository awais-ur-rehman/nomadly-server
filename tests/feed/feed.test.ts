import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { User } from "../../src/modules/users/models/user.model";
import { Post } from "../../src/modules/feed/models/post.model";
import { createAndAuthenticateUser, authRequest, AuthenticatedUser } from "../helpers/test-utils";

describe("Feed API", () => {
    let app: Express;
    let user1: AuthenticatedUser;
    let user2: AuthenticatedUser;
    let testPostId: string;

    beforeAll(async () => {
        app = createApp();

        // Create two test users
        user1 = await createAndAuthenticateUser(app, { name: "Feed User 1" });
        user2 = await createAndAuthenticateUser(app, { name: "Feed User 2" });
    });

    afterAll(async () => {
        // Clean up test data
        await Post.deleteMany({ author_id: { $in: [user1.id, user2.id] } });
        await User.deleteMany({ _id: { $in: [user1.id, user2.id] } });
    });

    describe("POST /api/v1/feed/posts", () => {
        it("should create a new post successfully", async () => {
            const response = await authRequest(app, user1.accessToken)
                .post("/api/v1/feed/posts")
                .send({
                    photos: ["https://example.com/photo1.jpg"],
                    caption: "Test post caption",
                    tags: ["test", "sample"],
                })
                .expect(201);

            expect(response.body.status).toBe("success");
            expect(response.body.data.photos).toContain("https://example.com/photo1.jpg");
            expect(response.body.data.caption).toBe("Test post caption");

            testPostId = response.body.data._id;
        });

        it("should fail without photos", async () => {
            const response = await authRequest(app, user1.accessToken)
                .post("/api/v1/feed/posts")
                .send({
                    caption: "No photos here",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post("/api/v1/feed/posts")
                .send({
                    photos: ["https://example.com/photo.jpg"],
                    caption: "Test",
                })
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/feed", () => {
        it("should get timeline for authenticated user", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get("/api/v1/feed")
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.posts).toBeDefined();
            expect(response.body.data.pagination).toBeDefined();
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .get("/api/v1/feed")
                .expect(401);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/feed/posts/:postId", () => {
        it("should get a single post", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get(`/api/v1/feed/posts/${testPostId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data._id).toBe(testPostId);
        });

        it("should return 404 for non-existent post", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get("/api/v1/feed/posts/507f1f77bcf86cd799439011")
                .expect(404);

            expect(response.body.status).toBe("error");
        });
    });

    describe("POST /api/v1/feed/posts/:postId/like", () => {
        it("should like a post", async () => {
            const response = await authRequest(app, user2.accessToken)
                .post(`/api/v1/feed/posts/${testPostId}/like`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.liked).toBe(true);
            expect(response.body.data.likes_count).toBe(1);
        });

        it("should unlike a post when liked again", async () => {
            const response = await authRequest(app, user2.accessToken)
                .post(`/api/v1/feed/posts/${testPostId}/like`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.liked).toBe(false);
            expect(response.body.data.likes_count).toBe(0);
        });
    });

    describe("POST /api/v1/feed/posts/:postId/comments", () => {
        it("should add a comment to a post", async () => {
            const response = await authRequest(app, user2.accessToken)
                .post(`/api/v1/feed/posts/${testPostId}/comments`)
                .send({
                    text: "Great post!",
                })
                .expect(201);

            expect(response.body.status).toBe("success");
            expect(response.body.data.text).toBe("Great post!");
        });

        it("should fail with empty comment", async () => {
            const response = await authRequest(app, user2.accessToken)
                .post(`/api/v1/feed/posts/${testPostId}/comments`)
                .send({
                    text: "",
                })
                .expect(400);

            expect(response.body.status).toBe("error");
        });
    });

    describe("GET /api/v1/feed/posts/:postId/comments", () => {
        it("should get comments for a post", async () => {
            const response = await authRequest(app, user1.accessToken)
                .get(`/api/v1/feed/posts/${testPostId}/comments`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.comments).toBeDefined();
            expect(response.body.data.comments.length).toBeGreaterThan(0);
        });
    });

    describe("DELETE /api/v1/feed/posts/:postId", () => {
        it("should not allow deleting another user's post", async () => {
            const response = await authRequest(app, user2.accessToken)
                .delete(`/api/v1/feed/posts/${testPostId}`)
                .expect(403);

            expect(response.body.status).toBe("error");
        });

        it("should delete own post", async () => {
            const response = await authRequest(app, user1.accessToken)
                .delete(`/api/v1/feed/posts/${testPostId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
        });
    });
});
