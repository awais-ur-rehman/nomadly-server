export const uploadPaths = {
  "/api/upload/image": {
    post: {
      tags: ["Upload"],
      summary: "Upload image to Cloudinary",
      description:
        "Upload an image file to Cloudinary and get back the URL. Use the returned URL in other APIs (profile photo, activity images, etc.). **Requires authentication.**",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "type",
          in: "query",
          schema: {
            type: "string",
            enum: ["profile", "activity", "rig", "chat", "default"],
            example: "profile",
          },
          description:
            "Type of upload - determines folder structure (profile, activity, rig, chat, default)",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["image"],
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "Image file (JPEG, PNG, GIF, WebP - max 10MB)",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Image uploaded successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UploadImageResponse",
              },
            },
          },
        },
        400: {
          description: "Bad request - invalid file or missing file",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        401: {
          description: "Unauthorized - authentication required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
  "/api/upload/image/{publicId}": {
    delete: {
      tags: ["Upload"],
      summary: "Delete image from Cloudinary",
      description:
        "Delete an image from Cloudinary using its public_id. **Requires authentication.**",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "publicId",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "nomadly/profile-images/abc123",
          },
          description: "Cloudinary public ID of the image to delete",
        },
      ],
      responses: {
        200: {
          description: "Image deleted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeleteImageResponse",
              },
            },
          },
        },
        400: {
          description: "Bad request - invalid public ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        401: {
          description: "Unauthorized - authentication required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
};
