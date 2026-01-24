"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
const auth_schemas_1 = require("./auth.schemas");
const user_schemas_1 = require("./user.schemas");
const matching_schemas_1 = require("./matching.schemas");
const activity_schemas_1 = require("./activity.schemas");
const marketplace_schemas_1 = require("./marketplace.schemas");
const chat_schemas_1 = require("./chat.schemas");
const vouching_schemas_1 = require("./vouching.schemas");
const payment_schemas_1 = require("./payment.schemas");
const upload_schemas_1 = require("./upload.schemas");
const common_schemas_1 = require("./common.schemas");
exports.schemas = {
    ...common_schemas_1.commonSchemas,
    ...auth_schemas_1.authSchemas,
    ...user_schemas_1.userSchemas,
    ...matching_schemas_1.matchingSchemas,
    ...activity_schemas_1.activitySchemas,
    ...marketplace_schemas_1.marketplaceSchemas,
    ...chat_schemas_1.chatSchemas,
    ...vouching_schemas_1.vouchingSchemas,
    ...payment_schemas_1.paymentSchemas,
    ...upload_schemas_1.uploadSchemas,
};
//# sourceMappingURL=index.js.map