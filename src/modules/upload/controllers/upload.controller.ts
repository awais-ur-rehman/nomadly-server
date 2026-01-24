import { type Request, type Response } from "express";
import { UploadService } from "../services/upload.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";
import { ValidationError } from "../../../utils/errors";

export class UploadController {
  constructor(private uploadService: UploadService) {}

  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file provided");
    }

    const type = (req.query.type as string) || "default";
    const folder = this.uploadService.getFolderForType(type);

    const result = await this.uploadService.uploadImage(req.file, folder);

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
