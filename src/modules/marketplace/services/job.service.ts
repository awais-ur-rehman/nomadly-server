import { Job, type IJob } from "../models/job.model";
import { User } from "../../users/models/user.model";
import { JobApplication, type IJobApplication } from "../models/job-application.model";
import { JobPayment, type IJobPayment } from "../models/job-payment.model";
import { ForbiddenError, NotFoundError } from "../../../utils/errors";
import { NotificationService } from "../../notifications/services/notification.service";

interface SearchJobsFilters {
    category?: string[];
    budgetType?: "fixed" | "hourly";
    minBudget?: number;
    maxBudget?: number;
}

export class JobService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

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

        // Get applicant info for notification
        const applicant = await User.findById(applicantId).select("username profile.name");

        try {
            const application = await JobApplication.create({
                job_id: jobId,
                applicant_id: applicantId,
                cover_letter: coverLetter,
            });

            // Send notification to job author
            const applicantName = applicant?.profile?.name || applicant?.username || "Someone";
            await this.notificationService.sendJobApplicationNotification(
                job.author_id.toString(),
                applicantName,
                job.title,
                jobId,
                applicantId
            );

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

        const previousStatus = application.status;
        application.status = status;
        await application.save();

        // If hired, we might want to close the job or mark it as in_progress
        if (status === "hired") {
            await Job.findByIdAndUpdate(job._id, { status: "in_progress" });
        }

        // Send notification to applicant if status changed (not for pending)
        if (status !== "pending" && status !== previousStatus) {
            await this.notificationService.sendApplicationStatusNotification(
                application.applicant_id.toString(),
                job.title,
                status,
                job._id.toString()
            );
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

    async getMyApplications(
        userId: string,
        pagination: { page: number; limit: number }
    ): Promise<{ applications: IJobApplication[]; total: number }> {
        const skip = (pagination.page - 1) * pagination.limit;

        const [applications, total] = await Promise.all([
            JobApplication.find({ applicant_id: userId })
                .populate({
                    path: "job_id",
                    select: "title description category budget budget_type status created_at",
                    populate: {
                        path: "author_id",
                        select: "username profile.photo_url",
                    },
                })
                .skip(skip)
                .limit(pagination.limit)
                .sort({ created_at: -1 }),
            JobApplication.countDocuments({ applicant_id: userId }),
        ]);

        return { applications, total };
    }

    async getMyJobs(
        userId: string,
        pagination: { page: number; limit: number }
    ): Promise<{ jobs: any[]; total: number }> {
        const skip = (pagination.page - 1) * pagination.limit;

        const [jobs, total] = await Promise.all([
            Job.find({ author_id: userId })
                .skip(skip)
                .limit(pagination.limit)
                .sort({ created_at: -1 }),
            Job.countDocuments({ author_id: userId }),
        ]);

        // Get application counts for each job
        const jobsWithCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await JobApplication.countDocuments({ job_id: job._id });
                return {
                    ...job.toObject(),
                    application_count: applicationCount,
                };
            })
        );

        return { jobs: jobsWithCounts, total };
    }

    async completeJob(jobId: string, userId: string): Promise<IJob> {
        const job = await Job.findById(jobId);
        if (!job) throw new NotFoundError("Job not found");
        if (job.author_id.toString() !== userId) {
            throw new ForbiddenError("Only the job owner can complete a job");
        }
        if (job.status !== "in_progress") {
            throw new Error("Job must be in_progress to complete");
        }

        job.status = "completed";
        await job.save();

        // Find the hired applicant to create a payment record
        const hiredApplication = await JobApplication.findOne({
            job_id: jobId,
            status: "hired",
        });

        if (hiredApplication) {
            // Create a pending payment record if one doesn't exist
            const existingPayment = await JobPayment.findOne({ job_id: jobId });
            if (!existingPayment) {
                await JobPayment.create({
                    job_id: jobId,
                    payer_id: userId,
                    payee_id: hiredApplication.applicant_id,
                    amount: job.budget,
                    status: "pending",
                });
            }
        }

        return job;
    }

    async recordJobPayment(
        jobId: string,
        userId: string,
        transactionId: string,
        amount: number
    ): Promise<IJobPayment> {
        const job = await Job.findById(jobId);
        if (!job) throw new NotFoundError("Job not found");
        if (job.author_id.toString() !== userId) {
            throw new ForbiddenError("Only the job owner can record payment");
        }

        let payment = await JobPayment.findOne({ job_id: jobId });

        if (payment) {
            // Update existing payment
            payment.revenue_cat_transaction_id = transactionId;
            payment.status = "paid";
            payment.amount = amount;
            await payment.save();
        } else {
            // Find hired applicant
            const hiredApplication = await JobApplication.findOne({
                job_id: jobId,
                status: "hired",
            });

            if (!hiredApplication) {
                throw new Error("No hired applicant found for this job");
            }

            payment = await JobPayment.create({
                job_id: jobId,
                payer_id: userId,
                payee_id: hiredApplication.applicant_id,
                amount,
                revenue_cat_transaction_id: transactionId,
                status: "paid",
            });
        }

        // Also mark job as closed after payment
        await Job.findByIdAndUpdate(jobId, { status: "closed" });

        // Notify the hired worker that payment has been received
        const hiredApp = await JobApplication.findOne({ job_id: jobId, status: "hired" });
        if (hiredApp) {
            await this.notificationService.sendPushNotification(
                hiredApp.applicant_id.toString(),
                "Payment Received",
                `Payment of $${amount} has been received for "${job.title}"`,
                "application_status",
                { type: "job_payment", jobId: jobId }
            );
        }

        return payment;
    }

    async getJobPayment(jobId: string): Promise<IJobPayment | null> {
        return JobPayment.findOne({ job_id: jobId })
            .populate("payer_id", "username profile.name profile.photo_url")
            .populate("payee_id", "username profile.name profile.photo_url");
    }
}
