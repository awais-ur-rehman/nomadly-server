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

const applyJobSchema = z.object({
    body: z.object({
        cover_letter: z.string().min(20),
    }),
});

const updateApplicationStatusSchema = z.object({
    body: z.object({
        status: z.enum(["pending", "interview", "hired", "rejected"]),
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

    // Applications
    router.post(
        "/:id/apply",
        authenticate,
        validate(applyJobSchema),
        jobController.applyForJob
    );

    router.get(
        "/:id/applications",
        authenticate,
        jobController.getJobApplications
    );

    router.patch(
        "/applications/:applicationId",
        authenticate,
        validate(updateApplicationStatusSchema),
        jobController.updateApplicationStatus
    );

    return router;
};
