"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const auth_paths_1 = require("./paths/auth.paths");
const user_paths_1 = require("./paths/user.paths");
const matching_paths_1 = require("./paths/matching.paths");
const activity_paths_1 = require("./paths/activity.paths");
const marketplace_paths_1 = require("./paths/marketplace.paths");
const chat_paths_1 = require("./paths/chat.paths");
const vouching_paths_1 = require("./paths/vouching.paths");
const payment_paths_1 = require("./paths/payment.paths");
const notification_paths_1 = require("./paths/notification.paths");
const upload_paths_1 = require("./paths/upload.paths");
const index_1 = require("./schemas/index");
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Nomadly API",
        version: "1.0.0",
        description: "API documentation for Nomadly - A location-based social platform for digital nomads",
        contact: {
            name: "Nomadly Support",
            email: "support@nomadly.com",
        },
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Development server",
        },
        {
            url: "https://api.nomadly.com",
            description: "Production server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Enter JWT token",
            },
        },
        schemas: index_1.schemas,
    },
    paths: {
        ...auth_paths_1.authPaths,
        ...user_paths_1.userPaths,
        ...matching_paths_1.matchingPaths,
        ...activity_paths_1.activityPaths,
        ...marketplace_paths_1.marketplacePaths,
        ...chat_paths_1.chatPaths,
        ...vouching_paths_1.vouchingPaths,
        ...payment_paths_1.paymentPaths,
        ...notification_paths_1.notificationPaths,
        ...upload_paths_1.uploadPaths,
    },
};
const options = {
    definition: swaggerDefinition,
    apis: [],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map