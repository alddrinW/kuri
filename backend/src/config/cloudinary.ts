import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// CONFIGURACIÓN CENTRALIZADA DE CLOUDINARY
// Provee utilidades para subida de imágenes optimizadas y almacenamiento cloud
// ============================================================================

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  // Verificar que no sean los marcadores de posición por defecto
  if (
    cloudName === "tu_cloud_name_aqui" ||
    apiKey === "tu_api_key_aqui" ||
    apiSecret === "tu_api_secret_aqui"
  ) {
    return false;
  }

  return true;
}

// Inicializar SDK de Cloudinary
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Sube un buffer binario a Cloudinary mediante upload_stream
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = "kuri/uploads",
  publicId?: string
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Credenciales de Cloudinary no configuradas. Por favor agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en backend/.env"
    );
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: "image",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Error desconocido al subir a Cloudinary"));
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

/**
 * Sube una imagen en formato Base64 o Data URI a Cloudinary
 */
export async function uploadBase64ToCloudinary(
  dataUri: string,
  folder: string = "kuri/uploads"
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Credenciales de Cloudinary no configuradas. Por favor agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en backend/.env"
    );
  }

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
}

export { cloudinary };
