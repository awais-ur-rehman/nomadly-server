export const authSchemas = {
  RegisterRequest: {
    type: "object",
    required: ["email", "password", "name"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      password: {
        type: "string",
        minLength: 8,
        example: "securePassword123",
      },
      name: {
        type: "string",
        minLength: 1,
        example: "John Doe",
      },
      phone: {
        type: "string",
        example: "+1234567890",
        description: "Optional phone number",
      },
      age: {
        type: "number",
        example: 30,
        description: "Optional age",
      },
      gender: {
        type: "string",
        example: "male",
        description: "Optional gender",
      },
    },
  },
  VerifyOtpRequest: {
    type: "object",
    required: ["email", "code"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      code: {
        type: "string",
        length: 6,
        example: "123456",
      },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      password: {
        type: "string",
        example: "securePassword123",
      },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  },
  ResendOtpRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
    },
  },
  AuthResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string", example: "Login successful" },
      data: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "507f1f77bcf86cd799439011" },
              email: { type: "string", example: "user@example.com" },
              isActive: { type: "boolean", example: true },
            },
          },
        },
      },
    },
  },
};
