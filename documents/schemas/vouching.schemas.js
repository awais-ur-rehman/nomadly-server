"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vouchingSchemas = void 0;
exports.vouchingSchemas = {
    Vouch: {
        type: "object",
        properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            voucher_id: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    profile: { $ref: "#/components/schemas/UserProfile" },
                },
            },
            vouchee_id: { type: "string" },
            created_at: { type: "string", format: "date-time" },
        },
    },
    VouchesResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/Vouch" },
            },
        },
    },
};
//# sourceMappingURL=vouching.schemas.js.map