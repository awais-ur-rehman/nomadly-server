import swaggerJsdoc from "swagger-jsdoc";
import { type SwaggerDefinition } from "swagger-jsdoc";

import { authPaths } from "./paths/auth.paths";
import { userPaths } from "./paths/user.paths";
import { matchingPaths } from "./paths/matching.paths";
import { activityPaths } from "./paths/activity.paths";
import { marketplacePaths } from "./paths/marketplace.paths";
import { chatPaths } from "./paths/chat.paths";
import { vouchingPaths } from "./paths/vouching.paths";
import { paymentPaths } from "./paths/payment.paths";
import { notificationPaths } from "./paths/notification.paths";
import { uploadPaths } from "./paths/upload.paths";

import { schemas } from "./schemas/index";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Nomadly API",
    version: "1.0.0",
    description:
      "API documentation for Nomadly - A location-based social platform for digital nomads",
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
    schemas,
  },
  paths: {
    ...authPaths,
    ...userPaths,
    ...matchingPaths,
    ...activityPaths,
    ...marketplacePaths,
    ...chatPaths,
    ...vouchingPaths,
    ...paymentPaths,
    ...notificationPaths,
    ...uploadPaths,
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
