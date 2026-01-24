import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticate } from "../../../middleware/auth";
import { upload } from "../../../middleware/upload";

const router = Router();

export const createUploadRoutes = (uploadController: UploadController) => {
  router.post(
    "/image",
    authenticate,
    upload.single("image"),
    uploadController.uploadImage
  );

  router.delete(
    "/image/:publicId",
    authenticate,
    uploadController.deleteImage
  );

  return router;
};
