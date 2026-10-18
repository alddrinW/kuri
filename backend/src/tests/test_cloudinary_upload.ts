import { isCloudinaryConfigured } from "../config/cloudinary.js";

async function runCloudinaryTests() {
  console.log("=== INICIANDO PRUEBAS DE INTEGRACIÓN: CLOUDINARY & UPLOADS ===");
  const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";

  try {
    // 1. Probar GET /api/upload/status
    const statusRes = await fetch(`${baseUrl}/api/upload/status`);
    const statusData: any = await statusRes.json();
    console.log("[TEST] GET /api/upload/status respuesta:", statusData);
    if (typeof statusData.configured !== "boolean") {
      throw new Error("El campo 'configured' no es booleano");
    }

    // 2. Probar POST /api/upload/base64 sin datos
    const emptyRes = await fetch(`${baseUrl}/api/upload/base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const emptyData: any = await emptyRes.json();
    console.log("[TEST] POST /api/upload/base64 (sin datos) respuesta:", emptyData);
    if (emptyRes.status !== 400) {
      throw new Error(`Se esperaba status 400 y se obtuvo ${emptyRes.status}`);
    }

    // 3. Probar comportamiento con datos y verificar respuesta clara si no hay API keys configuradas
    const sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const uploadRes = await fetch(`${baseUrl}/api/upload/base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: sampleBase64, folder: "kuri/tests" }),
    });
    const uploadData: any = await uploadRes.json();
    console.log(`[TEST] POST /api/upload/base64 (env configured=${isCloudinaryConfigured()}):`, uploadData);

    if (isCloudinaryConfigured()) {
      if (!uploadData.success || !uploadData.url) {
        throw new Error("Fallo al subir a Cloudinary con credenciales activas");
      }
      console.log("[TEST] Imagen subida exitosamente a Cloudinary:", uploadData.url);
    } else {
      if (uploadRes.status !== 503 || !uploadData.message?.includes("CLOUDINARY_CLOUD_NAME")) {
        throw new Error("No devolvió el mensaje guiado de configuración de Cloudinary esperado");
      }
      console.log("[TEST] Mensaje de configuración verificado correctamente: el sistema guía al usuario a colocar sus credenciales en backend/.env");
    }

    console.log("=== TODAS LAS PRUEBAS DE BACKEND PASARON EXITOSAMENTE ===");
  } catch (err) {
    console.error("Fallo en prueba:", err);
    throw err;
  }
}

runCloudinaryTests().catch((err) => {
  console.error("Error en pruebas:", err);
  process.exit(1);
});
