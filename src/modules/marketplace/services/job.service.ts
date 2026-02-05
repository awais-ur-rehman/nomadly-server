import { Job, type IJob } from "../models/job.model";
import { User } from "../../users/models/user.model";
import { JobApplication, type IJobApplication } from "../models/job-application.model";
import { ForbiddenError, NotFoundError } from "../../../utils/errors";

interface SearchJobsFilters {
    category?: string[];
    budgetType?: "fixed" | "hourly";
    minBudget?: number;
    maxBudget?: number;
}

export class JobService {
    async createJob(
        authorId: string,
        data: {
            title: string;
            description: string;
            category: string;
            budget: number;
            budget_type: "fixed" | "hourly";
            location: { lat: number; lng: number };
            is_remote: boolean;
        }
    ): Promise<IJob> {
        // Basic limit check (mock for now, or real if simple)
        // TODO: Integrate RevenueCat entitlement check here later

        // Ensure author exists
        const author = await User.findById(authorId);
        if (!author) throw new Error("User not found");

        // Check Limits (3 jobs per week for free tier)
        if (author.subscription.plan === 'free') {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const jobCount = await Job.countDocuments({
                author_id: authorId,
                created_at: { $gte: oneWeekAgo },
            });

            if (jobCount >= 3) {
                throw new ForbiddenError("Free tier limit reached (3 jobs/week). Upgrade to Pro.");
            }
        }


        const job = await Job.create({
            author_id: authorId,
            ...data,
            location: {
                type: "Point",
                coordinates: [data.location.lng, data.location.lat],
            },
        });

        // Populate author before returning
        await job.populate("author_id", "username profile.photo_url nomad_id.verified");

        return job;
    }

    async searchJobs(
        lat: number | null,
        lng: number | null,
        radiusInMeters: number,
        filters: SearchJobsFilters,
        pagination: { page: number; limit: number }
    ): Promise<{ jobs: IJob[]; total: number }> {
        const query: any = { status: "open" };

        // Geospatial query - only apply if we have valid coordinates
        if (lat !== null && lng !== null && radiusInMeters > 0) {
            // Convert radius from meters to radians for $centerSphere
            const radiusInRadians = radiusInMeters / 6378100;
            query.location = {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radiusInRadians]
                }
            };
        }

        if (filters.category && filters.category.length > 0) {
            query.category = { $in: filters.category };
        }
        if (filters.budgetType) {
            query.budget_type = filters.budgetType;
        }
        // Budget range
        if (filters.minBudget || filters.maxBudget) {
            query.budget = {};
            if (filters.minBudget) query.budget.$gte = filters.minBudget;
            if (filters.maxBudget) query.budget.$lte = filters.maxBudget;
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate("author_id", "username profile.photo_url nomad_id.verified")
                .skip(skip)
                .limit(pagination.limit)
                .sort({ created_at: -1 }),
            Job.countDocuments(query),
        ]);

        return { jobs, total };
    }

    async getJobById(jobId: string): Promise<IJob | null> {
        return Job.findById(jobId).populate("author_id", "username profile.photo_url profile.bio nomad_id.verified");
    }

    async applyForJob(jobId: string, applicantId: string, coverLetter: string): Promise<IJobApplication> {
        const job = await Job.findById(jobId);
        if (!job) throw new NotFoundError("Job not found");
        if (job.status !== "open") throw new Error("Job is no longer open for applications");
        if (job.author_id.toString() === applicantId) throw new Error("You cannot apply to your own job");

        try {
            const application = await JobApplication.create({
                job_id: jobId,
                applicant_id: applicantId,
                cover_letter: coverLetter,
            });
            return application;
        } catch (error: any) {
            if (error.code === 11000) throw new Error("You have already applied for this job");
            throw error;
        }
    }

    async getApplicationsByJob(jobId: string, userId: string): Promise<IJobApplication[]> {
        const job = await Job.findById(jobId);
        if (!job) throw new NotFoundError("Job not found");

        // Only job author can see applications
        if (job.author_id.toString() !== userId) {
            throw new ForbiddenError("Only the job owner can view applications");
        }

        return JobApplication.find({ job_id: jobId })
            .populate("applicant_id", "username profile.name profile.photo_url profile.bio nomad_id.verified")
            .sort({ created_at: -1 });
    }

    async updateApplicationStatus(
        applicationId: string,
        userId: string,
        status: "pending" | "interview" | "hired" | "rejected"
    ): Promise<IJobApplication> {
        const application = await JobApplication.findById(applicationId).populate("job_id");
        if (!application) throw new NotFoundError("Application not found");

        const job = application.job_id as any as IJob;
        if (job.author_id.toString() !== userId) {
            throw new ForbiddenError("Only the job owner can update application status");
        }

        application.status = status;
        await application.save();

        // If hired, we might want to close the job or mark it as in_progress
        if (status === "hired") {
            await Job.findByIdAndUpdate(job._id, { status: "in_progress" });
        }

        return application;
    }

    async deleteJob(jobId: string, userId: string): Promise<void> {
        const job = await Job.findById(jobId);
        if (!job) throw new Error("Job not found");
        if (job.author_id.toString() !== userId) {
            throw new Error("Unauthorized");
        }
        await job.deleteOne();
    }
}
