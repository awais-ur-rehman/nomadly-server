import { uploadToCloudinary, deleteFromCloudinary, type UploadResult } from "../../../utils/file-upload";
import { ValidationError } from "../../../utils/errors";

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = "nomadly"
  ): Promise<UploadResult & { width?: number; height?: number; format: string }> {
    if (!file) {
      throw new ValidationError("No file provided");
    }

    const result = await uploadToCloudinary(file, folder);

    return {
      ...result,
      format: file.mimetype.split("/")[1] || "unknown",
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    await deleteFromCloudinary(publicId);
  }

  getFolderForType(type: string): string {
    const folderMap: Record<string, string> = {
      profile: "nomadly/profile-images",
      activity: "nomadly/activity-images",
      rig: "nomadly/rig-images",
      chat: "nomadly/chat-images",
      feed: "nomadly/feed-images",
      story: "nomadly/story-images",
      default: "nomadly/uploads",
    };

    return folderMap[type] || folderMap.default;
  }
}
