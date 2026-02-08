import { type Request, type Response } from "express";
import { JobService } from "../services/job.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class JobController {
    constructor(private jobService: JobService) { }

    createJob = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");

        const { title, description, category, budget, budget_type, location, is_remote } = req.body;

        const job = await this.jobService.createJob(req.user.userId, {
            title,
            description,
            category,
            budget,
            budget_type,
            location, // Expecting { lat, lng }
            is_remote,
        });

        ApiResponse.success(res, job, "Job created successfully", 201);
    });

    searchJobs = asyncHandler(async (req: Request, res: Response) => {
        const latRaw = parseFloat(req.query.lat as string);
        const lngRaw = parseFloat(req.query.lng as string);
        const radius = parseInt(req.query.radius as string) || 50000; // 50km default

        // Handle NaN - pass null if coordinates are invalid
        const lat = isNaN(latRaw) ? null : latRaw;
        const lng = isNaN(lngRaw) ? null : lngRaw;

        const filters = {
            category: req.query.category ? (req.query.category as string).split(",") : undefined,
            budgetType: req.query.budget_type as "fixed" | "hourly",
            minBudget: req.query.min_budget ? parseFloat(req.query.min_budget as string) : undefined,
            maxBudget: req.query.max_budget ? parseFloat(req.query.max_budget as string) : undefined,
        };

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const { jobs, total } = await this.jobService.searchJobs(lat, lng, radius, filters, { page, limit });

        ApiResponse.paginated(res, jobs, page, limit, total);
    });

    getJob = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const job = await this.jobService.getJobById(id);
        if (!job) {
            ApiResponse.error(res, "Job not found", 404);
        } else {
            ApiResponse.success(res, job);
        }
    });

    deleteJob = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");
        const { id } = req.params;
        await this.jobService.deleteJob(id, req.user.userId);
        ApiResponse.success(res, null, "Job deleted successfully");
    });

    applyForJob = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");
        const { id } = req.params;
        const { cover_letter } = req.body;

        const application = await this.jobService.applyForJob(id, req.user.userId, cover_letter);
        ApiResponse.success(res, application, "Application submitted successfully", 201);
    });

    getJobApplications = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");
        const { id } = req.params;

        const applications = await this.jobService.getApplicationsByJob(id, req.user.userId);
        ApiResponse.success(res, { applications });
    });

    updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");
        const { applicationId } = req.params;
        const { status } = req.body;

        const application = await this.jobService.updateApplicationStatus(applicationId, req.user.userId, status);
        ApiResponse.success(res, application, "Application status updated");
    });

    getMyApplications = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const { applications, total } = await this.jobService.getMyApplications(
            req.user.userId,
            { page, limit }
        );

        ApiResponse.paginated(res, applications, page, limit, total);
    });

    getMyJobs = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new Error("User not authenticated");

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const { jobs, total } = await this.jobService.getMyJobs(
            req.user.userId,
            { page, limit }
        );

        ApiResponse.paginated(res, jobs, page, limit, total);
    });
}
