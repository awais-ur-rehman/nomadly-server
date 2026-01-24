import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "nomadly"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "auto" as const,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error({ error }, "Cloudinary upload failed");
          reject(new Error("File upload failed"));
          return;
        }

        if (!result) {
          reject(new Error("Upload result is null"));
          return;
        }

        resolve({
          url: result.url,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      })
      .end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info({ publicId }, "File deleted from Cloudinary");
  } catch (error) {
    logger.error({ error, publicId }, "Failed to delete file from Cloudinary");
    throw new Error("Failed to delete file");
  }
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = "nomadly",
  resourceType: "image" | "video" | "raw" = "image"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error({ error }, "Cloudinary upload failed");
          reject(new Error("File upload failed"));
          return;
        }

        if (!result) {
          reject(new Error("Upload result is null"));
          return;
        }

        resolve({
          url: result.url,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      })
      .end(buffer);
  });
};
