"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPaths = void 0;
exports.authPaths = {
    "/api/auth/register": {
        post: {
            tags: ["Authentication"],
            summary: "Register a new user",
            description: "Register a new user with email, password, name, and optional basic info (phone, age, gender). An OTP will be sent to the email. **Public endpoint - no authentication required.**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RegisterRequest",
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "User registered successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    message: { type: "string", example: "Registration successful. Please verify your email." },
                                    data: {
                                        type: "object",
                                        properties: {
                                            userId: { type: "string" },
                                            email: { type: "string" },
                                            isActive: { type: "boolean", example: false },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/schemas/Error" },
                409: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/auth/verify-otp": {
        post: {
            tags: ["Authentication"],
            summary: "Verify OTP code",
            description: "Verify the OTP code sent to user's email and activate the account. **Public endpoint - no authentication required.**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/VerifyOtpRequest",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "OTP verified successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AuthResponse",
                            },
                        },
                    },
                },
                400: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/auth/login": {
        post: {
            tags: ["Authentication"],
            summary: "Login user",
            description: "Authenticate user with email and password. **Public endpoint - no authentication required.**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Login successful",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AuthResponse",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/auth/refresh": {
        post: {
            tags: ["Authentication"],
            summary: "Refresh access token",
            description: "Get a new access token using refresh token. **Public endpoint - no authentication required (uses refresh token in body).**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RefreshTokenRequest",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Token refreshed successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            token: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/auth/resend-otp": {
        post: {
            tags: ["Authentication"],
            summary: "Resend OTP code",
            description: "Resend OTP code to user's email. **Public endpoint - no authentication required.**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResendOtpRequest",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "OTP sent successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Success",
                            },
                        },
                    },
                },
                400: { $ref: "#/components/schemas/Error" },
            },
        },
    },
};
//# sourceMappingURL=auth.paths.js.map