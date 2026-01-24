# Swagger API Documentation

This directory contains the modular Swagger/OpenAPI documentation for the Nomadly API.

## Structure

```
documents/
├── swagger.ts              # Main Swagger configuration
├── schemas/                # Schema definitions
│   ├── index.ts           # Schema aggregator
│   ├── common.schemas.ts  # Common schemas (Error, Success, Pagination)
│   ├── auth.schemas.ts    # Authentication schemas
│   ├── user.schemas.ts    # User-related schemas
│   ├── matching.schemas.ts # Matching schemas
│   ├── activity.schemas.ts # Activity schemas
│   ├── marketplace.schemas.ts # Marketplace schemas
│   ├── chat.schemas.ts    # Chat schemas
│   ├── vouching.schemas.ts # Vouching schemas
│   └── payment.schemas.ts # Payment schemas
└── paths/                  # API endpoint definitions
    ├── auth.paths.ts      # Authentication endpoints
    ├── user.paths.ts      # User endpoints
    ├── matching.paths.ts  # Matching endpoints
    ├── activity.paths.ts # Activity endpoints
    ├── marketplace.paths.ts # Marketplace endpoints
    ├── chat.paths.ts     # Chat endpoints
    ├── vouching.paths.ts # Vouching endpoints
    ├── payment.paths.ts  # Payment endpoints
    └── notification.paths.ts # Notification endpoints
```

## Accessing the Documentation

Once the server is running, access the Swagger UI at:

```
http://localhost:3000/api-docs
```

## Adding New Endpoints

1. **Add Schema** (if needed): Create or update the appropriate schema file in `schemas/`
2. **Add Path**: Create or update the appropriate path file in `paths/`
3. **Export**: Make sure the new schema/path is exported in the index files
4. **Import**: The main `swagger.ts` file will automatically pick up the changes

## Example: Adding a New Endpoint

### 1. Add Schema (if needed)
```typescript
// documents/schemas/my-module.schemas.ts
export const myModuleSchemas = {
  MyRequest: {
    type: "object",
    properties: {
      field: { type: "string" },
    },
  },
};
```

### 2. Add Path
```typescript
// documents/paths/my-module.paths.ts
export const myModulePaths = {
  "/api/my-module/endpoint": {
    post: {
      tags: ["MyModule"],
      summary: "My endpoint",
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MyRequest" },
          },
        },
      },
      responses: {
        200: { $ref: "#/components/schemas/Success" },
      },
    },
  },
};
```

### 3. Export in Index Files
```typescript
// documents/schemas/index.ts
import { myModuleSchemas } from "./my-module.schemas";
export const schemas = {
  ...myModuleSchemas,
  // ... other schemas
};
```

```typescript
// documents/swagger.ts
import { myModulePaths } from "./paths/my-module.paths";
export const paths = {
  ...myModulePaths,
  // ... other paths
};
```

## Authentication

Most endpoints require JWT authentication. In Swagger UI:

1. Click the "Authorize" button at the top
2. Enter your JWT token (without "Bearer " prefix)
3. Click "Authorize"
4. All subsequent requests will include the token

## Testing Endpoints

You can test all endpoints directly from the Swagger UI:

1. Navigate to the endpoint you want to test
2. Click "Try it out"
3. Fill in the required parameters/body
4. Click "Execute"
5. View the response

## Best Practices

- Keep schemas modular and organized by feature
- Use `$ref` to reference schemas instead of duplicating
- Include examples in schemas for better documentation
- Add descriptions to all endpoints and schemas
- Keep paths organized by module/feature
