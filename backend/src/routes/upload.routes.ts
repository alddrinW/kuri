import { Router } from "express";
import {
  getUploadStatus,
  uploadImageFile,
  uploadBase64Image,
  uploadMiddleware,
} from "../controllers/upload.controller.js";

const router = Router();

// ============================================================================
// RUTAS DE CARGA Y ALMACENAMIENTO DE IMÁGENES (CLOUDINARY)
// ============================================================================

// Consultar estado de configuración de Cloudinary
router.get("/upload/status", getUploadStatus);

// Subida de imagen multipart/form-data (acepta 'image' o 'file')
router.post(
  "/upload/image",
  uploadMiddleware.single("image"),
  uploadImageFile
);

// Subida de imagen alternativa (campo 'file')
router.post(
  "/upload/file",
  uploadMiddleware.single("file"),
  uploadImageFile
);

// Subida de imagen en formato Base64 o Data URI
router.post("/upload/base64", uploadBase64Image);

export default router;
