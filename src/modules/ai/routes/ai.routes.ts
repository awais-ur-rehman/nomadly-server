import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

export const createAiRoutes = (aiController: AiController) => {
    router.post(
        "/chat",
        authenticate,
        aiController.chat
    );

    router.get(
        "/quota",
        authenticate,
        aiController.getQuota
    );

    return router;
};
