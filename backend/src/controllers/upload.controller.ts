import { Request, Response } from "express";
import multer from "multer";
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadBase64ToCloudinary,
} from "../config/cloudinary.js";

// ============================================================================
// CONFIGURACIÓN DE MULTER (ALMACENAMIENTO EN MEMORIA)
// Permite procesar archivos multipart sin escribir en disco temporal
// ============================================================================
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Máximo 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Use JPG, PNG, WEBP, GIF o SVG.`));
    }
  },
});

// ============================================================================
// CONTROLADOR DE SUBIDA Y ESTADO DE CLOUDINARY
// ============================================================================

/**
 * Consulta el estado de configuración de Cloudinary
 * GET /api/upload/status
 */
export async function getUploadStatus(_req: Request, res: Response): Promise<void> {
  const configured = isCloudinaryConfigured();
  res.json({
    configured,
    cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME : null,
    message: configured
      ? "Cloudinary configurado y listo para recibir imágenes."
      : "Cloudinary no está configurado. Por favor define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en backend/.env",
  });
}

/**
 * Sube una imagen mediante multipart/form-data
 * POST /api/upload/image (campo 'image' o 'file')
 */
export async function uploadImageFile(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No se proporcionó ningún archivo de imagen para subir." });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        error: "Servicio de almacenamiento no configurado",
        message: "Faltan credenciales de Cloudinary en backend/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
        configured: false,
      });
      return;
    }

    const folder = (req.body?.folder as string) || "kuri/uploads";
    const result = await uploadBufferToCloudinary(file.buffer, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url || result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error: any) {
    console.error("Error al subir archivo a Cloudinary:", error);
    res.status(500).json({
      error: "Error interno al procesar y subir la imagen",
      details: error?.message || "Error desconocido",
    });
  }
}

/**
 * Sube una imagen en formato Base64 o Data URI
 * POST /api/upload/base64
 */
export async function uploadBase64Image(req: Request, res: Response): Promise<void> {
  try {
    const { image, folder } = req.body;
    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Se requiere el campo 'image' en formato Base64 o Data URI." });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        error: "Servicio de almacenamiento no configurado",
        message: "Faltan credenciales de Cloudinary en backend/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
        configured: false,
      });
      return;
    }

    const targetFolder = folder || "kuri/uploads";
    const result = await uploadBase64ToCloudinary(image, targetFolder);

    res.status(200).json({
      success: true,
      url: result.secure_url || result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error: any) {
    console.error("Error al subir Base64 a Cloudinary:", error);
    res.status(500).json({
      error: "Error interno al procesar y subir la imagen Base64",
      details: error?.message || "Error desconocido",
    });
  }
}
