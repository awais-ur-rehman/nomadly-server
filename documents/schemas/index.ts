import { authSchemas } from "./auth.schemas";
import { userSchemas } from "./user.schemas";
import { matchingSchemas } from "./matching.schemas";
import { activitySchemas } from "./activity.schemas";
import { marketplaceSchemas } from "./marketplace.schemas";
import { chatSchemas } from "./chat.schemas";
import { vouchingSchemas } from "./vouching.schemas";
import { paymentSchemas } from "./payment.schemas";
import { commonSchemas } from "./common.schemas";

export const schemas = {
  ...commonSchemas,
  ...authSchemas,
  ...userSchemas,
  ...matchingSchemas,
  ...activitySchemas,
  ...marketplaceSchemas,
  ...chatSchemas,
  ...vouchingSchemas,
  ...paymentSchemas,
};
