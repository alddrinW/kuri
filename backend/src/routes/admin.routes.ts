import { Router } from "express";
import {
  getAdminMetrics,
  listAdminStores,
  createAdminStore,
  updateAdminStore,
  updateAdminCampaign,
  listBatches,
  createBatch,
  listAllKeychains,
  exportKeychainsCsv,
  updateStoreSubscription,
  recordSubscriptionPayment,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas protegidas exclusivamente para rol SUPER_ADMIN en el prefijo /admin
router.use("/admin", requireAuth, requireRole(["SUPER_ADMIN"]));

// Métricas globales
router.get("/admin/metrics", getAdminMetrics);

// Gestión de comercios y credenciales de acceso
router.get("/admin/stores", listAdminStores);
router.post("/admin/stores", createAdminStore);
router.put("/admin/stores/:storeId", updateAdminStore);

// Gestión de mensualidades y suscripciones de comercios
router.put("/admin/stores/:storeId/subscription", updateStoreSubscription);
router.post("/admin/stores/:storeId/payments", recordSubscriptionPayment);

// Gestión y configuración de campañas de fidelidad
router.put("/admin/campaigns/:storeId", updateAdminCampaign);

// Catálogo general de llaveros y exportación
router.get("/admin/keychains", listAllKeychains);
router.get("/admin/keychains/export/csv", exportKeychainsCsv);

// Generación y consulta de lotes de llaveros QR
router.get("/admin/batches", listBatches);
router.post("/admin/batches", createBatch);

export default router;
