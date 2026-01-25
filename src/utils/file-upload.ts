import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

// Initialize Cloudinary config - will be called on first use
const initCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("🔧 Initializing Cloudinary with config:", {
    cloudName: cloudName ? "✓ set" : "✗ missing",
    apiKey: apiKey ? "✓ set" : "✗ missing",
    apiSecret: apiSecret ? "✓ set" : "✗ missing",
  });

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      `Cloudinary credentials missing: cloudName=${!!cloudName}, apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  console.log("✅ Cloudinary configured successfully");
};

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "nomadly"
): Promise<UploadResult> => {
  // Initialize Cloudinary on first upload attempt
  try {
    initCloudinary();
  } catch (initError) {
    const errorMsg = initError instanceof Error ? initError.message : "Unknown initialization error";
    console.error("❌ CLOUDINARY INIT FAILED:", errorMsg);
    logger.error({ initError: errorMsg }, "Cloudinary initialization failed");
    throw new Error(`Cloudinary configuration failed: ${errorMsg}`);
  }

  logger.info({
    fileName: file.originalname,
    fileSize: file.size,
    mimetype: file.mimetype,
    hasBuffer: !!file.buffer,
    folder
  }, "Starting Cloudinary upload");

  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        folder,
        resource_type: "auto" as const,
      };

      console.log("📤 Upload options:", uploadOptions);
      logger.info({ uploadOptions }, "Creating upload stream with options");

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          const errorDetail = {
            message: error.message,
            code: error.code,
            http_code: error.http_code,
            status: error.status,
          };
          console.error("❌ CLOUDINARY CALLBACK ERROR:", errorDetail);
          logger.error(errorDetail, "Cloudinary upload failed in callback");
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          console.error("❌ CLOUDINARY RETURNED NO RESULT");
          logger.error({}, "No result returned from Cloudinary upload");
          reject(new Error("Cloudinary upload returned empty result"));
          return;
        }

        console.log("✅ CLOUDINARY UPLOAD SUCCESS:", { public_id: result.public_id, url: result.secure_url });
        logger.info({
          public_id: result.public_id,
          url: result.secure_url,
        }, "File uploaded successfully to Cloudinary");

        resolve({
          url: result.url,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      });

      uploadStream.on("error", (streamError) => {
        console.error("❌ STREAM ERROR:", streamError.message);
        logger.error({ 
          streamError: streamError.message,
          streamErrorCode: (streamError as any).code,
        }, "Stream error during Cloudinary upload");
        reject(streamError);
      });

      uploadStream.on("end", () => {
        logger.info({}, "Upload stream ended");
      });

      console.log(`📦 Writing ${file.buffer.length} bytes to upload stream`);
      logger.info({ bufferSize: file.buffer.length }, "Writing buffer to upload stream");
      uploadStream.end(file.buffer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ UPLOAD EXCEPTION:", errorMessage);
      logger.error({ exception: errorMessage }, "Exception during upload stream creation");
      reject(err);
    }
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
          logger.error({ cloudinaryError: error }, "Cloudinary upload failed");
          reject(new Error(`File upload failed: ${error.message}`));
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
