"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSchemas = void 0;
exports.uploadSchemas = {
    UploadImageResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Image uploaded successfully" },
            data: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        example: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/nomadly/profile-images/abc123.jpg",
                        description: "Secure HTTPS URL of the uploaded image",
                    },
                    public_id: {
                        type: "string",
                        example: "nomadly/profile-images/abc123",
                        description: "Cloudinary public ID (use this to delete the image)",
                    },
                    format: {
                        type: "string",
                        example: "jpeg",
                        description: "Image format (jpeg, png, gif, webp)",
                    },
                    folder: {
                        type: "string",
                        example: "nomadly/profile-images",
                        description: "Cloudinary folder where image is stored",
                    },
                },
            },
        },
    },
    DeleteImageResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Image deleted successfully" },
            data: { type: "null" },
        },
    },
};
//# sourceMappingURL=upload.schemas.js.map