import { Router } from "express";
import { z } from "zod";
import { JobController } from "../controllers/job.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(5),
        description: z.string().min(20),
        category: z.string().min(1),
        budget: z.number().min(0),
        budget_type: z.enum(["fixed", "hourly"]),
        location: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
        is_remote: z.boolean().optional(),
    }),
});

export const createJobRoutes = (jobController: JobController) => {
    router.post(
        "/",
        authenticate,
        validate(createJobSchema),
        jobController.createJob
    );

    router.get("/", authenticate, jobController.searchJobs);

    router.get("/:id", authenticate, jobController.getJob);

    router.delete("/:id", authenticate, jobController.deleteJob);

    return router;
};
