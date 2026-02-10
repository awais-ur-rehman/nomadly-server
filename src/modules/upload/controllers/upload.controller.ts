import { type Request, type Response } from "express";
import { UploadService } from "../services/upload.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";
import { ValidationError } from "../../../utils/errors";
import { logger } from "../../../utils/logger";

export class UploadController {
  constructor(private uploadService: UploadService) { }

  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    // logger.info({ hasFile: !!req.file, queryType: req.query.type }, "Upload image request received");

    if (!req.file) {
      logger.warn("No file provided in upload request");
      throw new ValidationError("No file provided");
    }

    const type = (req.query.type as string) || "default";
    const folder = this.uploadService.getFolderForType(type);

    // logger.info({ type, folder, fileName: req.file.originalname }, "Starting upload to Cloudinary");

    const result = await this.uploadService.uploadImage(req.file, folder);

    logger.info({ public_id: result.public_id, url: result.secure_url }, "Image uploaded successfully");

    ApiResponse.success(
      res,
      {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        folder: folder,
      },
      "Image uploaded successfully",
      201
    );
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
      throw new ValidationError("Public ID is required");
    }

    await this.uploadService.deleteImage(publicId);

    ApiResponse.success(res, null, "Image deleted successfully");
  });
}
